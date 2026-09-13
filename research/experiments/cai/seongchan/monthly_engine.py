#!/usr/bin/env python3
"""
SEONGCHAN CAI WEEKEND ENGINE — REVIEW COPY
==========================================

검수본: 입력 데이터 배열·출처 manifest는 성찬님 수신본 그대로이며 원문 대조 전입니다.
수정 범위: 학습 차단 상태, 정답 종료일, 학습 구간 적격성, 합성 self-test.
실측 2024–2025 재실행은 이 저장소의 검정 구간 규약 검토 후 별도로 진행합니다.
self-test는 합성 입력만 사용합니다.

Purpose
-------
Seongchan의 수신본을 검수한 별도 월별 연구 코드. 기존 일별 공통 엔진이 아닙니다.
원문 수치·성능은 제출자 보고이며 아직 독립 재현하지 않았습니다.

Core rules
----------
1. Never fabricate missing observations.
2. If availability/as-of is unknown, PIT use is blocked.
3. CONTROL / CONTEXT / TARGET variables are not CAI activity components.
4. If only one eligible component exists, learned composition is blocked.
5. Learned CAI weights are non-negative and sum to 1.
6. Learned-weight tuning uses chronological inner validation and inner-train-only preprocessing.
6. Equal-weight and learned-weight models use the same dates and same preprocessing.
7. Five-trading-day forward labels are overlapping; phase-stride diagnostics are reported.
8. Weak/negative results are preserved rather than hidden.

Typical usage
-------------
Validate:
    python monthly_engine.py validate \
        --input panel.csv \
        --date-col date \
        --target-col target_up_5d \
        --components tmas_traffic,chhmi_lodging,ccedi_shift \
        --market-features rsi14,ret_5d \
        --train-end 2020-12-31 \
        --eval-start 2021-01-04 \
        --eval-end 2023-12-21 \
        --mode retrospective

Run:
    python monthly_engine.py run \
        --input panel.csv \
        --date-col date \
        --target-col target_up_5d \
        --components tmas_traffic,chhmi_lodging,ccedi_shift \
        --market-features rsi14,ret_5d \
        --train-end 2020-12-31 \
        --eval-start 2021-01-04 \
        --eval-end 2023-12-21 \
        --mode retrospective \
        --output-dir outputs/seongchan_run

PIT mode:
    Every activity component must also have:
        <component>__available_at
    containing the timestamp/date when that observation actually became usable.

Dependencies
------------
numpy
pandas
scikit-learn
"""

from __future__ import annotations

import argparse
import json
import math
import hashlib
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    log_loss,
    brier_score_loss,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ENGINE_VERSION = "SEONGCHAN-CAI-2.1-REVIEW-1"


# ============================================================
# Utilities
# ============================================================

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_csv_list(value: Optional[str]) -> List[str]:
    if value is None or str(value).strip() == "":
        return []
    return [x.strip() for x in str(value).split(",") if x.strip()]


def softmax(theta: np.ndarray) -> np.ndarray:
    theta = np.asarray(theta, dtype=float)
    theta = theta - np.max(theta)
    e = np.exp(theta)
    return e / e.sum()


def safe_auc(y_true, p) -> Optional[float]:
    y = pd.Series(y_true).dropna()
    if y.nunique() < 2:
        return None
    try:
        return float(roc_auc_score(y_true, p))
    except Exception:
        return None


def calibration_error(y_true, p, bins: int = 10) -> Optional[float]:
    """Simple expected calibration error."""
    y = np.asarray(y_true, dtype=float)
    p = np.asarray(p, dtype=float)
    if len(y) == 0:
        return None

    edges = np.linspace(0.0, 1.0, bins + 1)
    total = len(y)
    ece = 0.0
    used = 0
    for i in range(bins):
        if i == bins - 1:
            mask = (p >= edges[i]) & (p <= edges[i + 1])
        else:
            mask = (p >= edges[i]) & (p < edges[i + 1])
        n = int(mask.sum())
        if n == 0:
            continue
        used += n
        conf = float(np.mean(p[mask]))
        obs = float(np.mean(y[mask]))
        ece += (n / total) * abs(conf - obs)

    return float(ece) if used else None


def evaluate_probabilities(y_true, p) -> Dict[str, Optional[float]]:
    y = np.asarray(y_true, dtype=int)
    p = np.clip(np.asarray(p, dtype=float), 1e-8, 1 - 1e-8)
    pred = (p >= 0.5).astype(int)

    return {
        "n": int(len(y)),
        "accuracy": float(accuracy_score(y, pred)),
        "log_loss": float(log_loss(y, p, labels=[0, 1])),
        "brier": float(brier_score_loss(y, p)),
        "roc_auc": safe_auc(y, p),
        "calibration_ece": calibration_error(y, p),
        "positive_rate": float(np.mean(y)),
        "mean_predicted_probability": float(np.mean(p)),
    }


# ============================================================
# Data validation / eligibility
# ============================================================

@dataclass
class ValidationReport:
    engine_version: str
    input_path: str
    input_sha256: str
    rows: int
    date_min: Optional[str]
    date_max: Optional[str]
    target: str
    requested_components: List[str]
    eligible_components: List[str]
    blocked_components: Dict[str, str]
    market_features: List[str]
    mode: str
    train_end: str
    eval_start: str
    eval_end: str
    train_rows: int
    eval_rows: int
    learned_weight_status: str
    warnings: List[str]
    errors: List[str]


