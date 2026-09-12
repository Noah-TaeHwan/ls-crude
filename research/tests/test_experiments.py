"""Tests for the CAI experiment program. All inputs are synthetic fixtures."""

from __future__ import annotations

import json

import numpy as np
import pandas as pd
import pytest

from ls_crude.experiment.data import align_availability, build_target, load_price_frame, online_feature_check, prepare
from ls_crude.experiment.fixtures import synthetic_frames, synthetic_spec
from ls_crude.experiment.models import learn_weights
from ls_crude.experiment.runner import compare_runs, run
from ls_crude.experiment.spec import InputSpec, SpecError, load_spec, sha256_file, validate_inputs


def test_train_labels_never_cross_validation_boundary():
    spec = synthetic_spec()
    prepared = prepare(spec, synthetic_frames(seed=1))
    positions = {date: index for index, date in enumerate(prepared.dates)}
    train_dates = prepared.dates[prepared.train_mask]
    assert len(train_dates) > 0
    for date in (train_dates[0], train_dates[-1]):
        label_date = prepared.dates[positions[date] + spec.horizon_days]
        assert label_date <= pd.Timestamp(spec.train_end)
    assert prepared.target.iloc[-spec.horizon_days:].isna().all()
    assert prepared.target.loc[prepared.train_mask].notna().all()
    assert prepared.quality["train_dropped_by_horizon_boundary"] == spec.horizon_days


def test_spec_validation_rejects_bad_hash(tmp_path):
    csv = tmp_path / "price.csv"
    csv.write_text("date,Close\n2020-01-02,50\n2020-01-03,51\n", encoding="utf-8")
    config = {
        "candidate_id": "unit",
        "target": {"kind": "next_n_trading_days_up", "horizon_days": 5},
        "price": {"path": str(csv), "sha256": "0" * 64, "value_column": "Close"},
        "components": [],
        "is": {"start": "2015-01-01", "end": "2023-12-31"},
        "split": {"train_end": "2020-12-31", "val_start": "2021-01-01", "val_end": "2023-12-31"},
        "market_features": ["rsi14"],
        "models": ["baseline_up_rate"],
        "limits": {"max_configs": 12, "max_workers": 2, "max_seconds": 600},
        "seeds": [7],
    }
    spec_path = tmp_path / "spec.json"
    spec_path.write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(SpecError):
        validate_inputs(load_spec(spec_path))
    config["price"]["sha256"] = sha256_file(csv)
    spec_path.write_text(json.dumps(config), encoding="utf-8")
    resolved = validate_inputs(load_spec(spec_path))
    assert resolved["price"] == str(csv)


def test_missing_values_are_not_filled():
    frames = synthetic_frames(seed=2)
    component = frames["components"]["syn1"].copy()
    component.iloc[10:15] = float("nan")
    frames["components"]["syn1"] = component
    prepared = prepare(synthetic_spec(), frames)
    assert prepared.quality["missing_component_cells"] == 5
    assert prepared.component_scores["syn1"].iloc[10:15].isna().all()
    usable = prepared.components.notna().all(axis=1)
    assert len(usable) > 0


def test_learned_weights_stay_on_simplex():
    prepared = prepare(synthetic_spec(), synthetic_frames(seed=3))
    rows = prepared.train_mask & prepared.target.notna() & prepared.components.notna().all(axis=1)
    weights = learn_weights(prepared.component_scores.loc[rows], prepared.target.loc[rows], 7)
    assert len(weights) == 2
    assert abs(sum(weights) - 1.0) < 1e-6
    assert min(weights) >= 0.0


def test_single_component_does_not_force_weight_learning(tmp_path):
    run_dir = run(synthetic_spec(n_components=1), frames=synthetic_frames(seed=4, n_components=1),
                  base_dir=tmp_path, run_id="single")
    export = json.loads((run_dir / "export" / "summary.json").read_text(encoding="utf-8"))
    learned = next(model for model in export["models"] if model["id"] == "cai_learned_logit")
    assert learned["status"] == "done"
    assert learned["weights"] == [1.0]
    assert "not forced" in learned["notes"]


