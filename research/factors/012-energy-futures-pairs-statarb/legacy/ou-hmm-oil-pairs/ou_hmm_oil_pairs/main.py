#!/usr/bin/env python3
"""
OU-HMM Crude Oil Futures Pairs Trading – Demo Runner
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.data.loader import generate_synthetic_prices, build_spread
from src.models.ou_hmm import OUHMM
from src.strategies import (
    PlainVanillaStrategy,
    ProbabilityIntervalStrategy,
    RealizedIncrementStrategy,
    PredictionIntervalStrategy,
    PredictedIncrementStrategy,
)
from src.utils.metrics import performance_table, plot_equity_curves


def main():
    print("=" * 60)
    print("OU-HMM Statistical Arbitrage – Crude Oil Futures")
    print("=" * 60)

    # 1. Generate synthetic cointegrated prices
    print("\n[1] Generating synthetic crude oil futures prices...")
    prices = generate_synthetic_prices(n_days=1200, seed=42)
    print(f"    Period: {prices.index[0].date()} → {prices.index[-1].date()}")
    print(f"    Assets: {list(prices.columns)}")

    # 2. Build spread
    print("\n[2] Constructing cointegration spread...")
    spread, beta = build_spread(prices, method="ols")
    print(f"    Hedge ratios (beta): {np.round(beta, 3)}")
    print(f"    Spread mean: {spread.mean():.4f}  std: {spread.std():.4f}")

    # 3. Fit OU-HMM
    print("\n[3] Fitting OU-HMM (3 regimes)...")
    model = OUHMM(n_regimes=3, max_iter=30)
    model.fit(spread.values, verbose=False)
    print(model.summary())

    # 4. Run all strategies
    print("\n[4] Running trading strategies...")
    strategies = [
        PlainVanillaStrategy(lookback=60),
        ProbabilityIntervalStrategy(lookback=20, z=2.0),
        RealizedIncrementStrategy(lookback=40),
        PredictionIntervalStrategy(model, z=1.96),
        PredictedIncrementStrategy(model, lookback=40),
    ]

    results = []
    for strat in strategies:
        print(f"    → {strat.name}")
        res = strat.backtest(spread)
        results.append(res)

    # 5. Buy & Hold benchmark on first asset (for reference)
    print("    → Buy & Hold (Brent)")
    bh_equity = (1 + prices["Brent"].pct_change().fillna(0)).cumprod() * 100_000
    from src.strategies.base import BacktestResult
    bh_result = BacktestResult(
        equity=bh_equity,
        trades=[],
        positions=pd.Series(1, index=spread.index),
        name="Buy & Hold"
    )
    results.insert(0, bh_result)

    # 6. Performance table
    print("\n[5] Performance Summary")
    print("-" * 60)
    table = performance_table(results)
    print(table.to_string())
    print("-" * 60)

    # 7. Save outputs
    out_dir = Path("output")
    out_dir.mkdir(exist_ok=True)

    table.to_csv(out_dir / "performance_summary.csv")
    print(f"\nSaved performance table → {out_dir / 'performance_summary.csv'}")

    plot_equity_curves(results, save_path=str(out_dir / "equity_curves.png"))

    # Save spread + regime
    fig, axes = plt.subplots(2, 1, figsize=(12, 7), sharex=True)
    axes[0].plot(spread.index, spread.values, color="steelblue", linewidth=0.9)
    axes[0].set_title("Cointegration Spread")
    axes[0].grid(True, alpha=0.3)

    if model.most_likely_regime is not None:
        axes[1].plot(spread.index, model.most_likely_regime, color="darkorange", drawstyle="steps-post")
        axes[1].set_title("Most Likely Regime (OU-HMM)")
        axes[1].set_yticks(range(model.n_regimes))
        axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(out_dir / "spread_and_regimes.png", dpi=150, bbox_inches="tight")
    print(f"Saved spread & regimes plot → {out_dir / 'spread_and_regimes.png'}")
    plt.close()

    print("\nDone. Check the ./output/ folder for results.")
    print("=" * 60)


if __name__ == "__main__":
    main()
