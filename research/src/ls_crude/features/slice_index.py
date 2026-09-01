from __future__ import annotations

import numpy as np
import pandas as pd

from ls_crude.config import HORMUZ_WEIGHT, INFLATION_WEIGHT, SLICE_WINDOW
from ls_crude.data.news import news_to_daily_counts

COUNT_COLUMNS = (
    "hormuz_count",
    "inflation_count",
    "other_count",
    "headline_count",
)


def naive_index(values: pd.DatetimeIndex | pd.Index) -> pd.DatetimeIndex:
    index = pd.DatetimeIndex(pd.to_datetime(values))
    if index.tz is not None:
        index = index.tz_convert("UTC").tz_localize(None)
    return index.normalize()


def naive_sessions(values: pd.DatetimeIndex | pd.Index) -> pd.DatetimeIndex:
    return naive_index(values).unique().sort_values()


def align_daily_to_sessions(
    daily: pd.DataFrame,
    sessions: pd.DatetimeIndex,
) -> pd.DataFrame:
    """Map headline dates onto the next trading session (weekend → Monday)."""
    calendar = naive_sessions(sessions)
    empty = pd.DataFrame(0.0, index=calendar, columns=list(COUNT_COLUMNS))
    empty.index.name = "date"
    if daily.empty or calendar.empty:
        return empty

    working = daily.copy()
    working.index = naive_index(working.index)
    mapped_index: list[pd.Timestamp] = []
    mapped_rows: list[pd.Series] = []
    for date, row in working.iterrows():
        loc = int(calendar.searchsorted(date, side="left"))
        if loc >= len(calendar):
            continue
        mapped_index.append(calendar[loc])
        mapped_rows.append(row)
    if not mapped_rows:
        return empty

    mapped = pd.DataFrame(mapped_rows)
    mapped.index = pd.DatetimeIndex(mapped_index)
    summed = mapped.groupby(level=0).sum(numeric_only=True)
    aligned = summed.reindex(calendar).fillna(0.0)
    aligned.index.name = "date"
    return aligned


def oil_slice(
    news: pd.DataFrame,
    window: int = SLICE_WINDOW,
    hormuz_weight: float = HORMUZ_WEIGHT,
    inflation_weight: float = INFLATION_WEIGHT,
    calendar: pd.DatetimeIndex | None = None,
) -> pd.DataFrame:
    """Pizza-index analog: kitchen heat, not the oil quote.

    Score = 2 * Hormuz headlines + 1 * US inflation/policy headlines.
    slice_z is the rolling z-score of that score on the trading calendar.
    """
    daily = news_to_daily_counts(news)
    if calendar is not None:
        daily = align_daily_to_sessions(daily, calendar)
    if daily.empty:
        return pd.DataFrame(
            columns=["slice_score", "slice_z", "hormuz_count", "inflation_count"]
        )

    score = (
        hormuz_weight * daily["hormuz_count"]
        + inflation_weight * daily["inflation_count"]
    )
    rolling_mean = score.rolling(window, min_periods=max(5, window // 2)).mean()
    rolling_std = score.rolling(window, min_periods=max(5, window // 2)).std()
    z_score = (score - rolling_mean) / rolling_std.replace(0, np.nan)
    z_score = z_score.fillna(0.0)

    out = daily.copy()
    out["slice_score"] = score
    out["slice_z"] = z_score.astype(float)
    return out