def test_cai_models_blocked_without_components(tmp_path):
    run_dir = run(synthetic_spec(n_components=0), frames=synthetic_frames(seed=5, n_components=0),
                  base_dir=tmp_path, run_id="blocked")
    export = json.loads((run_dir / "export" / "summary.json").read_text(encoding="utf-8"))
    statuses = {model["id"]: model["status"] for model in export["models"]}
    assert statuses["baseline_up_rate"] == "done"
    assert statuses["market_only_logit"] == "done"
    assert statuses["cai_equal_logit"] == "blocked"
    assert statuses["cai_learned_logit"] == "blocked"
    for model in export["models"]:
        if model["status"] == "blocked":
            assert "no eligible components" in model["reason"]


def test_export_has_no_per_row_data_and_internal_does(tmp_path):
    run_dir = run(synthetic_spec(), frames=synthetic_frames(seed=6), base_dir=tmp_path, run_id="demo")
    export = json.loads((run_dir / "export" / "summary.json").read_text(encoding="utf-8"))
    assert all(model["status"] == "done" for model in export["models"])
    export_text = json.dumps(export)
    assert '"p_up"' not in export_text and '"probs"' not in export_text
    assert (run_dir / "internal" / "predictions_baseline_up_rate.csv").is_file()
    assert (run_dir / "internal" / "provenance.json").is_file()


def test_cache_dedup_and_resume(tmp_path):
    spec = synthetic_spec()
    frames = synthetic_frames(seed=7)
    first = run(spec, frames=frames, base_dir=tmp_path, run_id="r1")
    second = run(spec, frames=frames, base_dir=tmp_path, run_id="r2")
    state = json.loads((second / "internal" / "run_state.json").read_text(encoding="utf-8"))
    assert all(entry.get("cached") for entry in state["configs"].values())
    resumed = run(spec, frames=frames, base_dir=tmp_path, resume=first)
    resumed_state = json.loads((resumed / "internal" / "run_state.json").read_text(encoding="utf-8"))
    assert all(entry["status"] == "done" for entry in resumed_state["configs"].values())


def test_online_feature_check_passes_on_causal_features():
    frames = synthetic_frames(seed=8)
    result = online_feature_check(frames["price"]["close"], ("rsi14", "ret_5d"))
    assert result["ok"] is True


def test_nonpositive_close_is_excluded_not_filled(tmp_path):
    dates = pd.bdate_range("2020-01-02", periods=40)
    close = pd.Series(np.linspace(50.0, 59.0, len(dates)), index=dates)
    close.iloc[20] = -5.0
    csv = tmp_path / "price.csv"
    close.rename("Close").to_frame().rename_axis("date").to_csv(csv)
    frame = load_price_frame(str(csv), "date", "Close", start="2015-01-01", end="2023-12-31")
    assert int(frame["invalid_close"].sum()) == 1
    assert int(frame["close"].isna().sum()) == 1
    target = build_target(frame["close"], 5, frame["invalid_close"])
    assert target.iloc[15:21].isna().all()
    assert target.iloc[:15].notna().all()
    assert target.iloc[21:-5].notna().all()


def _mode_config(mode: str, price_path: str, **price_extra: object) -> dict:
    price = {"path": price_path, "sha256": "0" * 64, "value_column": "Close"}
    price.update(price_extra)
    return {
        "mode": mode,
        "candidate_id": "unit",
        "target": {"kind": "next_n_trading_days_up", "horizon_days": 5},
        "price": price,
        "components": [],
        "is": {"start": "2015-01-01", "end": "2023-12-31"},
        "split": {"train_end": "2020-12-31", "val_start": "2021-01-01", "val_end": "2023-12-31"},
        "market_features": ["rsi14"],
        "models": ["baseline_up_rate"],
        "limits": {"max_configs": 12, "max_workers": 2, "max_seconds": 600},
        "seeds": [7],
    }


