"""Small-sample, descriptive test for the Cushing Motel Lights concept.

The hotel-tax observations are a provisional transcription from the City of
Cushing's November 2025 agenda packet.  This script intentionally labels the
result as a pilot: there are not enough observations for an alpha claim.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr


HOTEL_TAX = [
    7671.30, 6454.69, 7644.07, 7555.46, 6902.84, 6131.73, 6340.75,
    6452.39, 8200.99, 11609.15, 13698.30, 12111.28, 13006.05, 12598.34,
]


def correlation(frame: pd.DataFrame, signal: str, target: str) -> tuple[float, float, float, int]:
    values = frame[[signal, target]].dropna()
    pearson = pearsonr(values[signal], values[target])
    return (
        pearson.statistic,
        pearson.pvalue,
        spearmanr(values[signal], values[target]).statistic,
        len(values),
    )


def main() -> None:
    crude = pd.read_csv(
        "research/data/clf-daily-2015-2026.csv", parse_dates=["date"]
    ).set_index("date").sort_index()
    crude["log_return"] = np.log(crude["Close"]).diff()
    monthly = crude.groupby(crude.index.to_period("M")).agg(
        realized_volatility=("log_return", lambda x: x.std(ddof=1) * np.sqrt(252)),
        monthly_return=("Close", lambda x: x.iloc[-1] / x.iloc[0] - 1),
    )
    panel = pd.DataFrame(
        {
            "month": pd.period_range("2024-07", "2025-08", freq="M"),
            "hotel_tax_usd": HOTEL_TAX,
        }
    ).join(monthly, on="month")
    panel["hotel_tax_change"] = panel["hotel_tax_usd"].pct_change()
    panel["next_month_rv"] = panel["realized_volatility"].shift(-1)
    panel["next_month_return"] = panel["monthly_return"].shift(-1)
    panel["next_month_absolute_return"] = panel["next_month_return"].abs()

    print(panel.round(4).to_string(index=False))
    for target in [
        "realized_volatility",
        "next_month_rv",
        "next_month_return",
        "next_month_absolute_return",
    ]:
        print(f"\n{target}")
        for signal in ["hotel_tax_usd", "hotel_tax_change"]:
            pearson, pvalue, spearman, observations = correlation(panel, signal, target)
            print(
                f"  {signal}: n={observations}, Pearson={pearson:.3f}, "
                f"p={pvalue:.3f}, Spearman={spearman:.3f}"
            )

    for label, sample in [
        ("IS through 2024-12", panel[panel["month"] <= pd.Period("2024-12", freq="M")]),
        ("OOS from 2025-01", panel[panel["month"] >= pd.Period("2025-01", freq="M")]),
    ]:
        pearson, pvalue, spearman, observations = correlation(sample, "hotel_tax_usd", "next_month_rv")
        print(
            f"\n{label}: n={observations}, hotel_tax -> next_month_rv "
            f"Pearson={pearson:.3f}, p={pvalue:.3f}, Spearman={spearman:.3f}"
        )


if __name__ == "__main__":
    main()
