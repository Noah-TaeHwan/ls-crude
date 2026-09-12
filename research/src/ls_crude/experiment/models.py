"""Model families for the CAI experiment.

Four first-wave models, all trained on the training segment only:
- baseline_up_rate: constant train-period up rate (simple reference).
- market_only_logit: logistic model on existing market features only.
- cai_equal_logit: logistic model on the equal-weight component CAI.
- cai_learned_logit: logistic model on a CAI whose non-negative weights sum to 1
  are learned on the training segment (never forced when a single component exists).

Prediction-model coefficients and CAI component weights are kept separate: the
weights always live on the simplex and their sum is 1.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss
from sklearn.preprocessing import StandardScaler

from .data import DataError, Prepared
from .spec import COMPONENT_MODELS, Spec


@dataclass
class ModelFit:
    """One fitted model's validation probabilities plus weight/equation provenance."""

    model: str
    probs: pd.Series
    weights: list[float] | None = None
    notes: str = ""
    coefficients: dict[str, Any] | None = None
    n_train: int = 0


def fit_predict_logit(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_eval: np.ndarray,
    seed: int,
    feature_names: list[str] | None = None,
) -> tuple[np.ndarray, dict[str, Any]]:
    """Standardize on the training rows only, then fit/predict logistic regression.

    Returns probabilities plus the fitted equation (scaled coefficients, intercept) and
    preprocessing statistics, so a trained model is never left unsaved.
    """
    if len(np.unique(y_train)) < 2:
        raise DataError("training labels are single-class; cannot fit a classifier")
    scaler = StandardScaler().fit(X_train)
    model = LogisticRegression(max_iter=2000, random_state=seed)
    model.fit(scaler.transform(X_train), y_train)
    probs = model.predict_proba(scaler.transform(X_eval))[:, 1]
    names = list(feature_names) if feature_names else [f"x{index}" for index in range(X_train.shape[1])]
    info = {
        "features": names,
        "coefficients": [float(value) for value in model.coef_[0]],
        "intercept": float(model.intercept_[0]),
        "scaler_mean": [float(value) for value in scaler.mean_],
        "scaler_scale": [float(value) for value in scaler.scale_],
        "note": "coefficients apply to scaled inputs (x - mean) / scale",
    }
    return probs, info


def _weights_log_loss(X: np.ndarray, y: np.ndarray, weights: np.ndarray, seed: int) -> float:
    cai = X @ weights
    probs, _ = fit_predict_logit(cai.reshape(-1, 1), y, cai.reshape(-1, 1), seed)
    return float(log_loss(y, probs, labels=[0, 1]))


def learn_weights(scores_train: pd.DataFrame, y_train: pd.Series, seed: int) -> list[float]:
    """Learn non-negative simplex weights minimizing training log-loss.

    SLSQP is the primary path; a coarse grid is the deterministic fallback.
    """
    n = scores_train.shape[1]
    if n == 1:
        return [1.0]
    X = scores_train.to_numpy(dtype=float)
    y = y_train.to_numpy(dtype=float)
    constraints = [{"type": "eq", "fun": lambda w: float(np.sum(w) - 1.0)}]
    bounds = [(0.0, 1.0)] * n
    starts = [np.full(n, 1.0 / n), np.eye(n)[0], np.eye(n)[-1]]
    best: tuple[float, np.ndarray] | None = None
    try:
        for start in starts:
            result = minimize(
                lambda w: _weights_log_loss(X, y, w, seed),
                start,
                method="SLSQP",
                bounds=bounds,
                constraints=constraints,
                options={"maxiter": 200, "ftol": 1e-10},
            )
            if result.success and np.isfinite(result.fun):
                if best is None or result.fun < best[0]:
                    best = (float(result.fun), np.asarray(result.x, dtype=float))
    except Exception:
        best = None
    if best is None:
        grid = _grid_weights(X, y, n, seed)
        return grid
    weights = np.clip(best[1], 0.0, None)
    weights = weights / weights.sum()
    return [float(weight) for weight in weights]


def _grid_weights(X: np.ndarray, y: np.ndarray, n: int, seed: int) -> list[float]:
    """Deterministic coarse grid fallback over the simplex (n <= 3)."""
    if n > 3:
        return [1.0 / n] * n
    step = 0.05
    grid = np.arange(0.0, 1.0 + step / 2, step)
    best: tuple[float, tuple[float, ...]] | None = None
    for first in grid:
        for second in (grid if n >= 2 else [0.0]):
            weights = (first, second) if n == 2 else (first, second, 1.0 - first - second)
            if min(weights) < -1e-9 or abs(sum(weights) - 1.0) > 1e-9:
                continue
            try:
                loss = _weights_log_loss(X, y, np.asarray(weights), seed)
            except Exception:
                continue
            if np.isfinite(loss) and (best is None or loss < best[0]):
                best = (loss, weights)
    if best is None:
        return [1.0 / n] * n
    return [float(weight) for weight in best[1]]