def test_mode_contract_and_point_in_time_gate(tmp_path):
    assert synthetic_spec().mode == "RETROSPECTIVE_RESEARCH"
    csv = tmp_path / "price.csv"
    csv.write_text("date,Close\n2020-01-02,50\n2020-01-03,51\n", encoding="utf-8")
    pit = tmp_path / "pit.json"
    pit.write_text(json.dumps(_mode_config("POINT_IN_TIME_FORECAST", str(csv))), encoding="utf-8")
    with pytest.raises(SpecError):
        load_spec(pit)
    ok = _mode_config("POINT_IN_TIME_FORECAST", str(csv), availability_basis="official close 16:00 ET")
    pit.write_text(json.dumps(ok), encoding="utf-8")
    assert load_spec(pit).mode == "POINT_IN_TIME_FORECAST"
    bad = _mode_config("NO_SUCH_MODE", str(csv))
    pit.write_text(json.dumps(bad), encoding="utf-8")
    with pytest.raises(SpecError):
        load_spec(pit)


def test_compare_runs_matches_and_detects_tamper(tmp_path):
    spec = synthetic_spec()
    frames = synthetic_frames(seed=9)
    left = run(spec, frames=frames, base_dir=tmp_path / "left", run_id="a")
    right = run(spec, frames=frames, base_dir=tmp_path / "right", run_id="b")
    report = compare_runs(left, right)
    assert report["match"] is True
    assert all(row["metrics_match"] for row in report["configs"])
    summary_path = right / "export" / "summary.json"
    tampered = json.loads(summary_path.read_text(encoding="utf-8"))
    tampered["spec_hash"] = "tampered"
    summary_path.write_text(json.dumps(tampered), encoding="utf-8")
    assert compare_runs(left, right)["match"] is False


def _component_spec(**overrides: object) -> InputSpec:
    base = {"kind": "component", "path": "synthetic://c", "sha256": "0" * 64}
    base.update(overrides)
    return InputSpec(**base)  # type: ignore[arg-type]


def test_availability_is_calendar_based_not_row_shift():
    observations = pd.DataFrame({"value": [10.0, 20.0]}, index=pd.DatetimeIndex(["2023-01-31", "2023-02-28"]))
    dates = pd.bdate_range("2023-01-25", "2023-03-03")
    aligned, record = align_availability(
        observations, dates, _component_spec(availability_lag_days=1), "RETROSPECTIVE_RESEARCH"
    )
    assert pd.isna(aligned.loc["2023-01-31"])  # never exposed before availability
    assert aligned.loc["2023-02-01"] == 10.0  # January value is available February 1
    assert pd.isna(aligned.loc["2023-02-28"])  # a row shift would (wrongly) expose it here
    assert aligned.loc["2023-03-01"] == 20.0  # February value is available March 1
    assert record["status"] == "ASSUMED_LAG_DAYS"


def test_validity_window_bounds_reuse_and_never_backfills():
    observations = pd.DataFrame({"value": [10.0, 20.0]}, index=pd.DatetimeIndex(["2023-01-31", "2023-02-28"]))
    dates = pd.bdate_range("2023-01-20", "2023-05-01")
    aligned, _ = align_availability(
        observations, dates, _component_spec(availability_lag_days=1, validity_days=45), "RETROSPECTIVE_RESEARCH"
    )
    assert pd.isna(aligned.loc["2023-01-20"])  # no backward fill
    assert aligned.loc["2023-02-15"] == 10.0  # within 45 days of Feb 1
    assert aligned.loc["2023-03-20"] == 20.0  # newer observation replaces it
    assert pd.isna(aligned.loc["2023-04-20"])  # stale beyond 45 days, dropped not filled


