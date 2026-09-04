from __future__ import annotations

import pandas as pd
import pytest

from ls_crude.data.anti_usa_tension import (
    attach_anti_usa_signals_to_prices,
    build_anti_usa_tension_frame,
    detect_tension_spikes,
)


def test_build_frame_with_empty_input() -> None:
    df = build_anti_usa_tension_frame({})
    assert "anti_usa_raw" in df.columns
    assert "anti_usa_z" in df.columns
    assert len(df) == 0


def test_build_frame_aggregates_thematic_subgroups() -> None:
    dates = pd.date_range("2023-01-01", "2023-02-15", freq="D")
    sample_views = {
        "United_States_Fifth_Fleet": pd.Series(100.0, index=dates),
        "Strait_of_Hormuz": pd.Series(200.0, index=dates),
        "Anti-Americanism": pd.Series(50.0, index=dates),
    }
    df = build_anti_usa_tension_frame(sample_views)
    assert len(df) == len(dates)
    assert (df["anti_usa_raw"] == 350.0).all()
    assert "z_military" in df.columns
    assert "z_chokepoint" in df.columns
    assert "z_sanctions" in df.columns
    assert "anti_usa_z" in df.columns


def test_detect_tension_spikes_excludes_day_d() -> None:
    dates = pd.date_range("2023-01-01", "2023-01-25", freq="D")
    # 20 days of baseline (100 views), day 21 spikes to 1000
    values = [100.0] * 20 + [1000.0] + [100.0] * 4
    s = pd.Series(values, index=dates)
    spikes = detect_tension_spikes(s, lookback=20, mult=2.0)
    assert bool(spikes.iloc[20]) is True
    assert bool(spikes.iloc[0]) is False
    assert bool(spikes.iloc[19]) is False


def test_attach_signals_uses_prior_calendar_day() -> None:
    # Trading days: Monday 2023-05-08, Tuesday 2023-05-09
    prices = pd.DataFrame(
        {"Close": [70.0, 72.0]},
        index=pd.to_datetime(["2023-05-08", "2023-05-09"]),
    )
    # Calendar days include weekend
    cal_dates = pd.to_datetime(["2023-05-06", "2023-05-07", "2023-05-08"])
    tension_df = pd.DataFrame(
        {
            "anti_usa_raw": [100.0, 500.0, 100.0],
            "anti_usa_z": [0.2, 2.5, 0.1],
        },
        index=cal_dates,
    )

    attached = attach_anti_usa_signals_to_prices(prices, tension_df)

    # Monday May 8 trading session must see Sunday May 7 signal (z=2.5)
    assert attached.loc["2023-05-08", "anti_usa_z_prior"] == 2.5
    # Tuesday May 9 trading session must see Monday May 8 signal (z=0.1)
    assert attached.loc["2023-05-09", "anti_usa_z_prior"] == 0.1
