"""
Turn sermon escalation scores into a simple oil-volatility risk signal.
"""

import numpy as np
import pandas as pd
from typing import Dict


def aggregate_weekly_scores(sermon_scores: pd.DataFrame) -> pd.DataFrame:
    """
    sermon_scores must contain columns: date, score, level, country
    """
    df = sermon_scores.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")

    weekly = df.resample("W-FRI").agg({
        "score": "mean",
        "level": lambda x: x.mode().iloc[0] if len(x) > 0 else "calm",
        "country": "count",
    }).rename(columns={"country": "n_sermons"})

    weekly["score"] = weekly["score"].fillna(0)
    weekly["score_change"] = weekly["score"].diff()
    return weekly


def generate_risk_signal(
    weekly: pd.DataFrame,
    score_threshold: float = 0.55,
    change_threshold: float = 0.20,
    min_sermons: int = 1,
) -> pd.DataFrame:
    """
    Simple rule:
    - Elevated risk if average weekly score is high AND
      there was a meaningful recent increase in tone.
    """
    sig = weekly.copy()
    sig["elevated_risk"] = (
        (sig["score"] >= score_threshold) &
        (sig["score_change"].fillna(0) >= change_threshold) &
        (sig["n_sermons"] >= min_sermons)
    )
    # Also flag sustained high hostility
    sig["sustained_hostile"] = sig["score"] >= 0.60
    sig["signal"] = (sig["elevated_risk"] | sig["sustained_hostile"]).astype(int)
    return sig


def join_with_oil(signal: pd.DataFrame, oil: pd.DataFrame) -> pd.DataFrame:
    """
    Align weekly signal with daily oil data (forward-fill signal).
    """
    oil = oil.copy()
    oil.index = pd.to_datetime(oil.index)

    # Reindex signal to daily and forward-fill
    daily_signal = signal[["score", "signal"]].reindex(oil.index, method="ffill")
    combined = oil.join(daily_signal)
    combined["signal"] = combined["signal"].fillna(0).astype(int)
    combined["score"] = combined["score"].fillna(0)
    return combined
