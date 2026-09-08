"""Test the only long, public proxy for 091-Y: Oklahoma retail regular gasoline.

This is deliberately *not* a backtest of a Cushing station.  EIA stopped publishing
the Oklahoma retail-price series after 2022, while the fixed Maverik page has only
five irregular archived observations.  The test answers a narrower question: whether
the public state retail series is a crude-price lead, or is merely a delayed product
price response.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-28" / "20260908T210000Z"
OUT = ROOT / "research" / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091YDEEPZ"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def tidy_eia(path: Path, value_name: str) -> pd.DataFrame:
    wide = pd.read_html(path)[4]
    wide["Year"] = pd.to_numeric(wide["Year"], errors="coerce")
    wide = wide.dropna(subset=["Year"])
    long = wide.melt(id_vars="Year", value_vars=MONTHS, var_name="month", value_name=value_name)
    long[value_name] = pd.to_numeric(long[value_name], errors="coerce")
    long["month_n"] = pd.Categorical(long["month"], MONTHS, ordered=True).codes + 1
    long["date"] = pd.to_datetime(dict(year=long["Year"].astype(int), month=long["month_n"], day=1))
    return long[["date", value_name]].dropna().sort_values("date")


def corr(a: pd.Series, b: pd.Series) -> float:
    return a.corr(b)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    gas = tidy_eia(RAW / "eia_ok_regular_retail_history.html", "ok_regular")
    wti = tidy_eia(RAW / "eia_wti_monthly_history.html", "wti")
    df = gas.merge(wti, on="date", how="inner")
    df["gas_return"] = df.ok_regular.pct_change()
    df["wti_return"] = df.wti.pct_change()
    df["future_gas_return_1m"] = df.gas_return.shift(-1)
    df["future_wti_return_1m"] = df.wti_return.shift(-1)
    test = df.dropna().copy()
    results = pd.DataFrame([
        {"relationship": "same-month WTI return → Oklahoma regular-gas return", "r": corr(test.wti_return, test.gas_return), "n": len(test), "meaning": "contemporaneous pass-through"},
        {"relationship": "WTI return → next-month Oklahoma regular-gas return", "r": corr(test.wti_return, test.future_gas_return_1m), "n": test[["wti_return", "future_gas_return_1m"]].dropna().shape[0], "meaning": "retail repricing lag"},
        {"relationship": "Oklahoma regular-gas return → next-month WTI return", "r": corr(test.gas_return, test.future_wti_return_1m), "n": test[["gas_return", "future_wti_return_1m"]].dropna().shape[0], "meaning": "reverse-direction test"},
    ])
    results.to_csv(OUT / "retail_proxy_lag_tests.csv", index=False, float_format="%.6f")
    df.to_csv(OUT / "eia_ok_retail_regular_wti_monthly.csv", index=False, float_format="%.6f")

    fig, ax = plt.subplots(figsize=(10, 4.8))
    z = (df[["ok_regular", "wti"]] - df[["ok_regular", "wti"]].mean()) / df[["ok_regular", "wti"]].std()
    ax.plot(df.date, z.ok_regular, label="Oklahoma regular gasoline (z-score)", color="#0b6e4f", linewidth=1.4)
    ax.plot(df.date, z.wti, label="Cushing WTI (z-score)", color="#bd3e34", linewidth=1.1, alpha=.85)
    ax.set_title("Long public proxy: Oklahoma retail gasoline vs Cushing WTI")
    ax.set_ylabel("standard deviations")
    ax.grid(alpha=.22)
    ax.legend(frameon=False, ncol=2, loc="upper left")
    fig.tight_layout()
    fig.savefig(OUT / "figures" / "091y-ok-retail-wti-proxy.svg", format="svg") if (OUT / "figures").exists() else None


if __name__ == "__main__":
    (OUT / "figures").mkdir(parents=True, exist_ok=True)
    main()
