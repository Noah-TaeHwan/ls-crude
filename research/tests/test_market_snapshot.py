from __future__ import annotations

import json
import math
from datetime import UTC, datetime

import pandas as pd
import pytest

from ls_crude import market_snapshot


def _prices() -> pd.DataFrame:
    reference_dates = pd.bdate_range("2015-01-02", periods=30)
    current_dates = pd.bdate_range(end="2026-09-03", periods=25)
    dates = reference_dates.append(current_dates)
    closes = pd.Series(
        [50.0 + index * 0.2 for index in range(len(reference_dates))]
        + [70.0 + index * 0.4 for index in range(len(current_dates))],
        index=dates,
    )
    return pd.DataFrame(
        {
            "Open": closes - 0.25,
            "High": closes + 0.5,
            "Low": closes - 0.5,
            "Close": closes,
            "Volume": 1_000,
        },
        index=dates,
    ).rename_axis("date")


def test_build_market_snapshot_uses_only_completed_new_york_bars() -> None:
    now = datetime(2026, 9, 3, 8, 15, tzinfo=UTC)
    prices = _prices()

    payload = market_snapshot.build_market_snapshot(prices, now=now)

    completed = prices.loc[prices.index < "2026-09-03"]
    returns = completed["Close"].pct_change(fill_method=None)
    rv5 = 100 * ((252 / 5) * returns.pow(2).rolling(5).sum()).pow(0.5)
    rv20 = 100 * ((252 / 20) * returns.pow(2).rolling(20).sum()).pow(0.5)
    reference = rv5.loc["2015-01-01":"2023-12-31"].dropna()
    expected_score = 100 * (reference <= rv5.iloc[-1]).sum() / len(reference)

    assert payload["schemaVersion"] == 1
    assert payload["ticker"] == "CL=F"
    assert payload["interval"] == "1d"
    assert payload["status"] == "ok"
    assert payload["source"] == {
        "provider": "Yahoo Finance",
        "library": "yfinance",
        "autoAdjust": True,
    }
    assert payload["checkedAt"] == "2026-09-03T08:15:00Z"
    assert payload["generatedAt"] == "2026-09-03T08:15:00Z"
    assert payload["asOf"] == "2026-09-02"
    assert payload["freshnessPolicy"] == {
        "maxCheckAgeHours": 36,
        "maxBarAgeDays": 4,
    }
    assert payload["bars"][-1] == {
        "date": "2026-09-02",
        "open": pytest.approx(completed["Open"].iloc[-1]),
        "high": pytest.approx(completed["High"].iloc[-1]),
        "low": pytest.approx(completed["Low"].iloc[-1]),
        "close": pytest.approx(completed["Close"].iloc[-1]),
        "volume": 1_000,
    }
    assert all(row["date"] != "2026-09-03" for row in payload["bars"])
    assert len(payload["bars"]) <= 60
    assert payload["volatility"] == {
        "method": "simple-return-rms",
        "formula": "100 × sqrt((252 / N) × sum(r_t²))",
        "annualization": 252,
        "rv5AnnualizedPct": pytest.approx(float(rv5.iloc[-1])),
        "rv20AnnualizedPct": pytest.approx(float(rv20.iloc[-1])),
        "rv5ReferencePercentile": pytest.approx(float(expected_score)),
        "referenceStart": "2015-01-01",
        "referenceEnd": "2023-12-31",
        "referenceWindowCount": len(reference),
    }
    assert payload["provenance"]["firstDate"] == "2015-01-02"
    assert payload["provenance"]["lastDate"] == "2026-09-02"
    assert payload["provenance"]["rowCount"] == len(completed)
    assert len(payload["provenance"]["contentSha256"]) == 64
    assert payload["provenance"]["contentSha256Scope"] == "all-completed-bars"


def test_realized_volatility_recovers_after_an_old_zero_close() -> None:
    close = pd.Series([100.0] * 5 + [0.0] + [101.0] * 22)

    rv20 = market_snapshot.realized_volatility(close, 20)

    assert pd.isna(rv20.iloc[25])
    assert math.isfinite(float(rv20.iloc[-1]))


def test_current_window_zero_close_makes_snapshot_unavailable() -> None:
    prices = _prices()
    prices.loc[prices.index[-2], "Close"] = 0.0

    with pytest.raises(ValueError, match="Current realized volatility is unavailable"):
        market_snapshot.build_market_snapshot(
            prices,
            now=datetime(2026, 9, 4, 8, 15, tzinfo=UTC),
        )


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (lambda frame: frame.drop(columns="Volume"), "Missing price columns"),
        (
            lambda frame: frame.assign(Close=frame["Close"].mask(frame.index == frame.index[0])),
            "numeric and non-null",
        ),
        (
            lambda frame: frame.assign(High=frame["High"].mask(frame.index == frame.index[0], float("inf"))),
            "must be finite",
        ),
        (lambda frame: pd.concat([frame, frame.iloc[[-1]]]), "must be unique"),
    ],
)
def test_market_snapshot_rejects_invalid_ohlcv(mutate, message: str) -> None:
    with pytest.raises(ValueError, match=message):
        market_snapshot.build_market_snapshot(
            mutate(_prices()),
            now=datetime(2026, 9, 4, 8, 15, tzinfo=UTC),
        )


def test_atomic_writer_keeps_last_good_snapshot_when_replace_fails(
    tmp_path, monkeypatch
) -> None:
    target = tmp_path / "wti-market-snapshot.json"
    target.write_text('{"status":"last-good"}\n', encoding="utf-8")

    def fail_replace(_source, _target) -> None:
        raise OSError("replace failed")

    monkeypatch.setattr(market_snapshot.os, "replace", fail_replace)

    with pytest.raises(OSError, match="replace failed"):
        market_snapshot.write_snapshot_atomic(target, {"status": "ok"})

    assert json.loads(target.read_text(encoding="utf-8")) == {
        "status": "last-good"
    }
    assert list(tmp_path.glob("*.tmp")) == []


def test_atomic_writer_keeps_last_good_snapshot_when_json_is_invalid(tmp_path) -> None:
    target = tmp_path / "wti-market-snapshot.json"
    target.write_text('{"status":"last-good"}\n', encoding="utf-8")

    with pytest.raises(ValueError, match="Out of range float values"):
        market_snapshot.write_snapshot_atomic(target, {"score": float("nan")})

    assert json.loads(target.read_text(encoding="utf-8")) == {
        "status": "last-good"
    }
    assert list(tmp_path.glob("*.tmp")) == []
