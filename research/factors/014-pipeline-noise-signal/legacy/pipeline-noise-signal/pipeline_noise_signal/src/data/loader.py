"""
Synthetic acoustic-energy series for major oil pipeline corridors.
Replace with real station extracts (IRIS / USGS / EMSC) for research use.
"""

import numpy as np
import pandas as pd
from typing import Dict


# Major corridors we simulate
CORRIDORS = [
    "Keystone",
    "Dakota_Access",
    "Druzhba",
    "ESPO",           # East Siberia – Pacific Ocean
]


def generate_corridor_energy(
    name: str,
    dates: pd.DatetimeIndex,
    rng: np.random.Generator,
    base_level: float = 1.0,
    noise_scale: float = 0.12,
) -> pd.Series:
    """
    Create a realistic-looking daily acoustic energy proxy series
    with occasional controlled spikes.
    """
    n = len(dates)
    # Baseline + slow drift + noise
    energy = base_level + 0.03 * np.sin(np.linspace(0, 8 * np.pi, n))
    energy += rng.normal(0, noise_scale, n)
    energy = np.maximum(energy, 0.05)

    # Inject a few anomaly windows (different per corridor for realism)
    spike_specs = {
        "Keystone":      [("2023-06-10", "2023-06-18", 0.55),
                          ("2024-02-20", "2024-03-01", 0.70)],
        "Dakota_Access": [("2023-09-05", "2023-09-12", 0.45)],
        "Druzhba":       [("2023-08-01", "2023-08-12", 0.85),
                          ("2024-01-15", "2024-01-25", 0.60)],
        "ESPO":          [("2023-11-10", "2023-11-20", 0.50),
                          ("2024-04-05", "2024-04-14", 0.65)],
    }

    for start, end, magnitude in spike_specs.get(name, []):
        mask = (dates >= pd.Timestamp(start)) & (dates <= pd.Timestamp(end))
        energy[mask] += magnitude + rng.normal(0, 0.08, mask.sum())

    return pd.Series(energy, index=dates, name=name)


def load_demo_acoustic(
    start: str = "2023-01-01",
    end: str = "2024-06-30",
    seed: int = 42,
) -> pd.DataFrame:
    """
    Returns a DataFrame with daily acoustic-energy proxies for each corridor.
    """
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start=start, end=end)

    data = {}
    base_levels = {"Keystone": 1.05, "Dakota_Access": 0.95,
                   "Druzhba": 1.15, "ESPO": 1.00}
    for name in CORRIDORS:
        data[name] = generate_corridor_energy(
            name, dates, rng, base_level=base_levels.get(name, 1.0)
        )

    df = pd.DataFrame(data)
    df.index.name = "date"
    return df


def load_acoustic_from_csv(path: str) -> pd.DataFrame:
    """
    Expected format: date index + one column per corridor / station cluster.
    """
    df = pd.read_csv(path, parse_dates=True, index_col=0)
    df.index.name = "date"
    return df.sort_index()
