"""여름 콤보: CDD YoY + 수박 월 share YoY vs WTI 월 수익률 (IS만, 오프라인).

plan.md 사전 고정대로 실행. 2024+ assert 차단. as-of NOT SAFE(탐색용).
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
NB = Path(__file__).resolve().parent
IS_END = pd.Timestamp("2023-12-31")
CUTOFF = pd.Timestamp("2024-01-01")


def main() -> None:
    # 1. WTI 월말 종가 → 다음 1/3개월 수익률 (동결 일봉)
    wti = pd.read_csv(ROOT / "research/gathering/raw/ALT-20260907-01/20260907T062017Z/wti.csv",
                      parse_dates=["date"])
    assert wti["date"].max() < CUTOFF, "2024+ 침범"
    wti = wti[wti["date"] <= IS_END].sort_values("date")
    close = wti.set_index("date")["Close"].astype(float)
    close = close[np.isfinite(close) & (close > 0)]
    mend = close.groupby(close.index.to_period("M")).last()
    mend.index = mend.index.to_timestamp("M")
    frame = pd.DataFrame({"wti_close": mend})
    frame["fwd1m"] = frame["wti_close"].shift(-1) / frame["wti_close"] - 1
    frame["fwd3m"] = frame["wti_close"].shift(-3) / frame["wti_close"] - 1

    # 2. 도일 CDD YoY (월)
    dd = json.load(open(ROOT / "research/indexes/web-observations/v2/degree-days.json"))["points"]
    dd = pd.DataFrame(dd)
    dd["month"] = pd.to_datetime(dd["month"]) + pd.offsets.MonthEnd(0)
    assert dd["month"].max() <= IS_END
    frame["sig_cdd"] = dd.set_index("month")["providerCDDYoy"].astype(float)

    # 3. 수박 월평균 share → YoY (당월 − 12개월 전)
    wm = pd.DataFrame(json.load(open(ROOT / "research/indexes/web-observations/v2/watermelon.json"))["points"])
    wm["date"] = pd.to_datetime(wm["date"])
    wm["share"] = wm["numerator"] / wm["denominator"]
    wm = wm[wm["date"] < CUTOFF]
    wm_m = wm.groupby(wm["date"].dt.to_period("M"))["share"].mean()
    wm_m.index = wm_m.index.to_timestamp("M")
    frame["sig_wm"] = (wm_m - wm_m.shift(12)).reindex(frame.index)

    frame = frame.loc["2015-01-31":IS_END]
    print(f"months={len(frame)} cdd_n={frame['sig_cdd'].notna().sum()} "
          f"wm_n={frame['sig_wm'].notna().sum()} both_n={frame[['sig_cdd','sig_wm']].notna().all(axis=1).sum()}")

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

    for sig in ["sig_cdd", "sig_wm"]:
        for k in [-3, -2, -1, 0, 1, 2, 3]:
            d = pd.DataFrame({"s": frame[sig], "t": frame["fwd1m"].shift(-k)}).dropna()
            c = d["s"].corr(d["t"]) if len(d) >= 2 and d["s"].std() > 0 else np.nan
            rows.append({"test": f"lagcorr_{sig}_k{k}", "n": len(d),
                         "corr": round(float(c), 4) if pd.notna(c) else None})
    print(pd.DataFrame([r for r in rows if r["test"].startswith("lagcorr")]).to_string(index=False))

    z = frame[["sig_cdd", "sig_wm"]].apply(lambda s: (s - s.mean()) / s.std())
    z["z_summer"] = z.mean(axis=1)
    ols(frame["fwd1m"], z[["sig_cdd"]], "ols_cdd_fwd1m")
    ols(frame["fwd1m"], z[["sig_wm"]], "ols_wm_fwd1m")
    ols(frame["fwd1m"], z[["z_summer"]], "ols_summer_fwd1m")
    zp = z.shift(12).add_suffix("_pb")
    ols(frame["fwd1m"], zp[[c for c in zp.columns if c != "z_summer_pb"]], "ols_placebo12_fwd1m")

    pd.DataFrame(rows).to_csv(NB / "results.csv", index=False)
    print("saved results.csv")


if __name__ == "__main__":
    main()
