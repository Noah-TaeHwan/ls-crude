"""
Simple evaluation helpers.
"""

import numpy as np
import pandas as pd
from typing import Dict


def correlation_summary(combined: pd.DataFrame) -> Dict:
    """
    Basic contemporaneous and lagged correlations between
    sermon score and oil realized volatility / absolute returns.
    """
    df = combined.dropna(subset=["score", "realized_vol_20d"]).copy()
    if len(df) < 30:
        return {"error": "insufficient data"}

    corr_vol = df["score"].corr(df["realized_vol_20d"])
    corr_absret = df["score"].corr(df["log_return"].abs())

    # Simple lead-lag: does score today correlate with vol over next 5–10 days?
    future_vol = df["realized_vol_20d"].shift(-5)
    corr_lead = df["score"].corr(future_vol)

    return {
        "corr_score_vs_realized_vol": round(float(corr_vol), 3),
        "corr_score_vs_abs_return": round(float(corr_absret), 3),
        "corr_score_vs_future_vol_5d": round(float(corr_lead), 3) if not np.isnan(corr_lead) else None,
        "n_obs": len(df),
    }


def signal_hit_rate(combined: pd.DataFrame, forward_days: int = 10) -> Dict:
    """
    When signal = 1, what is average forward realized volatility
    compared with periods when signal = 0.
    """
    df = combined.copy()
    df["fwd_vol"] = df["realized_vol_20d"].shift(-forward_days)

    on = df.loc[df["signal"] == 1, "fwd_vol"].dropna()
    off = df.loc[df["signal"] == 0, "fwd_vol"].dropna()

    return {
        "avg_fwd_vol_when_signal_on": round(float(on.mean()), 4) if len(on) else None,
        "avg_fwd_vol_when_signal_off": round(float(off.mean()), 4) if len(off) else None,
        "n_signal_on_days": int((df["signal"] == 1).sum()),
    }
