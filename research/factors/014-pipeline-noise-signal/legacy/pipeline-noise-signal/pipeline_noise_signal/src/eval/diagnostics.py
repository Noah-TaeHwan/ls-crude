"""
Research diagnostics for pipeline acoustic risk flags vs oil volatility.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any


def correlation_report(combined: pd.DataFrame, min_obs: int = 40) -> Dict[str, Any]:
    df = combined.dropna(subset=["risk_score", "realized_vol_20d"])
    if len(df) < min_obs:
        return {"error": "insufficient data"}

    return {
        "corr_risk_score_vs_vol": _r(df["risk_score"].corr(df["realized_vol_20d"])),
        "corr_risk_score_vs_abs_ret": _r(df["risk_score"].corr(df["log_return"].abs())),
        "corr_risk_score_vs_future_vol_5d": _r(
            df["risk_score"].corr(df["realized_vol_20d"].shift(-5))
        ),
        "n_obs": len(df),
    }


def signal_forward_stats(combined: pd.DataFrame, forward_days: int = 10) -> Dict[str, Any]:
    df = combined.copy()
    df["fwd_vol"] = df["realized_vol_20d"].shift(-forward_days)

    on = df.loc[df["signal"] == 1, "fwd_vol"].dropna()
    off = df.loc[df["signal"] == 0, "fwd_vol"].dropna()
    high = df.loc[df["high_risk"] == 1, "fwd_vol"].dropna()

    return {
        "avg_fwd_vol_signal_on": _r(on.mean()) if len(on) else None,
        "avg_fwd_vol_signal_off": _r(off.mean()) if len(off) else None,
        "avg_fwd_vol_high_risk": _r(high.mean()) if len(high) else None,
        "n_signal_on_days": int((df["signal"] == 1).sum()),
        "n_high_risk_days": int((df["high_risk"] == 1).sum()),
    }


def _r(x):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    return round(float(x), 4)