def test_confirmed_available_at_wins_and_blocks_early_exposure():
    observations = pd.DataFrame(
        {"value": [10.0], "available_at": [pd.Timestamp("2023-02-10")]},
        index=pd.DatetimeIndex(["2023-01-31"]),
    )
    dates = pd.bdate_range("2023-02-01", "2023-03-10")
    aligned, record = align_availability(
        observations, dates, _component_spec(available_at_column="available_at", validity_days=45),
        "POINT_IN_TIME_FORECAST",
    )
    assert pd.isna(aligned.loc["2023-02-09"])
    assert aligned.loc["2023-02-10"] == 10.0
    assert aligned.loc["2023-03-10"] == 10.0
    assert record["status"] == "CONFIRMED_RECEIVED_DATE"


def test_weekend_observation_available_next_weekday():
    observations = pd.DataFrame({"value": [5.0]}, index=pd.DatetimeIndex(["2023-01-27"]))  # Friday
    dates = pd.bdate_range("2023-01-27", "2023-02-10")
    aligned, _ = align_availability(
        observations, dates, _component_spec(availability_lag_days=1, validity_days=7), "RETROSPECTIVE_RESEARCH"
    )
    assert pd.isna(aligned.loc["2023-01-27"])  # available Saturday Jan 28
    assert aligned.loc["2023-01-30"] == 5.0  # Monday, within the 7-day window
    assert pd.isna(aligned.loc["2023-02-06"])  # beyond Jan 28 + 7 days


def test_dmr_reuse_policy_semantics_same_day_and_31_days():
    observations = pd.DataFrame({"value": [10.0]}, index=pd.DatetimeIndex(["2023-01-31"]))
    observations["available_at"] = pd.Timestamp("2023-02-01")
    dates = pd.date_range("2023-02-01", "2023-03-10", freq="D")

    exact, _ = align_availability(
        observations, dates, _component_spec(available_at_column="available_at", validity_days=0),
        "RETROSPECTIVE_RESEARCH",
    )
    assert exact.loc["2023-02-01"] == 10.0
    assert pd.isna(exact.loc["2023-02-02"])  # validity_days=0 is same-day only

    window31, _ = align_availability(
        observations, dates, _component_spec(available_at_column="available_at", validity_days=31),
        "RETROSPECTIVE_RESEARCH",
    )
    assert window31.loc["2023-03-04"] == 10.0  # availability + 31 days is included
    assert pd.isna(window31.loc["2023-03-05"])  # day 32 is expired, not filled


def test_prepare_records_availability_status_and_reuse_counts():
    prepared = prepare(synthetic_spec(), synthetic_frames(seed=11))
    records = prepared.checks["availability"]
    assert records and records[0]["status"] == "RECORDED_OBSERVATION_DATE"
    assert prepared.quality["component_observations"]["syn1"] == len(prepared.components)
    assert prepared.quality["component_decision_rows"]["syn1"] > 0


def test_market_cai_models_run_and_save_coefficients(tmp_path):
    models = ("market_only_logit", "market_cai_equal_logit", "market_cai_learned_logit")
    run_dir = run(synthetic_spec(models=models), frames=synthetic_frames(seed=12), base_dir=tmp_path, run_id="mc")
    export = json.loads((run_dir / "export" / "summary.json").read_text(encoding="utf-8"))
    for entry in export["models"]:
        assert entry["status"] == "done", entry
        info = entry["coefficients"]
        expected_last = "cai" if "cai" in entry["model"] else "ret_5d"
        assert info["features"][-1] == expected_last
        assert len(info["coefficients"]) == len(info["features"])
        assert "intercept" in info and "scaler_mean" in info


def test_single_component_market_cai_learned_weight_not_forced(tmp_path):
    models = ("market_cai_learned_logit",)
    run_dir = run(
        synthetic_spec(n_components=1, models=models),
        frames=synthetic_frames(seed=13, n_components=1),
        base_dir=tmp_path,
        run_id="mc1",
    )
    export = json.loads((run_dir / "export" / "summary.json").read_text(encoding="utf-8"))
    entry = export["models"][0]
    assert entry["status"] == "done"
    assert entry["weights"] == [1.0]
    assert "not forced" in entry["notes"]
