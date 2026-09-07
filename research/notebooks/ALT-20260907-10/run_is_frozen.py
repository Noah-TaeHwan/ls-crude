#!/usr/bin/env python3
"""IS test for ALT-20260907-10 — WTI COT money-manager net positioning (frozen plan).

Provenance: first built as notebooks/ALT-20260907-01/run_is.py for candidate
ALT-20260907-01; a concurrent branch restructure retired IDs 01..04 and moved
the byte-identical raw inputs to ALT-20260907-10 (hashes verified, see below).
This file re-establishes the runnable artifact under the current ID. It does
NOT replace the sibling division's notebooks/.../run_is.py (different method).

Reads ONLY local inputs, IS ONLY 2015-01-01~2023-12-31. No network.
Recipe (§4 of candidate card): mm_net=(MM long-MM short)/OI on CFTC code 067651
FutOnly rows -> trailing z52 (min 26) -> decision = first WTI trading day strictly
after the report-week Friday (Tue aggregate, Fri 15:30 ET release) -> RV5 target.
Variant note (documented, not silent): card does not pin FutOnly vs Combined;
this run uses FutOnly (all 067651 rows in the raw zips are FutOnly) with the
same-row Open_Interest_All as denominator.

Usage:
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-10/run_is_frozen.py
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-10/run_is_frozen.py --check
Workdir: repo root (/Users/noah/orca/workspaces/ls-crude/petrel).
"""
import argparse
import csv
import hashlib
import io
import os
import subprocess
import sys
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

CANDIDATE_ID = "ALT-20260907-10"
RUN_ID = "run-20260907-01"
REPO = Path(__file__).resolve().parents[3]
RAW_DIR = REPO / "research/gathering/raw/ALT-20260907-10/20260907T000000Z"
WTI_PATH = REPO / "research/data/clf-daily-2015-2026.csv"
OUT_DIR = REPO / "research/indexes/ALT-20260907-10" / RUN_ID
IS_START = pd.Timestamp("2015-01-01")
IS_END = pd.Timestamp("2023-12-31")
H = 5  # RV5
LAGS = list(range(-4, 5))  # weeks, row-shift on weekly panel
PLACEBO_SHIFT = 26  # weeks
MIN_Z = 26
OWNER = "손성찬"
REVIEWER = "오태환"


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def pearson(x, y):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    m = np.isfinite(x) & np.isfinite(y)
    n = int(m.sum())
    if n < 3:
        return (float("nan"), n)
    a, b = x[m], y[m]
    sa, sb = a.std(ddof=1), b.std(ddof=1)
    if sa == 0 or sb == 0:
        return (float("nan"), n)
    return (float(np.corrcoef(a, b)[0, 1]), n)


def spearman(x, y):
    return pearson(pd.Series(x).rank().to_numpy(), pd.Series(y).rank().to_numpy())


def git_info():
    try:
        rev = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"], cwd=REPO,
            capture_output=True, text=True).stdout.strip()
        dirty = bool(subprocess.run(
            ["git", "status", "--short"], cwd=REPO,
            capture_output=True, text=True).stdout.strip())
        return rev or "unknown", dirty
    except Exception:
        return "unknown", "unknown"


def load_cot():
    """Return (frame[report, mm_net], file_hashes, n_raw_wti)."""
    rows, hashes = [], []
    for y in range(2015, 2024):
        zp = RAW_DIR / f"fut_disagg_txt_{y}.zip"
        hashes.append((zp.name, sha256_file(zp)))
        with zipfile.ZipFile(zp) as z:
            for n in z.namelist():
                if not n.lower().endswith(".txt"):
                    continue
                raw = z.read(n).decode("utf-8", errors="replace")
                for row in csv.DictReader(io.StringIO(raw)):
                    if row["CFTC_Contract_Market_Code"].strip() != "067651":
                        continue
                    oi = float(row["Open_Interest_All"].replace(",", ""))
                    ml = float(row["M_Money_Positions_Long_All"].replace(",", ""))
                    ms = float(row["M_Money_Positions_Short_All"].replace(",", ""))
                    rows.append({
                        "report": pd.Timestamp(row["Report_Date_as_YYYY-MM-DD"].strip()),
                        "futonly": row["FutOnly_or_Combined"].strip(),
                        "mm_net": (ml - ms) / oi if oi > 0 else np.nan,
                    })
    df = pd.DataFrame(rows).sort_values("report").drop_duplicates("report").reset_index(drop=True)
    return df, hashes, len(df)


