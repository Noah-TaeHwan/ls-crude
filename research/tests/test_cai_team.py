"""공동 제출 검증: 합성 입력만 학습하며 실패 결과를 성공으로 포장하지 않는다."""
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path

import pytest

from ls_crude.experiment.fixtures import synthetic_frames
from ls_crude.experiment.runner import run
from ls_crude.experiment import spec as engine_spec
from ls_crude.experiment.spec import MODEL_KINDS, SpecError, canonical_hash, load_spec, sha256_file

ROOT = Path(__file__).resolve().parents[2]
loader = spec_from_file_location("cai_team", ROOT / "research/scripts/cai_team.py")
team = module_from_spec(loader)
loader.loader.exec_module(team)


def write(path, value):
    path.write_text(json.dumps(value), encoding="utf-8")


@pytest.fixture
def example(tmp_path, monkeypatch):
    monkeypatch.setattr(engine_spec, "REPO_ROOT", tmp_path)
    data = tmp_path / "research/data"
    data.mkdir(parents=True)
    frames = synthetic_frames(n_components=1)
    frames["price"].rename_axis("date").to_csv(data / "price.csv")
    frames["components"]["syn1"].rename("value").rename_axis("date").to_csv(data / "syn1.csv")
    inputs = [{"path": f"research/data/{name}.csv", "sha256": sha256_file(data / f"{name}.csv"),
               "value_column": column, "unit": "synthetic-units", "availability_basis": "synthetic observation date", "role": "active"}
              for name, column in [("price", "close"), ("syn1", "value")]]
    raw = {"candidate_id": "synthetic-team-test", "mode": "RETROSPECTIVE_RESEARCH",
           "target": {"kind": "next_n_trading_days_up", "horizon_days": 5}, "price": inputs[0], "components": inputs[1:],
           "is": {"start": "2015-01-01", "end": "2023-12-31"},
           "split": {"train_end": "2020-12-31", "val_start": "2021-01-01", "val_end": "2023-12-31"},
           "market_features": ["rsi14", "ret_5d"], "models": list(MODEL_KINDS), "seeds": [7]}
    config = tmp_path / "config.json"
    write(config, raw)
    run_dir = run(load_spec(config), base_dir=tmp_path / "runs", run_id="synthetic", use_cache=False)
    return config, run_dir, tmp_path / "submission"


def test_valid_package_preserves_config_and_excludes_internal_data(example):
    config, run_dir, out = example
    assert team.check(config)[2]["status"] == "INPUT_READY"
    summary_path = run_dir / "export/summary.json"
    summary = team.read_json(summary_path)
    summary["private_extra"] = "must-not-leak"
    summary["models"][0]["notes"] = "must-not-leak"
    write(summary_path, summary)
    assert team.package(config, run_dir, "seongchan", out)["models"] == 6
    assert {p.relative_to(out).as_posix() for p in out.rglob("*") if p.is_file()} == {
        "README.md", "manifest.json", "config.json", "export/summary.json"}
    assert canonical_hash(team.read_json(out / "config.json")) == canonical_hash(team.read_json(config))
    manifest = team.read_json(out / "manifest.json")
    assert manifest["source_run_env"] == team.read_json(run_dir / "internal/provenance.json")["env"]
    assert set(manifest["packaging_env"]) == {"python", "platform", "numpy", "pandas", "sklearn", "scipy"}
    text = (out / "export/summary.json").read_text()
    assert '"p_up"' not in text and '"notes"' not in text and '"platform"' not in text
    assert "must-not-leak" not in text
    with pytest.raises(SpecError, match="output exists"):
        team.package(config, run_dir, "seongchan", out)


@pytest.mark.parametrize("fault", ["failed", "metrics", "weights", "coefficients", "missing_predictions", "wrong_dates", "wrong_target", "missing_model", "code", "cached"])
def test_corrupt_runs_are_rejected(example, fault):
    config, run_dir, out = example
    summary_path = run_dir / "export/summary.json"
    state_path = run_dir / "internal/run_state.json"
    summary, state = team.read_json(summary_path), team.read_json(state_path)
    entry = summary["models"][2]
    if fault == "failed":
        entry["status"] = "failed"
    elif fault == "metrics":
        entry["metrics"]["brier"] += 0.1
    elif fault == "weights":
        entry["weights"] = [0.5]
    elif fault == "coefficients":
        entry["coefficients"]["intercept"] += 1
    elif fault == "cached":
        entry["cached"] = True
    elif fault == "code":
        summary["code_combined"] = "wrong"
    elif fault == "missing_model":
        summary["models"].pop()
    else:
        path = run_dir / "internal" / f"predictions_{entry['id']}.csv"
        if fault == "missing_predictions":
            path.unlink()
        else:
            rows = team.pd.read_csv(path)
            if fault == "wrong_dates":
                rows.loc[0, "date"] = "2024-01-01"
            else:
                rows.loc[0, "target"] = 1 - rows.loc[0, "target"]
            rows.to_csv(path, index=False)
    state["configs"][entry["id"]].update(entry)
    write(summary_path, summary)
    write(state_path, state)
    with pytest.raises(SpecError):
        team.package(config, run_dir, "seongchan", out)
    assert not out.exists()
    assert run_dir.is_dir()


