"""
Weekly aggregation and risk-signal generation.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any


def score_sermons(df: pd.DataFrame, scorer_fn) -> pd.DataFrame:
    """
    Apply scorer to each row. Expects columns: date, country, text
    """
    records = []
    for _, row in df.iterrows():
        res = scorer_fn(row["text"])
        records.append({
            "date": row["date"],
            "country": row["country"],
            "score": res["score"],
            "level": res["level"],
            "tense_hits": res["tense_hits"],
            "hostile_hits": res["hostile_hits"],
            "warcry_hits": res["warcry_hits"],
        })
    return pd.DataFrame(records)


def make_weekly(scores: pd.DataFrame) -> pd.DataFrame:
    s = scores.copy()
    s["date"] = pd.to_datetime(s["date"])
    s = s.set_index("date").sort_index()

    weekly = s.resample("W-FRI").agg({
        "score": "mean",
        "level": lambda x: x.mode().iloc[0] if len(x) else "calm",
        "country": "count",
    }).rename(columns={"country": "n_sermons"})

    weekly["score"] = weekly["score"].fillna(0.0)
    weekly["score_change"] = weekly["score"].diff()
    weekly["n_sermons"] = weekly["n_sermons"].fillna(0).astype(int)
    return weekly


def generate_signal(
    weekly: pd.DataFrame,
    score_threshold: float = 0.50,
    change_threshold: float = 0.15,
    sustained_threshold: float = 0.60,
    min_sermons: int = 1,
) -> pd.DataFrame:
    sig = weekly.copy()
    elevated = (
        (sig["score"] >= score_threshold) &
        (sig["score_change"].fillna(0) >= change_threshold) &
        (sig["n_sermons"] >= min_sermons)
    )
    sustained = sig["score"] >= sustained_threshold
    sig["elevated_risk"] = elevated
    sig["sustained_hostile"] = sustained
    sig["signal"] = (elevated | sustained).astype(int)
    return sig


def align_with_oil(signal: pd.DataFrame, oil: pd.DataFrame) -> pd.DataFrame:
    oil = oil.copy()
    oil.index = pd.to_datetime(oil.index)
    daily = signal[["score", "signal"]].reindex(oil.index, method="ffill")
    out = oil.join(daily)
    out["signal"] = out["signal"].fillna(0).astype(int)
    out["score"] = out["score"].fillna(0.0)
    return out
