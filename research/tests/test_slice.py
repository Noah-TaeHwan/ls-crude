from __future__ import annotations

import pandas as pd

from ls_crude.features.slice_index import oil_slice
from ls_crude.models.rsi_overlay import rsi_position


def test_oil_slice_weights_hormuz_heavier_than_inflation() -> None:
    news = pd.DataFrame(
        {
            "published_at": pd.to_datetime(["2024-04-13", "2024-04-13"]),
            "title": ["Hormuz tanker risk", "US CPI inflation"],
            "url": ["", ""],
            "source": ["investing.com", "investing.com"],
            "tags": [["hormuz"], ["inflation_policy"]],
        }
    )
    slice_frame = oil_slice(news, window=5)
    assert slice_frame.loc[pd.Timestamp("2024-04-13"), "slice_score"] == 3.0
    assert slice_frame.loc[pd.Timestamp("2024-04-13"), "hormuz_count"] == 1
    assert slice_frame.loc[pd.Timestamp("2024-04-13"), "inflation_count"] == 1


def test_rsi_overlay_labels() -> None:
    rsi_value = pd.Series([25.0, 50.0, 80.0])
    positions = list(rsi_position(rsi_value))
    assert positions == ["long", "flat", "short"]


def test_weekend_news_lands_on_next_session() -> None:
    news = pd.DataFrame(
        {
            "published_at": pd.to_datetime(["2024-04-13"]),
            "title": ["Hormuz tanker risk"],
            "url": [""],
            "source": ["investing.com"],
            "tags": [["hormuz"]],
        }
    )
    sessions = pd.bdate_range("2024-04-12", "2024-04-16")
    slice_frame = oil_slice(news, window=5, calendar=sessions)
    assert slice_frame.loc[pd.Timestamp("2024-04-12"), "slice_score"] == 0.0
    assert slice_frame.loc[pd.Timestamp("2024-04-15"), "slice_score"] == 2.0
    assert slice_frame.loc[pd.Timestamp("2024-04-15"), "hormuz_count"] == 1
