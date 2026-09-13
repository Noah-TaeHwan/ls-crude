"""공통 후보 JSON과 GitHub 작업표가 같은 상태를 보여주는지 검사한다."""
import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("worklist", ROOT / "research/scripts/build_cai_team_worklist.py")
worklist = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worklist)


def test_worklist_matches_source_and_rejects_false_assignment():
    data = json.loads(worklist.SOURCE.read_text())
    text = worklist.render(data)
    assert text == worklist.OUTPUT.read_text()
    assert len(data["candidates"]) == 33
    for candidate in data["candidates"]:
        assert candidate["id"] in text and candidate["name"] in text
    proposed = [c for c in data["candidates"] if c["work"]["owner"] == "seongchan"]
    assert len(proposed) == 3 and all(c["work"]["assignment"] == "confirmed" and c["work"]["status"] == "review" for c in proposed)
    proposed[0]["work"]["assignment"] = "proposed"
    proposed[0]["work"]["status"] = "in_progress"
    with pytest.raises(ValueError):
        worklist.render(data)
