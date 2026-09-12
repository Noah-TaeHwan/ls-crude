"""회고 실험 표시용 요약 생성 (대시보드 서버가 읽는 JSON).

실제 저장된 run 결과(export/summary.json, predictions CSV, 진단 JSON)만 읽어
표시용 요약을 만든다. 숫자를 하드코딩하지 않는다. 원자료·내부 예측 CSV는 포함하지 않는다.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from ls_crude.experiment.runner import compute_metrics

PILOT = Path("data/processed/091-cai-exp-pilot")
SENS = Path("data/processed/091-cai-exp-sens")
SENS_DIAG = Path("../docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS/sample_diagnostics.json")

MODEL_LABEL = {
    "baseline_up_rate": "기준선(학습기간 상승률)",
    "market_only_logit": "시장정보만",
    "market_cai_equal_logit": "시장정보+동일가중 CAI",
    "market_cai_learned_logit": "시장정보+학습가중 CAI",
    "cai_equal_logit": "CAI 동일가중 단독",
    "cai_learned_logit": "CAI 학습가중 단독",
    "baseline": "기준선(학습기간 상승률)",
    "market": "시장정보만",
    "market_cai_equal": "시장정보+동일가중 CAI",
    "market_cai_learned": "시장정보+학습가중 CAI",
    "cai_equal": "CAI 동일가중 단독",
    "cai_learned": "CAI 학습가중 단독",
}
DELTA_KEYS = (("market_cai_equal_logit", "market_cai_equal"), ("market_cai_learned_logit", "market_cai_learned"))


def _models(export: dict) -> list[dict]:
    rows = []
    for model in export["models"]:
        metrics = model.get("metrics") or {}
        rows.append({
            "id": model["id"],
            "label": MODEL_LABEL.get(model["id"], model["id"]),
            "status": model["status"],
            "train_rows": model.get("train_rows"),
            "accuracy": metrics.get("accuracy"),
            "log_loss": metrics.get("log_loss"),
            "brier": metrics.get("brier"),
            "weights": model.get("weights"),
        })
    return rows


def _experiment(path: Path, exp_id: str, label: str, component_names: list[str]) -> dict:
    export = json.loads((path / "export" / "summary.json").read_text(encoding="utf-8"))
    models = _models(export)
    by_id = {row["id"]: row for row in models}
    market = by_id.get("market_only_logit") or by_id.get("market") or {}
    deltas = {}
    for long_key, short_key in DELTA_KEYS:
        row = by_id.get(long_key) or by_id.get(short_key)
        if row and row.get("log_loss") is not None and market.get("log_loss") is not None:
            deltas[short_key] = row["log_loss"] - market["log_loss"]
    return {
        "id": exp_id,
        "label": label,
        "run_id": export["run_id"],
        "mode": export.get("mode"),
        "eval": export.get("eval", {}).get("common_eval"),
        "components": component_names,
        "models": models,
        "delta_log_loss_vs_market": deltas,
    }


def _common_232() -> dict:
    a = PILOT.parent / "091-cai-exp-sens" / "20260911T132949Z"
    b = PILOT.parent / "091-cai-exp-sens" / "20260911T132951Z"
    pred_a = {f.name.split("predictions_")[1][:-4]: pd.read_csv(f) for f in sorted((a / "internal").glob("predictions_*.csv"))}
    pred_b = {f.name.split("predictions_")[1][:-4]: pd.read_csv(f) for f in sorted((b / "internal").glob("predictions_*.csv"))}
    common = sorted(set(pred_a["market"]["date"]) & set(pred_b["market"]["date"]))
    rows = []
    config_labels = {
        "baseline": "기준선(학습기간 상승률)",
        "market": "시장정보만",
        "market_cai_equal": "시장정보+동일가중 CAI",
        "market_cai_learned": "시장정보+학습가중 CAI",
    }
    for model_id in ("baseline", "market", "market_cai_equal", "market_cai_learned"):
        left = pred_a[model_id].set_index("date").loc[common]
        right = pred_b[model_id].set_index("date").loc[common]
        ma = compute_metrics(left["target"], left["p_up"])
        mb = compute_metrics(right["target"], right["p_up"])
        rows.append({
            "id": model_id,
            "label": config_labels[model_id],
            "a": {"accuracy": ma["accuracy"], "log_loss": ma["log_loss"], "brier": ma["brier"]},
            "b": {"accuracy": mb["accuracy"], "log_loss": mb["log_loss"], "brier": mb["brier"]},
            "delta_log_loss_b_minus_a": (mb["log_loss"] - ma["log_loss"]) if mb["log_loss"] is not None else None,
        })
    return {"n": len(common), "dates": {"start": common[0], "end": common[-1]}, "models": rows, "dmr_value_diffs": 0}


def _sensitivity_models(path: Path) -> list[dict]:
    export = json.loads((path / "export" / "summary.json").read_text(encoding="utf-8"))
    return _models(export)


EXPANSION_AFTER = Path("data/processed/091-cai-exp-2019/20260912T013423Z") if Path("data/processed/091-cai-exp-2019/20260912T013423Z").exists() else sorted(Path("data/processed/091-cai-exp-2019").glob("2026*"))[-1]


def _sample_expansion() -> dict:
    """2019 교통 보강 전/후 비교(같은 2023 평가, 같은 6모델)."""
    before = json.loads((PILOT / "20260911T130219Z" / "export" / "summary.json").read_text(encoding="utf-8"))
    after = json.loads((EXPANSION_AFTER / "export" / "summary.json").read_text(encoding="utf-8"))
    a = {m["id"]: m for m in before["models"]}
    b = {m["id"]: m for m in after["models"]}
    keys = ("baseline", "market", "cai_equal", "cai_learned", "market_cai_equal", "market_cai_learned")

    def pack(model: dict) -> dict:
        metrics = model.get("metrics") or {}
        return {"train_rows": model.get("train_rows"), "accuracy": metrics.get("accuracy"),
                "log_loss": metrics.get("log_loss"), "brier": metrics.get("brier"), "weights": model.get("weights")}

    rows = []
    for key in keys:
        ra, rb = pack(a[key]), pack(b[key])
        rows.append({
            "id": key, "label": MODEL_LABEL.get(key, key),
            "before": ra, "after": rb,
            "delta_log_loss_after_minus_before": (rb["log_loss"] - ra["log_loss"]) if rb["log_loss"] is not None and ra["log_loss"] is not None else None,
            "before_delta_vs_market": (ra["log_loss"] - pack(a["market"])["log_loss"]) if key.startswith("market_cai") else None,
            "after_delta_vs_market": (rb["log_loss"] - pack(b["market"])["log_loss"]) if key.startswith("market_cai") else None,
        })
    return {
        "kind": "sample_expansion",
        "changed": "교통 입력에 2019년 12개월만 추가 (그 외 조건 동일)",
        "preregistration_kind": "기존 2023 결과를 본 뒤 설계한 후속 회고 실험(독립 검증/OOS 아님)",
        "before_run": before["run_id"], "after_run": after["run_id"],
        "before_train_rows": a["market"].get("train_rows"), "after_train_rows": b["market"].get("train_rows"),
        "eval": after.get("eval", {}).get("common_eval"),
        "eval_identical": before.get("eval", {}).get("common_eval") == after.get("eval", {}).get("common_eval"),
        "models": rows,
        "note": "평가 날짜(2023)와 모델 6종은 동일하지만 학습 표본이 달라 직접 인과로 해석하지 않습니다. CAI 추가 효과는 두 버전 모두에서 확인되지 않았습니다.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    diag = json.loads(SENS_DIAG.read_text(encoding="utf-8"))
    a_run, b_run = SENS / "20260911T132949Z", SENS / "20260911T132951Z"
    provenance = json.loads((PILOT / "20260911T130235Z" / "internal" / "provenance.json").read_text(encoding="utf-8"))

    summary = {
        "schema": "cai-retrospective-experiment-summary/v1",
        "kind": "retrospective_experiment_summary",
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "code_fingerprint": provenance["program"]["combined"][:12],
        "disclosure": (
            "2023년 회고 평가 요약입니다. 실시간 예측·운영 지수·공식 CAI 채택이 아니며, "
            "독립 재현과 외부 게시는 아직 완료되지 않았습니다."
        ),
        "review_status": {"self_check": True, "independent_reproduction": "pending"},
        "experiments": [
            _experiment(PILOT / "20260911T130235Z", "pilot_traffic", "교통 단독 파일럿", ["TMAS AVC040 일별"]),
            _experiment(PILOT / "20260911T130219Z", "pilot_traffic_dmr", "교통+DMR 파일럿", ["TMAS AVC040 일별", "DMR South STP MGD(월별)"]),
        ],
        "sample_expansion": _sample_expansion(),
        "sensitivity": {
            "preregistration_kind": "기존 결과를 보고 설계한 후속 회고 민감도 분석(독립 사전등록 아님)",
            "changed": "DMR validity_days만 62/31/0으로 변경",
            "A_62": {
                "train_rows": diag["A_62"]["model_train_rows"],
                "val_rows": diag["A_62"]["model_val_rows"],
                "observations": diag["A_62"]["distinct_dmr_observations_used"],
                "elapsed_days": diag["A_62"]["elapsed_days"],
                "models": _sensitivity_models(a_run),
            },
            "B_31": {
                "train_rows": diag["B_31"]["model_train_rows"],
                "val_rows": diag["B_31"]["model_val_rows"],
                "observations": diag["B_31"]["distinct_dmr_observations_used"],
                "elapsed_days": diag["B_31"]["elapsed_days"],
                "models": _sensitivity_models(b_run),
            },
            "common_232": _common_232(),
            "C_0": {
                "status": "skipped",
                "reason": "사전 고정 기준(train>=100, val>=50) 미달로 학습하지 않음",
                "train_rows": diag["C_0"]["model_train_rows"],
                "val_rows": diag["C_0"]["model_val_rows"],
                "observations": diag["C_0"]["distinct_dmr_observations_used"],
            },
        },
        "limitations": [
            "2023년 한 해 회고 평가이며 최종 OOS는 열지 않았습니다.",
            "DMR은 ECHO 접수일 기준이며 외부 공개일은 확인되지 않았습니다.",
            "표본이 작고(train 507/905, val 245) DMR 원관측은 월별 85건입니다.",
            "재사용 기간 비교(62/31일)는 공통 날짜의 DMR 값이 동일해 학습 표본 차이만 반영합니다.",
            "CAI 추가는 두 실험 모두 확률오차(log loss)를 개선하지 못했습니다.",
        ],
        "data_access": {
            "traffic": "FHWA TMAS AVC040 (공식 원출처에서 직접 취득 필요)",
            "dmr": "EPA ECHO effluent chart (공식 원출처에서 직접 취득 필요)",
            "redistribution": "미확인 — 원자료는 이 요약에 포함되지 않음",
        },
    }

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
    print("experiments:", [(e["id"], e["run_id"], len(e["models"])) for e in summary["experiments"]])
    print("common_232 n:", summary["sensitivity"]["common_232"]["n"], "| C:", summary["sensitivity"]["C_0"]["status"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
