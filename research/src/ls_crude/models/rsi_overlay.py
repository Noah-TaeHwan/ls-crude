from __future__ import annotations

from typing import Literal

import pandas as pd

Position = Literal["long", "flat", "short"]


def rsi_position(
    rsi_value: pd.Series,
    oversold: float = 30.0,
    overbought: float = 70.0,
) -> pd.Series:
    """Textbook RSI overlay only. Not the team ML model."""

    def label(value: float) -> Position:
        if pd.isna(value):
            return "flat"
        if value <= oversold:
            return "long"
        if value >= overbought:
            return "short"
        return "flat"

    positions = rsi_value.map(label)
    positions.name = "rsi_position"
    return positions
