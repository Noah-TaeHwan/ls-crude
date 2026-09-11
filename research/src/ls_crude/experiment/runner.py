"""Run orchestration: config statuses, cache/dedup, resume, provenance, export split.

Statuses per config: pending -> running -> done | failed | blocked.
Failures are visible in the export summary and never auto-retried without an
explicit ``--retry-failed`` (and then at most once). Export artifacts contain
aggregate metrics and provenance only; per-row predictions stay internal.
"""

from __future__ import annotations

import json
import platform
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, log_loss

from . import PROGRAM_VERSION
from .data import (
    Prepared,
    build_market_features,
    load_component_frame,
    load_price_frame,
    online_feature_check,
    prepare,
)
from .models import run_model
from .spec import CAI_MODELS, REPO_ROOT, Spec, build_configs, canonical_hash, sha256_file, validate_inputs

RUN_STATUSES = ("pending", "running", "done", "failed", "blocked")
DEFAULT_BASE_DIR = str(REPO_ROOT / "research" / "data" / "processed" / "091-cai-exp")


class BlockedError(RuntimeError):
    """A config cannot run because an eligibility gate failed (not a crash)."""


def utc_now() -> str:
    """UTC timestamp used in run ids and state files."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def utc_stamp() -> str:
    """Compact UTC run id."""
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def code_fingerprint() -> dict[str, Any]:
    """Hash every program file so a result is tied to exact code."""
    files = sorted(Path(__file__).parent.glob("*.py"))
    hashes = {path.name: sha256_file(path) for path in files}
    return {"program_version": PROGRAM_VERSION, "files": hashes, "combined": canonical_hash(hashes)}


def env_fingerprint() -> dict[str, Any]:
    """Library/runtime versions recorded with every result."""
    versions: dict[str, Any] = {"python": sys.version.split()[0], "platform": platform.platform()}
    for name in ("numpy", "pandas", "sklearn", "scipy"):
        try:
            module = __import__(name)
            versions[name] = getattr(module, "__version__", "unknown")
        except Exception:
            versions[name] = "missing"
    return versions


def common_eval_index(prepared: Prepared, spec: Spec) -> pd.DatetimeIndex:
    """Single evaluation index shared by every model (same dates/target/inputs)."""
    valid = prepared.val_mask & prepared.target.notna() & prepared.market.notna().all(axis=1)
    if any(model in CAI_MODELS for model in spec.models) or spec.configs:
        if prepared.components is not None:
            models = [str(config.get("model", "")) for config in spec.configs] or list(spec.models)
            if any(model in CAI_MODELS for model in models):
                valid = valid & prepared.components.notna().all(axis=1)
    return prepared.dates[valid]


def compare_runs(left: str | Path, right: str | Path) -> dict[str, Any]:
    """Compare two owner runs; require matching spec, inputs, target and eval window."""
    def load(run_dir: str | Path) -> dict[str, Any]:
        summary = Path(run_dir) / "export" / "summary.json"
        return json.loads(summary.read_text(encoding="utf-8"))

    first, second = load(left), load(right)
    checks = {
        "spec_hash": first.get("spec_hash") == second.get("spec_hash"),
        "price_sha": first.get("price_sha") == second.get("price_sha"),
        "target": first.get("target") == second.get("target"),
        "eval": (first.get("eval") or {}).get("common_eval") == (second.get("eval") or {}).get("common_eval"),
        "mode": first.get("mode") == second.get("mode"),
    }
    second_models = {model["id"]: model for model in second.get("models", [])}
    rows = []
    for model in first.get("models", []):
        other = second_models.get(model["id"], {})
        rows.append({
            "id": model["id"],
            "left_status": model["status"],
            "right_status": other.get("status"),
            "left_log_loss": (model.get("metrics") or {}).get("log_loss"),
            "right_log_loss": (other.get("metrics") or {}).get("log_loss"),
            "metrics_match": model.get("metrics") == other.get("metrics"),
        })
    return {"match": all(checks.values()), "checks": checks, "configs": rows}


def compute_metrics(y: pd.Series, probs: pd.Series) -> dict[str, Any]:
    """Accuracy plus probability error; no reliability claim is made from these."""
    y_values = y.to_numpy(dtype=float)
    p_values = np.clip(probs.to_numpy(dtype=float), 1e-9, 1 - 1e-9)
    metrics: dict[str, Any] = {
        "n": int(len(y_values)),
        "accuracy": float(((p_values >= 0.5).astype(int) == y_values.astype(int)).mean()),
        "up_rate_true": float(y_values.mean()),
        "up_rate_pred": float(p_values.mean()),
    }
    if len(np.unique(y_values)) > 1:
        metrics["log_loss"] = float(log_loss(y_values, p_values, labels=[0, 1]))
        metrics["brier"] = float(brier_score_loss(y_values, p_values))
    else:
        metrics["log_loss"] = None
        metrics["brier"] = None
        metrics["note"] = "single-class validation labels; probability metrics undefined"
    return metrics


def load_inputs(spec: Spec) -> dict[str, Any]:
    """Validate pinned files and load price + component frames (IS window only)."""
    resolved = validate_inputs(spec)
    price = load_price_frame(
        resolved[spec.price.name],
        spec.price.date_column,
        spec.price.value_column,
        start=spec.is_start,
        end=spec.is_end,
    )
    components = {
        input_spec.name: load_component_frame(input_spec, start=spec.is_start, end=spec.is_end)
        for input_spec in spec.components
    }
    return {"price": price, "components": components}


def _config_key(spec: Spec, config: dict[str, Any], seed: int) -> str:
    payload = {
        "spec": spec.raw,
        "config": config,
        "seed": seed,
        "code": code_fingerprint()["combined"],
        "env": env_fingerprint(),
    }
    return canonical_hash(payload)


def _load_state(run_dir: Path) -> dict[str, Any] | None:
    path = run_dir / "internal" / "run_state.json"
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def _save_state(run_dir: Path, state: dict[str, Any]) -> None:
    state["updated_at"] = utc_now()
    path = run_dir / "internal" / "run_state.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def _write_prediction_csv(run_dir: Path, config_id: str, fit, y: pd.Series) -> None:
    frame = pd.DataFrame({"date": fit.probs.index, "p_up": fit.probs.to_numpy(), "target": y.to_numpy()})
    frame.to_csv(run_dir / "internal" / f"predictions_{config_id}.csv", index=False)


def _execute_config(spec: Spec, prepared: Prepared, config: dict[str, Any], seed: int,
                    eval_index: pd.DatetimeIndex) -> dict[str, Any]:
    model = str(config["model"])
    if model in CAI_MODELS and (prepared.components is None or not prepared.component_names):
        raise BlockedError("no eligible components: CAI models blocked until a component with usage/availability basis is provided")
    fit = run_model(spec, prepared, config, seed, eval_index)
    y = prepared.target.loc[eval_index]
    metrics = compute_metrics(y, fit.probs)
    return {"metrics": metrics, "weights": fit.weights, "notes": fit.notes, "fit": fit, "y": y}


def run(
    spec: Spec,
    *,
    base_dir: str | Path = DEFAULT_BASE_DIR,
    run_id: str | None = None,
    resume: str | Path | None = None,
    max_seconds: int | None = None,
    use_cache: bool = True,
    retry_failed: bool = False,
    frames: dict[str, Any] | None = None,
) -> Path:
    """Execute the config set and return the run directory.

    When ``frames`` is provided (synthetic demo/tests) file loading and input
    validation are skipped; the synthetic spec pins no real files.
    """
    started = time.time()
    base = Path(base_dir)
    if resume is not None:
        run_dir = Path(resume)
        state = _load_state(run_dir)
        if state is None:
            raise FileNotFoundError(f"no run_state.json under {run_dir}")
        if state.get("spec_hash") != canonical_hash(spec.raw):
            raise ValueError("resume spec does not match the saved run state")
        run_id = state["run_id"]
    else:
        run_id = run_id or utc_stamp()
        run_dir = base / run_id
        state = {
            "run_id": run_id,
            "program_version": PROGRAM_VERSION,
            "spec_hash": canonical_hash(spec.raw),
            "price_sha": spec.price.sha256,
            "component_shas": {item.name: item.sha256 for item in spec.components},
            "started_at": utc_now(),
            "configs": {
                str(config["id"]): {"status": "pending", "attempts": 0, "model": config["model"]}
                for config in build_configs(spec)
            },
        }
        if frames is None:
            frames = load_inputs(spec)
        (run_dir / "internal").mkdir(parents=True, exist_ok=True)
        (run_dir / "export").mkdir(parents=True, exist_ok=True)
    if frames is None:
        frames = load_inputs(spec)

    prepared = prepare(spec, frames)
    leakage = online_feature_check(prepared.close, spec.market_features)
    eval_index = common_eval_index(prepared, spec)
    if len(eval_index) == 0:
        raise BlockedError("no validation rows available after quality checks")

    if max_seconds is None:
        max_seconds = spec.max_seconds
    cache_dir = base / "cache"
    configs = build_configs(spec)
    budget_hit = False

    for config in configs:
        config_id = str(config["id"])
        entry = state["configs"][config_id]
        if entry["status"] == "done":
            continue
        if entry["status"] == "failed" and not (retry_failed and entry.get("attempts", 0) < 2):
            continue
        if time.time() - started > max_seconds:
            budget_hit = True
            break

        key = _config_key(spec, config, spec.seeds[0])
        cache_path = cache_dir / f"{key}.json"
        if use_cache and cache_path.is_file():
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            entry.update({**cached, "status": "done", "cached": True,
                          "attempts": entry.get("attempts", 0) + 1})
            _save_state(run_dir, state)
            continue

        entry["status"] = "running"
        entry["attempts"] = entry.get("attempts", 0) + 1
        _save_state(run_dir, state)
        try:
            outcome = _execute_config(spec, prepared, config, spec.seeds[0], eval_index)
            fit, y = outcome.pop("fit"), outcome.pop("y")
            _write_prediction_csv(run_dir, config_id, fit, y)
            result = {"status": "done", "cached": False, "seed": spec.seeds[0], **outcome}
            cache_dir.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        except BlockedError as error:
            result = {"status": "blocked", "reason": str(error), "seed": spec.seeds[0]}
        except Exception as error:  # noqa: BLE001 - failure is recorded, not retried
            result = {"status": "failed", "reason": f"{type(error).__name__}: {error}", "seed": spec.seeds[0]}
        entry.update(result)
        _save_state(run_dir, state)

    provenance = {
        "run_id": run_id,
        "generated_at": utc_now(),
        "mode": spec.mode,
        "mode_note": (
            "observation-date aligned retrospective exploration; not a real-time forecast"
            if spec.mode == "RETROSPECTIVE_RESEARCH"
            else "point-in-time forecast mode; availability basis recorded per input"
        ),
        "program": code_fingerprint(),
        "env": env_fingerprint(),
        "spec": spec.raw,
        "spec_hash": state["spec_hash"],
        "inputs": {
            "price": {"path": spec.price.path, "sha256": spec.price.sha256},
            "components": [
                {"name": item.name, "path": item.path, "sha256": item.sha256,
                 "availability_lag_days": item.availability_lag_days}
                for item in spec.components
            ],
        },
        "component_order": prepared.component_names,
        "preprocessing": {
            "component_scores": "train-fit z, clip +/-3, map to 0-100",
            "market_scaling": "StandardScaler fitted on training rows only",
            "missing_policy": "no fill; rows dropped and counted",
        },
        "splits": {
            "is": [spec.is_start, spec.is_end],
            "train_end": spec.train_end,
            "val": [spec.val_start, spec.val_end],
            "horizon_safe_train": "labels crossing the validation boundary excluded from training",
        },
        "target": {"kind": spec.raw.get("target", {}).get("kind"), "horizon_days": spec.horizon_days},
        "evaluation": {
            "primary": "log_loss (secondary: accuracy, brier)",
            "common_eval": {"n": int(len(eval_index)),
                            "start": eval_index.min().date().isoformat(),
                            "end": eval_index.max().date().isoformat()},
            "note": "model comparison uses identical eval dates/target/inputs; probability output is not a reliability claim",
        },
        "prepared_quality": prepared.quality,
        "checks": prepared.checks,
        "leakage_check": leakage,
        "limits": {"max_configs": spec.max_configs, "max_workers": spec.max_workers,
                   "max_seconds": max_seconds, "budget_hit": budget_hit, "elapsed_s": round(time.time() - started, 2)},
        "cache": {"use_cache": use_cache, "retry_failed": retry_failed},
        "final_oos": "locked and not executed by this program",
    }
    (run_dir / "internal" / "provenance.json").write_text(
        json.dumps(provenance, ensure_ascii=False, indent=2), encoding="utf-8")

    baseline = state["configs"].get("baseline_up_rate") or {}
    export = {
        "run_id": run_id,
        "generated_at": provenance["generated_at"],
        "candidate_id": spec.candidate_id,
        "mode": spec.mode,
        "program_version": PROGRAM_VERSION,
        "spec_hash": state["spec_hash"],
        "code_combined": provenance["program"]["combined"],
        "env": provenance["env"],
        "periods": provenance["splits"],
        "target": provenance["target"],
        "component_order": prepared.component_names,
        "component_shas": state["component_shas"],
        "price_sha": state["price_sha"],
        "eval": provenance["evaluation"],
        "models": [
            {
                "id": config_id,
                "model": entry.get("model"),
                "status": entry["status"],
                "seed": entry.get("seed"),
                "metrics": entry.get("metrics"),
                "weights": entry.get("weights"),
                "notes": entry.get("notes"),
                "reason": entry.get("reason"),
                "cached": entry.get("cached"),
            }
            for config_id, entry in state["configs"].items()
        ],
        "baseline_reference": {"metrics": baseline.get("metrics"), "status": baseline.get("status")},
        "failures_visible": True,
        "internal_artifacts": "run_state.json, provenance.json, predictions_*.csv (internal/ only)",
        "final_oos": "locked and not executed by this program",
    }
    (run_dir / "export" / "summary.json").write_text(
        json.dumps(export, ensure_ascii=False, indent=2), encoding="utf-8")
    state["finished_at"] = utc_now()
    state["budget_hit"] = budget_hit
    _save_state(run_dir, state)
    return run_dir
