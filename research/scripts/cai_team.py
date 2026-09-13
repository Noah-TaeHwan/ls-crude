#!/usr/bin/env python3
"""공동 CAI 입력 검사·제출: 학습 없이 현재 입력과 저장된 예측·수식을 대조한다.

검사 통과는 물리적 타당성·이용 권리·PIT 승인이나 독립 재현 성공을 뜻하지 않는다.
원자료와 행별 예측은 읽기만 하며 공개 파일은 명시한 새 폴더에만 생성한다.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "research/src"))
from ls_crude.experiment.data import prepare  # noqa: E402
from ls_crude.experiment.runner import (  # noqa: E402
    code_fingerprint, common_eval_index, compute_metrics, env_fingerprint, load_inputs,
)
from ls_crude.experiment.spec import (  # noqa: E402
    COMPONENT_MODELS, MARKET_CAI_MODELS, MODEL_KINDS,
    SpecError, build_configs, canonical_hash, load_spec, sha256_file,
)

REFERENCE = ROOT / "research/experiments/cai/reference/2019plus_20260912T013423Z/export/summary.json"
METRICS = ("n", "accuracy", "up_rate_true", "up_rate_pred", "log_loss", "brier")
NOTICE = "검사 통과는 자료의 물리적 타당성·권리·공개시점 승인·독립 재현 성공을 뜻하지 않습니다. 최종 OOS는 실행하지 않습니다."


def require(condition, reason):
    """조건이 거짓이면 작업을 중단하고 원인을 반환한다."""
    if not condition:
        raise SpecError(reason)


def read_json(path):
    """로컬 JSON을 읽고 비표준 NaN 상수를 거부한다."""
    def reject_constant(value):
        raise SpecError(f"invalid JSON number: {value}")
    return json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject_constant)


def identifier(value):
    """파일·공개 식별자에 허용된 짧은 문자열만 반환한다."""
    require(isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,119}", value), "unsafe or missing identifier")
    return value


def public_text(value):
    """명시 메타데이터의 경로·인증정보·제어문자 노출을 차단한다."""
    require(isinstance(value, str) and 0 < len(value.strip()) <= 500, "metadata text missing or too long")
    require(not re.search(r"(?:https?://|/Users/|/home/|[A-Za-z]:\\|Bearer\s|sk-[A-Za-z0-9]|(?:token|password|secret|api[_-]?key)\s*[:=]|[\x00-\x1f])", value, re.I), "private/unsafe metadata: review unit and availability_basis")
    return value


def check(config_path):
    """고정 입력·분할·성분의 유효 행을 확인하고 학습 없는 검사 영수증을 반환한다."""
    spec = load_spec(config_path)
    safe_config(spec)
    require(spec.mode == "RETROSPECTIVE_RESEARCH", "team workflow supports RETROSPECTIVE_RESEARCH only; PIT needs separate approval")
    require(spec.is_start <= spec.train_end < spec.val_start <= spec.val_end <= spec.is_end, "split outside IS window")
    require(spec.seeds == (7,), "team v1 requires exactly seed 7")
    require(spec.horizon_days == 5, "team v1 requires 5 trading day horizon")
    require(spec.raw["target"].get("flat_counts_as", "down") == "down", "team v1 requires flat returns counted as down")
    require(spec.market_features == ("rsi14", "ret_5d"), "team v1 requires RSI14 and ret_5d market features")
    require((spec.is_start, spec.is_end, spec.train_end, spec.val_start, spec.val_end) ==
            ("2015-01-01", "2023-12-31", "2020-12-31", "2021-01-01", "2023-12-31"), "team v1 requires fixed IS/train/validation split")
    identifier(spec.candidate_id)
    require("EXAMPLE" not in spec.candidate_id.upper(), "EXAMPLE template is not executable; replace placeholders")
    items = (spec.price, *spec.components)
    names = [identifier(item.name) for item in items]
    require(len(names) == len(set(names)), "duplicate input stem: use unique filenames for price and components")
    configs = build_configs(spec)
    require(len(configs) == len(MODEL_KINDS) and {c["model"] for c in configs} == set(MODEL_KINDS),
            "team v1 requires each of the six model kinds exactly once")
    ids = [identifier(c["id"]) for c in configs]
    require(len(ids) == len(set(ids)), "duplicate config id")
    for config in configs:
        require(set(config) <= {"id", "model", "features", "match_components"}, "unsupported model config fields")
        require(tuple(config.get("features", spec.market_features)) == spec.market_features, "team v1 requires the common market features in every config")
        require(isinstance(config.get("match_components", False), bool), "match_components must be boolean")
    require(bool(spec.components), "at least one explicit active component required")
    legacy = canonical_hash(spec.raw) == read_json(REFERENCE)["spec_hash"]
    warnings = []
    for item, raw in zip(items, [spec.raw["price"], *spec.raw["components"]]):
        require(item.availability_lag_days >= 0 and item.validity_days >= 0, "negative lag/reuse window")
        if legacy:
            continue
        public_text(raw.get("unit"))
        public_text(item.availability_basis)
        require(not any(word in (raw["unit"] + item.availability_basis).upper() for word in ("EXAMPLE", "REPLACE_WITH")), "replace metadata placeholders before execution")
        if item.kind == "component":
            require(raw.get("role") == "active", "component role must be active; context/hold candidates cannot be auto-included")
    if legacy:
        warnings.append("2019 고정 config에 한해 기존 해시를 보존합니다. unit/role 및 일부 availability_basis 누락: 회고 전용, 새 입력 승인 근거로 재사용 금지.")
    prepared = prepare(spec, load_inputs(spec))
    evaluation = common_eval_index(prepared, spec)
    require(prepared.quality["train_rows"] > 0 and len(evaluation) > 0, "no common valid train/evaluation rows")
    require(prepared.target.loc[evaluation].nunique() == 2, "evaluation labels single class: probability metrics undefined")
    require(prepared.target.loc[prepared.train_mask & prepared.components.notna().all(axis=1) & prepared.market.notna().all(axis=1)].nunique() == 2, "common training labels single class")
    require(np.isfinite(prepared.component_scores.loc[evaluation].to_numpy()).all(), "nonfinite component scores")
    report = {"status": "INPUT_READY", "spec_hash": canonical_hash(spec.raw), "price_sha": spec.price.sha256,
              "component_shas": {c.name: c.sha256 for c in spec.components},
              "common_train_rows": prepared.quality["train_rows"],
              "common_eval": {"n": len(evaluation), "start": evaluation.min().date().isoformat(), "end": evaluation.max().date().isoformat()},
              "warnings": warnings, "notice": NOTICE}
    return spec, prepared, report


def safe_config(spec):
    """허용 필드의 전체 타입·상대경로를 검사하고 원본 spec 해시를 보존한다."""
    input_schema = {"kind": str, "path": str, "sha256": str, "date_column": str, "value_column": str,
                    "availability_lag_days": int, "validity_days": int, "available_at_column": str,
                    "availability_basis": str, "unit": str, "role": str}
    schema = {"spec_version": int, "mode": str, "preregistered_at": str, "preregistration_note": str,
              "candidate_id": str, "target": {"kind": str, "horizon_days": int, "flat_counts_as": str, "definition": str},
              "price": input_schema, "components": [input_schema], "is": {"start": str, "end": str},
              "split": {"train_end": str, "val_start": str, "val_end": str},
              "market_features": [str], "models": [str], "seeds": [int],
              "limits": {"max_configs": int, "max_workers": int, "max_seconds": int},
              "configs": [{"id": str, "model": str, "features": [str], "match_components": bool}]}

    def inspect(value, expected, field):
        """리스트 원소와 객체 필드를 포함해 허용 스키마의 타입을 재귀 검사한다."""
        if isinstance(expected, dict):
            require(type(value) is dict and set(value) <= set(expected), f"{field}: unsupported object fields")
            for key, child in value.items():
                inspect(child, expected[key], f"{field}.{key}")
        elif isinstance(expected, list):
            require(type(value) is list, f"{field}: expected list")
            for child in value:
                inspect(child, expected[0], field + "[]")
        else:
            require(type(value) is expected, f"{field}: expected {expected.__name__}")
            if expected is str and value:
                public_text(value)

    raw = spec.raw
    inspect(raw, schema, "config")
    for item in [raw["price"], *raw["components"]]:
        path = Path(item["path"])
        require(not path.is_absolute() and ".." not in path.parts and "\\" not in str(path) and ":" not in str(path), "package requires safe repo-relative input paths")
        require(path.parts[:2] == ("research", "data"), "package inputs must live in ignored research/data")
    return raw


def safe_env(value):
    """실행 환경의 필수 문자열만 공개하고 누락·중첩 값은 거부한다."""
    require(type(value) is dict, "run environment missing")
    return {key: public_text(value.get(key)) for key in ("python", "platform", "numpy", "pandas", "sklearn", "scipy")}


def verify_model(entry, config, spec, prepared, evaluation, run_dir):
    """행별 예측·정답·저장 수식·가중치와 지표를 다시 계산하여 손상된 결과를 거부한다."""
    model_id, model = config["id"], config["model"]
    require(entry.get("model") == model and entry.get("status") == "done", f"{model_id}: model missing/not done")
    require(entry.get("seed") == spec.seeds[0] and not entry.get("cached"), f"{model_id}: wrong seed/cache run; rerun --no-cache")
    path = run_dir / "internal" / f"predictions_{model_id}.csv"
    require(path.is_file(), f"{model_id}: predictions missing; rerun --no-cache")
    rows = pd.read_csv(path)
    require(list(rows.columns) == ["date", "p_up", "target"], f"{model_id}: bad prediction columns")
    require(pd.DatetimeIndex(pd.to_datetime(rows.date)).equals(evaluation), f"{model_id}: evaluation dates/rows mismatch")
    target = prepared.target.loc[evaluation]
    require(np.array_equal(rows.target.to_numpy(), target.to_numpy()), f"{model_id}: targets mismatch")
    probs = rows.p_up.to_numpy(dtype=float)
    require(np.isfinite(probs).all() and ((0 <= probs) & (probs <= 1)).all(), f"{model_id}: invalid probabilities")
    metrics = compute_metrics(target, pd.Series(probs, index=evaluation))
    for key in METRICS:
        value = (entry.get("metrics") or {}).get(key)
        require(isinstance(value, (float, int)) and not isinstance(value, bool) and np.isfinite(value) and np.isclose(value, metrics[key], atol=1e-10, rtol=1e-9), f"{model_id}: metric mismatch {key}")
    train = prepared.train_mask & prepared.target.notna()
    if model in COMPONENT_MODELS or config.get("match_components"):
        train &= prepared.components.notna().all(axis=1)
    if model == "market_only_logit" or model in MARKET_CAI_MODELS or config.get("match_components"):
        train &= prepared.market.notna().all(axis=1)
    require(entry.get("train_rows") == int(train.sum()), f"{model_id}: train rows mismatch")
    weights, coefficients = None, None
    if model == "baseline_up_rate":
        expected = np.full(len(evaluation), prepared.target.loc[train].mean())
    else:
        features = list(config.get("features", spec.market_features)) if model == "market_only_logit" or model in MARKET_CAI_MODELS else []
        matrix = prepared.market.loc[evaluation, features].to_numpy(dtype=float)
        if model in COMPONENT_MODELS:
            weights = entry.get("weights")
            require(isinstance(weights, list) and len(weights) == len(spec.components), f"{model_id}: missing weights")
            w = np.asarray(weights, dtype=float)
            require(np.isfinite(w).all() and (w >= 0).all() and np.isclose(w.sum(), 1), f"{model_id}: invalid weights")
            if model in ("cai_equal_logit", "market_cai_equal_logit"):
                require(np.allclose(w, 1 / len(w)), f"{model_id}: equal weights mismatch")
            matrix = np.column_stack([matrix, prepared.component_scores.loc[evaluation].to_numpy() @ w])
            features += ["cai"]
        info = entry.get("coefficients") or {}
        require(info.get("features") == features, f"{model_id}: coefficient features mismatch")
        coefficients = {"features": features}
        for key in ("coefficients", "scaler_mean", "scaler_scale"):
            values = np.asarray(info.get(key), dtype=float)
            require(values.shape == (len(features),) and np.isfinite(values).all(), f"{model_id}: invalid {key}")
            coefficients[key] = values.tolist()
        require(all(v > 0 for v in coefficients["scaler_scale"]), f"{model_id}: invalid scales")
        intercept = info.get("intercept")
        require(isinstance(intercept, (float, int)) and np.isfinite(intercept), f"{model_id}: invalid intercept")
        coefficients["intercept"] = intercept
        z = ((matrix - coefficients["scaler_mean"]) / coefficients["scaler_scale"]) @ np.asarray(coefficients["coefficients"]) + intercept
        expected = np.exp(-np.logaddexp(0, -z))
    require(np.allclose(expected, probs, atol=1e-9, rtol=1e-8), f"{model_id}: stored equation/prediction mismatch")
    return {"id": model_id, "model": model, "status": "done", "seed": spec.seeds[0], "train_rows": int(train.sum()),
            "metrics": metrics, "weights": weights, "coefficients": coefficients}


def package(config_path, run_dir, owner, out):
    """검증된 요약만 새 제출 폴더로 기록하며 원자료·원본 설정의 임의 필드는 제외한다."""
    out, run_dir = Path(out), Path(run_dir)
    require(not out.exists(), "output exists; choose a new folder (never overwrite)")
    require(not out.resolve().is_relative_to(run_dir.resolve()), "output must be outside original run directory")
    require(owner in ("taehwan", "seongchan"), "owner must be taehwan or seongchan")
    spec, prepared, report = check(config_path)
    summary = read_json(run_dir / "export/summary.json")
    provenance = read_json(run_dir / "internal/provenance.json")
    state = read_json(run_dir / "internal/run_state.json")
    code = code_fingerprint()
    source_env = safe_env(provenance.get("env"))
    require(source_env == safe_env(summary.get("env")), "source run environment mismatch")
    run_id = identifier(summary.get("run_id"))
    for record in (summary, provenance, state):
        require(record.get("run_id") == run_id and record.get("spec_hash") == report["spec_hash"], "run/spec identity mismatch")
    require(canonical_hash(provenance.get("spec")) == report["spec_hash"], "provenance config mismatch")
    require(provenance.get("program") == code and summary.get("code_combined") == code["combined"], "engine code mismatch; use recorded code version")
    for key in ("price_sha", "component_shas"):
        require(summary.get(key) == state.get(key) == report[key], f"{key} mismatch")
    target = {"kind": "next_n_trading_days_up", "horizon_days": spec.horizon_days}
    require(summary.get("target") == provenance.get("target") == target, "target mismatch")
    require(summary.get("mode") == provenance.get("mode") == spec.mode, "mode mismatch")
    periods = {"is": [spec.is_start, spec.is_end], "train_end": spec.train_end, "val": [spec.val_start, spec.val_end]}
    require(all(summary.get("periods", {}).get(k) == provenance.get("splits", {}).get(k) == v for k, v in periods.items()), "periods mismatch")
    require(summary.get("eval", {}).get("common_eval") == provenance.get("evaluation", {}).get("common_eval") == report["common_eval"], "common eval mismatch")
    require(summary.get("component_order") == provenance.get("component_order") == prepared.component_names, "component order mismatch")
    require(not state.get("budget_hit") and not provenance.get("limits", {}).get("budget_hit"), "run budget interrupted")
    configs = build_configs(spec)
    entries = summary.get("models", [])
    require(len(entries) == len(configs) and {e.get("id") for e in entries} == {c["id"] for c in configs}, "expected model set mismatch")
    require(set(state.get("configs", {})) == {c["id"] for c in configs}, "run state model set mismatch")
    evaluation = common_eval_index(prepared, spec)
    models = []
    for config in configs:
        entry = next(e for e in entries if e["id"] == config["id"])
        saved = state["configs"][config["id"]]
        require(all(entry.get(k) == saved.get(k) for k in ("model", "status", "seed", "metrics", "weights", "coefficients", "train_rows", "cached")), f"{config['id']}: summary/state mismatch")
        models.append(verify_model(entry, config, spec, prepared, evaluation, run_dir))
    public = {"run_id": run_id, "candidate_id": spec.candidate_id, "mode": spec.mode, "spec_hash": report["spec_hash"],
              "code_combined": code["combined"], "price_sha": report["price_sha"], "component_shas": report["component_shas"],
              "component_order": prepared.component_names, "periods": periods, "target": target,
              "eval": {"common_eval": report["common_eval"]}, "models": models, "final_oos": "locked; not executed"}
    clean_config = safe_config(spec)
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    manifest = {"owner": owner, "run_id": run_id, "packaged_at_code_sha": commit, "validation_tool_sha256": sha256_file(__file__), "engine_code": code,
                "source_run_env": source_env, "packaging_env": safe_env(env_fingerprint()),
                "source_config_sha256": sha256_file(config_path), "source_spec_hash": report["spec_hash"],
                "submission_config_hash": canonical_hash(clean_config), "input_hashes": {"price": spec.price.sha256, **report["component_shas"]},
                "validation": {"input": report, "model_count": len(models), "predictions_targets_metrics_equations": "MATCH"},
                "notice": NOTICE}
    # 허용 스키마 검사 후 원본 설정 해시를 그대로 보존한다.
    out.mkdir(parents=True, exist_ok=False)
    (out / "export").mkdir()
    for path, payload in [("export/summary.json", public), ("manifest.json", manifest), ("config.json", clean_config)]:
        (out / path).write_text(json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    (out / "README.md").write_text(f"""# CAI 제출: {owner} / {run_id}

