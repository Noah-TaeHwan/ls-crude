"""고정 과거 입력으로 실험용 CAI v0.1 공개 JSON을 만든다. 수집·학습·예측 없음."""
from __future__ import annotations

import argparse
import csv
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from ls_crude.experiment.data import (
    align_availability, component_scores, horizon_safe_train_mask, load_component_frame,
)
from ls_crude.experiment.spec import canonical_hash, load_spec, resolve_path, sha256_file, validate_inputs

ROOT = Path(__file__).resolve().parents[2]
DEFINITION = ROOT / "research/indexes/cai-v0.1/definition.json"
MANIFEST = ROOT / "research/indexes/cai-v0.1/manifest.json"
PUBLIC = ROOT / "app/app/data/cai-public-view.json"


def calculate(components: pd.DataFrame, reference_mask: pd.Series) -> tuple:
    """기존 성분 변환을 재사용하고 두 유효 성분에만 동일가중을 적용한다."""
    if components.shape[1] != 2:
        raise ValueError("CAI v0.1 requires exactly two components")
    if np.isinf(components.to_numpy(dtype=float)).any():
        raise ValueError("infinite component value")
    scores = component_scores(components, reference_mask)
    # 배열 내적은 결측을 전파한다. pandas mean의 기본 skipna를 사용하지 않는다.
    index = pd.Series(scores.to_numpy() @ np.array([0.5, 0.5]), index=components.index)
    calibration = {}
    for name in components:
        values = components.loc[reference_mask, name].dropna()
        calibration[name] = {
            "n": int(len(values)), "mean": float(values.mean()),
            "std_population": float(values.std(ddof=0)),
            "first_date": values.index.min().date().isoformat(),
            "last_date": values.index.max().date().isoformat(),
        }
    return index, scores, calibration


