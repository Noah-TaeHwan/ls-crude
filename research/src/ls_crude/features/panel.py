from __future__ import annotations

import pandas as pd

from ls_crude.config import RSI_PERIOD
from ls_crude.data.splits import add_sample_split
from ls_crude.features.rsi import rsi
from ls_crude.features.slice_index import oil_slice


def build_daily_panel(
    prices: pd.DataFrame,
    news: pd.DataFrame,
    macro: pd.DataFrame | None = None,
) -> pd.DataFrame:
    panel = add_sample_split(prices)
    panel[f"rsi_{RSI_PERIOD}"] = rsi(panel["Close"])
    slice_frame = oil_slice(news, calendar=panel.index)
    panel = panel.join(slice_frame, how="left")
    count_columns = [
        "hormuz_count",
        "inflation_count",
        "other_count",
        "headline_count",
        "slice_score",
        "slice_z",
    ]
    for column in count_columns:
        if column in panel.columns:
            panel[column] = panel[column].fillna(0.0)
    if macro is not None and not macro.empty:
        aligned = macro.reindex(panel.index, method="ffill")
        panel = panel.join(aligned, how="left")
    return panel
