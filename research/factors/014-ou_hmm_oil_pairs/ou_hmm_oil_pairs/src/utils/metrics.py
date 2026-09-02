"""
Performance and risk metrics utilities.
"""

import numpy as np
import pandas as pd
from typing import List, Dict
from ..strategies.base import BacktestResult


def performance_table(results: List[BacktestResult]) -> pd.DataFrame:
    rows = [r.summary() for r in results]
    df = pd.DataFrame(rows)
    return df.set_index("Strategy")


def plot_equity_curves(results: List[BacktestResult], save_path: str = None):
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(12, 6))
    for r in results:
        equity_norm = r.equity / r.equity.iloc[0]
        ax.plot(equity_norm.index, equity_norm.values, label=r.name, linewidth=1.5)

    ax.set_title("Equity Curves – OU-HMM Oil Pairs Strategies")
    ax.set_ylabel("Growth of $1")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Saved equity plot → {save_path}")
    else:
        plt.show()
    plt.close()
