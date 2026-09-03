"""
Realized Increment Strategy (RI)
Trades extreme percentage changes of the spread.
"""

import numpy as np
import pandas as pd
from .base import BaseStrategy


class RealizedIncrementStrategy(BaseStrategy):
    def __init__(self, lookback: int = 40, q_low: float = 0.025, q_high: float = 0.975):
        super().__init__(name="Realized Increment")
        self.lookback = lookback
        self.q_low = q_low
        self.q_high = q_high

    def generate_signals(self, spread: pd.Series) -> pd.Series:
        # Realized increment
        x = spread.pct_change().fillna(0)

        # Rolling quantiles
        q_down = x.rolling(self.lookback, min_periods=15).quantile(self.q_low)
        q_up = x.rolling(self.lookback, min_periods=15).quantile(self.q_high)

        signal = pd.Series(0, index=spread.index)
        pos = 0
        out = []
        for i in range(len(x)):
            if i < self.lookback:
                out.append(0)
                continue
            if x.iloc[i] > q_up.iloc[i]:
                pos = -1          # extreme up move → expect reversion down
            elif x.iloc[i] < q_down.iloc[i]:
                pos = 1           # extreme down move → expect reversion up
            elif q_down.iloc[i] <= x.iloc[i] <= q_up.iloc[i]:
                pos = 0           # back to normal
            out.append(pos)
        return pd.Series(out, index=spread.index)
