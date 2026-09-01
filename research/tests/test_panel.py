from __future__ import annotations

import pandas as pd

from ls_crude.data.splits import split_frames
from ls_crude.features.panel import build_daily_panel


def test_panel_joins_rsi_slice_and_sample() -> None:
    index = pd.bdate_range("2023-12-28", "2024-01-05")
    prices = pd.DataFrame(
        {
            "Open": range(len(index)),
            "High": range(len(index)),
            "Low": range(len(index)),
            "Close": range(50, 50 + len(index)),
            "Volume": [1_000] * len(index),
        },
        index=index,
    )
    news = pd.DataFrame(
        {
            "published_at": pd.to_datetime(["2024-01-01"]),
            "title": ["Strait of Hormuz tanker traffic"],
            "url": [""],
            "source": ["investing.com"],
            "tags": [["hormuz"]],
        }
    )
    panel = build_daily_panel(prices, news)
    in_sample, out_sample = split_frames(panel)
    assert "rsi_14" in panel.columns
    assert panel.loc[pd.Timestamp("2024-01-01"), "slice_score"] == 2.0
    assert in_sample.index.max() <= pd.Timestamp("2023-12-31")
    assert out_sample.index.min() >= pd.Timestamp("2024-01-01")
