"""실험용 지수의 실제 입력 재현·결측·고정 참조기간을 검증한다."""
import importlib.util
import json
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("cai_v01", ROOT / "research/scripts/build_cai_v01.py")
cai = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cai)


def test_stored_output_reproduces_without_training():
    if not (ROOT / "research/data/processed/091-cai-exp-pilot/inputs/traffic_avc040_daily_2019plus.csv").exists():
        pytest.skip("해시로 고정된 로컬 연구 입력이 필요합니다")
    stored = json.loads(cai.PUBLIC.read_text())
    public, manifest = cai.build(stored["index"]["computed_at"])
    assert public == stored
    assert manifest == json.loads(cai.MANIFEST.read_text())
    assert public["index"]["score"] == 43.1
    assert public["index"]["as_of"] == "2023-12-29"
    assert len(public["index"]["history"]) == 2262
    assert manifest["output"]["valid_rows"] == 1003
    assert manifest["output"]["missing_rows"] == 1259
    assert public["constituents"][1]["reading"]["observed_on"] == "2023-11-30"
    assert public["constituents"][1]["reading"]["aligned_on"] == "2023-12-11"
    assert public["forecast"]["publication_approved"] is False
    assert all(value is False for value in manifest["execution"].values())


def test_complete_pairs_and_frozen_reference_statistics():
    dates = pd.date_range("2020-12-21", periods=5)
    frame = pd.DataFrame({"traffic": [1., 2., 3., 4., np.nan], "dmr": [3., 2., 1., np.nan, 4.]}, index=dates)
    reference = pd.Series([True, True, True, False, False], index=dates)
    index, scores, calibration = cai.calculate(frame, reference)
    assert np.allclose(index.iloc[:3], [50., 50., 50.])
    assert index.iloc[3:].isna().all()  # 한 성분 점수만으로 지수를 만들어서는 안 된다.
    changed = frame.copy()
    changed.loc[~reference] *= 100
    changed_index, changed_scores, changed_calibration = cai.calculate(changed, reference)
    assert calibration == changed_calibration
    pd.testing.assert_frame_equal(scores.loc[reference], changed_scores.loc[reference])
    assert changed_index.iloc[3:].isna().all()
