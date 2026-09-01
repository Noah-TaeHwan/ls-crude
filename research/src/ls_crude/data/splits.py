from __future__ import annotations

from typing import Literal

import pandas as pd

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START, OUT_SAMPLE_START

SampleLabel = Literal["in", "out"]


def _as_timestamp(value: str | pd.Timestamp) -> pd.Timestamp:
    return pd.Timestamp(value).normalize()


def label_sample(date: pd.Timestamp) -> SampleLabel:
    day = _as_timestamp(date)
    if day <= _as_timestamp(IN_SAMPLE_END):
        return "in"
    return "out"


def add_sample_split(
    frame: pd.DataFrame,
    in_start: str = IN_SAMPLE_START,
    in_end: str = IN_SAMPLE_END,
    out_start: str = OUT_SAMPLE_START,
) -> pd.DataFrame:
    if frame.empty:
        empty = frame.copy()
        empty["sample"] = pd.Series(dtype="object")
        return empty

    out = frame.copy()
    index = pd.to_datetime(out.index).tz_localize(None).normalize()
    out.index = index
    out = out.loc[index >= _as_timestamp(in_start)]
    sample = pd.Series("out", index=out.index, dtype="object")
    in_mask = (out.index >= _as_timestamp(in_start)) & (
        out.index <= _as_timestamp(in_end)
    )
    sample.loc[in_mask] = "in"
    out["sample"] = sample
    if _as_timestamp(out_start) <= _as_timestamp(in_end):
        raise ValueError("out_start must be after in_end")
    return out


def split_frames(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    if "sample" not in frame.columns:
        labeled = add_sample_split(frame)
    else:
        labeled = frame
    in_sample = labeled.loc[labeled["sample"] == "in"].copy()
    out_sample = labeled.loc[labeled["sample"] == "out"].copy()
    return in_sample, out_sample
