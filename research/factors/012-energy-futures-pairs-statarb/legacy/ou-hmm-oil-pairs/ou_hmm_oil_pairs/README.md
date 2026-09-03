# OU-HMM Statistical Arbitrage: Crude Oil Futures Pairs Trading

**Implementation inspired by Tommaso Zanatta (University of Padua, 2024/2025)**  
*"Statistical Arbitrage: Crude Oil Futures Market Pairs Trading"*

This project implements a **regime-switching pairs trading framework** for international crude oil futures using an **Ornstein-Uhlenbeck Hidden Markov Model (OU-HMM)**.

---

## Strategy Overview

Traditional pairs trading assumes a *static* cointegrating relationship.  
This implementation relaxes that assumption:

- The cointegration spread is modeled as an **Ornstein-Uhlenbeck** process.
- The OU parameters (mean, reversion speed, volatility) can switch across **hidden market regimes** governed by a Markov chain.
- Trading signals are generated from several rules that exploit the model’s predictive distribution and regime probabilities.

### Assets Covered
- Brent Crude (ICE)
- WTI Crude (NYMEX)
- Dubai Crude
- Shanghai Crude (INE)

### Implemented Strategies
| Strategy                  | Description                                      | Type                |
|---------------------------|--------------------------------------------------|---------------------|
| **Plain Vanilla**         | Simple mean-crossing of the spread               | Classic             |
| **Probability Interval**  | Rolling mean ± z-score bands                     | Statistical         |
| **Realized Increment**    | Extreme percentage changes in the spread         | Anomaly detection   |
| **Prediction Interval**   | Model-based forecast intervals from OU-HMM       | Regime-aware        |
| **Predicted Increment**   | Extreme model-predicted returns                  | Fully model-driven  |

---

## Project Structure

```
ou_hmm_oil_pairs/
├── README.md
├── requirements.txt
├── main.py                     # Run full demo
├── src/
│   ├── data/
│   │   └── loader.py           # Data loading & preprocessing
│   ├── models/
│   │   ├── ou_process.py       # Ornstein-Uhlenbeck process
│   │   └── ou_hmm.py           # OU-HMM with EM filtering
│   ├── strategies/
│   │   ├── base.py
│   │   ├── plain_vanilla.py
│   │   ├── probability_interval.py
│   │   ├── realized_increment.py
│   │   ├── prediction_interval.py
│   │   └── predicted_increment.py
│   └── utils/
│       ├── metrics.py          # Performance & risk metrics
│       └── cointegration.py    # Johansen / ADF helpers
├── examples/
│   └── quick_start.py
└── data/                       # Place your price data here
```

---

## Installation

```bash
pip install -r requirements.txt
```

**Requirements**:
- Python ≥ 3.9
- numpy, pandas, scipy, statsmodels, matplotlib, seaborn

---

## Quick Start

### 1. Using Synthetic Data (Demo)

```bash
python main.py
```

This will:
1. Generate realistic synthetic cointegrated crude oil futures prices
2. Fit the OU-HMM
3. Run all five strategies
4. Print performance table (returns, max drawdown, Sharpe, Calmar)
5. Save equity curves and plots to `./output/`

### 2. Using Your Own Data

Place a CSV file in the `data/` folder with columns:

```
date,Brent,WTI,Dubai,Shanghai
2020-01-02,65.12,63.45,64.80,428.5
...
```

Then modify `main.py` or use:

```python
from src.data.loader import load_prices
from src.models.ou_hmm import OUHMM
from src.strategies.prediction_interval import PredictionIntervalStrategy

prices = load_prices("data/your_crude_prices.csv")
spread, beta = build_spread(prices)          # Johansen-based
model = OUHMM(n_regimes=3)
model.fit(spread)

strategy = PredictionIntervalStrategy(model)
results = strategy.backtest(spread)
print(results.summary())
```

---

## Key Features

- **Online filtering**: Regime probabilities updated recursively via filter-based EM
- **Multiple trading rules** that go beyond simple z-score thresholds
- **Full performance & risk analytics**: Sharpe, Calmar, Max DD, VaR, CVaR
- **Modular design**: Easy to add new strategies or change the number of regimes
- **Walk-forward friendly**: Designed to support rolling estimation

---

## Important Notes

1. **Data Quality Matters**  
   Continuous futures series (back-adjusted) are strongly recommended.  
   Shanghai futures have lower liquidity and different contract specifications.

2. **Transaction Costs**  
   The current implementation is frictionless. For realistic results, add commission + slippage (especially important on Dubai and Shanghai).

3. **Regime Sensitivity**  
   Performance is highly regime-dependent. In strong trending bull markets the market-neutral strategies act primarily as **risk-reduction tools**. In sideways or mean-reverting regimes they can generate meaningful alpha.

4. **Not Production Ready**  
   This is a research / educational implementation. Before live trading you should add:
   - Proper position sizing & risk limits
   - Transaction cost modeling
   - Liquidity filters
   - Robust walk-forward + bootstrap testing

---

## Performance Expectations (Based on Zanatta 2025)

On the Oct 2023 – Mar 2025 bull market period:

| Strategy              | Return | Max DD | Sharpe |
|-----------------------|--------|--------|--------|
| Buy & Hold            | 16.3%  | 19.4%  | 1.54   |
| Realized Increment    | 2.2%   | 1.2%   | 1.12   |
| Probability Interval  | 1.4%   | 0.8%   | 0.90   |
| Prediction Interval   | 0.9%   | **0.4%** | 0.69 |

The strategies significantly reduce drawdowns and tail risk relative to directional exposure.

---

## References

- Zanatta, T. (2025). *Statistical Arbitrage: Crude Oil Futures Market Pairs Trading*. Master Thesis, University of Padua.
- Fanelli, V., Fontana, C., & Rotondi, F. (2023). Original OU-HMM framework paper.
- Uhlenbeck, G. E., & Ornstein, L. S. (1930). On the theory of Brownian motion.
- Hamilton, J. D. (1989). A new approach to the economic analysis of nonstationary time series.

---

## License

MIT License – free for research and educational use.

---

**Disclaimer**: This is not financial advice. Past performance is not indicative of future results. Use at your own risk.
