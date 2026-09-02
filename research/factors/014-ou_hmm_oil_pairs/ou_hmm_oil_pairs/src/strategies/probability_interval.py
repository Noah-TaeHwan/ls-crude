"""
Probability Interval Strategy (ProbI)
Uses rolling mean ± z * rolling std as dynamic bands.
"""

import numpy as np
import pandas as pd
from .base import BaseStrategy


class ProbabilityIntervalStrategy(BaseStrategy):
    def __init__(self, lookback: int = 20, z: float = 2.0):
        super().__init__(name="Probability Interval")
        self.lookback = lookback
        self.z = z

    def generate_signals(self, spread: pd.Series) -> pd.Series:
        mu = spread.rolling(self.lookback, min_periods=10).mean()
        sigma = spread.rolling(self.lookback, min_periods=10).std()

        upper = mu + self.z * sigma
        lower = mu - self.z * sigma

        signal = pd.Series(0, index=spread.index)
        # Enter short when above upper band, long when below lower band
        signal[spread > upper] = -1
        signal[spread < lower] = 1

        # Exit when back inside the bands (simple version: stay in until opposite signal)
        # For cleaner mean-reversion we can force flat inside bands
        inside = (spread <= upper) & (spread >= lower)
        # Keep previous position until it reverts inside, then flatten
        # (simplified implementation)
        pos = 0
        out = []
        for i in range(len(spread)):
            if spread.iloc[i] > upper.iloc[i]:
                pos = -1
            elif spread.iloc[i] < lower.iloc[i]:
                pos = 1
            elif inside.iloc[i]:
                pos = 0
            out.append(pos)
        return pd.Series(out, index=spread.index)
