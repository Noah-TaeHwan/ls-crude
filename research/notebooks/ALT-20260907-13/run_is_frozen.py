#!/usr/bin/env python3
"""IS-PARTIAL test for ALT-20260907-13 — Hormuz tanker surprise (frozen plan).

Provenance: first built as notebooks/ALT-20260907-04/run_is.py for candidate
ALT-20260907-04; a concurrent branch restructure retired IDs 01..04 and moved
the byte-identical raw inputs to ALT-20260907-13 (hashes verified, see below).
This file re-establishes the runnable artifact under the current ID. It does
NOT replace the sibling division's notebooks/.../run_is.py (different method).

Reads ONLY local inputs. 2015~2018 source gap => IS-PARTIAL on 2019-01-01~
2023-12-31 ONLY (never full-IS, never 2024+). No network.
Recipe (§4 of candidate card): tanker7 = trailing 7-day sum of daily tanker
transits -> z52w vs trailing 364d (min 180) -> decision = first WTI trading
day on/after observed day +9d -> RV5 target. Daily rows are NOT independent
observations (reported as-is, no independence claims).

Usage:
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-13/run_is_frozen.py
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-13/run_is_frozen.py --check
Workdir: repo root (/Users/noah/orca/workspaces/ls-crude/petrel).
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import timedelta, timezone
from datetime import datetime
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

CANDIDATE_ID = "ALT-20260907-13"
RUN_ID = "run-20260907-01"
REPO = Path(__file__).resolve().parents[3]
RAW_DIR = REPO / "research/gathering/raw/ALT-20260907-13/20260907T000000Z"
RAW_FILES = ["chokepoint6_2019_2023_p00.json", "chokepoint6_2019_2023_p01.json"]
WTI_PATH = REPO / "research/data/clf-daily-2015-2026.csv"
OUT_DIR = REPO / "research/indexes/ALT-20260907-13" / RUN_ID
IS_START = pd.Timestamp("2019-01-01")  # IS-PARTIAL: source starts 2019
IS_END = pd.Timestamp("2023-12-31")
H = 5
LAGS_W = list(range(-4, 5))  # weeks; daily panel => shift k*5 trading rows
PLACEBO_SHIFT = 130  # trading rows ~= +26 weeks
MIN_Z = 180
OWNER = "오태환"
REVIEWER = "손성찬"


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


def load_portwatch():
    feats, hashes = [], []
    for name in RAW_FILES:
        p = RAW_DIR / name
        hashes.append((name, sha256_file(p)))
        d = json.load(open(p))
        feats += [f["attributes"] for f in d["features"]]
    df = pd.DataFrame(feats)
    df["date"] = pd.to_datetime(df[["year", "month", "day"]])
    df = df.sort_values("date").drop_duplicates("date").reset_index(drop=True)
    return df, hashes


def compute_rv(w, h):
    dates = pd.to_datetime(w["date"]).reset_index(drop=True)
    p = w["Close"].to_numpy(dtype=float)
    n = len(p)
    ok = np.isfinite(p) & (p > 0)
    r2 = np.full(n, np.nan)
    with np.errstate(divide="ignore", invalid="ignore"):
        r2[1:] = (p[1:] / p[:-1] - 1) ** 2
    okc = np.concatenate([[0], np.cumsum(ok.astype(int))])
    finc = np.concatenate([[0], np.cumsum(np.isfinite(r2).astype(int))])
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

    pw, hashes = load_portwatch()
    n_raw = len(pw)
    # Continuity audit: full calendar coverage expected.
    full = pd.date_range("2019-01-01", "2023-12-31")
    missing = full.difference(pd.DatetimeIndex(pw["date"]))
    assert pw["n_tanker"].isna().sum() == 0 and (pw["n_tanker"] < 0).sum() == 0
    wti = pd.read_csv(WTI_PATH, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
    wti_hash = sha256_file(WTI_PATH)
    n_wti_pre2019 = int((wti["date"] < IS_START).sum())
    n_wti_post = int((wti["date"] > IS_END).sum())
    assert n_wti_post > 0

    # tanker7 = trailing 7 calendar-day sum, requires 7 valid days (no zero-fill).
    pw = pw.set_index("date").asfreq("D")
    n_cal_missing = int(pw["n_tanker"].isna().sum())
    cnt7 = pw["n_tanker"].rolling(7, min_periods=7).count()
    tanker7 = pw["n_tanker"].rolling(7, min_periods=7).sum()
    tanker7[cnt7 < 7] = np.nan
    # z52w trailing 364d incl. current, min 180.
    t7 = tanker7.to_numpy(dtype=float)
    z = np.full(len(t7), np.nan)
    zero_std = 0
    for i in range(len(t7)):
        win = t7[max(0, i - 363): i + 1]
        win = win[np.isfinite(win)]
        if len(win) < MIN_Z:
            continue
        sd = win.std(ddof=1)
        if sd == 0:
            z[i] = 0.0
            zero_std += 1
        else:
            z[i] = (t7[i] - win.mean()) / sd
    pw["tanker7"] = t7
    pw["z52w"] = z
    pw = pw.reset_index()

    # Decision: first WTI trading day on/after observed +9d.
    tdays = pd.to_datetime(wti["date"]).to_numpy()
    dec = []
    for d in pw["date"]:
        tgt = np.datetime64((d + timedelta(days=9)).date())
        k = int(np.searchsorted(tdays, tgt, side="left"))
        dec.append(pd.Timestamp(tdays[k]) if k < len(tdays) else pd.NaT)
    pw["decision"] = pd.to_datetime(pd.Series(dec))
    sig = pw.dropna(subset=["z52w", "decision"])
    sig = sig[(sig["decision"] >= IS_START) & (sig["decision"] <= IS_END)].reset_index(drop=True)

    rvf = compute_rv(wti, H)
    panel = sig.merge(rvf, left_on="decision", right_on="date", how="left")
    n_before = len(panel)
    invalid_mask = panel["rv"].isna()
    beyond_mask = panel["rv"].notna() & (panel["rv_end"] > IS_END)
    n_invalid = int(invalid_mask.sum())
    n_beyond = int(beyond_mask.sum())
    keep = panel[~invalid_mask & ~beyond_mask].copy().reset_index(drop=True)
    n_after = len(keep)
    assert (keep["decision"] <= IS_END).all() and (keep["rv_end"] <= IS_END).all()

    I = keep["z52w"].to_numpy(dtype=float)
    T = keep["rv"].to_numpy(dtype=float)
    r_main, n_main = pearson(I, T)
    rho_main, _ = spearman(I, T)
    lag_rows = []
    for k in LAGS_W:
        s = k * 5
        rk, nk = pearson(I, pd.Series(T).shift(-s).to_numpy())
        rhok, _ = spearman(I, pd.Series(T).shift(-s).to_numpy())
        lag_rows.append({"lag_weeks": k, "shift_trading_days": s, "n": nk,
                         "pearson_r": rk, "spearman_rho": rhok})
    lag = pd.DataFrame(lag_rows)
    r_plac, n_plac = pearson(pd.Series(I).shift(PLACEBO_SHIFT).to_numpy(), T)
    half = n_after // 2
    r1, n1 = pearson(I[:half], T[:half])
    r2, n2 = pearson(I[half:], T[half:])
    s1 = "pos" if r1 > 0 else ("neg" if r1 < 0 else "nan")
    s2 = "pos" if r2 > 0 else ("neg" if r2 < 0 else "nan")
    rule = ("KEEP-candidate" if (abs(r_main) >= 0.10 and s1 == s2 and abs(r_plac) < abs(r_main) / 2)
            else "PARK")

    print(f"[{CANDIDATE_ID}] IS-PARTIAL 2019-2023 inputs:")
    for name, h in hashes:
        print(f"  {name} sha256={h[:16]}...")
    print(f"  tanker daily rows={n_raw}, calendar gaps={len(missing)}, cal-missing-after-asfreq={n_cal_missing}")
    print(f"  clf-daily-2015-2026.csv sha256={wti_hash[:16]}... "
          f"(pre-2019 ignored={n_wti_pre2019}, post-2023 ignored={n_wti_post})")
    print(f"  signal rows in IS-partial={len(sig)}, pairs before/after={n_before}/{n_after} "
          f"(invalid-window={n_invalid}, end-beyond-IS={n_beyond}), zero-std={zero_std}")
    print(f"  main lag0: n={n_main} pearson_r={r_main:.4f} spearman_rho={rho_main:.4f}")
    print(f"  placebo(+130td~=26wk): n={n_plac} r={r_plac:.4f}")
    print(f"  split-half: n1={n1} r1={r1:.4f}({s1}) n2={n2} r2={r2:.4f}({s2}) -> {rule} (추론 미검증)")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    summ = pd.DataFrame([
        ("candidate_id", CANDIDATE_ID), ("run_id", RUN_ID), ("run_utc", run_utc),
        ("command", command), ("workdir", workdir), ("git_rev", git_rev),
        ("git_dirty", str(git_dirty)), ("is_start", "2019-01-01 (IS-PARTIAL)"),
        ("is_end", "2023-12-31"), ("target", "RV5"),
        ("raw_daily_rows", n_raw), ("raw_calendar_gaps", len(missing)),
        ("signal_rows_is_partial", len(sig)),
        ("n_pairs_before", n_before), ("n_pairs_after", n_after),
        ("n_excluded_invalid_window", n_invalid), ("n_excluded_end_beyond_is", n_beyond),
        ("wti_pre2019_rows_ignored", n_wti_pre2019), ("wti_post2023_rows_ignored", n_wti_post),
        ("main_lag_weeks", 0), ("main_n", n_main),
        ("main_pearson_r", r_main), ("main_spearman_rho", rho_main),
        ("placebo_shift_trading_days", PLACEBO_SHIFT), ("placebo_n", n_plac),
        ("placebo_pearson_r", r_plac),
        ("split1_n", n1), ("split1_r", r1), ("split1_sign", s1),
        ("split2_n", n2), ("split2_r", r2), ("split2_sign", s2),
        ("frozen_rule_outcome", rule), ("inference", "추론 미검증"),
        ("variant_note", "IS-PARTIAL only; never full-IS; daily rows not independent"),
    ], columns=["metric", "value"])

    if args.check:
        old_s = pd.read_csv(OUT_DIR / "summary.csv", dtype=str)
        old_l = pd.read_csv(OUT_DIR / "lag_table.csv")
        new_s = summ.copy()
        new_s["value"] = new_s["value"].astype(str)
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
                if not np.allclose(old_l[c].to_numpy(dtype=float), lag[c].to_numpy(dtype=float),
                                   atol=1e-9, equal_nan=True):
                    ok = False
                    print(f"  MISMATCH lag_table.{c}")
        print("REPRODUCE OK" if ok else "REPRODUCE FAIL")
        sys.exit(0 if ok else 1)

    summ.to_csv(OUT_DIR / "summary.csv", index=False)
    lag.to_csv(OUT_DIR / "lag_table.csv", index=False)

    fig, ax = plt.subplots(2, 1, figsize=(10, 6), sharex=True)
    ax[0].plot(keep["decision"], keep["z52w"], lw=0.7)
    ax[0].set_ylabel("index z52w (unitless)")
    ax[0].set_title(f"{CANDIDATE_ID} Hormuz tanker7-z52w vs WTI RV5 — Strait of Hormuz daily, "
                    f"IS-PARTIAL 2019-01-01..2023-12-31, n={n_after}")
    ax[1].plot(keep["decision"], keep["rv"], lw=0.7, color="tab:orange")
    ax[1].set_ylabel("RV5 (% ann.)")
    ax[1].set_xlabel("decision date (first WTI day on/after observed+9d)")
    ax[1].axvline(pd.Timestamp("2023-12-31"), ls="--", lw=1, color="k")
    ax[1].text(pd.Timestamp("2023-12-31"), ax[1].get_ylim()[1], " IS cutoff ",
               ha="right", va="top", fontsize=8)
    fig.tight_layout()
    fig.savefig(OUT_DIR / "plot_series.png", dpi=120)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(lag["lag_weeks"], lag["pearson_r"], marker="o", label="Pearson")
    ax.plot(lag["lag_weeks"], lag["spearman_rho"], marker="s", ls="--", label="Spearman")
    ax.axhline(0, lw=1, color="k")
    ax.set_xlabel("lag k (weeks ~= k*5 trading days; k>0 index leads WTI RV5)")
    ax.set_ylabel("corr(tanker z52w, RV5)")
    ax.set_title(f"{CANDIDATE_ID} lag curve — daily panel, IS-PARTIAL 2019-01-01..2023-12-31 "
                 f"(n {lag['n'].min()}..{lag['n'].max()}; placebo +130td r={r_plac:.3f})")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(OUT_DIR / "plot_lag.png", dpi=120)
    plt.close(fig)

    hash_lines = "\n".join(f"| {n} | `{h}` |" for n, h in hashes)
    (OUT_DIR / "results.md").write_text(f"""# 실행 영수증 — {CANDIDATE_ID} / {RUN_ID} (IS-PARTIAL)

