"""
Simple research diagnostics.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any


def correlation_report(combined: pd.DataFrame, min_obs: int = 30) -> Dict[str, Any]:
    df = combined.dropna(subset=["score", "realized_vol_20d"])
    if len(df) < min_obs:
        return {"error": "insufficient overlapping observations"}

    corr_vol = df["score"].corr(df["realized_vol_20d"])
    corr_abs = df["score"].corr(df["log_return"].abs())
    future_vol = df["realized_vol_20d"].shift(-5)
    corr_lead = df["score"].corr(future_vol)

    return {
        "corr_score_vs_realized_vol": _r(corr_vol),
        "corr_score_vs_abs_return": _r(corr_abs),
        "corr_score_vs_future_vol_5d": _r(corr_lead),
        "n_obs": len(df),
    }


def signal_forward_vol(combined: pd.DataFrame, forward_days: int = 10) -> Dict[str, Any]:
    df = combined.copy()
    df["fwd_vol"] = df["realized_vol_20d"].shift(-forward_days)

    on = df.loc[df["signal"] == 1, "fwd_vol"].dropna()
    off = df.loc[df["signal"] == 0, "fwd_vol"].dropna()

    return {
        "avg_fwd_vol_signal_on": _r(on.mean()) if len(on) else None,
        "avg_fwd_vol_signal_off": _r(off.mean()) if len(off) else None,
        "n_signal_on_days": int((df["signal"] == 1).sum()),
        "n_signal_off_days": int((df["signal"] == 0).sum()),
    }


def _r(x):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    return round(float(x), 4)
