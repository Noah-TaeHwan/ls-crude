"""
Demo oil price / volatility series with regimes loosely aligned
to the injected acoustic spikes.
"""

import numpy as np
import pandas as pd


def generate_demo_oil(
    start: str = "2023-01-01",
    end: str = "2024-06-30",
    seed: int = 7,
) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start=start, end=end)
    n = len(dates)

    log_ret = rng.normal(0.0002, 0.0115, n)

    # Higher vol windows roughly matching major acoustic spikes
    high_vol = [
        ("2023-06-08", "2023-06-25"),
        ("2023-08-01", "2023-08-18"),
        ("2023-11-08", "2023-11-25"),
        ("2024-01-12", "2024-01-30"),
        ("2024-02-18", "2024-03-05"),
        ("2024-04-03", "2024-04-18"),
    ]
    for s, e in high_vol:
        mask = (dates >= pd.Timestamp(s)) & (dates <= pd.Timestamp(e))
        log_ret[mask] = log_ret[mask] * 2.4 + rng.normal(0, 0.007, mask.sum())

    price = 81.0 * np.exp(np.cumsum(log_ret))
    rets = pd.Series(log_ret, index=dates)
    vol20 = rets.rolling(20).std() * np.sqrt(252)

    return pd.DataFrame({
        "brent": price,
        "log_return": log_ret,
        "realized_vol_20d": vol20.values,
    }, index=dates)