def load_wti():
    w = pd.read_csv(WTI_PATH, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
    n_post = int((w["date"] > IS_END).sum())
    n_pre = int((w["date"] < IS_START).sum())
    return w, n_pre, n_post


def compute_rv(w, h):
    """RV_h(t) over next h trading days; NaN where any of the h+1 prices is
    missing/non-positive or the window end falls outside the frame."""
    dates = pd.to_datetime(w["date"]).reset_index(drop=True)
    p = w["Close"].to_numpy(dtype=float)
    n = len(p)
    ok = np.isfinite(p) & (p > 0)
    r2 = np.full(n, np.nan)
    with np.errstate(divide="ignore", invalid="ignore"):
        r = p[1:] / p[:-1] - 1
    r2[1:] = r ** 2
    okc = np.concatenate([[0], np.cumsum(ok.astype(int))])
    fin = np.isfinite(r2).astype(int)
    finc = np.concatenate([[0], np.cumsum(fin)])
    r2s = np.concatenate([[0], np.cumsum(np.where(np.isfinite(r2), r2, 0.0))])
    rv = np.full(n, np.nan)
    end = [pd.NaT] * n
    for i in range(n - h):
        j = i + h
        if okc[j + 1] - okc[i] != h + 1:
            continue
        if finc[j + 1] - finc[i + 1] != h:
            continue
        rv[i] = 100.0 * float(np.sqrt((252.0 / h) * (r2s[j + 1] - r2s[i + 1])))
        end[i] = dates[i + h]
    return pd.DataFrame({"date": dates, "rv": rv, "rv_end": pd.to_datetime(end)})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    run_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    command = " ".join(sys.argv)
    workdir = os.getcwd()
    git_rev, git_dirty = git_info()

    cot, hashes, n_raw = load_cot()
    assert (cot["futonly"] == "FutOnly").all(), "unexpected non-FutOnly 067651 rows"
    assert cot["report"].duplicated().sum() == 0
    wti, n_wti_pre, n_wti_post = load_wti()
    wti_hash = sha256_file(WTI_PATH)
    # Verify cutoff: 2024+ rows exist in the local file and are never used.
    assert n_wti_post > 0, "expected post-2023 rows in local WTI file for cutoff check"

    # z52 trailing (incl. current), min 26; std==0 -> z=0.
    mm = cot["mm_net"].to_numpy(dtype=float)
    z = np.full(len(mm), np.nan)
    zero_std = 0
    for i in range(len(mm)):
        win = mm[max(0, i - 51): i + 1]
        win = win[np.isfinite(win)]
        if len(win) < MIN_Z:
            continue
        sd = win.std(ddof=1)
        if sd == 0:
            z[i] = 0.0
            zero_std += 1
        else:
            z[i] = (mm[i] - win.mean()) / sd
    cot["z52"] = z

    # Decision date: first WTI trading day strictly after report-week Friday.
    tdays = pd.to_datetime(wti["date"]).to_numpy()
    dec = []
    for r in cot["report"]:
        fri = np.datetime64((r + timedelta(days=3)).date())
        k = int(np.searchsorted(tdays, fri, side="right"))
        dec.append(pd.Timestamp(tdays[k]) if k < len(tdays) else pd.NaT)
    cot["decision"] = pd.to_datetime(pd.Series(dec))
    sig = cot.dropna(subset=["z52", "decision"])
    sig = sig[(sig["decision"] >= IS_START) & (sig["decision"] <= IS_END)].reset_index(drop=True)

    rvf = compute_rv(wti, H)
    panel = sig.merge(rvf, left_on="decision", right_on="date", how="left", suffixes=("", "_wti"))
    n_before = len(panel)
    # Exclusion: RV invalid (non-positive/missing price in window) or target end beyond IS.
    invalid_mask = panel["rv"].isna()
    beyond_mask = panel["rv"].notna() & (panel["rv_end"] > IS_END)
    n_invalid = int(invalid_mask.sum())
    n_beyond = int(beyond_mask.sum())
    keep = panel[~invalid_mask & ~beyond_mask].copy().reset_index(drop=True)
    n_after = len(keep)
    assert (keep["decision"] <= IS_END).all() and (keep["rv_end"] <= IS_END).all(), "IS leak"

    I = keep["z52"].to_numpy(dtype=float)
    T = keep["rv"].to_numpy(dtype=float)
    r_main, n_main = pearson(I, T)
    rho_main, _ = spearman(I, T)

    lag_rows = []
    for k in LAGS:
        rk, nk = pearson(I, pd.Series(T).shift(-k).to_numpy())
        rhok, _ = spearman(I, pd.Series(T).shift(-k).to_numpy())
        lag_rows.append({"lag_weeks": k, "n": nk,
                         "pearson_r": rk, "spearman_rho": rhok})
    lag = pd.DataFrame(lag_rows)
    r_plac, n_plac = pearson(pd.Series(I).shift(PLACEBO_SHIFT).to_numpy(), T)
    half = n_after // 2
    r1, n1 = pearson(I[:half], T[:half])
    r2, n2 = pearson(I[half:], T[half:])
    s1 = "pos" if r1 > 0 else ("neg" if r1 < 0 else "nan")
    s2 = "pos" if r2 > 0 else ("neg" if r2 < 0 else "nan")

    # Frozen decision rule (§5 card): KEEP iff |r|>=0.10, same split signs, |placebo|<|r|/2.
    rule = ("KEEP-candidate" if (abs(r_main) >= 0.10 and s1 == s2 and abs(r_plac) < abs(r_main) / 2)
            else "PARK")

    print(f"[{CANDIDATE_ID}] inputs:")
    for name, h in hashes:
        print(f"  {name} sha256={h[:16]}...")
    print(f"  clf-daily-2015-2026.csv sha256={wti_hash[:16]}... "
          f"(pre-2015 rows ignored={n_wti_pre}, post-2023 rows ignored={n_wti_post})")
    print(f"  COT WTI rows={n_raw}, signal rows in IS={len(sig)}, pairs before/after exclusion={n_before}/{n_after} "
          f"(invalid-window={n_invalid}, end-beyond-IS={n_beyond}), zero-std windows={zero_std}")
    print(f"  main lag0: n={n_main} pearson_r={r_main:.4f} spearman_rho={rho_main:.4f}")
    print(f"  placebo(+{PLACEBO_SHIFT}wk): n={n_plac} r={r_plac:.4f}")
    print(f"  split-half: n1={n1} r1={r1:.4f}({s1}) n2={n2} r2={r2:.4f}({s2}) -> {rule} (추론 미검증)")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    summ = pd.DataFrame([
        ("candidate_id", CANDIDATE_ID), ("run_id", RUN_ID), ("run_utc", run_utc),
        ("command", command), ("workdir", workdir), ("git_rev", git_rev),
        ("git_dirty", str(git_dirty)), ("is_start", "2015-01-01"), ("is_end", "2023-12-31"),
        ("target", "RV5"), ("cot_wti_rows", n_raw),
        ("signal_rows_is", len(sig)), ("n_pairs_before", n_before), ("n_pairs_after", n_after),
        ("n_excluded_invalid_window", n_invalid), ("n_excluded_end_beyond_is", n_beyond),
        ("wti_pre2015_rows_ignored", n_wti_pre), ("wti_post2023_rows_ignored", n_wti_post),
        ("main_lag_weeks", 0), ("main_n", n_main),
        ("main_pearson_r", r_main), ("main_spearman_rho", rho_main),
        ("placebo_shift_weeks", PLACEBO_SHIFT), ("placebo_n", n_plac),
        ("placebo_pearson_r", r_plac),
        ("split1_n", n1), ("split1_r", r1), ("split1_sign", s1),
        ("split2_n", n2), ("split2_r", r2), ("split2_sign", s2),
        ("frozen_rule_outcome", rule), ("inference", "추론 미검증"),
        ("variant_note", "FutOnly rows; same-row Open_Interest_All denominator"),
    ], columns=["metric", "value"])

    if args.check:
        old_s = pd.read_csv(OUT_DIR / "summary.csv", dtype=str)
        old_l = pd.read_csv(OUT_DIR / "lag_table.csv")
        new_s = summ.copy()
        new_s["value"] = new_s["value"].astype(str)
        # run_utc/command/workdir/git fields are run-specific: exclude from comparison.
        skip = {"run_utc", "command", "workdir", "git_rev", "git_dirty"}
        m_old = dict(zip(old_s["metric"], old_s["value"]))
        m_new = dict(zip(new_s["metric"], new_s["value"]))
        ok = True
        for k, v in m_new.items():
            if k in skip:
                continue
            vo = m_old.get(k)
            try:
                same = (vo is not None) and (abs(float(vo) - float(v)) <= 1e-9)
            except (ValueError, TypeError):
                same = (vo == v)
            if not same:
                ok = False
                print(f"  MISMATCH summary.{k}: old={vo} new={v}")
        if len(old_l) != len(lag) or list(old_l.columns) != list(lag.columns):
            ok = False
            print("  MISMATCH lag_table shape/columns")
        else:
            for c in ["n", "pearson_r", "spearman_rho"]:
                a = old_l[c].to_numpy(dtype=float)
                b = lag[c].to_numpy(dtype=float)
                if not np.allclose(a, b, atol=1e-9, equal_nan=True):
                    ok = False
                    print(f"  MISMATCH lag_table.{c}")
        print("REPRODUCE OK" if ok else "REPRODUCE FAIL")
        sys.exit(0 if ok else 1)

    summ.to_csv(OUT_DIR / "summary.csv", index=False)
    lag.to_csv(OUT_DIR / "lag_table.csv", index=False)

    # Plot 1: index vs RV (stacked panels, shared x — no dual axis).
    fig, ax = plt.subplots(2, 1, figsize=(10, 6), sharex=True)
    ax[0].plot(keep["decision"], keep["z52"], lw=1)
    ax[0].set_ylabel("index z52 (unitless)")
    ax[0].set_title(f"{CANDIDATE_ID} COT MM-net z52 vs WTI RV5 — NYMEX WTI weekly, "
                    f"IS 2015-01-01..2023-12-31, n={n_after}")
    ax[1].plot(keep["decision"], keep["rv"], lw=1, color="tab:orange")
    ax[1].set_ylabel("RV5 (% ann.)")
    ax[1].set_xlabel("decision date (first WTI day after report-week Friday)")
    ax[1].axvline(pd.Timestamp("2023-12-31"), ls="--", lw=1, color="k")
    ax[1].text(pd.Timestamp("2023-12-31"), ax[1].get_ylim()[1], " IS cutoff ",
               ha="right", va="top", fontsize=8)
    fig.tight_layout()
    fig.savefig(OUT_DIR / "plot_series.png", dpi=120)
    plt.close(fig)

    # Plot 2: pre-registered lag curve.
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(lag["lag_weeks"], lag["pearson_r"], marker="o", label="Pearson")
    ax.plot(lag["lag_weeks"], lag["spearman_rho"], marker="s", ls="--", label="Spearman")
    ax.axhline(0, lw=1, color="k")
    ax.set_xlabel("lag k (weeks; k>0 index leads WTI RV5)")
    ax.set_ylabel("corr(index z52, RV5)")
    ax.set_title(f"{CANDIDATE_ID} lag curve — weekly, IS 2015-01-01..2023-12-31 "
                 f"(n {lag['n'].min()}..{lag['n'].max()}; placebo +26wk r={r_plac:.3f})")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(OUT_DIR / "plot_lag.png", dpi=120)
    plt.close(fig)

    hash_lines = "\n".join(f"| {n} | `{h}` |" for n, h in hashes)
    (OUT_DIR / "results.md").write_text(f"""# 실행 영수증 — {CANDIDATE_ID} / {RUN_ID}

- run_utc: {run_utc} · 실행자: SPECIALIZED division · owner {OWNER} / reviewer {REVIEWER}
- command: `{command}` · workdir: `{workdir}` · git: `{git_rev}` dirty={git_dirty}
- env: /tmp/altvenv/bin/python (pandas {pd.__version__} / numpy {np.__version__} / matplotlib {matplotlib.__version__})
- variant note: 카드 미지정 FutOnly-vs-Combined → FutOnly 사용(원시 067651행 전부 FutOnly), 분모는 동일행 Open_Interest_All.
- provenance: 구 ID ALT-20260907-01에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 |
| --- | --- |
{hash_lines}
| clf-daily-2015-2026.csv | `{wti_hash}` |

WTI 로컬 파일의 범위 외 행은 읽기만 하고 미사용: pre-2015 {n_wti_pre}행, post-2023 {n_wti_post}행 무시.
COT 시장명 변경(CRUDE OIL LIGHT SWEET → WTI-PHYSICAL, 동일 코드 067651, 시점 불명)을 관측 — 코드 기준으로만 병합.
보고 요일: 화요일이 원칙이나 월요일 보고 1건 포함(휴장 주) — 금요일+3일 규칙 동일 적용.

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| COT WTI 행(2015~2023) | {n_raw} |
| 지수+결정일 IS 행 | {len(sig)} |
| 결정-타깃 쌍(제외 전) | {n_before} |
| 제외: 가격 비양수/결측 창 (2020-04-20 −37.63 포함) | {n_invalid} |
| 제외: 타깃 종료일 2023-12-31 초과 | {n_beyond} |
| 최종 쌍(제외 후) | {n_after} |

## 결과 (IS-only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n={n_main}, Pearson r={r_main:.4f}, Spearman rho={rho_main:.4f}
- placebo 신호 +26주: n={n_plac}, r={r_plac:.4f}
- split-half: 전반 n={n1} r={r1:.4f}({s1}) / 후반 n={n2} r={r2:.4f}({s2})
- 전체 lag표: lag_table.csv (k=-4..+4주, lag별 n 포함)
- 동결 규칙 대조: **{rule}** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 표본의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 방향 알파, 인과, OOS 일반화, 유의성. vintage: CFTC 히스토리 확정치이나 개정 이력 미확인 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
""", encoding="utf-8")
    print(f"  wrote {OUT_DIR}/{{summary.csv,lag_table.csv,results.md,plot_series.png,plot_lag.png}}")


if __name__ == "__main__":
    main()
