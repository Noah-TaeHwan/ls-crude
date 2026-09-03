from __future__ import annotations

import pandas as pd
import pytest

from ls_crude.data import wiki_pageviews
from ls_crude.data.wiki_pageviews import (
    WIKI_VIEWS_START,
    attach_prior_calendar_views,
    calendar_spike_flags,
    count_in_sample_spike_next_up,
    fetch_hormuz_wiki_views,
    in_sample_wiki_window,
    next_session_direction,
)


def test_fetch_rejects_missing_calendar_day(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(wiki_pageviews.time, "sleep", lambda _seconds: None)
    monkeypatch.setattr(
        wiki_pageviews,
        "_fetch_range",
        lambda _start, _end: pd.Series(
            [10.0, 30.0],
            index=pd.to_datetime(["2023-01-01", "2023-01-03"]),
        ),
    )

    with pytest.raises(RuntimeError, match="2023-01-01\\.\\.2023-01-03"):
        fetch_hormuz_wiki_views("2023-01-01", "2023-01-03")


def test_fetch_rejects_none_chunk(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(wiki_pageviews.time, "sleep", lambda _seconds: None)
    monkeypatch.setattr(wiki_pageviews, "_fetch_range", lambda _start, _end: None)

    with pytest.raises(RuntimeError, match="2023-01-01\\.\\.2023-01-03"):
        fetch_hormuz_wiki_views("2023-01-01", "2023-01-03")


def test_cl_uses_prior_calendar_day_not_same_day() -> None:
    prices = pd.DataFrame(
        {"Close": [1.0, 2.0, 3.0]},
        index=pd.to_datetime(["2018-05-07", "2018-05-08", "2018-05-09"]),
    )
    views = pd.Series(
        [521.0, 965.0, 914.0],
        index=pd.to_datetime(["2018-05-07", "2018-05-08", "2018-05-09"]),
    )
    attached = attach_prior_calendar_views(prices, views)
    assert attached.loc["2018-05-08", "hormuz_wiki_views_prior"] == 521.0
    assert attached.loc["2018-05-09", "hormuz_wiki_views_prior"] == 965.0


def test_in_sample_window_drops_out_sample_and_pre_api() -> None:
    index = pd.to_datetime(
        ["2015-06-30", "2015-07-02", "2023-12-31", "2024-01-02"]
    )
    prices = pd.DataFrame({"Close": [1.0, 2.0, 3.0, 4.0]}, index=index)
    views = pd.Series(
        [10.0, 20.0, 30.0, 99.0],
        index=pd.to_datetime(["2015-06-30", "2015-07-01", "2023-12-30", "2024-01-01"]),
    )
    window = in_sample_wiki_window(prices, views)
    assert pd.Timestamp("2024-01-02") not in window.index
    assert pd.Timestamp("2015-06-30") not in window.index
    assert window.index.min() >= pd.Timestamp(WIKI_VIEWS_START) + pd.Timedelta(days=1)
    assert window["sample"].eq("in").all()
    assert window.loc["2015-07-02", "hormuz_wiki_views_prior"] == 20.0


def test_spike_median_excludes_same_calendar_day() -> None:
    index = pd.to_datetime(["2018-05-01", "2018-05-02", "2018-05-03", "2018-05-04"])
    views = pd.Series([10.0, 10.0, 1000.0, 25.0], index=index)
    flags = calendar_spike_flags(views, lookback=3, mult=2.0)
    assert bool(flags.loc["2018-05-04"]) is True


def test_next_session_not_same_day_return() -> None:
    close = pd.Series(
        [10.0, 11.0, 9.0],
        index=pd.to_datetime(["2018-05-07", "2018-05-08", "2018-05-09"]),
    )
    direction = next_session_direction(close)
    assert bool(direction.loc["2018-05-07"]) is True
    assert bool(direction.loc["2018-05-08"]) is False
    assert pd.isna(direction.loc["2018-05-09"])


def test_count_uses_prior_spike_and_drops_out_sample() -> None:
    prices = pd.DataFrame(
        {"Close": [10.0, 12.0, 8.0]},
        index=pd.to_datetime(["2018-05-05", "2018-05-07", "2024-01-02"]),
    )
    views = pd.Series(
        [10.0, 10.0, 1000.0, 25.0, 25.0, 25.0],
        index=pd.to_datetime(
            [
                "2018-05-01",
                "2018-05-02",
                "2018-05-03",
                "2018-05-04",
                "2018-05-05",
                "2018-05-06",
            ]
        ),
    )
    counts = count_in_sample_spike_next_up(prices, views, lookback=3, mult=2.0)
    assert counts["n_out_in_window"] == 0
    assert counts["n_spike"] == 1
    assert counts["n_up"] == 1
    assert counts["n_down"] == 0
    assert counts["n_scored"] == 1
