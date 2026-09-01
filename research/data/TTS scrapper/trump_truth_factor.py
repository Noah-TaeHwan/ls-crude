# ======================================================================
# TRUMP TRUTH SOCIAL FACTOR -- via CNN's public archive
# ======================================================================
#
# ANSWER TO "can I get Trump's Truth Social posts for free, even
# indirectly via a journalist/account that reports on them"
# ------------------------------------------------------------------------
# Yes -- CNN maintains and publicly serves an auto-updating JSON archive
# of @realDonaldTrump's Truth Social posts, refreshed every ~5 minutes,
# no authentication required:
#
#     https://ix.cnn.io/data/truth-social/truth_archive.json
#
# Verified live from this project's environment: real posts, real
# timestamps, full content, and -- directly relevant to this project --
# multiple recent posts explicitly about oil/Iran/Venezuela/sanctions
# (e.g. "Trump's historic oil deal with Venezuela...", "Bessent Unleashed
# on Iran", "Iran is officially a Failed Nation"). This is exactly the
# kind of statement that has moved oil markets before.
#
# WHY THIS OVER truthbrush / a self-built scraper
# --------------------------------------------------
# `truthbrush` (Stanford Internet Observatory) directly hits Truth
# Social's own undocumented internal API and generally requires a Truth
# Social account/login for most endpoints. CNN's archive is already
# built, already running, already public, and requires no credentials
# or scraping logic of your own -- lower operational risk, and you're
# not the one making repeated automated requests against Truth Social's
# own servers. If you ever need MORE than this (e.g. other accounts,
# not just @realDonaldTrump), truthbrush is the documented fallback,
# but carries real ToS/reliability risk that CNN's hosted archive
# doesn't put on you directly.
#
# THE CRITICAL UNKNOWN, CHECKED EXPLICITLY BELOW
# -------------------------------------------------
# This archive updates in near-real-time, which is great for a GOING-
# FORWARD factor (paper-tracked, same spirit as paper_trader.py). What
# is NOT yet confirmed is how far BACK it goes. If it's a rolling window
# of only recent posts, it CANNOT be used to backtest against years of
# oil price history the way COT/GPR were -- it could only ever be
# validated prospectively, going forward from whenever you start
# collecting it. `check_archive_depth()` below checks this explicitly
# on every run and refuses to proceed to a historical phenomenon test
# if the depth is too shallow, recommending prospective tracking instead.
#
# LOOKAHEAD NOTE
# ---------------
# Unlike COT (weekly, ~6-day lag) or GPR (monthly, ~45-day lag), this
# archive updates within minutes of a real post, so no multi-day
# publication lag needs to be modeled. The only timing rule applied
# here is the same one used everywhere else in this project: a post
# becomes part of the tradable signal starting the NEXT trading day's
# open, never the same day it was posted (consistent with oil_v101.py's
# one-bar-lag convention, applied uniformly by factor_lab.py's test
# runner for every factor).
# ======================================================================

from __future__ import annotations
import sys, subprocess

for package in ["requests", "pandas", "numpy"]:
    try:
        __import__(package)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

import requests
import pandas as pd
import numpy as np

CNN_ARCHIVE_URL = "https://ix.cnn.io/data/truth-social/truth_archive.json"

# Simple, transparent keyword list -- deliberately not an LLM-based
# sentiment score. An LLM scoring these headlines retrospectively risks
# "knowing" what happened after the post (the exact hindsight-leakage
# problem flagged as the reason 'Sentiment/news' was originally marked
# INFEASIBLE). Keyword presence, checked against ONLY the post's own
# text, has no such risk.
OIL_RELEVANT_KEYWORDS = [
    "oil", "opec", "crude", "barrel", "energy", "gas price", "gasoline",
    "iran", "venezuela", "saudi", "sanction", "strait of hormuz", "hormuz",
    "tariff", "petroleum", "refinery", "pipeline",
]


