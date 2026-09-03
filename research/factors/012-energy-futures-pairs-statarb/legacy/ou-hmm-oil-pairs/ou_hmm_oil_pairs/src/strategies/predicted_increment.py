"""
Predicted Increment Strategy (PI)
Trades when the model-implied expected return is extreme.
"""

import numpy as np
import pandas as pd
from .base import BaseStrategy
from ..models.ou_hmm import OUHMM


class PredictedIncrementStrategy(BaseStrategy):
    def __init__(self, model: OUHMM, lookback: int = 40, q_low: float = 0.05, q_high: float = 0.95):
        super().__init__(name="Predicted Increment")
        self.model = model
        self.lookback = lookback
        self.q_low = q_low
        self.q_high = q_high

    def generate_signals(self, spread: pd.Series) -> pd.Series:
        path = spread.values
        T = len(path)

        if self.model.filtered_probs is None or len(self.model.filtered_probs) != T:
            self.model.filter(path)

        # Compute predicted increments
        pred_inc = np.zeros(T)
        for t in range(1, T):
            mean, _ = self.model.predict_next(path[t-1], self.model.filtered_probs[t-1])
            pred_inc[t] = (mean / path[t-1] - 1) if abs(path[t-1]) > 1e-8 else 0.0

        pred_inc = pd.Series(pred_inc, index=spread.index)
        q_down = pred_inc.rolling(self.lookback, min_periods=15).quantile(self.q_low)
        q_up = pred_inc.rolling(self.lookback, min_periods=15).quantile(self.q_high)

        signal = pd.Series(0, index=spread.index)
        pos = 0
        out = []
        for i in range(len(pred_inc)):
            if i < self.lookback:
                out.append(0)
                continue
            if pred_inc.iloc[i] > q_up.iloc[i]:
                pos = -1
            elif pred_inc.iloc[i] < q_down.iloc[i]:
                pos = 1
            else:
                pos = 0
            out.append(pos)
        return pd.Series(out, index=spread.index)
