"""Data loading, quality/time-alignment checks, splits, target and CAI scores.

Rules enforced here:
- Out-of-sample (2024+) rows are dropped before anything else and asserted absent.
- Target = next ``horizon`` trading days up (close[t+h] > close[t]); flat counts as 0.
- Training rows whose label window crosses the validation boundary are excluded.
- Component scores are z-clipped with statistics fitted on the training rows only.
- Missing values are never filled; affected rows are dropped and counted.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np
import pandas as pd

from ls_crude.config import IN_SAMPLE_END
from ls_crude.features.rsi import rsi

from .spec import MODEL_KINDS, CAI_MODELS, Spec, resolve_path

Z_CLIP = 3.0


class DataError(ValueError):
    """Raised when an input series fails a hard quality check."""


@dataclass
class Prepared:
    """Prepared frames and masks for one spec run."""

    dates: pd.DatetimeIndex
    close: pd.Series
    target: pd.Series
    market: pd.DataFrame
    components: pd.DataFrame | None
    component_scores: pd.DataFrame | None
    train_mask: pd.Series
    val_mask: pd.Series
    quality: dict[str, Any] = field(default_factory=dict)
    checks: dict[str, Any] = field(default_factory=dict)

    @property
    def component_names(self) -> list[str]:
        """Fixed component order used everywhere downstream."""
        return list(self.components.columns) if self.components is not None else []


def load_price_frame(
    path: str,
    date_column: str = "date",
    close_column: str = "Close",
    *,
    start: str,
    end: str,
) -> pd.DataFrame:
    """Load a price CSV and keep only the in-sample window.

    Non-positive closes (e.g. the 2020-04-20 negative WTI settlement) are marked
    invalid and treated as missing observations: they are never filled, and the
    target drops any label whose forward window includes one.
    """
    frame = pd.read_csv(path)
    if date_column not in frame.columns:
        raise DataError(f"price input missing date column '{date_column}'")
    if close_column not in frame.columns:
        raise DataError(f"price input missing close column '{close_column}'")
    frame = frame[[date_column, close_column]].copy()
    frame[date_column] = pd.to_datetime(frame[date_column], errors="raise").dt.normalize()
    frame = frame.sort_values(date_column)
    if frame[date_column].duplicated().any():
        raise DataError("price input has duplicate dates")
    frame = frame.set_index(date_column)
    close = pd.to_numeric(frame[close_column], errors="raise").astype(float)
    if close.isna().any():
        raise DataError("price close has missing values")
    window_end = min(pd.Timestamp(end), pd.Timestamp(IN_SAMPLE_END))
    close = close.loc[(close.index >= pd.Timestamp(start)) & (close.index <= window_end)]
    if close.empty:
        raise DataError("price input is empty inside the requested IS window")
    if (close.index > pd.Timestamp(IN_SAMPLE_END)).any():
        raise DataError("price input leaked out-of-sample dates")
    invalid = close <= 0
    close = close.mask(invalid)
    return pd.DataFrame({"close": close, "invalid_close": invalid})


def load_component_frame(input_spec, *, start: str, end: str) -> pd.DataFrame:
    """Load one component's observations.

    Returns a frame indexed by observation date with columns:
    ``value`` and ``available_at`` (NaT unless an available_at column is configured).
    """
    path = resolve_path(input_spec.path)
    frame = pd.read_csv(path)
    columns = [input_spec.date_column, input_spec.value_column]
    if input_spec.available_at_column:
        if input_spec.available_at_column not in frame.columns:
            raise DataError(
                f"component {input_spec.name} missing available_at column '{input_spec.available_at_column}'"
            )
        columns.append(input_spec.available_at_column)
    frame = frame[columns].copy()
    frame[input_spec.date_column] = pd.to_datetime(frame[input_spec.date_column], errors="raise").dt.normalize()
    frame = frame.sort_values(input_spec.date_column)
    if frame[input_spec.date_column].duplicated().any():
        raise DataError(f"component {input_spec.name} has duplicate dates")
    value = pd.to_numeric(frame[input_spec.value_column], errors="raise").astype(float)
    out = pd.DataFrame({"value": value.to_numpy()}, index=pd.DatetimeIndex(frame[input_spec.date_column]))
    if input_spec.available_at_column:
        out["available_at"] = pd.to_datetime(
            frame[input_spec.available_at_column], errors="coerce"
        ).dt.normalize().to_numpy()
    else:
        out["available_at"] = pd.NaT
    out = out.loc[(out.index >= pd.Timestamp(start)) & (out.index <= pd.Timestamp(IN_SAMPLE_END))]
    return out


def align_availability(
    observations: pd.DataFrame | pd.Series,
    dates: pd.DatetimeIndex,
    input_spec,
    mode: str,
) -> tuple[pd.Series, dict[str, Any]]:
    """Align observations to decision dates by AVAILABILITY DATE, not by row position.

    Relationship enforced here:
    observation date --(available_at column, else + lag calendar days)--> availability date
    --(used only on decision dates >= availability date, never before)--> decision date.

    Availability source precedence:
    - ``available_at`` column present -> CONFIRMED_RECEIVED_DATE (a recorded receipt date).
    - else assumed calendar-day lag -> ASSUMED_LAG_DAYS; in RETROSPECTIVE mode with lag 0 the
      observation date itself is the recorded alignment (RECORDED_OBSERVATION_DATE).

    Value reuse: ``validity_days == 0`` allows an exact availability-date match only;
    ``validity_days > 0`` carries a value forward at most that many calendar days.
    There is never a backward fill and never an unbounded forward fill; stale values drop to NaN.
    """
    if isinstance(observations, pd.Series):
        observations = observations.rename("value").to_frame()
    value = pd.to_numeric(observations["value"], errors="coerce")
    has_receipt = (
        bool(input_spec.available_at_column)
        and "available_at" in observations.columns
        and observations["available_at"].notna().any()
    )
    if has_receipt:
        available = pd.DatetimeIndex(observations["available_at"])
        status = "CONFIRMED_RECEIVED_DATE"
        source = input_spec.available_at_column
    else:
        available = pd.DatetimeIndex(observations.index) + pd.Timedelta(days=int(input_spec.availability_lag_days))
        if mode == "RETROSPECTIVE_RESEARCH" and int(input_spec.availability_lag_days) == 0:
            status, source = "RECORDED_OBSERVATION_DATE", "observation_date"
        else:
            status, source = "ASSUMED_LAG_DAYS", f"observation_date+{int(input_spec.availability_lag_days)}d"
    obs = pd.DataFrame({"available": available, "value": value.to_numpy()}).dropna(subset=["value", "available"])
    obs = obs.sort_values("available").drop_duplicates(subset="available", keep="last")
    available_series = pd.Series(obs["value"].to_numpy(), index=pd.DatetimeIndex(obs["available"]))
    if int(input_spec.validity_days) > 0:
        aligned = available_series.reindex(
            dates, method="ffill", tolerance=pd.Timedelta(days=int(input_spec.validity_days))
        )
    else:
        aligned = available_series.reindex(dates)
    record = {
        "component": input_spec.name,
        "status": status,
        "source": source,
        "lag_days": int(input_spec.availability_lag_days),
        "validity_days": int(input_spec.validity_days),
        "raw_observations": int(len(value)),
        "distinct_available_observations": int(len(available_series)),
        "decision_rows_with_value": int(aligned.notna().sum()),
    }
    return aligned.rename(input_spec.name), record


def build_target(close: pd.Series, horizon: int, invalid: pd.Series | None = None) -> pd.Series:
    """Binary label: 1 when close[t+h] > close[t], else 0; NaN when undefined.

    A label is undefined when the forward close is unavailable, the current close
    is missing, or the forward window includes an invalid (non-positive) close.
    """
    forward = close.shift(-horizon)
    target = (forward > close).astype(float)
    target[forward.isna() | close.isna()] = np.nan
    if invalid is not None and bool(invalid.any()):
        window = (
            invalid.astype(float)
            .rolling(horizon + 1, min_periods=1)
            .max()
            .shift(-horizon)
            .fillna(0.0)
        ) > 0
        target[window] = np.nan
    return target.rename("target")


def build_market_features(close: pd.Series, names: tuple[str, ...]) -> pd.DataFrame:
    """Causal market features (only past/current closes are used)."""
    out = pd.DataFrame(index=close.index)
    if "rsi14" in names:
        out["rsi14"] = rsi(close)
    if "ret_5d" in names:
        out["ret_5d"] = close.pct_change(5)
    return out


def component_scores(components: pd.DataFrame, train_rows: pd.Series) -> pd.DataFrame:
    """Map raw components to 0-100 scores; z-stats fitted on training rows only."""
    scores = pd.DataFrame(index=components.index, columns=components.columns, dtype=float)
    for name in components.columns:
        column = components[name]
        train_values = column.loc[train_rows & column.notna()]
        if train_values.empty:
            raise DataError(f"component {name} has no training observations")
        mean = float(train_values.mean())
        std = float(train_values.std(ddof=0))
        z = (column - mean) / std if std > 0 else column * 0.0
        z = z.clip(-Z_CLIP, Z_CLIP)
        scores[name] = ((z + Z_CLIP) / (2 * Z_CLIP) * 100.0).clip(0.0, 100.0)
    return scores


def split_masks(dates: pd.DatetimeIndex, val_start: str, val_end: str) -> pd.Series:
    """Validation mask by date (train is derived separately with the horizon rule)."""
    val_mask = pd.Series((dates >= pd.Timestamp(val_start)) & (dates <= pd.Timestamp(val_end)), index=dates)
    return val_mask


def horizon_safe_train_mask(dates: pd.DatetimeIndex, train_end: str, horizon: int) -> pd.Series:
    """Training rows whose label window stays strictly inside the training period."""
    positions = np.arange(len(dates))
    last_train = int(np.searchsorted(dates.values, np.datetime64(pd.Timestamp(train_end)), side="right") - 1)
    safe = (positions <= last_train) & (positions + horizon <= last_train)
    return pd.Series(safe, index=dates)


def prepare(spec: Spec, frames: dict[str, Any]) -> Prepared:
    """Build target/features/scores/masks plus quality and leakage check records."""
    price_frame = frames["price"]
    close = price_frame["close"]
    invalid = (
        price_frame["invalid_close"].astype(bool)
        if "invalid_close" in price_frame.columns
        else pd.Series(False, index=close.index)
    )
    dates = pd.DatetimeIndex(close.index)
    target = build_target(close, spec.horizon_days, invalid)
    market = build_market_features(close, spec.market_features)

    components: pd.DataFrame | None = None
    availability_records: list[dict[str, Any]] = []
    if spec.components:
        aligned = {}
        for input_spec in spec.components:
            series, record = align_availability(
                frames["components"][input_spec.name], dates, input_spec, spec.mode
            )
            aligned[input_spec.name] = series
            availability_records.append(record)
        components = pd.DataFrame(aligned, index=dates)

    train_mask = horizon_safe_train_mask(dates, spec.train_end, spec.horizon_days)
    val_mask = split_masks(dates, spec.val_start, spec.val_end)

    scores = component_scores(components, train_mask) if components is not None else None

    feature_valid = market.notna().all(axis=1)
    component_valid = components.notna().all(axis=1) if components is not None else pd.Series(True, index=dates)
    label_valid = target.notna()

    quality = {
        "rows_is": int(len(dates)),
        "span": [dates.min().date().isoformat(), dates.max().date().isoformat()],
        "missing_close": int(close.isna().sum()),
        "missing_market_cells": int(market.isna().sum().sum()),
        "missing_component_cells": int(components.isna().sum().sum()) if components is not None else 0,
        "component_observations": {r["component"]: r["raw_observations"] for r in availability_records},
        "component_decision_rows": {r["component"]: r["decision_rows_with_value"] for r in availability_records},
        "target_nan_rows": int(target.isna().sum()),
        "invalid_close_rows": int(invalid.sum()),
        "label_rows_dropped_by_invalid_close": int((invalid.astype(float).rolling(
            spec.horizon_days + 1, min_periods=1).max().shift(-spec.horizon_days).fillna(0.0) > 0).sum())
        if bool(invalid.any()) else 0,
        "train_rows": int((train_mask & label_valid & feature_valid & component_valid).sum()),
        "val_rows": int((val_mask & label_valid & feature_valid & component_valid).sum()),
        "train_dropped_by_horizon_boundary": int(
            ((dates <= pd.Timestamp(spec.train_end)) & ~train_mask).sum()
        ),
        "duplicate_dates": int(dates.duplicated().sum()),
        "zero_or_negative_close": int(invalid.sum()),
    }
    checks = {
        "is_only": bool((dates <= pd.Timestamp(IN_SAMPLE_END)).all()),
        "no_missing_fill": True,
        "invalid_close_policy": (
            "Close<=0 excluded as missing observation; labels whose forward window includes one are dropped; never filled"
        ) if bool(invalid.any()) else "no invalid closes",
        "availability": availability_records,
        "availability_note": (
            "observation date -> availability date -> decision date; confirmed receipt dates kept separate from assumed lags; "
            "no backward fill, bounded forward reuse only"
        ),
        "component_order": list(components.columns) if components is not None else [],
        "component_lags": {input_spec.name: input_spec.availability_lag_days for input_spec in spec.components},
        "horizon_days": spec.horizon_days,
        "train_end": spec.train_end,
        "val_window": [spec.val_start, spec.val_end],
    }
    return Prepared(
        dates=dates,
        close=close,
        target=target,
        market=market,
        components=components,
        component_scores=scores,
        train_mask=train_mask,
        val_mask=val_mask,
        quality=quality,
        checks=checks,
    )


def online_feature_check(close: pd.Series, names: tuple[str, ...]) -> dict[str, Any]:
    """Leakage check: features computed on a truncated history must match the full history tail."""
    if len(close) < 120:
        return {"ok": True, "note": "series too short; skipped"}
    cut = int(len(close) * 0.9)
    full = build_market_features(close, names)
    partial = build_market_features(close.iloc[:cut], names)
    overlap = full.iloc[cut - 10:cut]
    partial_overlap = partial.iloc[-10:]
    if full.empty:
        return {"ok": True, "note": "no features"}
    diff = (overlap - partial_overlap).abs().max().max()
    return {"ok": bool(diff < 1e-9), "max_abs_diff": float(diff), "checked_rows": int(len(overlap))}


def eval_frame(prepared: Prepared, model: str) -> tuple[pd.DataFrame, pd.Series, pd.Series]:
    """Common evaluation frame for a model: same dates, same target, no NaN rows."""
    valid = prepared.val_mask & prepared.target.notna() & prepared.market.notna().all(axis=1)
    if model in CAI_MODELS:
        if prepared.components is None or prepared.component_scores is None:
            raise DataError("no components available")
        valid = valid & prepared.components.notna().all(axis=1)
    index = prepared.dates[valid]
    y = prepared.target.loc[index]
    return prepared.market.loc[index], y, index
