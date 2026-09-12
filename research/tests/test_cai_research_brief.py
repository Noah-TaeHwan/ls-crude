"""오프라인 브리프의 수치·결론·생성물 동기화를 검사한다."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("cai_brief", ROOT / "research/scripts/build_cai_research_brief.py")
brief = importlib.util.module_from_spec(spec)
spec.loader.exec_module(brief)


def test_public_brief_tracks_metrics_and_rejects_missing_results():
    raw = brief.SUMMARY.read_bytes()
    summary = json.loads(raw)
    config = json.loads(brief.CONFIG.read_text())
    rendered = brief.render(summary, config, hashlib.sha256(raw).hexdigest())
    for path, text in zip(brief.OUTPUTS, rendered):
        assert path.read_text() == text, "정본 요약 변경 후 생성물을 다시 만들어야 한다"
        assert "시장정보에 CAI를 추가한 두 비교 모두 확률오차가 줄지 않았습니다" in text
        for row in summary["sample_expansion"]["models"]:
            assert f"{row['after']['log_loss']:.6f}" in text
    assert all(tag not in rendered[1] for tag in ("<script", "<link", "<img", "<iframe")), "오프라인에서 외부 자원이 필요 없어야 한다"

    changed = copy.deepcopy(summary)
    rows = {row["id"]: row for row in changed["sample_expansion"]["models"]}
    rows["market_cai_equal"]["after"]["log_loss"] = rows["market"]["after"]["log_loss"] - 0.01
    rows["market_cai_equal"]["label"] = "<script>alert(1)</script>"
    md, html = brief.render(changed, config, "test")
    assert "확률오차가 줄어든 비교가 있습니다" in md
    assert "-0.010000" in html and "&lt;script&gt;" in html and "<script>" not in html
    rows["market"]["after"]["log_loss"] = None
    with pytest.raises(ValueError):
        brief.render(changed, config, "test")