def build(computed_at: str) -> tuple[dict, dict]:
    """동결 설정·입력 해시를 검사하고 공개 결과와 재현 명세를 반환한다."""
    definition = json.loads(DEFINITION.read_text())
    for file_key, hash_key in (("source_config", "source_config_sha256"),
                               ("normalization_code", "normalization_code_sha256")):
        if sha256_file(ROOT / definition[file_key]) != definition[hash_key]:
            raise ValueError(f"frozen file changed: {definition[file_key]}")
    spec = load_spec(ROOT / definition["source_config"])
    validate_inputs(spec)  # 파일은 불투명 바이트로 해시 비교. 가격값·OOS 값을 파싱하지 않는다.
    if [s.name for s in spec.components] != [c["input_name"] for c in definition["components"]]:
        raise ValueError("frozen component order changed")
    calendar = definition["calendar"]
    if (calendar["start"], calendar["end"]) != ("2015-01-01", "2023-12-31"):
        raise ValueError("CAI v0.1 cannot use dates outside the frozen 2015–2023 calendar")
    if any(entry["weight"] != 0.5 or entry["validity_days"] != source.validity_days
           for source, entry in zip(spec.components, definition["components"], strict=True)):
        raise ValueError("definition weights or validity disagree with the fixed calculation")
    date_values = []
    with resolve_path(spec.price.path).open(newline="") as handle:
        for row in csv.DictReader(handle):
            date = row[spec.price.date_column]
            if calendar["start"] <= date <= calendar["end"]:
                date_values.append(date)
    dates = pd.DatetimeIndex(pd.to_datetime(date_values))
    if dates.empty or not dates.is_unique or not dates.is_monotonic_increasing:
        raise ValueError("calendar must be nonempty, unique and sorted")
    frames, alignment, aligned = {}, {}, {}
    for source in spec.components:
        frame = load_component_frame(source, start=spec.is_start, end=spec.is_end)
        if (frame.index > pd.Timestamp(calendar["end"])).any():
            raise ValueError("component outside frozen window")
        frames[source.name] = frame
        aligned[source.name], alignment[source.name] = align_availability(frame, dates, source, spec.mode)
    components = pd.DataFrame(aligned, index=dates)
    reference_mask = horizon_safe_train_mask(dates, spec.train_end, spec.horizon_days)
    reference = {"start": dates[reference_mask].min().date().isoformat(),
                 "end": dates[reference_mask].max().date().isoformat()}
    if reference != definition["reference_period"]:
        raise ValueError("frozen reference period changed")
    index, scores, calibration = calculate(components, reference_mask)
    valid = index.dropna()
    if len(valid) < 2:
        raise ValueError("not enough complete index observations")
    latest = valid.index[-1]
    definition_sha = sha256_file(DEFINITION)
    run_id = "cai-v0.1-" + definition_sha[:16]
    constituents, latest_inputs = [], {}
    for source, entry in zip(spec.components, definition["components"], strict=True):
        frame = frames[source.name].copy()
        frame["aligned_on"] = (frame["available_at"] if source.available_at_column
                                else frame.index + pd.Timedelta(days=source.availability_lag_days))
        eligible = frame.loc[(frame["aligned_on"] <= latest) & frame["value"].notna()]
        eligible = eligible.sort_values("aligned_on").drop_duplicates("aligned_on", keep="last")
        row = eligible.iloc[-1]
        age = int((latest - row["aligned_on"]).days)
        if age > source.validity_days or age < 0:
            raise ValueError("latest component exceeds validity")
        reading = {"score": round(float(scores.loc[latest, source.name]), 1), "weight": 0.5,
                   "observed_on": row.name.date().isoformat(),
                   "aligned_on": row["aligned_on"].date().isoformat(),
                   "alignment_basis": entry["alignment_basis"]}
        constituents.append({
            **{key: entry[key] for key in ("candidate_id", "name", "observed_quantity", "geography", "frequency")},
            "membership": "ADOPTED", "status_note": "실험용 v0.1 과거 지수에 동일가중으로 사용",
            "evidence_ids": [entry["evidence_id"], "cai-v01-definition"], "reading": reading,
        })
        latest_inputs[source.name] = {**reading, "elapsed_days": age, "validity_days": source.validity_days}
    history = [{"date": day.date().isoformat(), "score": round(float(value), 1) if pd.notna(value) else None,
                "definition_version": "cai-v0.1"} for day, value in index.items()]
    public = {
        "schema_version": "cai.public.v1",
        "index": {
            "index_id": "cushing-activity-index", "definition_version": "cai-v0.1",
            "mode": "RETROSPECTIVE", "reference_period": reference, "weighting_method": "equal-weight",
            "score": round(float(valid.iloc[-1]), 1), "previous_score": round(float(valid.iloc[-2]), 1),
            "as_of": latest.date().isoformat(), "observed_at": None, "available_at": None,
            "computed_at": computed_at, "retrieved_at": None, "data_origin": "OBSERVED",
            "freshness": None, "run_id": run_id, "constituent_count": 2, "coverage": 1, "history": history,
        },
        "forecast": {
            "model_id": None, "trained_run_id": None, "generated_at": None, "decision_cutoff": None,
            "target_start": None, "target_end": None, "target_definition": None, "publication_approved": False,
            "probabilities": None, "data_origin": "NO_DATA", "freshness": None,
        },
        "validation": {"status": "NOT_RUN", "n": None, "sample_start": None, "sample_end": None,
                       "oos_exposure": "UNKNOWN", "freeze_ref": None, "review_ref": None, "metrics": []},
        "constituents": constituents,
        "evidence": [
            {"id": "cai-v01-definition", "title": "CAI v0.1 산식·자료·재현 안내",
             "url": "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/indexes/cai-v0.1/README.md", "access": "public"},
            {"id": "fhwa-tmas", "title": "FHWA TMAS 교통량 자료",
             "url": "https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/", "access": "public"},
            {"id": "epa-dmr", "title": "EPA ECHO ICIS-NPDES DMR 신고 자료",
             "url": "https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary", "access": "public"},
        ],
        "warnings": [
            "2015–2023 과거 자료로 만든 실험용 지수입니다. 현재 쿠싱 활동이나 실시간 관측을 나타내지 않습니다.",
            "월중 일최대 신고 유량은 규제기관 접수일부터 최대 62일 재사용합니다. 접수일은 최초 공개일을 뜻하지 않습니다.",
            "도로 전체 차량 수와 처리시설 방류유량의 대리 지수이며 원유 물동량을 직접 측정하지 않습니다.",
        ],
    }
    manifest = {
        "definition_version": "cai-v0.1", "definition_sha256": definition_sha, "run_id": run_id,
        "computed_at": computed_at, "source_config_sha256": definition["source_config_sha256"],
        "inputs": [{"name": s.name, "path": s.path, "sha256": s.sha256,
                    "use": "date column within 2015–2023 only" if s.kind == "price" else "component observations within 2015–2023"}
                   for s in (spec.price, *spec.components)],
        "code_sha256": {str(path.relative_to(ROOT)): sha256_file(path) for path in
                        (Path(__file__).resolve(), ROOT / definition["normalization_code"],
                         ROOT / "research/src/ls_crude/experiment/spec.py")},
        "runtime": {"python": platform.python_version(), "numpy": np.__version__, "pandas": pd.__version__},
        "reference_period": reference, "calibration": calibration, "alignment": alignment,
        "calendar": {"start": dates.min().date().isoformat(), "end": dates.max().date().isoformat(), "rows": len(dates)},
        "output": {"valid_rows": len(valid), "missing_rows": int(index.isna().sum()),
                   "first_valid_date": valid.index.min().date().isoformat(), "as_of": latest.date().isoformat(),
                   "valid_rows_by_year": {str(year): int(count) for year, count in valid.groupby(valid.index.year).size().items()},
                   "score": public["index"]["score"], "latest_inputs": latest_inputs,
                   "public_payload_sha256": canonical_hash(public)},
        "execution": {"downloaded": False, "labels_built": False, "model_trained": False, "oos_values_used": False},
    }
    return public, manifest


def main() -> int:
    """정본을 생성하거나 기존 생성시각을 유지해 재현성을 확인한다."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="저장된 생성시각을 유지해 두 출력의 재현성을 확인")
    args = parser.parse_args()
    if args.check:
        computed_at = json.loads(PUBLIC.read_text())["index"]["computed_at"]
    else:
        computed_at = datetime.now(timezone.utc).isoformat()
    public, manifest = build(computed_at)
    for path, payload in ((PUBLIC, public), (MANIFEST, manifest)):
        text = json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        if args.check:
            if path.read_text() != text:
                raise ValueError(f"generated file differs: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    print(f"CAI v0.1 {'verified' if args.check else 'generated'}: {public['index']['as_of']} {public['index']['score']} / {manifest['output']['valid_rows']} valid rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
