"""
Anomaly detection on corridor acoustic energy and risk-flag generation.
"""

import numpy as np
import pandas as pd
from typing import Tuple


def compute_baseline(
    energy: pd.DataFrame,
    window: int = 21,
) -> pd.DataFrame:
    """Rolling mean baseline per corridor."""
    return energy.rolling(window, min_periods=max(5, window // 3)).mean()


def detect_spikes(
    energy: pd.DataFrame,
    baseline: pd.DataFrame,
    threshold_pct: float = 0.30,
) -> pd.DataFrame:
    """
    Binary spike matrix: 1 when energy > baseline * (1 + threshold)
    """
    ratio = energy / (baseline + 1e-8)
    spikes = (ratio > (1.0 + threshold_pct)).astype(int)
    return spikes


def aggregate_risk(
    spikes: pd.DataFrame,
    energy: pd.DataFrame,
    baseline: pd.DataFrame,
    multi_min: int = 2,
) -> pd.DataFrame:
    """
    Produce daily risk features:
    - n_corridors_spiking
    - max_excess (largest % above baseline)
    - signal (0/1) and high_risk (multi-corridor)
    """
    n_spiking = spikes.sum(axis=1)
    excess = (energy / (baseline + 1e-8) - 1.0).clip(lower=0)
    max_excess = excess.max(axis=1)

    out = pd.DataFrame({
        "n_spiking": n_spiking,
        "max_excess": max_excess,
        "signal": (n_spiking >= 1).astype(int),
        "high_risk": (n_spiking >= multi_min).astype(int),
    }, index=spikes.index)

    # Simple continuous score for diagnostics
    out["risk_score"] = (
        0.6 * out["max_excess"].clip(0, 1.5) +
        0.4 * (out["n_spiking"] / max(len(spikes.columns), 1))
    ).clip(0, 1.5)

    return out


def run_detection(
    energy: pd.DataFrame,
    baseline_window: int = 21,
    threshold_pct: float = 0.30,
    multi_min: int = 2,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Full detection pipeline.
    Returns: baseline, spikes, risk_flags
    """
    baseline = compute_baseline(energy, window=baseline_window)
    spikes = detect_spikes(energy, baseline, threshold_pct=threshold_pct)
    risk = aggregate_risk(spikes, energy, baseline, multi_min=multi_min)
    return baseline, spikes, risk


def align_with_oil(risk: pd.DataFrame, oil: pd.DataFrame) -> pd.DataFrame:
    oil = oil.copy()
    oil.index = pd.to_datetime(oil.index)
    cols = ["signal", "high_risk", "risk_score", "n_spiking", "max_excess"]
    daily = risk[cols].reindex(oil.index, method="ffill")
    out = oil.join(daily)
    for c in ["signal", "high_risk", "n_spiking"]:
        out[c] = out[c].fillna(0).astype(int)
    out["risk_score"] = out["risk_score"].fillna(0.0)
    out["max_excess"] = out["max_excess"].fillna(0.0)
    return out
