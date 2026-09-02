"""
Prediction Interval Strategy (PredI)
Uses the OU-HMM predictive distribution to form dynamic forecast intervals.
"""

import numpy as np
import pandas as pd
from .base import BaseStrategy
from ..models.ou_hmm import OUHMM


class PredictionIntervalStrategy(BaseStrategy):
    def __init__(self, model: OUHMM, z: float = 1.96):
        super().__init__(name="Prediction Interval")
        self.model = model
        self.z = z

    def generate_signals(self, spread: pd.Series) -> pd.Series:
        path = spread.values
        T = len(path)

        # Ensure model is filtered on this path
        if self.model.filtered_probs is None or len(self.model.filtered_probs) != T:
            self.model.filter(path)

        signal = np.zeros(T)
        pos = 0

        for t in range(1, T):
            # Predictive mean & var under current filtered regime probabilities
            mean, var = self.model.predict_next(path[t-1], self.model.filtered_probs[t-1])
            std = np.sqrt(var)
            upper = mean + self.z * std
            lower = mean - self.z * std

            if path[t] > upper:
                pos = -1
            elif path[t] < lower:
                pos = 1
            else:
                # inside interval → flatten or keep (we flatten for pure mean-reversion)
                pos = 0
            signal[t] = pos

        return pd.Series(signal, index=spread.index)
