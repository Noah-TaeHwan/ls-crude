"""
Quick-start example: fit OU-HMM and run one strategy.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data.loader import generate_synthetic_prices, build_spread
from src.models.ou_hmm import OUHMM
from src.strategies.prediction_interval import PredictionIntervalStrategy

# Data
prices = generate_synthetic_prices(n_days=800, seed=7)
spread, beta = build_spread(prices)

# Model
model = OUHMM(n_regimes=3)
model.fit(spread.values)
print(model.summary())

# Strategy
strat = PredictionIntervalStrategy(model, z=1.8)
result = strat.backtest(spread)
print(result.summary())