def load_panel(path: Path, date_col: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if date_col not in df.columns:
        raise ValueError(f"Missing date column: {date_col}")

    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df = df.dropna(subset=[date_col]).sort_values(date_col).reset_index(drop=True)

    if df.empty:
        raise ValueError("Input contains no valid dated observations.")

    return df


def split_panel(df, date_col, target_col, train_end, eval_start, eval_end):
    """정답을 계산하는 마지막 날짜까지 학습 종료일 안에 있는 행만 사용한다."""
    required = {date_col, target_col, "label_end"}
    if not required.issubset(df.columns):
        raise ValueError("Missing date/target/label_end columns; label horizon must be explicit.")
    data = df.copy()
    data[date_col] = pd.to_datetime(data[date_col], errors="raise")
    data["label_end"] = pd.to_datetime(data["label_end"], errors="raise")
    if data[date_col].isna().any() or data[date_col].duplicated().any():
        raise ValueError("Invalid or duplicate decision dates.")
    valid = data[target_col].notna()
    if data.loc[valid, "label_end"].isna().any() or (data.loc[valid, "label_end"] <= data.loc[valid, date_col]).any():
        raise ValueError("Target requires a valid later label_end.")
    data = data.sort_values(date_col).loc[lambda x: x[target_col].notna()]
    train = data[(data[date_col] <= pd.Timestamp(train_end)) & (data["label_end"] <= pd.Timestamp(train_end))].copy()
    ev = data[(data[date_col] >= pd.Timestamp(eval_start)) & (data[date_col] <= pd.Timestamp(eval_end))].copy()
    return train, ev


class LearnedWeightBlocked(ValueError):
    """표본 부족이나 유효 목적함수 부재를 학습 성공과 구분한다."""


def inner_split(train, date_col, target_col):
    """기존 20/10 최소 표본을 유지하고 내부 학습 경계도 정답 종료일로 자른다."""
    n = len(train)
    cut = max(30, int(n * 0.80))
    if cut >= n - 10:
        cut = n - max(10, int(n * 0.20))
    if cut <= 0:
        raise LearnedWeightBlocked("BLOCKED_INSUFFICIENT_INNER_SPLIT")
    inner_train, inner_val = train.iloc[:cut].copy(), train.iloc[cut:].copy()
    if "label_end" not in train or date_col not in train:
        raise LearnedWeightBlocked("BLOCKED_LABEL_TIMING_UNKNOWN")
    inner_train = inner_train[pd.to_datetime(inner_train["label_end"]) <= pd.to_datetime(inner_train[date_col]).max()]
    if len(inner_train) < 20 or len(inner_val) < 10:
        raise LearnedWeightBlocked("BLOCKED_INSUFFICIENT_INNER_SPLIT")
    if inner_train[target_col].nunique() < 2:
        raise LearnedWeightBlocked("BLOCKED_INNER_TRAIN_SINGLE_CLASS")
    return inner_train, inner_val


def validate_panel(
    df: pd.DataFrame,
    path: Path,
    date_col: str,
    target_col: str,
    requested_components: List[str],
    market_features: List[str],
    mode: str,
    train_end: str,
    eval_start: str,
    eval_end: str,
    min_component_obs: int = 30,
) -> ValidationReport:

    warnings = []
    errors = []
    blocked = {}
    eligible = []
    try:
        train, ev = split_panel(df, date_col, target_col, train_end, eval_start, eval_end)
    except ValueError as error:
        errors.append(str(error))
        train, ev = df.iloc[:0].copy(), df.iloc[:0].copy()

    if target_col not in df.columns:
        errors.append(f"Missing target column: {target_col}")
    else:
        target_numeric = pd.to_numeric(df[target_col], errors="coerce")
        target_values = set(target_numeric.dropna().unique().tolist())
        if not target_values.issubset({0, 1, 0.0, 1.0}):
            errors.append(
                f"Target must be binary 0/1; observed values include: "
                f"{sorted(list(target_values))[:10]}"
            )

    for col in market_features:
        if col not in df.columns:
            errors.append(f"Missing market feature: {col}")

    for comp in requested_components:
        if comp not in df.columns:
            blocked[comp] = "COLUMN_MISSING"
            continue

        numeric = pd.to_numeric(train[comp], errors="coerce")
        n_obs = int(numeric.notna().sum())

        if n_obs < min_component_obs:
            blocked[comp] = f"INSUFFICIENT_OBSERVATIONS:{n_obs}<{min_component_obs}"
            continue

        if numeric.dropna().nunique() < 2:
            blocked[comp] = "NO_VARIATION"
            continue

        if mode.upper() == "PIT":
            available_col = f"{comp}__available_at"
            if available_col not in df.columns:
                blocked[comp] = "PIT_BLOCKED_AVAILABLE_AT_UNKNOWN"
                continue

            available = pd.to_datetime(df[available_col], errors="coerce")
            valid_obs = pd.to_numeric(df[comp], errors="coerce").notna()
            if available[valid_obs].isna().any():
                blocked[comp] = "PIT_BLOCKED_AVAILABLE_AT_PARTIALLY_UNKNOWN"
                continue

            observation_date = df[date_col]
            # Conservative rule:
            # the component must be available no later than the row's decision date.
            late = valid_obs & (available > observation_date)
            if bool(late.any()):
                blocked[comp] = f"PIT_BLOCKED_LATE_AVAILABILITY:{int(late.sum())}_ROWS"
                continue

        eligible.append(comp)

    dtrain_end = pd.Timestamp(train_end)
    deval_start = pd.Timestamp(eval_start)
    deval_end = pd.Timestamp(eval_end)

    if not (dtrain_end < deval_start <= deval_end):
        errors.append("Invalid date split: require train_end < eval_start <= eval_end.")

    train_rows = len(train)
    eval_rows = len(ev)

    if train_rows < 30:
        warnings.append(f"Very small training set: {train_rows} rows.")
    if eval_rows < 30:
        warnings.append(f"Very small evaluation set: {eval_rows} rows.")

    if target_col in df.columns:
        train_target = pd.to_numeric(
            train[target_col], errors="coerce"
        ).dropna()
        eval_target = pd.to_numeric(
            ev[target_col], errors="coerce"
        ).dropna()
        if train_target.nunique() < 2:
            errors.append("Training target has fewer than two classes.")
        if eval_target.nunique() < 2:
            warnings.append(
                "Evaluation target has fewer than two classes; AUC may be undefined."
            )

    if len(eligible) == 0:
        learned_status = "BLOCKED_NO_ELIGIBLE_COMPONENT"
    elif len(eligible) == 1:
        learned_status = "BLOCKED_SINGLE_COMPONENT"
        warnings.append(
            f"Only one eligible CAI component ({eligible[0]}). "
            "Composition weight is necessarily 100%; learned weighting is not meaningful."
        )
    else:
        try:
            inner_split(train, date_col, target_col)
            learned_status = "READY"
        except LearnedWeightBlocked as error:
            learned_status = str(error)
            warnings.append(learned_status)

    if mode.upper() == "RETROSPECTIVE":
        warnings.append(
            "RETROSPECTIVE mode: results must not be described as information "
            "that was necessarily available in real time."
        )

    warnings.append(
        "Forward labels can overlap. Row counts are not independent trial counts; "
        "record the target horizon and label_end explicitly."
    )

    return ValidationReport(
        engine_version=ENGINE_VERSION,
        input_path=str(path),
        input_sha256=sha256_file(path),
        rows=int(len(df)),
        date_min=df[date_col].min().date().isoformat() if len(df) else None,
        date_max=df[date_col].max().date().isoformat() if len(df) else None,
        target=target_col,
        requested_components=requested_components,
        eligible_components=eligible,
        blocked_components=blocked,
        market_features=market_features,
        mode=mode.upper(),
        train_end=train_end,
        eval_start=eval_start,
        eval_end=eval_end,
        train_rows=train_rows,
        eval_rows=eval_rows,
        learned_weight_status=learned_status,
        warnings=warnings,
        errors=errors,
    )


# ============================================================
# Modeling
# ============================================================

def make_pipeline(feature_cols: List[str]) -> Pipeline:
    return Pipeline(
        steps=[
            (
                "prep",
                ColumnTransformer(
                    [
                        (
                            "num",
                            Pipeline(
                                [
                                    ("impute", SimpleImputer(strategy="median")),
                                    ("scale", StandardScaler()),
                                ]
                            ),
                            feature_cols,
                        )
                    ],
                    remainder="drop",
                ),
            ),
            (
                "model",
                LogisticRegression(
                    solver="lbfgs",
                    max_iter=5000,
                    class_weight=None,
                    random_state=42,
                ),
            ),
        ]
    )


def fit_predict_logistic(
    train_df: pd.DataFrame,
    eval_df: pd.DataFrame,
    features: List[str],
    target_col: str,
) -> Tuple[np.ndarray, Pipeline]:

    if not features:
        raise ValueError("No features provided.")

    train = train_df.dropna(subset=[target_col]).copy()
    ev = eval_df.dropna(subset=[target_col]).copy()

    model = make_pipeline(features)
    model.fit(train[features], train[target_col].astype(int))
    p = model.predict_proba(ev[features])[:, 1]
    return p, model


def constant_baseline_probability(train_y: pd.Series, n_eval: int) -> np.ndarray:
    p = float(pd.to_numeric(train_y, errors="coerce").dropna().mean())
    p = min(max(p, 1e-6), 1 - 1e-6)
    return np.repeat(p, n_eval)


def standardize_components_from_train(
    train_df: pd.DataFrame,
    eval_df: pd.DataFrame,
    components: List[str],
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Dict[str, float]]]:

    tr = train_df.copy()
    ev = eval_df.copy()
    stats = {}

    for c in components:
        x = pd.to_numeric(tr[c], errors="coerce")
        med = float(x.median())
        xfilled = x.fillna(med)

        mu = float(xfilled.mean())
        sd = float(xfilled.std(ddof=0))
        if sd <= 1e-12:
            sd = 1.0

        tr[c] = (pd.to_numeric(tr[c], errors="coerce").fillna(med) - mu) / sd
        ev[c] = (pd.to_numeric(ev[c], errors="coerce").fillna(med) - mu) / sd

        stats[c] = {
            "train_median": med,
            "train_mean_after_impute": mu,
            "train_std_after_impute": sd,
        }

    return tr, ev, stats


