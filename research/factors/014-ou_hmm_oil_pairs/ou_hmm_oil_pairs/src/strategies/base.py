"""
Base class for trading strategies.
"""

from abc import ABC, abstractmethod
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class Trade:
    entry_idx: int
    exit_idx: int
    direction: int          # +1 long spread, -1 short spread
    entry_price: float
    exit_price: float
    pnl: float


@dataclass
class BacktestResult:
    equity: pd.Series
    trades: List[Trade]
    positions: pd.Series
    name: str = "Strategy"

    def summary(self) -> dict:
        rets = self.equity.pct_change().dropna()
        total_return = self.equity.iloc[-1] / self.equity.iloc[0] - 1
        max_dd = (self.equity / self.equity.cummax() - 1).min()
        sharpe = np.sqrt(252) * rets.mean() / rets.std() if rets.std() > 0 else 0.0
        calmar = total_return / abs(max_dd) if max_dd != 0 else 0.0
        return {
            "Strategy": self.name,
            "Cumulative Return (%)": round(total_return * 100, 2),
            "Max Drawdown (%)": round(max_dd * 100, 2),
            "Sharpe": round(sharpe, 2),
            "Calmar": round(calmar, 2),
            "N Trades": len(self.trades),
        }


class BaseStrategy(ABC):
    def __init__(self, name: str = "Base"):
        self.name = name
        self.trades: List[Trade] = []

    @abstractmethod
    def generate_signals(self, spread: pd.Series) -> pd.Series:
        """
        Return a Series of positions: +1 (long spread), -1 (short), 0 (flat)
        """
        pass

    def backtest(self, spread: pd.Series, initial_capital: float = 100_000.0) -> BacktestResult:
        signals = self.generate_signals(spread)
        signals = signals.reindex(spread.index).fillna(0)

        # Simple PnL: position * change in spread
        # Scale so a 1-sigma move ≈ 0.5% portfolio daily move
        spread_chg = spread.diff().fillna(0)
        vol = float(spread.std()) + 1e-8
        target_daily_vol = 0.005
        scale = target_daily_vol / vol

        strategy_ret = signals.shift(1).fillna(0) * spread_chg * scale
        strategy_ret = strategy_ret.clip(-0.04, 0.04)   # numerical safety

        equity = (1 + strategy_ret).cumprod() * initial_capital
        equity.name = "equity"

        # Reconstruct trades
        trades = []
        pos = 0
        entry_idx = None
        entry_price = None
        for i in range(len(signals)):
            new_pos = int(signals.iloc[i])
            if pos == 0 and new_pos != 0:
                entry_idx = i
                entry_price = spread.iloc[i]
                pos = new_pos
            elif pos != 0 and new_pos != pos:
                # close
                exit_price = spread.iloc[i]
                pnl = pos * (exit_price - entry_price)
                trades.append(Trade(
                    entry_idx=entry_idx,
                    exit_idx=i,
                    direction=pos,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    pnl=pnl
                ))
                if new_pos != 0:
                    entry_idx = i
                    entry_price = spread.iloc[i]
                pos = new_pos

        return BacktestResult(
            equity=equity,
            trades=trades,
            positions=signals,
            name=self.name
        )