- run_utc: {run_utc} · 실행자: SPECIALIZED division · owner {OWNER} / reviewer {REVIEWER}
- command: `{command}` · workdir: `{workdir}` · git: `{git_rev}` dirty={git_dirty}
- env: /tmp/altvenv/bin/python (pandas {pd.__version__} / numpy {np.__version__} / matplotlib {matplotlib.__version__})
- 범위 고지: **IS-PARTIAL 2019-01-01~2023-12-31** — 2015~2018 원천 부재(카드 §3). 전체-IS 주장 금지, OOS 검증 주장 금지.
- provenance: 구 ID ALT-20260907-04에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 |
| --- | --- |
{hash_lines}
| clf-daily-2015-2026.csv | `{wti_hash}` |

일별 유조선 {n_raw}행, 달력 공백 {len(missing)}일, asfreq 후 결측 {n_cal_missing}.
WTI pre-2019 {n_wti_pre2019}행·post-2023 {n_wti_post}행은 읽기만 하고 미사용.
추정치는 AIS 기반 추정치이며 실측 통관이 아님(카드 §1 한계).

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| 지수+결정일 IS-partial 행 | {len(sig)} |
| 결정-타깃 쌍(제외 전) | {n_before} |
| 제외: 가격 비양수/결측 창 | {n_invalid} |
| 제외: 타깃 종료일 2023-12-31 초과 | {n_beyond} |
| 최종 쌍(제외 후) | {n_after} |

일별 복제를 독립 표본으로 세지 않음.

## 결과 (IS-partial only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n={n_main}, Pearson r={r_main:.4f}, Spearman rho={rho_main:.4f}
- placebo 신호 +130거래일(~26주): n={n_plac}, r={r_plac:.4f}
- split-half: 전반 n={n1} r={r1:.4f}({s1}) / 후반 n={n2} r={r2:.4f}({s2})
- 전체 lag표: lag_table.csv (k=-4..+4주 ≈ k*5거래일 시프트, lag별 n 포함)
- 동결 규칙 대조: **{rule}** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 부분구간의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 전체-IS 일반화, 방향 알파, 인과, OOS 검증, 유의성. vintage: 수집 시점 빈티지, 소급 개정 가능 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
""", encoding="utf-8")
    print(f"  wrote {OUT_DIR}/{{summary.csv,lag_table.csv,results.md,plot_series.png,plot_lag.png}}")


if __name__ == "__main__":
    main()