def build_equal_cai(
    train_df: pd.DataFrame,
    eval_df: pd.DataFrame,
    components: List[str],
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, float], Dict]:

    tr, ev, stats = standardize_components_from_train(train_df, eval_df, components)
    w = {c: 1.0 / len(components) for c in components}

    tr = tr.copy()
    ev = ev.copy()
    tr["CAI_EQUAL"] = sum(w[c] * tr[c] for c in components)
    ev["CAI_EQUAL"] = sum(w[c] * ev[c] for c in components)

    return tr, ev, w, stats



def _standardize_inner_split(
    inner_train: pd.DataFrame,
    inner_val: pd.DataFrame,
    components: List[str],
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fit imputation/scaling only on inner_train, then apply to inner_val.
    This prevents preprocessing leakage during learned-weight tuning.
    """
    tr = inner_train.copy()
    va = inner_val.copy()

    for c in components:
        x = pd.to_numeric(tr[c], errors="coerce")
        med = float(x.median())
        xfilled = x.fillna(med)
        mu = float(xfilled.mean())
        sd = float(xfilled.std(ddof=0))
        if not np.isfinite(sd) or sd <= 1e-12:
            sd = 1.0

        tr[c] = (pd.to_numeric(tr[c], errors="coerce").fillna(med) - mu) / sd
        va[c] = (pd.to_numeric(va[c], errors="coerce").fillna(med) - mu) / sd

    return tr, va


def _softmax_weight_objective(
    theta: np.ndarray,
    train_df_raw: pd.DataFrame,
    components: List[str],
    market_features: List[str],
    target_col: str,
    date_col: str = "date",
) -> float:
    """
    Chronological internal holdout objective.

    Important:
    - inner validation is later in time than inner training
    - component preprocessing is fitted only on inner training
    - market-feature preprocessing is fitted by the sklearn pipeline on inner training
    """
    inner_train_raw, inner_val_raw = inner_split(train_df_raw, date_col, target_col)

    inner_train, inner_val = _standardize_inner_split(
        inner_train_raw, inner_val_raw, components
    )

    weights = softmax(theta)
    cai_train = np.zeros(len(inner_train))
    cai_val = np.zeros(len(inner_val))

    for j, c in enumerate(components):
        cai_train += weights[j] * inner_train[c].to_numpy(dtype=float)
        cai_val += weights[j] * inner_val[c].to_numpy(dtype=float)

    inner_train["CAI_LEARNED_TMP"] = cai_train
    inner_val["CAI_LEARNED_TMP"] = cai_val

    features = ["CAI_LEARNED_TMP"] + market_features

    try:
        p, _ = fit_predict_logistic(
            inner_train, inner_val, features, target_col
        )
        y = inner_val[target_col].astype(int).to_numpy()
        return float(
            log_loss(
                y,
                np.clip(p, 1e-8, 1 - 1e-8),
                labels=[0, 1],
            )
        )
    except (ValueError, FloatingPointError):
        return float("inf")

def learn_simplex_weights(
    train_df_raw: pd.DataFrame,
    components: List[str],
    market_features: List[str],
    target_col: str,
    max_iter: int = 120,
    date_col: str = "date",
) -> Dict[str, float]:
    """
    Dependency-light coordinate search on softmax parameters.

    This is intentionally conservative:
    - no scipy dependency
    - deterministic
    - nonnegative weights
    - sum(weights) == 1
    """
    k = len(components)

    if k < 2:
        raise ValueError("Learned composition requires at least two components.")

    theta = np.zeros(k, dtype=float)
    best = _softmax_weight_objective(
        theta, train_df_raw, components, market_features, target_col, date_col
    )
    if not np.isfinite(best):
        raise LearnedWeightBlocked("BLOCKED_NO_VALID_OBJECTIVE")

    step = 1.0

    for _ in range(max_iter):
        improved = False

        for j in range(k):
            for direction in (-1.0, 1.0):
                candidate = theta.copy()
                candidate[j] += direction * step
                score = _softmax_weight_objective(
                    candidate,
                    train_df_raw,
                    components,
                    market_features,
                    target_col,
                    date_col,
                )

                if score + 1e-8 < best:
                    theta = candidate
                    best = score
                    improved = True

        if not improved:
            step *= 0.65

        if step < 0.01:
            break

    w = softmax(theta)
    return {c: float(w[i]) for i, c in enumerate(components)}


def apply_learned_cai(
    train_df_std: pd.DataFrame,
    eval_df_std: pd.DataFrame,
    weights: Dict[str, float],
) -> Tuple[pd.DataFrame, pd.DataFrame]:

    tr = train_df_std.copy()
    ev = eval_df_std.copy()

    tr["CAI_LEARNED"] = sum(weights[c] * tr[c] for c in weights)
    ev["CAI_LEARNED"] = sum(weights[c] * ev[c] for c in weights)

    return tr, ev


# ============================================================
# Overlap diagnostics
# ============================================================

def phase_stride_diagnostics(
    eval_df: pd.DataFrame,
    probabilities: np.ndarray,
    target_col: str,
    horizon: int = 5,
) -> Dict:

    result = {}
    ev = eval_df.dropna(subset=[target_col]).reset_index(drop=True).copy()
    p = np.asarray(probabilities)

    if len(ev) != len(p):
        raise ValueError("Probability length does not match evaluation rows.")

    for phase in range(horizon):
        idx = np.arange(phase, len(ev), horizon)
        if len(idx) < 5:
            continue

        y_phase = ev.iloc[idx][target_col].astype(int).to_numpy()
        p_phase = p[idx]

        result[f"phase_{phase}"] = evaluate_probabilities(y_phase, p_phase)

    return result


# ============================================================
# Experiment runner
# ============================================================

def run_experiment(
    df: pd.DataFrame,
    validation: ValidationReport,
    date_col: str,
    target_col: str,
    market_features: List[str],
    output_dir: Path,
) -> Dict:

    if validation.errors:
        raise ValueError("Validation failed: " + " | ".join(validation.errors))

    train, ev = split_panel(df, date_col, target_col, validation.train_end, validation.eval_start, validation.eval_end)
    if train.empty or ev.empty:
        raise ValueError("No usable training or evaluation rows after label-boundary checks.")

    y_train = train[target_col].astype(int)
    y_eval = ev[target_col].astype(int)

    results = {
        "engine_version": ENGINE_VERSION,
        "validation": asdict(validation),
        "models": {},
        "weights": {},
        "preprocessing": {},
    }

    # --------------------------------------------------------
    # 1) Constant baseline
    # --------------------------------------------------------
    p_base = constant_baseline_probability(y_train, len(ev))
    results["models"]["baseline_constant"] = {
        "metrics": evaluate_probabilities(y_eval, p_base),
        "phase_stride_5d": phase_stride_diagnostics(ev, p_base, target_col, 5),
    }

    # --------------------------------------------------------
    # 2) Market-only
    # --------------------------------------------------------
    if market_features:
        p_market, _ = fit_predict_logistic(train, ev, market_features, target_col)
        results["models"]["market_only"] = {
            "features": market_features,
            "metrics": evaluate_probabilities(y_eval, p_market),
            "phase_stride_5d": phase_stride_diagnostics(ev, p_market, target_col, 5),
        }
    else:
        p_market = None
        results["models"]["market_only"] = {
            "status": "BLOCKED_NO_MARKET_FEATURES"
        }

    components = validation.eligible_components

    # --------------------------------------------------------
    # 3) No CAI components
    # --------------------------------------------------------
    if len(components) == 0:
        results["models"]["cai"] = {
            "status": "BLOCKED_NO_ELIGIBLE_COMPONENT"
        }

    # --------------------------------------------------------
    # 4) Single-component diagnostic
    # --------------------------------------------------------
    elif len(components) == 1:
        c = components[0]
        tr_std, ev_std, stats = standardize_components_from_train(
            train, ev, components
        )
        tr_std["CAI_SINGLE"] = tr_std[c]
        ev_std["CAI_SINGLE"] = ev_std[c]

        features_single = ["CAI_SINGLE"] + market_features
        p_single, _ = fit_predict_logistic(
            tr_std, ev_std, features_single, target_col
        )

        results["weights"]["single_component"] = {c: 1.0}
        results["preprocessing"]["activity_components"] = stats

        results["models"]["traffic_or_single_component"] = {
            "status": "RUN",
            "component": c,
            "note": (
                "Single eligible component. Weight is necessarily 100%; "
                "this is not a learned CAI composition."
            ),
            "features": features_single,
            "metrics": evaluate_probabilities(y_eval, p_single),
            "phase_stride_5d": phase_stride_diagnostics(
                ev_std, p_single, target_col, 5
            ),
        }

        results["models"]["equal_weight_cai"] = {
            "status": "NOT_DISTINCT_FROM_SINGLE_COMPONENT"
        }
        results["models"]["learned_weight_cai"] = {
            "status": "BLOCKED_SINGLE_COMPONENT"
        }

    # --------------------------------------------------------
    # 5) Multi-component equal + learned
    # --------------------------------------------------------
    else:
        # Equal
        tr_eq, ev_eq, eq_w, stats = build_equal_cai(
            train, ev, components
        )
        eq_features = ["CAI_EQUAL"] + market_features
        p_eq, _ = fit_predict_logistic(
            tr_eq, ev_eq, eq_features, target_col
        )

        results["weights"]["equal"] = eq_w
        results["preprocessing"]["activity_components"] = stats
        results["models"]["equal_weight_cai"] = {
            "status": "RUN",
            "features": eq_features,
            "metrics": evaluate_probabilities(y_eval, p_eq),
            "phase_stride_5d": phase_stride_diagnostics(
                ev_eq, p_eq, target_col, 5
            ),
        }

        try:
            # Learned
            tr_std, ev_std, _ = standardize_components_from_train(
                train, ev, components
            )

            learned_w = learn_simplex_weights(
                train,
                components,
                market_features,
                target_col,
                date_col=date_col,
            )
            tr_l, ev_l = apply_learned_cai(
                tr_std, ev_std, learned_w
            )

            learned_features = ["CAI_LEARNED"] + market_features
            p_l, _ = fit_predict_logistic(
                tr_l, ev_l, learned_features, target_col
            )

            results["weights"]["learned"] = learned_w
            results["models"]["learned_weight_cai"] = {
                "status": "RUN",
                "features": learned_features,
                "constraints": {
                    "nonnegative": True,
                    "sum_to_one": True,
                },
                "metrics": evaluate_probabilities(y_eval, p_l),
                "phase_stride_5d": phase_stride_diagnostics(
                    ev_l, p_l, target_col, 5
                ),
            }

            # direct comparison
            results["comparison"] = {
                "equal_vs_learned": {
                    "log_loss_equal": results["models"]["equal_weight_cai"]["metrics"]["log_loss"],
                    "log_loss_learned": results["models"]["learned_weight_cai"]["metrics"]["log_loss"],
                    "accuracy_equal": results["models"]["equal_weight_cai"]["metrics"]["accuracy"],
                    "accuracy_learned": results["models"]["learned_weight_cai"]["metrics"]["accuracy"],
                    "learned_minus_equal_log_loss": (
                        results["models"]["learned_weight_cai"]["metrics"]["log_loss"]
                        - results["models"]["equal_weight_cai"]["metrics"]["log_loss"]
                    ),
                    "interpretation": (
                        "Negative learned_minus_equal_log_loss favors learned weights; "
                        "positive favors equal weights. Do not select on final OOS data."
                    ),
                }
            }

        except LearnedWeightBlocked as error:
            results["models"]["learned_weight_cai"] = {"status": str(error)}
            results["validation"]["learned_weight_status"] = str(error)
            results["comparison"] = {"equal_vs_learned": {"status": "NOT_COMPARABLE_LEARNING_BLOCKED"}}

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------
    output_dir.mkdir(parents=True, exist_ok=False)
    if date_col == "month":
        for model in results["models"].values():
            model.pop("phase_stride_5d", None)

    (output_dir / "result.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    # compact comparison CSV
    rows = []
    for name, data in results["models"].items():
        if isinstance(data, dict) and "metrics" in data:
            m = data["metrics"]
            rows.append({
                "model": name,
                "n": m.get("n"),
                "accuracy": m.get("accuracy"),
                "log_loss": m.get("log_loss"),
                "brier": m.get("brier"),
                "roc_auc": m.get("roc_auc"),
                "calibration_ece": m.get("calibration_ece"),
                "status": data.get("status", "RUN"),
            })
        else:
            rows.append({
                "model": name,
                "status": data.get("status") if isinstance(data, dict) else None,
            })

    pd.DataFrame(rows).to_csv(
        output_dir / "model_comparison.csv",
        index=False,
    )

    if results["weights"]:
        weight_rows = []
        for scheme, ws in results["weights"].items():
            for comp, w in ws.items():
                weight_rows.append({
                    "scheme": scheme,
                    "component": comp,
                    "weight": w,
                })
        pd.DataFrame(weight_rows).to_csv(
            output_dir / "weights.csv",
            index=False,
        )

    return results




# ============================================================
# ALL-IN-ONE EMBEDDED DATA BUNDLE
# ============================================================

DATA_BUNDLE_VERSION = "2026-09-13-final"

SOURCE_MANIFEST = {
    "cushing_hotel_2022_2023": {
        "publisher": "City of Cushing",
        "url": "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/city.agenga.4.21.25.pdf",
        "status": "OFFICIAL_TABLE_EXTRACT",
        "note": "2022-2023 hotel tax monthly table; total 87,929.30."
    },
    "cushing_hotel_2023_2025": {
        "publisher": "City of Cushing",
        "url": "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf",
        "status": "OFFICIAL_TABLE_EXTRACT",
        "note": "2023-2024 and 2024-2025 hotel tax monthly tables."
    },
    "cushing_use_2023_2025": {
        "publisher": "City of Cushing",
        "url": "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf",
        "status": "OFFICIAL_TABLE_EXTRACT",
        "note": "2023-2024 and 2024-2025 use-tax monthly tables."
    },
    "cushing_airport_may_2023": {
        "publisher": "City of Cushing",
        "url": "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_may_23_final_copy.pdf",
        "status": "OFFICIAL_REPORT_VERIFIED",
        "note": "Airport April 2023 operations/fuel/based-aircraft snapshot."
    },
    "cushing_airport_followups": {
        "publisher": "City of Cushing",
        "urls": [
            "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_june_23_final_.pdf",
            "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_july_23_final.pdf",
            "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_september_23_final_.pdf",
        ],
        "status": "OFFICIAL_REPORT_EXTRACT",
        "note": "Additional monthly airport observations; not continuous enough for common model."
    },
    "wti_eia_monthly": {
        "publisher": "U.S. Energy Information Administration",
        "url": "https://www.eia.gov/dnav/pet/hist/rwtcM.htm",
        "status": "OFFICIAL_MONTHLY_SERIES",
        "note": "Cushing, OK WTI Spot Price FOB monthly series."
    },
    "sales_tax_conflict_note": {
        "publisher": "City of Cushing",
        "status": "EXCLUDED_FROM_DEFAULT_MODEL",
        "note": (
            "Multiple official packet text/OCR extracts produced conflicting sales-tax values "
            "for some months. The all-in-one engine does not silently choose among them. "
            "Sales-tax candidate remains in the provenance registry but is excluded from the "
            "default reproducible model until a row-by-row canonical table is manually verified."
        )
    }
}

# 36 verified/finalized hotel/motel-tax observations.
HOTEL_TAX_ROWS = [
    # tax_month, amount, available_at, source_id
    ("2022-07", 9488.70, "2022-08-15", "cushing_hotel_2022_2023"),
    ("2022-08", 10695.90, "2022-09-15", "cushing_hotel_2022_2023"),
    ("2022-09", 9156.57, "2022-10-15", "cushing_hotel_2022_2023"),
    ("2022-10", 7090.35, "2022-11-15", "cushing_hotel_2022_2023"),
    ("2022-11", 5521.83, "2022-12-15", "cushing_hotel_2022_2023"),
    ("2022-12", 5369.78, "2023-01-15", "cushing_hotel_2022_2023"),
    ("2023-01", 6124.48, "2023-02-15", "cushing_hotel_2022_2023"),
    ("2023-02", 6030.60, "2023-03-15", "cushing_hotel_2022_2023"),
    ("2023-03", 6895.19, "2023-04-15", "cushing_hotel_2022_2023"),
    ("2023-04", 6662.04, "2023-05-15", "cushing_hotel_2022_2023"),
    ("2023-05", 7460.20, "2023-06-15", "cushing_hotel_2022_2023"),
    ("2023-06", 7433.66, "2023-07-15", "cushing_hotel_2022_2023"),

    ("2023-07", 6088.32, "2023-08-15", "cushing_hotel_2023_2025"),
    ("2023-08", 5935.21, "2023-09-15", "cushing_hotel_2023_2025"),
    ("2023-09", 5631.31, "2023-10-15", "cushing_hotel_2023_2025"),
    ("2023-10", 6481.84, "2023-11-15", "cushing_hotel_2023_2025"),
    ("2023-11", 7532.42, "2023-12-15", "cushing_hotel_2023_2025"),
    ("2023-12", 6732.34, "2024-01-15", "cushing_hotel_2023_2025"),
    ("2024-01", 6331.33, "2024-02-15", "cushing_hotel_2023_2025"),
    ("2024-02", 5721.58, "2024-03-15", "cushing_hotel_2023_2025"),
    ("2024-03", 6866.02, "2024-04-15", "cushing_hotel_2023_2025"),
    ("2024-04", 7619.14, "2024-05-15", "cushing_hotel_2023_2025"),
    ("2024-05", 9524.08, "2024-06-15", "cushing_hotel_2023_2025"),
    ("2024-06", 7179.17, "2024-07-15", "cushing_hotel_2023_2025"),

    ("2024-07", 7672.30, "2024-08-15", "cushing_hotel_2023_2025"),
    ("2024-08", 6454.69, "2024-09-15", "cushing_hotel_2023_2025"),
    ("2024-09", 7644.07, "2024-10-15", "cushing_hotel_2023_2025"),
    ("2024-10", 7555.46, "2024-11-15", "cushing_hotel_2023_2025"),
    ("2024-11", 6902.84, "2024-12-15", "cushing_hotel_2023_2025"),
    ("2024-12", 6131.73, "2025-01-15", "cushing_hotel_2023_2025"),
    ("2025-01", 6340.75, "2025-02-15", "cushing_hotel_2023_2025"),
    ("2025-02", 6452.39, "2025-03-15", "cushing_hotel_2023_2025"),
    ("2025-03", 8200.99, "2025-04-15", "cushing_hotel_2023_2025"),
    ("2025-04", 9609.95, "2025-05-15", "cushing_hotel_2023_2025"),
    ("2025-05", 13698.30, "2025-06-15", "cushing_hotel_2023_2025"),
    ("2025-06", 12111.28, "2025-07-15", "cushing_hotel_2023_2025"),
]

# 24 complete use-tax observations covering July 2023 - June 2025.
USE_TAX_ROWS = [
    ("2023-07",129448.38,"2023-09-09","cushing_use_2023_2025"),
    ("2023-08",78001.62,"2023-10-06","cushing_use_2023_2025"),
    ("2023-09",83250.09,"2023-11-08","cushing_use_2023_2025"),
    ("2023-10",68536.43,"2023-12-08","cushing_use_2023_2025"),
    ("2023-11",92753.64,"2024-01-08","cushing_use_2023_2025"),
    ("2023-12",120603.48,"2024-02-09","cushing_use_2023_2025"),
    ("2024-01",76235.71,"2024-03-08","cushing_use_2023_2025"),
    ("2024-02",56490.54,"2024-04-08","cushing_use_2023_2025"),
    ("2024-03",67960.52,"2024-05-09","cushing_use_2023_2025"),
    ("2024-04",67301.11,"2024-06-10","cushing_use_2023_2025"),
    ("2024-05",96172.13,"2024-07-08","cushing_use_2023_2025"),
    ("2024-06",38415.18,"2024-08-09","cushing_use_2023_2025"),

    ("2024-07",74067.42,"2024-09-09","cushing_use_2023_2025"),
    ("2024-08",59718.32,"2024-10-09","cushing_use_2023_2025"),
    ("2024-09",105865.38,"2024-11-08","cushing_use_2023_2025"),
    ("2024-10",66956.40,"2024-12-09","cushing_use_2023_2025"),
    ("2024-11",91176.02,"2025-01-09","cushing_use_2023_2025"),
    ("2024-12",97622.41,"2025-02-10","cushing_use_2023_2025"),
    ("2025-01",63043.35,"2025-03-10","cushing_use_2023_2025"),
    ("2025-02",67240.30,"2025-04-09","cushing_use_2023_2025"),
    ("2025-03",72078.07,"2025-05-09","cushing_use_2023_2025"),
    ("2025-04",76527.06,"2025-06-09","cushing_use_2023_2025"),
    ("2025-05",90536.14,"2025-07-09","cushing_use_2023_2025"),
    ("2025-06",90848.50,"2025-08-08","cushing_use_2023_2025"),
]

# Airport observations: real but discontinuous, retained as a separate table rather than
# silently imputed into the 24-month common model.
AIRPORT_ROWS = [
    # month, transient_overnight, hangar_waitlist, survival_flight_ops, jet_a, avgas, based_aircraft, available_at, source_id
    ("2023-04",11,34,36,3600,3200,31,"2023-05-15","cushing_airport_may_2023"),
    ("2023-05",7,34,38,4800,4700,31,None,"cushing_airport_followups"),
    ("2023-06",6,34,41,4400,4500,31,"2023-07-17","cushing_airport_followups"),
    ("2023-08",4,38,48,None,None,31,None,"cushing_airport_followups"),
]

# WTI monthly values corresponding to the common July 2023 - June 2025 research window.
WTI_ROWS = [
    ("2023-07",76.07),("2023-08",81.39),("2023-09",89.43),("2023-10",85.64),
    ("2023-11",77.69),("2023-12",71.90),("2024-01",74.15),("2024-02",77.25),
    ("2024-03",81.28),("2024-04",85.35),("2024-05",80.02),("2024-06",79.77),
    ("2024-07",81.80),("2024-08",76.68),("2024-09",70.24),("2024-10",71.99),
    ("2024-11",69.95),("2024-12",70.12),("2025-01",75.74),("2025-02",71.53),
    ("2025-03",68.24),("2025-04",63.54),("2025-05",62.17),("2025-06",68.17),
]

# Sales-tax rows are kept only where directly verified from manager-report text in this bundle.
# Conflicting later table OCR values are intentionally not used in the default model.
SALES_TAX_VERIFIED_ROWS = [
    ("2023-01",511872.31,"2023-05-15","manager_report_verified"),
    ("2023-02",495921.97,"2023-05-15","manager_report_verified"),
    ("2023-03",571316.03,"2023-05-15","manager_report_verified"),
    ("2023-04",479306.29,"2023-07-17","manager_report_verified"),
    ("2023-05",556914.55,"2023-07-17","manager_report_verified"),
    ("2023-06",553851.71,None,"manager_report_extract"),
    ("2023-07",510833.95,None,"manager_report_extract"),
]


def _rows_to_df(rows, columns):
    return pd.DataFrame(rows, columns=columns)


def embedded_tables() -> Dict[str, pd.DataFrame]:
    hotel = _rows_to_df(
        HOTEL_TAX_ROWS,
        ["month","hotel_motel_tax_usd","available_at","source_id"]
    )
    use = _rows_to_df(
        USE_TAX_ROWS,
        ["month","use_tax_usd","available_at","source_id"]
    )
    airport = _rows_to_df(
        AIRPORT_ROWS,
        [
            "month","transient_overnight","hangar_waitlist","survival_flight_ops",
            "jet_a_gallons","avgas_gallons","based_aircraft","available_at","source_id"
        ]
    )
    wti = _rows_to_df(WTI_ROWS, ["month","wti_monthly_usd"])
    sales = _rows_to_df(
        SALES_TAX_VERIFIED_ROWS,
        ["month","sales_tax_usd","available_at","quality"]
    )

    for d in (hotel,use,airport,wti,sales):
        d["month"] = pd.to_datetime(d["month"] + "-01") + pd.offsets.MonthEnd(0)
    return {
        "hotel_tax": hotel,
        "use_tax": use,
        "airport": airport,
        "wti": wti,
        "sales_tax_verified_subset": sales,
    }


def build_common_monthly_panel() -> pd.DataFrame:
    t = embedded_tables()
    panel = (
        t["hotel_tax"][["month","hotel_motel_tax_usd"]]
        .merge(t["use_tax"][["month","use_tax_usd"]], on="month", how="inner")
        .merge(t["wti"], on="month", how="inner")
        .sort_values("month")
        .reset_index(drop=True)
    )
    panel["wti_ret_1m"] = panel["wti_monthly_usd"].pct_change()
    panel["wti_ret_lag1"] = panel["wti_ret_1m"].shift(1)
    panel["label_end"] = panel["month"].shift(-1)
    panel["target_next_month_up"] = (
        panel["wti_monthly_usd"].shift(-1) > panel["wti_monthly_usd"]
    ).astype(float)
    panel.loc[panel.index[-1], "target_next_month_up"] = np.nan
    return panel


def validate_embedded_data() -> Dict:
    t = embedded_tables()
    checks = {}

    checks["hotel_rows_36"] = bool(len(t["hotel_tax"]) == 36)
    checks["use_rows_24"] = bool(len(t["use_tax"]) == 24)
    checks["airport_rows_4"] = bool(len(t["airport"]) == 4)
    checks["wti_rows_24"] = bool(len(t["wti"]) == 24)

    checks["hotel_2022_23_total"] = bool(abs(
        t["hotel_tax"].iloc[:12]["hotel_motel_tax_usd"].sum() - 87929.30
    ) < 0.01)
    checks["hotel_2023_24_total"] = bool(abs(
        t["hotel_tax"].iloc[12:24]["hotel_motel_tax_usd"].sum() - 81642.76
    ) < 0.01)
    checks["hotel_2024_25_total"] = bool(abs(
        t["hotel_tax"].iloc[24:36]["hotel_motel_tax_usd"].sum() - 98774.75
    ) < 0.01)

    checks["use_2023_24_total"] = bool(abs(
        t["use_tax"].iloc[:12]["use_tax_usd"].sum() - 975168.83
    ) < 0.01)
    checks["use_2024_25_total"] = bool(abs(
        t["use_tax"].iloc[12:]["use_tax_usd"].sum() - 955679.37
    ) < 0.01)

    common = build_common_monthly_panel()
    checks["common_rows_24"] = bool(len(common) == 24)
    checks["common_no_missing_components"] = bool(
        common[["hotel_motel_tax_usd","use_tax_usd","wti_monthly_usd"]]
        .notna().all().all()
    )
    checks["all_pass"] = bool(all(bool(v) for v in checks.values()))
    return checks


def export_embedded_bundle(output_dir: Path) -> Dict:
    output_dir.mkdir(parents=True, exist_ok=False)
    t = embedded_tables()
    paths = {}

    for name, df in t.items():
        p = output_dir / f"{name}.csv"
        df.to_csv(p, index=False)
        paths[name] = str(p)

    common = build_common_monthly_panel()
    p = output_dir / "common_monthly_panel.csv"
    common.to_csv(p, index=False)
    paths["common_monthly_panel"] = str(p)

    manifest_path = output_dir / "source_manifest.json"
    manifest_path.write_text(
        json.dumps(SOURCE_MANIFEST, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    paths["source_manifest"] = str(manifest_path)

    qa = validate_embedded_data()
    qa_path = output_dir / "embedded_data_qa.json"
    qa_path.write_text(json.dumps(qa, indent=2), encoding="utf-8")
    paths["embedded_data_qa"] = str(qa_path)

    return {"paths": paths, "qa": qa}


def run_embedded_experiment(output_dir: Path) -> Dict:
    if output_dir.exists():
        raise FileExistsError(output_dir)
    export = export_embedded_bundle(output_dir / "data")
    if not export["qa"]["all_pass"]:
        raise RuntimeError("Embedded data QA failed; refusing to run model.")

    panel = build_common_monthly_panel()
    panel_path = output_dir / "data" / "common_monthly_panel.csv"

    # Only fully verified continuous common components are used by default.
    components = ["hotel_motel_tax_usd", "use_tax_usd"]
    market_features = ["wti_ret_lag1"]

    report = validate_panel(
        df=panel,
        path=panel_path,
        date_col="month",
        target_col="target_next_month_up",
        requested_components=components,
        market_features=market_features,
        mode="retrospective",
        train_end="2024-06-30",
        eval_start="2024-07-01",
        eval_end="2025-05-31",
        min_component_obs=12,
    )

    result = run_experiment(
        df=panel,
        validation=report,
        date_col="month",
        target_col="target_next_month_up",
        market_features=market_features,
        output_dir=output_dir / "model_run",
    )

    status = {
        "data_bundle_version": DATA_BUNDLE_VERSION,
        "candidate_5_airport": {
            "data_embedded": True,
            "rows": len(AIRPORT_ROWS),
            "main_common_model": False,
            "reason": "Discontinuous/short history; no synthetic backfill.",
        },
        "candidate_11_lodging_tax": {
            "data_embedded": True,
            "rows": len(HOTEL_TAX_ROWS),
            "monthly_exploratory_eligible": "hotel_motel_tax_usd" in report.eligible_components,
            "blocked_reason": report.blocked_components.get("hotel_motel_tax_usd"),
            "main_daily_cai_eligible": False,
        },
        "candidate_16_use_tax": {
            "data_embedded": True,
            "rows": len(USE_TAX_ROWS),
            "monthly_exploratory_eligible": "use_tax_usd" in report.eligible_components,
            "blocked_reason": report.blocked_components.get("use_tax_usd"),
            "main_daily_cai_eligible": False,
        },
        "candidate_16_sales_tax": {
            "data_embedded": True,
            "verified_subset_rows": len(SALES_TAX_VERIFIED_ROWS),
            "default_model_used": False,
            "reason": (
                "Conflicting official packet/OCR extracts for some later months; "
                "excluded instead of silently choosing a value."
            ),
        },
        "main_daily_cai_training_eligible": False,
        "monthly_baseline_evaluation_completed": True,
        "monthly_cai_comparison_completed": "metrics" in result["models"].get("equal_weight_cai", {}),
        "source_verification": "SUBMITTER_REPORTED_NOT_INDEPENDENTLY_VERIFIED",
    }

    mkt = result["models"]["market_only"]["metrics"]
    eq = result["models"].get("equal_weight_cai", {}).get("metrics")
    learned_model = result["models"].get("learned_weight_cai", {})
    learned = learned_model.get("metrics")

    status["wti_test"] = {
        "market_only": mkt,
        "equal_cai_plus_market": eq,
        "learned_cai_plus_market": learned,
        "equal_improves_log_loss": eq["log_loss"] < mkt["log_loss"] if eq else None,
        "learned_improves_log_loss": learned["log_loss"] < mkt["log_loss"] if learned else None,
        "learned_status": learned_model.get("status", "NOT_RUN"),
        "claim": (
            "Exploratory monthly diagnostic only. "
            "No main-daily-CAI predictive claim is permitted."
        ),
    }

    result["all_in_one_status"] = status
    out = output_dir / "ALL_IN_ONE_RESULT.json"
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    return result


def run_self_test() -> Dict:
    """실측·보호 구간을 읽지 않고 합성 입력으로 정상 학습과 차단 상태를 검사한다."""
    import tempfile
    dates = pd.date_range("2015-01-31", periods=90, freq="ME")
    rng = np.random.default_rng(7)
    panel = pd.DataFrame({"date": dates, "label_end": dates + pd.offsets.MonthEnd(1),
                          "a": rng.normal(size=90), "b": rng.normal(size=90),
                          "market": rng.normal(size=90), "target": np.arange(90) % 2})
    checks = {}
    with tempfile.TemporaryDirectory() as folder:
        root = Path(folder)
        path = root / "synthetic.csv"; panel.to_csv(path, index=False)
        for name, train_end, eval_start in [("enough", "2020-12-31", "2021-01-01"), ("short", "2016-01-31", "2016-02-01")]:
            report = validate_panel(panel, path, "date", "target", ["a", "b"], ["market"],
                                    "retrospective", train_end, eval_start, "2022-06-30", min_component_obs=1)
            result = run_experiment(panel, report, "date", "target", ["market"], root / name)
            model = result["models"]["learned_weight_cai"]
            weights = result["weights"].get("learned", {})
            checks[name] = (model["status"] == "RUN" and bool(weights) and all(np.isfinite(w) and w >= 0 for w in weights.values()) and abs(sum(weights.values())-1) < 1e-9) if name == "enough" else (
                model["status"] == "BLOCKED_INSUFFICIENT_INNER_SPLIT" and "metrics" not in model and "learned" not in result["weights"])
        train, _ = split_panel(panel, "date", "target", "2016-01-31", "2016-02-01", "2022-06-30")
        checks["label_boundary"] = bool((train["label_end"] <= pd.Timestamp("2016-01-31")).all() and len(train) == 12)
    return {"data_origin": "SYNTHETIC", "embedded_data_checked": False, "checks": checks, "all_pass": all(checks.values())}


# ============================================================
# CLI
# ============================================================

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Seongchan CAI Weekend Research Engine"
    )

    sub = p.add_subparsers(dest="command", required=True)

    def add_common(sp):
        sp.add_argument("--input", required=True, type=Path)
        sp.add_argument("--date-col", default="date")
        sp.add_argument("--target-col", default="target_up_5d")
        sp.add_argument(
            "--components",
            default="",
            help="Comma-separated CAI activity component columns.",
        )
        sp.add_argument(
            "--market-features",
            default="",
            help="Comma-separated market feature columns.",
        )
        sp.add_argument("--train-end", required=True)
        sp.add_argument("--eval-start", required=True)
        sp.add_argument("--eval-end", required=True)
        sp.add_argument(
            "--mode",
            choices=["retrospective", "pit"],
            default="retrospective",
        )
        sp.add_argument("--min-component-obs", type=int, default=30)

    v = sub.add_parser("validate")
    add_common(v)

    r = sub.add_parser("run")
    add_common(r)
    r.add_argument("--output-dir", required=True, type=Path)

    o = sub.add_parser(
        "official-5-11-16",
        help="Export embedded data and run the complete reproducible 5/11/16 monthly diagnostic."
    )
    o.add_argument("--output-dir", required=True, type=Path)

    e = sub.add_parser(
        "export-all",
        help="Export every embedded dataset, provenance manifest, common panel, and QA report."
    )
    e.add_argument("--output-dir", required=True, type=Path)

    sub.add_parser(
        "self-test",
        help="Run synthetic-only regression checks; embedded observations are not evaluated."
    )

    return p


def main():
    args = build_parser().parse_args()

    if args.command == "official-5-11-16":
        result = run_embedded_experiment(args.output_dir)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    if args.command == "export-all":
        result = export_embedded_bundle(args.output_dir)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    if args.command == "self-test":
        result = run_self_test()
        print(json.dumps(result, indent=2, ensure_ascii=False))
        raise SystemExit(0 if result.get("all_pass") else 1)

    df = load_panel(args.input, args.date_col)
    components = parse_csv_list(args.components)
    market_features = parse_csv_list(args.market_features)

    report = validate_panel(
        df=df,
        path=args.input,
        date_col=args.date_col,
        target_col=args.target_col,
        requested_components=components,
        market_features=market_features,
        mode=args.mode,
        train_end=args.train_end,
        eval_start=args.eval_start,
        eval_end=args.eval_end,
        min_component_obs=args.min_component_obs,
    )

    if args.command == "validate":
        print(json.dumps(asdict(report), indent=2, ensure_ascii=False))
        raise SystemExit(1 if report.errors else 0)

    if report.errors:
        print(json.dumps(asdict(report), indent=2, ensure_ascii=False))
        raise SystemExit(1)

    results = run_experiment(
        df=df,
        validation=report,
        date_col=args.date_col,
        target_col=args.target_col,
        market_features=market_features,
        output_dir=args.output_dir,
    )

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
