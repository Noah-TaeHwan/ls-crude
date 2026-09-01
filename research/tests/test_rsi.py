from __future__ import annotations

import numpy as np
import pandas as pd

from ls_crude.features.rsi import rsi


def test_rsi_is_high_on_a_steady_uptrend() -> None:
    close = pd.Series(np.linspace(50, 80, 40), name="Close")
    values = rsi(close, period=14)
    assert values.iloc[-1] > 70


def test_rsi_is_low_on_a_steady_downtrend() -> None:
    close = pd.Series(np.linspace(80, 50, 40), name="Close")
    values = rsi(close, period=14)
    assert values.iloc[-1] < 30


def test_rsi_stays_in_bounds() -> None:
    close = pd.Series([70.0, 71.2, 69.8, 72.1, 68.4, 67.0, 66.2, 65.0, 64.1, 63.0, 62.4, 61.8, 60.5, 59.0, 58.2, 57.0])
    values = rsi(close, period=14).dropna()
    assert (values.between(0, 100)).all()
