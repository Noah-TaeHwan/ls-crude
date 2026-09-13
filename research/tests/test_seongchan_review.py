"""성찬 엔진 검수: 합성 데이터만 사용해 학습 실패·정답 경계를 검증한다."""
import importlib.util
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

PATH = Path(__file__).resolve().parents[1] / "experiments/cai/seongchan/monthly_engine.py"
spec = importlib.util.spec_from_file_location("seongchan_review", PATH)
engine = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = engine
spec.loader.exec_module(engine)


def synthetic_panel(n=90):
    dates = pd.date_range("2015-01-31", periods=n, freq="ME")
    rng = np.random.default_rng(7)
    return pd.DataFrame({"date": dates, "label_end": dates + pd.offsets.MonthEnd(1),
                         "target": np.arange(n) % 2, "a": rng.normal(size=n),
                         "b": rng.normal(size=n), "market": rng.normal(size=n)})


def test_insufficient_inner_split_never_returns_uniform_weights(monkeypatch):
    panel = synthetic_panel(12)
    def forbidden(*args, **kwargs):
        raise AssertionError("표본 부족인데 모델 학습을 시도함")
    monkeypatch.setattr(engine, "fit_predict_logistic", forbidden)
    with pytest.raises(engine.LearnedWeightBlocked, match="INSUFFICIENT_INNER_SPLIT"):
        engine.learn_simplex_weights(panel, ["a", "b"], ["market"], "target")


def test_no_valid_objective_is_blocked(monkeypatch):
    monkeypatch.setattr(engine, "_softmax_weight_objective", lambda *args: float("inf"))
    with pytest.raises(engine.LearnedWeightBlocked, match="NO_VALID_OBJECTIVE"):
        engine.learn_simplex_weights(synthetic_panel(), ["a", "b"], ["market"], "target")


def test_runner_preserves_equal_and_baseline_but_omits_blocked_metrics(tmp_path):
    panel = synthetic_panel()
    path = tmp_path / "input.csv"; panel.to_csv(path, index=False)
    report = engine.validate_panel(panel, path, "date", "target", ["a", "b"], ["market"],
                                   "retrospective", "2016-01-31", "2016-02-01", "2022-06-30", 1)
    assert report.train_rows == 12
    assert report.learned_weight_status == "BLOCKED_INSUFFICIENT_INNER_SPLIT"
    out = tmp_path / "result"
    result = engine.run_experiment(panel, report, "date", "target", ["market"], out)
    assert result["models"]["equal_weight_cai"]["status"] == "RUN"
    assert "metrics" not in result["models"]["learned_weight_cai"]
    assert "learned" not in result["weights"]
    assert result["comparison"]["equal_vs_learned"]["status"] == "NOT_COMPARABLE_LEARNING_BLOCKED"
    assert not pd.read_csv(out / "weights.csv")["scheme"].eq("learned").any()
    with pytest.raises(FileExistsError):
        engine.run_experiment(panel, report, "date", "target", ["market"], out)


def test_target_horizon_and_training_only_eligibility(tmp_path):
    panel = synthetic_panel()
    panel.loc[panel.date <= "2016-01-31", "a"] = 1.0
    path = tmp_path / "input.csv"; panel.to_csv(path, index=False)
    report = engine.validate_panel(panel, path, "date", "target", ["a", "b"], ["market"],
                                   "retrospective", "2016-01-31", "2016-02-01", "2022-06-30", 1)
    assert report.blocked_components["a"] == "NO_VARIATION"
    train, _ = engine.split_panel(panel, "date", "target", "2016-01-31", "2016-02-01", "2022-06-30")
    assert train.date.max() == pd.Timestamp("2015-12-31")
    assert train.label_end.max() == pd.Timestamp("2016-01-31")
    with pytest.raises(ValueError, match="label_end"):
        engine.split_panel(panel.drop(columns="label_end"), "date", "target", "2016-01-31", "2016-02-01", "2022-06-30")


def test_self_test_never_reads_embedded_data(monkeypatch):
    def forbidden(*args, **kwargs):
        raise AssertionError("합성 검사에서 실측 내장 데이터를 읽음")
    monkeypatch.setattr(engine, "embedded_tables", forbidden)
    monkeypatch.setattr(engine, "run_embedded_experiment", forbidden)
    result = engine.run_self_test()
    assert result["all_pass"] and result["data_origin"] == "SYNTHETIC"
    assert result["embedded_data_checked"] is False


def test_monthly_wrapper_reports_actual_eligibility(monkeypatch, tmp_path):
    # 날짜만 외부 실험과 맞춘 합성값. 수신본의 2024+ 실측 배열은 사용하지 않는다.
    panel = synthetic_panel(24).rename(columns={"date": "month", "target": "target_next_month_up",
                                                "a": "hotel_motel_tax_usd", "b": "use_tax_usd", "market": "wti_ret_lag1"})
    panel["month"] = pd.date_range("2023-07-31", periods=24, freq="ME")
    panel["label_end"] = panel["month"] + pd.offsets.MonthEnd(1)
    monkeypatch.setattr(engine, "build_common_monthly_panel", lambda: panel)
    def export(out):
        out.mkdir(parents=True)
        panel.to_csv(out / "common_monthly_panel.csv", index=False)
        return {"qa": {"all_pass": True}}
    monkeypatch.setattr(engine, "export_embedded_bundle", export)
    result = engine.run_embedded_experiment(tmp_path / "monthly")
    assert result["validation"]["train_rows"] == 11
    status = result["all_in_one_status"]
    assert not status["candidate_11_lodging_tax"]["monthly_exploratory_eligible"]
    assert not status["monthly_cai_comparison_completed"]
    assert status["wti_test"]["learned_improves_log_loss"] is None
    assert all("phase_stride_5d" not in model for model in result["models"].values())
