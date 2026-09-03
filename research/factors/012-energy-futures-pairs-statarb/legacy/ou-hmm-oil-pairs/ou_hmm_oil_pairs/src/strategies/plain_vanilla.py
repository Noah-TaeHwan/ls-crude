"""
Plain Vanilla Strategy: simple mean-crossing of the spread.
"""

import numpy as np
import pandas as pd
from .base import BaseStrategy


class PlainVanillaStrategy(BaseStrategy):
    def __init__(self, lookback: int = 60):
        super().__init__(name="Plain Vanilla")
        self.lookback = lookback

    def generate_signals(self, spread: pd.Series) -> pd.Series:
        rolling_mean = spread.rolling(self.lookback, min_periods=20).mean()
        signal = pd.Series(0, index=spread.index)

        # Long when spread is below its mean, short when above
        signal[spread < rolling_mean] = 1
        signal[spread > rolling_mean] = -1

        # Optional: only trade when deviation is meaningful
        # (kept simple as in the thesis)
        return signal
