"""
Synthetic oil price / volatility series for demo purposes.
Replace with real continuous futures + OVX when available.
"""

import numpy as np
import pandas as pd


def generate_demo_oil(
    start: str = "2023-01-01",
    end: str = "2024-07-01",
    seed: int = 42,
) -> pd.DataFrame:
    """
    Creates a daily series with higher volatility windows that roughly
    align with the high-escalation sample sermon periods.
    """
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start=start, end=end)
    n = len(dates)

    log_ret = rng.normal(0.00015, 0.011, n)

    # Inject elevated volatility around known sample escalation windows
    high_vol_windows = [
        ("2023-05-01", "2023-05-28"),
        ("2023-10-08", "2023-11-10"),
        ("2024-01-15", "2024-02-15"),
        ("2024-04-01", "2024-04-20"),
    ]
    for s, e in high_vol_windows:
        mask = (dates >= pd.Timestamp(s)) & (dates <= pd.Timestamp(e))
        log_ret[mask] = log_ret[mask] * 2.6 + rng.normal(0, 0.006, mask.sum())

    price = 82.0 * np.exp(np.cumsum(log_ret))
    rets = pd.Series(log_ret, index=dates)
    vol20 = rets.rolling(20).std() * np.sqrt(252)

    df = pd.DataFrame({
        "brent": price,
        "log_return": log_ret,
        "realized_vol_20d": vol20.values,
    }, index=dates)
    df.index.name = "date"
    return df
