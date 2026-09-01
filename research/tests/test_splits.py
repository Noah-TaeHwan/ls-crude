from __future__ import annotations

import pandas as pd

from ls_crude.data.splits import add_sample_split, split_frames


def test_in_sample_stops_at_2023() -> None:
    index = pd.date_range("2023-12-29", "2024-01-03", freq="D")
    prices = pd.DataFrame({"Close": range(len(index))}, index=index)
    labeled = add_sample_split(prices)
    assert list(labeled.loc["2023-12-29":"2023-12-31", "sample"].unique()) == ["in"]
    assert list(labeled.loc["2024-01-01":, "sample"].unique()) == ["out"]


def test_split_frames_do_not_overlap() -> None:
    index = pd.date_range("2023-12-01", "2024-02-01", freq="B")
    prices = pd.DataFrame({"Close": range(len(index))}, index=index)
    labeled = add_sample_split(prices)
    in_sample, out_sample = split_frames(labeled)
    overlap = in_sample.index.intersection(out_sample.index)
    assert len(overlap) == 0
    assert in_sample["sample"].eq("in").all()
    assert out_sample["sample"].eq("out").all()
