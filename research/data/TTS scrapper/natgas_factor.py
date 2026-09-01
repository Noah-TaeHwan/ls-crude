# ======================================================================
# CROSS-COMMODITY FACTOR: Natural Gas vs WTI relative divergence
# ======================================================================
#
# HYPOTHESIS
# ----------
# Oil and natural gas are partial substitutes/complements in industrial
# and power-generation demand. When WTI's short-term return diverges
# sharply from natural gas's short-term return (oil running much hotter
# than gas), that divergence may be more about oil-specific speculative
# excess than a genuine energy-demand shift -- and therefore may be
# prone to reverting.
#
# This is a HYPOTHESIS, not a fact -- which is exactly why it goes
# through the same phenomenon-testing framework as everything else
# before being trusted.
#
# LOOKAHEAD NOTE
# ---------------
# Unlike COT or GPR, this is just daily market price data with no
# separate "publication lag" -- CL=F and NG=F closes are both known at
# the same moment (market close). The lookahead risk here is the exact
# same one already fixed in oil_v101.py: using TODAY's close-derived
# divergence to trade TODAY. The factor_lab's test runner applies the
# same one-bar lag to every factor uniformly for this reason.
# ======================================================================

from __future__ import annotations
import pandas as pd
import numpy as np
import yfinance as yf

NATGAS_TICKER = "NG=F"
DIVERGENCE_WINDOW = 5       # days, matches oil_v101.py's typical holding period
ZSCORE_WINDOW = 60          # rolling window for standardizing the divergence


def fetch_natgas_close(start: str, end: str | None = None) -> pd.Series:
    data = yf.download(NATGAS_TICKER, start=start, end=end, progress=False, auto_adjust=False)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)
    return data["Close"]


def compute_gas_oil_divergence(oil_close: pd.Series, gas_close: pd.Series) -> pd.DataFrame:
    """
    Returns a DataFrame indexed like oil_close, with:
      - oil_ret / gas_ret: N-day returns for each series
      - divergence: oil_ret - gas_ret (positive = oil outperforming gas)
      - divergence_zscore: rolling z-score of divergence, the actual
        feature used for signal testing (extreme positive = "oil hot
        relative to gas"; extreme negative = "oil cold relative to gas")
    """
    gas_aligned = gas_close.reindex(oil_close.index).ffill(limit=5)

    oil_ret = oil_close.pct_change(DIVERGENCE_WINDOW)
    gas_ret = gas_aligned.pct_change(DIVERGENCE_WINDOW)
    divergence = oil_ret - gas_ret

    mean = divergence.rolling(ZSCORE_WINDOW).mean()
    std = divergence.rolling(ZSCORE_WINDOW).std()
    zscore = (divergence - mean) / std.replace(0, np.nan)

    return pd.DataFrame({
        "gas_close": gas_aligned,
        "oil_ret_5d": oil_ret,
        "gas_ret_5d": gas_ret,
        "gas_oil_divergence": divergence,
        "gas_oil_divergence_zscore": zscore,
    })


def get_gas_oil_daily_features(oil_close: pd.Series) -> pd.DataFrame:
    """One-call wrapper: fetch NG=F over the same span as oil_close, compute
    the divergence features, return ready to merge (simple date-index join,
    no publication lag needed -- see module docstring)."""
    start = (oil_close.index.min() - pd.Timedelta(days=120)).strftime("%Y-%m-%d")
    end = (oil_close.index.max() + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    gas_close = fetch_natgas_close(start, end)
    return compute_gas_oil_divergence(oil_close, gas_close)


if __name__ == "__main__":
    import yfinance as yf
    wti = yf.download("CL=F", start="2015-01-01", progress=False, auto_adjust=False)
    if isinstance(wti.columns, pd.MultiIndex):
        wti.columns = wti.columns.get_level_values(0)
    features = get_gas_oil_daily_features(wti["Close"])
    print(features.tail(10))
    features.to_csv("gas_oil_divergence.csv")
    print("\nSaved to gas_oil_divergence.csv")
