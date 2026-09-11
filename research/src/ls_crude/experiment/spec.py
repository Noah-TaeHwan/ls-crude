"""Experiment spec: config parsing, validation, and hashing.

A spec pins inputs by SHA-256 and period/target/comparison rules before any
result is looked at (pre-registration). Validation never touches out-of-sample
data: every date range must live inside the project in-sample window.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START

TARGET_KIND = "next_n_trading_days_up"
MODEL_KINDS = (
    "baseline_up_rate",
    "market_only_logit",
    "cai_equal_logit",
    "cai_learned_logit",
)
CAI_MODELS = ("cai_equal_logit", "cai_learned_logit")
MARKET_FEATURES = ("rsi14", "ret_5d")
MAX_CONFIGS_LIMIT = 12
MAX_WORKERS_LIMIT = 2
MODES = ("RETROSPECTIVE_RESEARCH", "POINT_IN_TIME_FORECAST")

_HERE = Path(__file__).resolve()
RESEARCH_ROOT = _HERE.parents[3]
REPO_ROOT = _HERE.parents[4]


class SpecError(ValueError):
    """Raised when a spec or one of its pinned inputs is invalid."""


def sha256_file(path: str | Path) -> str:
    """SHA-256 of a file, read in 1 MiB chunks."""
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_hash(payload: Any) -> str:
    """Stable hash of a JSON-serializable payload."""
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False, default=str)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class InputSpec:
    """One pinned input file (price series or CAI component)."""

    kind: str
    path: str
    sha256: str
    date_column: str = "date"
    value_column: str = "value"
    availability_lag_days: int = 0
    availability_basis: str = ""

    @property
    def name(self) -> str:
        """Short component name used in weight provenance."""
        return Path(self.path).stem


@dataclass(frozen=True)
class Spec:
    """Validated, immutable experiment spec."""

    candidate_id: str
    mode: str
    price: InputSpec
    components: tuple[InputSpec, ...]
    horizon_days: int
    is_start: str
    is_end: str
    train_end: str
    val_start: str
    val_end: str
    market_features: tuple[str, ...]
    models: tuple[str, ...]
    seeds: tuple[int, ...]
    max_configs: int
    max_workers: int
    max_seconds: int
    configs: tuple[dict[str, Any], ...]
    raw: dict[str, Any]


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise SpecError(message)


def _parse_input(raw: dict[str, Any], kind: str) -> InputSpec:
    _require(isinstance(raw, dict), f"{kind} input must be an object")
    for key in ("path", "sha256"):
        _require(key in raw and raw[key], f"{kind} input needs '{key}'")
    return InputSpec(
        kind=kind,
        path=str(raw["path"]),
        sha256=str(raw["sha256"]).lower(),
        date_column=str(raw.get("date_column", "date")),
        value_column=str(raw.get("value_column", "value")),
        availability_lag_days=int(raw.get("availability_lag_days", 0)),
        availability_basis=str(raw.get("availability_basis", "")).strip(),
    )


def load_spec(path: str | Path) -> Spec:
    """Load and validate a spec JSON file."""
    config_path = Path(path)
    _require(config_path.is_file(), f"spec not found: {config_path}")
    raw = json.loads(config_path.read_text(encoding="utf-8"))

    mode = str(raw.get("mode", "RETROSPECTIVE_RESEARCH")).upper()
    _require(mode in MODES, f"mode must be one of {MODES}")

    target = raw.get("target") or {}
    _require(target.get("kind") == TARGET_KIND, f"target.kind must be {TARGET_KIND}")
    horizon = int(target.get("horizon_days", 0))
    _require(horizon >= 1, "target.horizon_days must be >= 1")

    is_window = raw.get("is") or {}
    split = raw.get("split") or {}
    is_start, is_end = str(is_window.get("start", "")), str(is_window.get("end", ""))
    train_end = str(split.get("train_end", ""))
    val_start, val_end = str(split.get("val_start", "")), str(split.get("val_end", ""))
    _require(is_start >= IN_SAMPLE_START and is_end <= IN_SAMPLE_END,
             f"IS window must stay within {IN_SAMPLE_START}..{IN_SAMPLE_END}")
    _require(is_start < is_end, "IS start must be before IS end")
    _require(train_end < val_start <= val_end, "split must be train_end < val_start <= val_end")
    _require(val_end <= is_end, "val_end must not exceed IS end")

    models = tuple(str(model) for model in raw.get("models", []))
    _require(models, "at least one model is required")
    unknown = [model for model in models if model not in MODEL_KINDS]
    _require(not unknown, f"unknown models: {unknown}")

    features = tuple(str(name) for name in raw.get("market_features", []))
    unknown_features = [name for name in features if name not in MARKET_FEATURES]
    _require(not unknown_features, f"unknown market features: {unknown_features}")

    limits = raw.get("limits") or {}
    max_configs = int(limits.get("max_configs", MAX_CONFIGS_LIMIT))
    max_workers = int(limits.get("max_workers", MAX_WORKERS_LIMIT))
    max_seconds = int(limits.get("max_seconds", 7200))
    _require(1 <= max_configs <= MAX_CONFIGS_LIMIT, f"max_configs must be 1..{MAX_CONFIGS_LIMIT}")
    _require(1 <= max_workers <= MAX_WORKERS_LIMIT, f"max_workers must be 1..{MAX_WORKERS_LIMIT}")
    _require(max_seconds >= 60, "max_seconds must be >= 60")

    seeds = tuple(int(seed) for seed in raw.get("seeds", [7]))
    _require(seeds, "at least one seed is required")

    configs = tuple(raw.get("configs", []))
    if configs:
        for config in configs:
            _require(isinstance(config, dict) and config.get("id"), "each config needs an id")
            _require(config.get("model") in MODEL_KINDS, f"bad config model: {config.get('model')}")
        _require(len(configs) <= max_configs, f"configs exceed max_configs={max_configs}")

    components = tuple(_parse_input(item, "component") for item in raw.get("components", []))
    price = _parse_input(raw["price"], "price")
    if mode == "POINT_IN_TIME_FORECAST":
        missing = [item.name for item in (price, *components) if not item.availability_basis]
        _require(
            not missing,
            "POINT_IN_TIME_FORECAST requires availability_basis for every input; "
            f"missing: {missing}. Use RETROSPECTIVE_RESEARCH when availability is unconfirmed.",
        )

    return Spec(
        candidate_id=str(raw.get("candidate_id", "unnamed")),
        mode=mode,
        price=price,
        components=components,
        horizon_days=horizon,
        is_start=is_start,
        is_end=is_end,
        train_end=train_end,
        val_start=val_start,
        val_end=val_end,
        market_features=features,
        models=models,
        seeds=seeds,
        max_configs=max_configs,
        max_workers=max_workers,
        max_seconds=max_seconds,
        configs=configs,
        raw=raw,
    )


def resolve_path(path: str) -> Path:
    """Resolve a spec path against the repo root."""
    candidate = Path(path)
    if candidate.is_absolute():
        return candidate
    return REPO_ROOT / candidate


def validate_inputs(spec: Spec) -> dict[str, str]:
    """Check every pinned input exists and matches its SHA-256.

    Returns a mapping of logical name -> absolute path. Raises SpecError on any
    mismatch so a stale or edited input can never be silently used.
    """
    resolved: dict[str, str] = {}
    for input_spec in (spec.price, *spec.components):
        file_path = resolve_path(input_spec.path)
        _require(file_path.is_file(), f"input missing: {file_path}")
        actual = sha256_file(file_path)
        _require(actual == input_spec.sha256,
                 f"sha256 mismatch for {file_path}: expected {input_spec.sha256}, got {actual}")
        resolved[input_spec.name] = str(file_path)
    return resolved


def build_configs(spec: Spec) -> list[dict[str, Any]]:
    """Expand the config set (explicit list or one per model), capped by max_configs."""
    if spec.configs:
        configs = [dict(config) for config in spec.configs]
    else:
        configs = [{"id": model, "model": model} for model in spec.models]
    _require(len(configs) <= spec.max_configs, f"config count {len(configs)} exceeds max {spec.max_configs}")
    return configs
