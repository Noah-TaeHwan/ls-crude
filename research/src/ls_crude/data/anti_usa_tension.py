"""Anti-USA Geopolitical Tension Index (Factor 050) Data Module.

Provides multi-entity Wikimedia Pageviews data ingestion, rolling standardization,
co-occurrence spike detection, and as-of-safe (D-1) trading session alignment.
"""

from __future__ import annotations

import json
import ssl
import time
import urllib.request
from urllib.error import HTTPError
import numpy as np
import pandas as pd

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START, OUT_SAMPLE_START

# Core 8-entity multi-thematic basket
MILITARY_ARTICLES = (
    "United_States_Fifth_Fleet",
    "United_States_Central_Command",
    "Operation_Prosperity_Guardian",
)

CHOKEPOINT_ARTICLES = (
    "Strait_of_Hormuz",
    "Bab-el-Mandeb",
    "Crisis_in_the_Red_Sea",
)

SANCTIONS_ARTICLES = (
    "Anti-Americanism",
    "U.S._sanctions_against_Iran",
)

ALL_ARTICLES = MILITARY_ARTICLES + CHOKEPOINT_ARTICLES + SANCTIONS_ARTICLES

USER_AGENT = "ls-crude-research/0.1 (https://github.com/Noah-TaeHwan/ls-crude)"
API_TEMPLATE = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia/all-access/user/{article}/daily/{start}/{end}"
)

SPIKE_LOOKBACK_DAYS = 20
SPIKE_MULT = 2.0


def fetch_article_chunk(
    article: str,
    start: pd.Timestamp,
    end: pd.Timestamp,
    timeout: int = 15,
) -> pd.Series | None:
    """Fetch daily views for a single article in a given date range."""
    ctx = ssl.create_default_context()
    url = API_TEMPLATE.format(
        article=article,
        start=start.strftime("%Y%m%d"),
        end=end.strftime("%Y%m%d"),
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        if e.code == 404:
            return None
        raise
    except Exception:
        return None

    items = payload.get("items", [])
    if not items:
        return None
    index = [pd.Timestamp(str(item["timestamp"])[:8]).normalize() for item in items]
    values = [float(item["views"]) for item in items]
    return pd.Series(values, index=index, name=article)


def fetch_article_views(
    article: str,
    start: str = "2016-01-01",
    end: str = "2026-03-01",
) -> pd.Series:
    """Fetch all daily views for an article across multiple years with pacing."""
    chunks: list[pd.Series] = []
    cursor = pd.Timestamp(start).normalize()
    last = pd.Timestamp(end).normalize()
    while cursor <= last:
        year_end = min(pd.Timestamp(year=cursor.year, month=12, day=31), last)
        chunk = fetch_article_chunk(article, cursor, year_end)
        if chunk is not None and not chunk.empty:
            chunks.append(chunk)
        cursor = year_end + pd.Timedelta(days=1)
        time.sleep(0.05)
    if not chunks:
        return pd.Series(dtype="float64")
    return pd.concat(chunks).sort_index()


def build_anti_usa_tension_frame(views_by_article: dict[str, pd.Series]) -> pd.DataFrame:
    """Aggregate multi-entity pageviews into standardized thematic Z-scores and overall index."""
    if not views_by_article:
        return pd.DataFrame(
            columns=["anti_usa_raw", "z_military", "z_chokepoint", "z_sanctions", "anti_usa_z"]
        )

    df = pd.DataFrame(views_by_article).fillna(0.0)
    df.index = pd.to_datetime(df.index).tz_localize(None).normalize()
    df = df.sort_index()

    # Thematic group raw sums
    mil_cols = [c for c in MILITARY_ARTICLES if c in df.columns]
    chk_cols = [c for c in CHOKEPOINT_ARTICLES if c in df.columns]
    snc_cols = [c for c in SANCTIONS_ARTICLES if c in df.columns]

    df["mil_raw"] = df[mil_cols].sum(axis=1) if mil_cols else 0.0
    df["chk_raw"] = df[chk_cols].sum(axis=1) if chk_cols else 0.0
    df["snc_raw"] = df[snc_cols].sum(axis=1) if snc_cols else 0.0
    df["anti_usa_raw"] = df["mil_raw"] + df["chk_raw"] + df["snc_raw"]

    # 30-day rolling Z-scores
    def _rolling_z(s: pd.Series, window: int = 30) -> pd.Series:
        mean = s.rolling(window, min_periods=10).mean()
        std = s.rolling(window, min_periods=10).std().replace(0, np.nan)
        return ((s - mean) / std).fillna(0.0)

    df["z_military"] = _rolling_z(df["mil_raw"])
    df["z_chokepoint"] = _rolling_z(df["chk_raw"])
    df["z_sanctions"] = _rolling_z(df["snc_raw"])

    # Composite Z-score (weighted average of themes)
    df["anti_usa_z"] = (
        0.40 * df["z_military"]
        + 0.35 * df["z_chokepoint"]
        + 0.25 * df["z_sanctions"]
    )
    return df


def detect_tension_spikes(
    tension_raw: pd.Series,
    lookback: int = SPIKE_LOOKBACK_DAYS,
    mult: float = SPIKE_MULT,
) -> pd.Series:
    """Spike flag: Day D views > mult * rolling median of lookback days (excluding day D)."""
    s = tension_raw.copy()
    s.index = pd.to_datetime(s.index).tz_localize(None).normalize()
    baseline = s.shift(1).rolling(lookback, min_periods=lookback).median()
    return s > (mult * baseline)


def attach_anti_usa_signals_to_prices(
    prices: pd.DataFrame,
    tension_df: pd.DataFrame,
) -> pd.DataFrame:
    """Attach T-1 calendar signals to trading day T prices (prevents look-ahead bias)."""
    if prices.empty or tension_df.empty:
        out = prices.copy()
        out["anti_usa_z_prior"] = pd.Series(dtype="float64")
        out["anti_usa_spike_prior"] = pd.Series(dtype="boolean")
        return out

    out = prices.copy()
    out.index = pd.to_datetime(out.index).tz_localize(None).normalize()

    t_df = tension_df.copy()
    t_df.index = pd.to_datetime(t_df.index).tz_localize(None).normalize()

    # Calculate spike on calendar dates
    spikes = detect_tension_spikes(t_df["anti_usa_raw"])

    # Align T-1 calendar day to trading day T
    prior_days = out.index - pd.Timedelta(days=1)
    out["anti_usa_z_prior"] = t_df["anti_usa_z"].reindex(prior_days).to_numpy()
    out["anti_usa_spike_prior"] = spikes.reindex(prior_days).fillna(False).to_numpy()
    return out
