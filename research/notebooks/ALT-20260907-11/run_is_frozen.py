#!/usr/bin/env python3
"""IS test for ALT-20260907-11 — US distillate demand surprise (frozen plan).

Provenance: first built as notebooks/ALT-20260907-02/run_is.py for candidate
ALT-20260907-02; a concurrent branch restructure retired IDs 01..04 and moved
the byte-identical raw input to ALT-20260907-11 (hash verified, see below).
This file re-establishes the runnable artifact under the current ID. It does
NOT replace the sibling division's notebooks/.../run_is.py (different method).

Reads ONLY local inputs, IS ONLY 2015-01-01~2023-12-31. No network.
Recipe (§4 of candidate card, 039 spec reused): dist4 = trailing 4-week mean of
weekly distillate product supplied -> z52 vs trailing 52w (min 26) ->
decision = first WTI trading day on/after observed Friday +5d -> RV5 target.

Usage:
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-11/run_is_frozen.py
  /tmp/altvenv/bin/python research/notebooks/ALT-20260907-11/run_is_frozen.py --check
Workdir: repo root (/Users/noah/orca/workspaces/ls-crude/petrel).
"""
import argparse
import hashlib
import numbers
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
import xlrd

CANDIDATE_ID = "ALT-20260907-11"
RUN_ID = "run-20260907-01"
REPO = Path(__file__).resolve().parents[3]
RAW_FILE = REPO / "research/gathering/raw/ALT-20260907-11/20260907T000000Z/WDIUPUS2w.xls"
WTI_PATH = REPO / "research/data/clf-daily-2015-2026.csv"
OUT_DIR = REPO / "research/indexes/ALT-20260907-11" / RUN_ID
IS_START = pd.Timestamp("2015-01-01")
IS_END = pd.Timestamp("2023-12-31")
H = 5
LAGS = list(range(-4, 5))
PLACEBO_SHIFT = 26
MIN_Z = 26
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


def load_eia():
    """Return frame[friday, supply] parsed from Data 1 sheet (whole history)."""
    book = xlrd.open_workbook(str(RAW_FILE))
    sh = book.sheet_by_name("Data 1")
    rows = []
    for r in range(sh.nrows):
        v0, v1 = sh.cell_value(r, 0), sh.cell_value(r, 1)
        if isinstance(v0, numbers.Number) and 20000 < v0 < 80000:
            dt = xlrd.xldate_as_datetime(float(v0), book.datemode).date()
            try:
                sup = float(v1)
            except (TypeError, ValueError):
                sup = np.nan
            rows.append((pd.Timestamp(dt), sup))
    df = pd.DataFrame(rows, columns=["friday", "supply"]).sort_values("friday")
    df = df.drop_duplicates("friday").reset_index(drop=True)
    return df


