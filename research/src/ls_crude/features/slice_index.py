from __future__ import annotations

import numpy as np
import pandas as pd

from ls_crude.config import HORMUZ_WEIGHT, INFLATION_WEIGHT, SLICE_WINDOW
from ls_crude.data.news import news_to_daily_counts


def oil_slice(
    news: pd.DataFrame,
    window: int = SLICE_WINDOW,
    hormuz_weight: float = HORMUZ_WEIGHT,
    inflation_weight: float = INFLATION_WEIGHT,
) -> pd.DataFrame:
    """Pizza-index analog: kitchen heat, not the oil quote.

    Score = 2 * Hormuz headlines + 1 * US inflation/policy headlines.
    slice_z is the rolling z-score of that score.
    """
    daily = news_to_daily_counts(news)
    if daily.empty:
        return pd.DataFrame(columns=["slice_score", "slice_z", "hormuz_count", "inflation_count"])

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