검증: {len(models)}개 설정의 입력·정답·평가일·지표·저장 수식과 예측 일치.
{NOTICE}

## 제출자 작성
- 수집·전처리에서 한 일:
- 기준선 대비 결과 해석(동일 평가일 기준):
- 한계·차단 사항·독립 검토 요청:

## 재실행
저장소 루트에서 입력 파일을 config.json의 상대경로에 배치하고 입력 해시를 확인합니다.
이 폴더에는 원자료·행별 예측을 포함하지 않았습니다. 권리가 확인된 경로로 별도 취득합니다.

```sh
python research/scripts/cai_team.py check --config <제출폴더>/config.json
python -m ls_crude.experiment.cli validate --config <제출폴더>/config.json
python -m ls_crude.experiment.cli run --config <제출폴더>/config.json --base-dir <새실험폴더> --no-cache
```

제출 config.json은 허용 필드만 포함하는 원본 설정이며 spec_hash를 보존합니다.
2019 legacy 설정의 원자료 재생성은 기존 REPRODUCE_2019.md를 따릅니다.
결과는 검토 후 PR에 제출하고 대시보드에 자동 게시하지 않습니다.
""", encoding="utf-8")
    return {"status": "PACKAGED", "out": str(out), "models": len(models), "notice": NOTICE}


def main():
    """명령을 실행하고 실패는 nonzero JSON 영수증으로 알린다."""
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("check", "package"):
        command = commands.add_parser(name)
        command.add_argument("--config", type=Path, required=True)
        if name == "package":
            command.add_argument("--run-dir", type=Path, required=True)
            command.add_argument("--owner", choices=["taehwan", "seongchan"], required=True)
            command.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = check(args.config)[2] if args.command == "check" else package(args.config, args.run_dir, args.owner, args.out)
        print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
        return 0
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(json.dumps({"status": "BLOCKED", "reason": str(error), "run_preserved": True}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
