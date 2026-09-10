"""주간 묶음 탐색: 01 바지선 z52 + 36 수박 share vs WTI 주간 수익률 (IS만, 오프라인).

plan.md 사전 고정대로 실행. 2024+는 assert로 차단. as-of NOT SAFE(탐색용).
"""
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
NB = Path(__file__).resolve().parent
IS_END = pd.Timestamp("2023-12-31")
CUTOFF = pd.Timestamp("2024-01-01")


def w_saturday(d: pd.Series) -> pd.Series:
    return (d + pd.to_timedelta((5 - d.dt.weekday) % 7, unit="D")).dt.normalize()


def main() -> None:
    # 1. 동결 WTI → 주간 종가 → 다음 1/4주 수익률
    wti = pd.read_csv(ROOT / "research/gathering/raw/ALT-20260907-01/20260907T062017Z/wti.csv",
                      parse_dates=["date"])
    assert wti["date"].max() < CUTOFF, "2024+ 침범"
    wti = wti[wti["date"] <= IS_END].sort_values("date")
    close = wti.set_index("date")["Close"].astype(float)
    bad = int(((~np.isfinite(close)) | (close <= 0)).sum())
    print(f"wti rows={len(close)} dropped_nonpositive_or_nan={bad}")
    close = close[np.isfinite(close) & (close > 0)]
    wk = close.groupby(w_saturday(close.index.to_series())).last()
    wk.index.name = "week"
    frame = pd.DataFrame({"wti_close": wk})
    frame["fwd1"] = frame["wti_close"].shift(-1) / frame["wti_close"] - 1
    frame["fwd4"] = frame["wti_close"].shift(-4) / frame["wti_close"] - 1

    # 2. 신호 붙이기
    barge = pd.read_csv(ROOT / "research/data/processed/ALT-20260907-01/20260907T070159Z/barge_wti_weekly_is.csv",
                        parse_dates=["week_ending"])
    assert barge["week_ending"].max() < CUTOFF
    frame["sig_barge"] = barge.set_index("week_ending")["z52"]

    wm = pd.read_csv(ROOT / "research/data/processed/ALT-20260907-36/20260908T065043Z/weekly.csv",
                     parse_dates=["date"])
    wm_is = wm[wm["date"].between("2015-01-01", IS_END)]
    wm_w = wm_is.groupby(w_saturday(wm_is["date"])).agg(sig_wm=("share_ge4_pct", "last"))
    frame["sig_wm"] = wm_w["sig_wm"]
    frame = frame.loc["2015-01-01":IS_END]

    print(f"weeks total={len(frame)} barge_n={frame['sig_barge'].notna().sum()} "
          f"wm_n={frame['sig_wm'].notna().sum()} both_n={frame[['sig_barge','sig_wm']].notna().all(axis=1).sum()}")

    rows = []

    def ols(y: pd.Series, X: pd.DataFrame, tag: str) -> None:
        d = pd.concat([y, X], axis=1).dropna()
        n = len(d)
        if n < 24:
            rows.append({"test": tag, "n": n, "note": "n<24 SKIP"})
            print(f"{tag}: n={n} SKIP"); return
        A = np.column_stack([np.ones(n), d.iloc[:, 1:].to_numpy()])
        beta, *_ = np.linalg.lstsq(A, d.iloc[:, 0].to_numpy(), rcond=None)
        pred = A @ beta
        ss = float(((d.iloc[:, 0] - pred) ** 2).sum())
        tt = float(((d.iloc[:, 0] - d.iloc[:, 0].mean()) ** 2).sum())
        r2 = 1 - ss / tt if tt > 0 else np.nan
        rows.append({"test": tag, "n": n, "coef": np.round(beta[1:], 4).tolist(),
                     "intercept": round(float(beta[0]), 5), "R2": round(float(r2), 4)})
        print(f"{tag}: n={n} coef={np.round(beta[1:], 4)} R2={r2:.4f}")

    # 3. lag 상관 (전부 공개)
    for sig in ["sig_barge", "sig_wm"]:
        for k in [-4, -3, -2, -1, 0, 1, 2, 3, 4]:
            d = pd.DataFrame({"s": frame[sig], "t": frame["fwd4"].shift(-k)}).dropna()
            c = d["s"].corr(d["t"]) if len(d) >= 2 and d["s"].std() > 0 else np.nan
            rows.append({"test": f"lagcorr_{sig}_k{k}", "n": len(d), "corr": round(float(c), 4) if pd.notna(c) else None})
    lag = pd.DataFrame([r for r in rows if r["test"].startswith("lagcorr")])
    print(lag.to_string(index=False))

    # 4. OLS 단독 + 묶음 (z-score는 IS 안에서만)
    z = frame[["sig_barge", "sig_wm"]].apply(lambda s: (s - s.mean()) / s.std())
    ols(frame["fwd4"], z[["sig_barge"]].rename(columns={"sig_barge": "z_barge"}), "ols_barge_fwd4")
    ols(frame["fwd4"], z[["sig_wm"]].rename(columns={"sig_wm": "z_wm"}), "ols_wm_fwd4")
    ols(frame["fwd4"], z.rename(columns={"sig_barge": "z_barge", "sig_wm": "z_wm"}), "ols_combo_fwd4")

    # 5. placebo (52주 shift)
    zp = z.shift(52).rename(columns={"sig_barge": "pz_barge", "sig_wm": "pz_wm"})
    ols(frame["fwd4"], zp, "ols_placebo52_fwd4")

    pd.DataFrame(rows).to_csv(NB / "results.csv", index=False)
    print("saved results.csv")


if __name__ == "__main__":
    main()
