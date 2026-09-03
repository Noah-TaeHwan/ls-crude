"""
Data loading and preprocessing utilities.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Optional


def load_prices(filepath: str, date_col: str = "date") -> pd.DataFrame:
    """
    Load crude oil futures prices from CSV.
    
    Expected columns: date, Brent, WTI, Dubai, Shanghai (or subset)
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {filepath}")

    df = pd.read_csv(path, parse_dates=[date_col])
    df = df.set_index(date_col).sort_index()
    df = df.dropna(how="all")
    return df


def generate_synthetic_prices(
    n_days: int = 1500,
    seed: int = 42,
    start_date: str = "2020-01-01",
) -> pd.DataFrame:
    """
    Generate realistic synthetic cointegrated crude oil futures prices
    for demonstration purposes.
    
    Creates four series with a common stochastic trend + idiosyncratic noise
    and occasional regime shifts in the spread dynamics.
    """
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start=start_date, periods=n_days)

    # Common stochastic trend (global oil price factor)
    common = np.cumsum(rng.normal(0.0003, 0.015, n_days)) + np.log(60)

    # Idiosyncratic components
    brent = common + rng.normal(0, 0.008, n_days)
    wti = common - 0.02 + rng.normal(0, 0.010, n_days)   # usually trades at discount
    dubai = common - 0.01 + rng.normal(0, 0.012, n_days)
    shanghai = common + 0.05 + rng.normal(0, 0.018, n_days)  # higher volatility / premium

    # Add mild mean-reverting spreads + regime shifts
    t = np.arange(n_days)
    regime = (t // 300) % 3
    spread_noise = np.zeros(n_days)
    for i in range(1, n_days):
        theta = [0.05, 0.15, 0.08][regime[i]]
        mu = [0.0, 0.03, -0.02][regime[i]]
        sigma = [0.012, 0.025, 0.018][regime[i]]
        spread_noise[i] = spread_noise[i-1] + theta * (mu - spread_noise[i-1]) + sigma * rng.normal()

    wti = wti + 0.4 * spread_noise
    dubai = dubai + 0.3 * spread_noise
    shanghai = shanghai - 0.5 * spread_noise

    prices = pd.DataFrame({
        "Brent": np.exp(brent),
        "WTI": np.exp(wti),
        "Dubai": np.exp(dubai),
        "Shanghai": np.exp(shanghai) * 6.5,  # rough CNY scaling for realism
    }, index=dates)

    return prices


def build_spread(
    prices: pd.DataFrame,
    method: str = "equal",
    assets: Optional[list] = None,
) -> Tuple[pd.Series, np.ndarray]:
    """
    Construct a cointegration spread.
    
    For demo purposes we use a simple equal-weight log-spread or
    OLS-based hedge ratios. In production use Johansen.
    
    Returns
    -------
    spread : pd.Series
    beta   : np.ndarray  (hedge ratios)
    """
    if assets is None:
        assets = [c for c in ["Brent", "WTI", "Dubai", "Shanghai"] if c in prices.columns]

    log_p = np.log(prices[assets].dropna())

    if method == "equal":
        # Simple equal-weight spread (for demo)
        beta = np.ones(len(assets)) / len(assets)
        beta[0] = 1.0  # normalize first leg
        spread = log_p.iloc[:, 0] - (log_p.iloc[:, 1:] * beta[1:]).sum(axis=1)
    else:
        # OLS hedge against first asset
        from numpy.linalg import lstsq
        y = log_p.iloc[:, 0].values
        X = log_p.iloc[:, 1:].values
        beta_ols, _, _, _ = lstsq(X, y, rcond=None)
        beta = np.concatenate([[1.0], -beta_ols])
        spread = log_p @ beta

    spread.name = "spread"
    return spread, beta
