"""Deterministic synthetic fixtures for demo/tests.

These frames are synthetic-only: they exist to exercise the program (and to test
leakage prevention), never to claim a real-world result. Components use only
past returns plus noise so the fixture itself contains no look-ahead signal.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .spec import InputSpec, Spec

ALL_MODELS = (
    "baseline_up_rate",
    "market_only_logit",
    "cai_equal_logit",
    "cai_learned_logit",
)


def synthetic_frames(seed: int = 7, n_components: int = 2) -> dict[str, object]:
    """Build a deterministic causal fixture covering the in-sample window."""
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range("2015-01-05", "2023-12-29")
    n = len(dates)
    returns = rng.normal(0.0003, 0.02, n)
    close = 50.0 * np.exp(np.cumsum(returns))
    price = pd.DataFrame({"close": close}, index=dates)
    components: dict[str, pd.Series] = {}
    past = np.concatenate([[0.0], returns[:-1]])
    for index in range(n_components):
        signal = np.roll(past, index)
        components[f"syn{index + 1}"] = pd.Series(
            1.0 + 0.5 * signal + rng.normal(0, 0.01, n), index=dates
        )
    return {"price": price, "components": components}


def synthetic_spec(n_components: int = 2, models: tuple[str, ...] = ALL_MODELS) -> Spec:
    """Spec for the synthetic fixture (no real files; file checks are skipped)."""
    components = tuple(
        InputSpec(kind="component", path=f"synthetic://syn{index + 1}", sha256="0" * 64)
        for index in range(n_components)
    )
    raw = {
        "spec_version": 1,
        "candidate_id": "synthetic-demo",
        "target": {"kind": "next_n_trading_days_up", "horizon_days": 5},
        "price": {"path": "synthetic://price", "sha256": "0" * 64},
        "components": [{"path": item.path, "sha256": item.sha256} for item in components],
        "is": {"start": "2015-01-01", "end": "2023-12-31"},
        "split": {"train_end": "2020-12-31", "val_start": "2021-01-01", "val_end": "2023-12-31"},
        "market_features": ["rsi14", "ret_5d"],
        "models": list(models),
        "synthetic": True,
    }
    return Spec(
        candidate_id="synthetic-demo",
        mode="RETROSPECTIVE_RESEARCH",
        price=InputSpec(kind="price", path="synthetic://price", sha256="0" * 64, value_column="close"),
        components=components,
        horizon_days=5,
        is_start="2015-01-01",
        is_end="2023-12-31",
        train_end="2020-12-31",
        val_start="2021-01-01",
        val_end="2023-12-31",
        market_features=("rsi14", "ret_5d"),
        models=models,
        seeds=(7,),
        max_configs=12,
        max_workers=2,
        max_seconds=600,
        configs=(),
        raw=raw,
    )