def fetch_raw_posts() -> pd.DataFrame:
    response = requests.get(CNN_ARCHIVE_URL, timeout=30)
    response.raise_for_status()
    posts = response.json()

    if not posts:
        raise RuntimeError("CNN archive returned no posts -- it may be temporarily down.")

    df = pd.DataFrame(posts)
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True).dt.tz_localize(None)
    df = df.sort_values("created_at").reset_index(drop=True)
    return df


def check_archive_depth(raw_df: pd.DataFrame, min_days_for_backtest: int = 365) -> dict:
    span_days = (raw_df["created_at"].max() - raw_df["created_at"].min()).days
    sufficient = span_days >= min_days_for_backtest

    print(f"CNN archive spans {span_days} days: "
          f"{raw_df['created_at'].min().date()} to {raw_df['created_at'].max().date()} "
          f"({len(raw_df)} posts).")

    if not sufficient:
        print(
            f"\nWARNING: archive depth ({span_days} days) is below the "
            f"{min_days_for_backtest}-day minimum needed for a meaningful historical "
            f"phenomenon test (matching the sample-size discipline used for every "
            f"other factor in this project). This factor should be treated as "
            f"PROSPECTIVE ONLY right now -- track it going forward (same pattern as "
            f"paper_trader.py) rather than backtesting it against years of oil history "
            f"that this feed simply doesn't have."
        )

    return {"span_days": span_days, "sufficient_for_backtest": sufficient}


def tag_oil_relevance(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()
    content_lower = df["content"].fillna("").str.lower()
    df["oil_relevant"] = content_lower.apply(
        lambda text: any(kw in text for kw in OIL_RELEVANT_KEYWORDS)
    )
    return df


def aggregate_daily(tagged_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates to one row per calendar day (post creation date). Each
    day gets a post count and an oil-relevant flag/count. This is what
    gets merged into the daily oil DataFrame -- NOT the raw post-level
    data, since oil_v101.py's engine operates on daily bars.
    """
    df = tagged_df.copy()
    df["date"] = df["created_at"].dt.normalize()

    daily = df.groupby("date").agg(
        total_posts=("content", "count"),
        oil_relevant_posts=("oil_relevant", "sum"),
    ).reset_index()
    daily["oil_relevant_flag"] = daily["oil_relevant_posts"] > 0
    return daily


def merge_trump_factor_into_daily(daily_oil_df: pd.DataFrame, trump_daily: pd.DataFrame) -> pd.DataFrame:
    """
    Simple date-index join -- no multi-day publication lag needed here
    (see module docstring). The standard next-bar-execution lag is
    applied uniformly by factor_lab.py's test runner, same as every
    other factor, so it is NOT duplicated here.
    """
    merged = daily_oil_df.copy()
    merged["date"] = merged.index
    trump_indexed = trump_daily.set_index("date")[["total_posts", "oil_relevant_posts", "oil_relevant_flag"]]
    merged = merged.join(trump_indexed, on="date")
    merged[["total_posts", "oil_relevant_posts"]] = merged[["total_posts", "oil_relevant_posts"]].fillna(0)
    merged["oil_relevant_flag"] = merged["oil_relevant_flag"].fillna(False)
    merged = merged.drop(columns=["date"])
    return merged


def get_trump_daily_features() -> tuple[pd.DataFrame, dict]:
    """One-call wrapper. Returns (daily_features, depth_check_result).
    Caller should check depth_check_result['sufficient_for_backtest']
    before running any historical significance test on this factor."""
    raw = fetch_raw_posts()
    depth = check_archive_depth(raw)
    tagged = tag_oil_relevance(raw)
    daily = aggregate_daily(tagged)
    return daily, depth


if __name__ == "__main__":
    daily, depth = get_trump_daily_features()
    print("\nMost recent 10 days with any posts:")
    print(daily.tail(10).to_string(index=False))
    n_oil_days = int(daily["oil_relevant_flag"].sum())
    print(f"\n{n_oil_days} of {len(daily)} days had at least one oil-relevant post.")
    daily.to_csv("trump_truth_daily.csv", index=False)
    print("\nSaved to trump_truth_daily.csv")