@pytest.mark.parametrize("fault", ["hash", "duplicate", "unit", "basis", "role", "oos", "seeds", "unknown", "secret", "absolute"])
def test_bad_configs_are_rejected(example, fault):
    config, run_dir, out = example
    raw = team.read_json(config)
    if fault == "hash":
        raw["price"]["sha256"] = "0" * 64
    elif fault == "duplicate":
        raw["components"].append(dict(raw["components"][0]))
    elif fault == "unit":
        raw["components"][0].pop("unit")
    elif fault == "basis":
        raw["components"][0].pop("availability_basis")
    elif fault == "role":
        raw["components"][0]["role"] = "context"
    elif fault == "oos":
        raw["is"]["end"] = "2024-01-01"
    elif fault == "seeds":
        raw["seeds"] = [7, 8]
    elif fault == "unknown":
        raw["private_note"] = "must not be published"
    elif fault == "secret":
        raw["preregistration_note"] = "token=not-real-test-token"
    elif fault == "absolute":
        raw["price"]["path"] = str(config.parent / raw["price"]["path"])
    write(config, raw)
    with pytest.raises(SpecError):
        if fault in ("unknown", "secret", "absolute"):
            team.safe_config(load_spec(config))
        else:
            team.check(config)
    assert not out.exists()


def test_reference_2019_run_readonly_when_local_inputs_available(tmp_path):
    config = ROOT / "research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json"
    run_dir = ROOT / "research/data/processed/091-cai-exp-2019/20260912T013423Z"
    if not run_dir.is_dir() or not all((ROOT / x["path"]).is_file() for x in [team.read_json(config)["price"], *team.read_json(config)["components"]]):
        pytest.skip("local private reference inputs not present")
    paths = [p for p in run_dir.rglob("*") if p.is_file()]
    before = {p: sha256_file(p) for p in paths}
    result = team.package(config, run_dir, "taehwan", tmp_path / "reference")
    assert result["models"] == 6
    assert before == {p: sha256_file(p) for p in paths}
    assert team.read_json(tmp_path / "reference/manifest.json")["validation"]["input"]["warnings"]


@pytest.mark.parametrize("fault", ["horizon", "seed", "model_subset", "split", "flat", "market_features"])
def test_team_v1_contract_is_fixed(example, fault):
    config, _, _ = example
    raw = team.read_json(config)
    if fault == "horizon":
        raw["target"]["horizon_days"] = 10
    elif fault == "seed":
        raw["seeds"] = [8]
    elif fault == "model_subset":
        raw["models"].pop()
    elif fault == "flat":
        raw["target"]["flat_counts_as"] = "up"
    elif fault == "market_features":
        raw["market_features"] = ["rsi14"]
    else:
        raw["split"]["train_end"] = "2019-12-31"
    write(config, raw)
    with pytest.raises(SpecError, match="team v1 requires"):
        team.check(config)


@pytest.mark.parametrize("field", ["preregistration_note", "preregistered_at", "definition", "date_column", "unit"])
def test_nested_private_values_cannot_hide_in_scalar_fields(example, field):
    config, _, out = example
    raw = team.read_json(config)
    hidden = {"api_key": "fake-test-marker", "raw_rows": [["test", 123]]}
    if field == "definition":
        raw["target"][field] = hidden
    elif field in ("date_column", "unit"):
        raw["price"][field] = hidden
    else:
        raw[field] = hidden
    write(config, raw)
    with pytest.raises(SpecError, match="expected str"):
        team.check(config)
    assert not out.exists()


@pytest.mark.parametrize("bad", [None, {"nested": "fake-test-marker"}])
def test_missing_or_untyped_run_environment_rejected(example, bad):
    config, run_dir, out = example
    for relative in ("export/summary.json", "internal/provenance.json"):
        path = run_dir / relative
        content = team.read_json(path)
        content["env"]["numpy"] = bad
        write(path, content)
    with pytest.raises(SpecError):
        team.package(config, run_dir, "taehwan", out)
    assert not out.exists()