def run_model(spec: Spec, prepared: Prepared, config: dict[str, Any], seed: int, eval_index: pd.DatetimeIndex) -> ModelFit:
    """Fit one configured model and return validation probabilities on ``eval_index``.

    Model families: market-only, CAI-only, market+CAI (equal or learned CAI weights).
    CAI weights live on the simplex; the classifier's own coefficients are stored separately.
    """
    model = str(config["model"])
    if model == "baseline_up_rate":
        train_valid = prepared.train_mask & prepared.target.notna()
        if config.get("match_components"):
            if prepared.components is not None:
                train_valid = train_valid & prepared.components.notna().all(axis=1)
            train_valid = train_valid & prepared.market.notna().all(axis=1)
        rate = float(prepared.target.loc[train_valid].mean())
        return ModelFit(
            model=model,
            probs=pd.Series(rate, index=eval_index),
            notes="constant train-period up rate",
            n_train=int(train_valid.sum()),
        )

    features = tuple(config.get("features", spec.market_features))
    needs_cai = model in COMPONENT_MODELS
    if needs_cai and (prepared.components is None or prepared.component_scores is None or not prepared.component_names):
        raise DataError("no components available for CAI models")

    cai_all: pd.Series | None = None
    weights: list[float] | None = None
    note = ""
    if needs_cai:
        n = len(prepared.component_names)
        if model in ("cai_learned_logit", "market_cai_learned_logit"):
            if n == 1:
                weights = [1.0]
                note = "single component; weight learning not forced — fixed at 1.0"
            else:
                train_rows_cai = (
                    prepared.train_mask & prepared.target.notna() & prepared.components.notna().all(axis=1)
                )
                weights = learn_weights(
                    prepared.component_scores.loc[train_rows_cai],
                    prepared.target.loc[train_rows_cai],
                    seed,
                )
                note = "simplex weights (w>=0, sum=1) learned on the training segment"
        else:
            weights = [1.0 / n] * n
            if n == 1:
                note = "single component; equal weight is degenerate (1.0)"
        cai_all = pd.Series(
            prepared.component_scores.to_numpy(dtype=float) @ np.asarray(weights),
            index=prepared.dates,
            name="cai",
        )

    if model == "market_only_logit":
        train_rows = prepared.train_mask & prepared.target.notna() & prepared.market.notna().all(axis=1)
        if config.get("match_components") and prepared.components is not None:
            train_rows = train_rows & prepared.components.notna().all(axis=1)
        probs, info = fit_predict_logit(
            prepared.market.loc[train_rows, list(features)].to_numpy(dtype=float),
            prepared.target.loc[train_rows].to_numpy(dtype=float),
            prepared.market.loc[eval_index, list(features)].to_numpy(dtype=float),
            seed,
            feature_names=list(features),
        )
        return ModelFit(
            model=model,
            probs=pd.Series(probs, index=eval_index),
            notes=f"features={list(features)}",
            coefficients=info,
            n_train=int(train_rows.sum()),
        )

    if model in ("cai_equal_logit", "cai_learned_logit"):
        train_rows = prepared.train_mask & prepared.target.notna() & prepared.components.notna().all(axis=1)
        if config.get("match_components"):
            train_rows = train_rows & prepared.market.notna().all(axis=1)
        probs, info = fit_predict_logit(
            cai_all.loc[train_rows].to_numpy(dtype=float).reshape(-1, 1),
            prepared.target.loc[train_rows].to_numpy(dtype=float),
            cai_all.loc[eval_index].to_numpy(dtype=float).reshape(-1, 1),
            seed,
            feature_names=["cai"],
        )
        return ModelFit(
            model=model,
            probs=pd.Series(probs, index=eval_index),
            weights=weights,
            notes=note,
            coefficients=info,
            n_train=int(train_rows.sum()),
        )

    if model in ("market_cai_equal_logit", "market_cai_learned_logit"):
        train_rows = (
            prepared.train_mask
            & prepared.target.notna()
            & prepared.market.notna().all(axis=1)
            & prepared.components.notna().all(axis=1)
        )
        names = list(features) + ["cai"]
        X_train = np.column_stack([
            prepared.market.loc[train_rows, list(features)].to_numpy(dtype=float),
            cai_all.loc[train_rows].to_numpy(dtype=float),
        ])
        X_eval = np.column_stack([
            prepared.market.loc[eval_index, list(features)].to_numpy(dtype=float),
            cai_all.loc[eval_index].to_numpy(dtype=float),
        ])
        probs, info = fit_predict_logit(
            X_train,
            prepared.target.loc[train_rows].to_numpy(dtype=float),
            X_eval,
            seed,
            feature_names=names,
        )
        market_note = f"market features {list(features)} + CAI" + (f"; {note}" if note else "")
        return ModelFit(
            model=model,
            probs=pd.Series(probs, index=eval_index),
            weights=weights,
            notes=market_note,
            coefficients=info,
            n_train=int(train_rows.sum()),
        )

    raise DataError(f"unsupported model: {model}")