def load_wti():
    w = pd.read_csv(WTI_PATH, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
    return w, int((w["date"] < IS_START).sum()), int((w["date"] > IS_END).sum())


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

    raw_hash = sha256_file(RAW_FILE)
    eia = load_eia()
    n_raw_hist = len(eia)
    n_oor = int(((eia["friday"] < IS_START) | (eia["friday"] > IS_END)).sum())
    assert eia["supply"].isna().sum() == 0, "unexpected NaN supply in raw"
    wti, n_wti_pre, n_wti_post = load_wti()
    wti_hash = sha256_file(WTI_PATH)
    assert n_wti_post > 0

    # dist4 trailing 4w incl. current; z52 trailing 52 of dist4, min 26.
    sup = eia["supply"].to_numpy(dtype=float)
    dist4 = pd.Series(sup).rolling(4, min_periods=4).mean().to_numpy()
    z = np.full(len(sup), np.nan)
    zero_std = 0
    for i in range(len(sup)):
        win = dist4[max(0, i - 51): i + 1]
        win = win[np.isfinite(win)]
        if len(win) < MIN_Z:
            continue
        sd = win.std(ddof=1)
        if sd == 0:
            z[i] = 0.0
            zero_std += 1
        else:
            z[i] = (dist4[i] - win.mean()) / sd
    eia["dist4"] = dist4
    eia["z52"] = z

    # Decision: first WTI trading day on/after Friday +5d.
    tdays = pd.to_datetime(wti["date"]).to_numpy()
    first, last = tdays[0], tdays[-1]
    dec = []
    for f in eia["friday"]:
        tgt = np.datetime64((f + timedelta(days=5)).date())
        if tgt < first or tgt > last:
            dec.append(pd.NaT)  # out-of-range obs must not clamp to boundary
            continue
        k = int(np.searchsorted(tdays, tgt, side="left"))
        dec.append(pd.Timestamp(tdays[k]) if k < len(tdays) else pd.NaT)
    eia["decision"] = pd.to_datetime(pd.Series(dec))
    sig = eia.dropna(subset=["z52", "decision"])
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

    I = keep["z52"].to_numpy(dtype=float)
    T = keep["rv"].to_numpy(dtype=float)
    r_main, n_main = pearson(I, T)
    rho_main, _ = spearman(I, T)
    lag_rows = []
    for k in LAGS:
        rk, nk = pearson(I, pd.Series(T).shift(-k).to_numpy())
        rhok, _ = spearman(I, pd.Series(T).shift(-k).to_numpy())
        lag_rows.append({"lag_weeks": k, "n": nk, "pearson_r": rk, "spearman_rho": rhok})
    lag = pd.DataFrame(lag_rows)
    r_plac, n_plac = pearson(pd.Series(I).shift(PLACEBO_SHIFT).to_numpy(), T)
    half = n_after // 2
    r1, n1 = pearson(I[:half], T[:half])
    r2, n2 = pearson(I[half:], T[half:])
    s1 = "pos" if r1 > 0 else ("neg" if r1 < 0 else "nan")
    s2 = "pos" if r2 > 0 else ("neg" if r2 < 0 else "nan")
    rule = ("KEEP-candidate" if (abs(r_main) >= 0.10 and s1 == s2 and abs(r_plac) < abs(r_main) / 2)
            else "PARK")

    print(f"[{CANDIDATE_ID}] inputs:")
    print(f"  WDIUPUS2w.xls sha256={raw_hash[:16]}... rows={n_raw_hist} "
          f"(out-of-IS weeks ignored={n_oor}, NaN supply=0)")
    print(f"  clf-daily-2015-2026.csv sha256={wti_hash[:16]}... "
          f"(pre-2015 ignored={n_wti_pre}, post-2023 ignored={n_wti_post})")
    print(f"  signal rows in IS={len(sig)}, pairs before/after={n_before}/{n_after} "
          f"(invalid-window={n_invalid}, end-beyond-IS={n_beyond}), zero-std={zero_std}")
    print(f"  main lag0: n={n_main} pearson_r={r_main:.4f} spearman_rho={rho_main:.4f}")
    print(f"  placebo(+{PLACEBO_SHIFT}wk): n={n_plac} r={r_plac:.4f}")
    print(f"  split-half: n1={n1} r1={r1:.4f}({s1}) n2={n2} r2={r2:.4f}({s2}) -> {rule} (추론 미검증)")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    summ = pd.DataFrame([
        ("candidate_id", CANDIDATE_ID), ("run_id", RUN_ID), ("run_utc", run_utc),
        ("command", command), ("workdir", workdir), ("git_rev", git_rev),
        ("git_dirty", str(git_dirty)), ("is_start", "2015-01-01"), ("is_end", "2023-12-31"),
        ("target", "RV5"), ("raw_history_rows", n_raw_hist), ("raw_out_of_is_ignored", n_oor),
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
        ("variant_note", "none — card recipe followed exactly"),
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
    ax[0].plot(keep["decision"], keep["z52"], lw=1)
    ax[0].set_ylabel("index z52 (unitless)")
    ax[0].set_title(f"{CANDIDATE_ID} distillate dist4-z52 vs WTI RV5 — US weekly, "
                    f"IS 2015-01-01..2023-12-31, n={n_after}")
    ax[1].plot(keep["decision"], keep["rv"], lw=1, color="tab:orange")
    ax[1].set_ylabel("RV5 (% ann.)")
    ax[1].set_xlabel("decision date (first WTI day on/after Friday+5d)")
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
    ax.set_xlabel("lag k (weeks; k>0 index leads WTI RV5)")
    ax.set_ylabel("corr(distillate z52, RV5)")
    ax.set_title(f"{CANDIDATE_ID} lag curve — weekly, IS 2015-01-01..2023-12-31 "
                 f"(n {lag['n'].min()}..{lag['n'].max()}; placebo +26wk r={r_plac:.3f})")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(OUT_DIR / "plot_lag.png", dpi=120)
    plt.close(fig)

    (OUT_DIR / "results.md").write_text(f"""# 실행 영수증 — {CANDIDATE_ID} / {RUN_ID}

- run_utc: {run_utc} · 실행자: SPECIALIZED division · owner {OWNER} / reviewer {REVIEWER}
- command: `{command}` · workdir: `{workdir}` · git: `{git_rev}` dirty={git_dirty}
- env: /tmp/altvenv/bin/python (pandas {pd.__version__} / numpy {np.__version__} / matplotlib {matplotlib.__version__} / xlrd {xlrd.__version__})
- variant note: 없음 — 카드 구성(dist4 4주평균 → z52, +5d)을 그대로 따름.
- provenance: 구 ID ALT-20260907-02에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 | 비고 |
| --- | --- | --- |
| WDIUPUS2w.xls | `{raw_hash}` | Data 1 시트 {n_raw_hist}주 (1991~2026), IS 밖 {n_oor}주 무시, 결측 0 |
| clf-daily-2015-2026.csv | `{wti_hash}` | pre-2015 {n_wti_pre}행·post-2023 {n_wti_post}행 무시 |

원시 주기는 금요일 week-ending 확인. 039 휘발유 기각은 기저율로만 사용.
워밍업 고지: z52 후행창은 과거 관측만 사용하므로 파일 내 2015년 이전 이력도
번인으로 사용(미래 누수 없음) — 평가 쌍은 전부 IS 결정일.
범위 외 관측의 결정일은 경계 거래일로 클램프하지 않고 NaT로 버림(경계 오염 방지).

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| 지수+결정일 IS 행 | {len(sig)} |
| 결정-타깃 쌍(제외 전) | {n_before} |
| 제외: 가격 비양수/결측 창 | {n_invalid} |
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
- 주장 불가: 방향 알파, 인과, OOS 일반화, 유의성. vintage: EIA DNAV 현재 빈티지, 과거 개정 미복원 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
""", encoding="utf-8")
    print(f"  wrote {OUT_DIR}/{{summary.csv,lag_table.csv,results.md,plot_series.png,plot_lag.png}}")


if __name__ == "__main__":
    main()
