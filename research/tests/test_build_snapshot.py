import json

import pandas as pd

from ls_crude import build


def test_public_snapshot_excludes_out_sample(tmp_path, monkeypatch) -> None:
    snapshot = tmp_path / "baseline-snapshot.json"
    monkeypatch.setattr(build, "SNAPSHOT_PATH", snapshot)
    panel = pd.DataFrame(
        {"Close": [69.0, 70.0, 80.0], "sample": ["out", "in", "out"]},
        index=pd.to_datetime(["2023-12-28", "2023-12-29", "2024-01-02"]),
    ).rename_axis("date")
    news = pd.DataFrame(
        {
            "published_at": pd.to_datetime(["2023-12-15", "2024-04-13"]),
            "title": ["in", "out"],
            "url": [None, None],
            "source": ["investing.com", "investing.com"],
            "tags": [["hormuz"], ["hormuz"]],
        }
    )

    build._write_snapshot(panel, news)

    payload = json.loads(snapshot.read_text())
    assert [row["sample"] for row in payload["rows"]] == ["in"]
    row_dates = [row["date"] for row in payload["rows"]]
    assert row_dates == ["2023-12-29"]
    assert "2023-12-28" not in row_dates
    assert [item["title"] for item in payload["news"]] == ["in"]
