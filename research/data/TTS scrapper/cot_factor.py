# ======================================================================
# CFTC COT FACTOR MODULE -- WTI (NYMEX Crude Oil, Light Sweet)
# ======================================================================
#
# WHAT THIS ADDS
# --------------
# Weekly hedge-fund ("Managed Money") net positioning in WTI futures,
# as reported by the CFTC's Commitment of Traders (COT) report. This is
# one of the highest-quality FREE alternative-data factors for crude
# oil: extreme net-long or net-short positioning by speculators has
# historically been associated with crowded-trade reversals.
#
# DATA SOURCE
# -----------
# CFTC Public Reporting Environment (Socrata API), Disaggregated
# Futures-Only report, dataset id 72hh-3qpy. No API key required.
# Verified live against the real API -- exact field names below are
# taken directly from an actual response, not guessed:
#   report_date_as_yyyy_mm_dd, cftc_contract_market_code,
#   m_money_positions_long_all, m_money_positions_short_all,
#   open_interest_all
#
# CFTC contract code for WTI on NYMEX is 067651. (067411 is a
# DIFFERENT contract -- "CRUDE OIL, LIGHT SWEET-WTI" on ICE FUTURES
# EUROPE -- do not substitute it; oil_v101.py trades CL=F, which
# settles against the NYMEX contract.)
#
# THE PART THAT ACTUALLY MATTERS: PUBLICATION LAG
# -------------------------------------------------
# The COT report's `report_date_as_yyyy_mm_dd` is a TUESDAY -- the date
# positions were AS OF. But the report is not released until the
# FOLLOWING FRIDAY at 3:30pm ET (3 days later). If you naively merge
# this data into a daily price series by date, you are letting the
# backtest "know" Tuesday's positioning on Tuesday itself -- a full 3
# days before it was actually published. That is the exact same
# category of lookahead bias already fixed twice in oil_v101.py, just
# arriving through a new data source instead of price/RSI/VIX.
#
# This module fixes that by explicitly shifting each report's usable
# date to the following Monday (Friday release + a 1-business-day
# safety buffer, since some holiday weeks push the release itself),
# and using a backward merge_asof so each daily bar only ever sees the
# most recently ACTUALLY-PUBLISHED report, never the current week's
# not-yet-released one.
# ======================================================================

from __future__ import annotations
import sys
import subprocess

for package in ["requests", "pandas", "numpy"]:
    try:
        __import__(package)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

import requests
import pandas as pd
import numpy as np


COT_API_URL = "https://publicreporting.cftc.gov/resource/72hh-3qpy.json"
WTI_NYMEX_CFTC_CODE = "067651"   # NYMEX WTI (CL). NOT 067411 (that's ICE Europe WTI).

# How many weeks back to look for the rolling percentile/z-score of net
# positioning. 156 weeks (~3 years) is the convention most commodity
# desks use for COT percentile ranks.
ROLLING_WINDOW_WEEKS = 156


def fetch_wti_cot_history(limit: int = 5000) -> pd.DataFrame:
    """
    Pulls the full available history of WTI (NYMEX) disaggregated COT
    reports. Returns one row per report week, with report_date being
    the Tuesday "as-of" date (NOT yet lagged for publication -- that
    happens in `add_publication_lag`, kept as a separate, explicit step
    so the lookahead-prevention logic is never silently skipped).
    """
    params = {
        "$where": f"cftc_contract_market_code='{WTI_NYMEX_CFTC_CODE}'",
        "$order": "report_date_as_yyyy_mm_dd ASC",
        "$limit": limit,
        "$select": "report_date_as_yyyy_mm_dd,open_interest_all,"
                    "m_money_positions_long_all,m_money_positions_short_all,"
                    "prod_merc_positions_long,prod_merc_positions_short",
    }

    response = requests.get(COT_API_URL, params=params, timeout=30)
    response.raise_for_status()
    rows = response.json()

    if not rows:
        raise RuntimeError(
            "CFTC API returned no rows for WTI (code 067651). The API may be "
            "temporarily down, or the contract code may have changed -- "
            "verify at https://publicreporting.cftc.gov before assuming the "
            "factor is unavailable."
        )

    df = pd.DataFrame(rows)
    df["report_date"] = pd.to_datetime(df["report_date_as_yyyy_mm_dd"]).dt.tz_localize(None)

    numeric_cols = [
        "open_interest_all", "m_money_positions_long_all", "m_money_positions_short_all",
        "prod_merc_positions_long", "prod_merc_positions_short",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.sort_values("report_date").reset_index(drop=True)
    return df[["report_date"] + numeric_cols]


def add_publication_lag(cot_df: pd.DataFrame) -> pd.DataFrame:
    """
    THE IMPORTANT STEP. Converts each report's Tuesday as-of date into
    the date the information actually became available to a trader:
    the following Monday (Friday 3:30pm ET release, plus one full
    business day of buffer for holiday-shifted release schedules).

    `usable_from_date` is what everything downstream must merge on --
    never `report_date` directly.
    """
    cot_df = cot_df.copy()
    # Friday release = report_date (Tuesday) + 3 days.
    release_date = cot_df["report_date"] + pd.Timedelta(days=3)
    # +1 business-day safety buffer beyond the release itself.
    cot_df["usable_from_date"] = release_date + pd.Timedelta(days=3)  # -> the following Monday
    return cot_df


def compute_cot_features(cot_df: pd.DataFrame) -> pd.DataFrame:
    """
    Builds the actual factor columns from raw positioning:
      - net_m_money: Managed Money net position (long - short), in contracts
      - net_m_money_pct_oi: net position as a % of open interest (comparable
        across time, unlike the raw contract count, since open interest has
        grown enormously over the sample)
      - net_m_money_percentile: rolling percentile rank of net_m_money_pct_oi
        over the trailing ROLLING_WINDOW_WEEKS reports -- this is the
        standard "how crowded is this positioning, historically speaking"
        metric. Values near 100 = speculators are about as net-long as
        they've been in ~3 years (crowded long); near 0 = as net-short as
        they've been (crowded short).
    """
    df = cot_df.copy()
    df["net_m_money"] = df["m_money_positions_long_all"] - df["m_money_positions_short_all"]
    df["net_m_money_pct_oi"] = df["net_m_money"] / df["open_interest_all"]

    df["net_m_money_percentile"] = (
        df["net_m_money_pct_oi"]
        .rolling(ROLLING_WINDOW_WEEKS, min_periods=26)  # need at least ~6 months before a percentile means much
        .apply(lambda window: pd.Series(window).rank(pct=True).iloc[-1] * 100, raw=False)
    )

    return df


def merge_cot_into_daily(daily_df: pd.DataFrame, cot_df: pd.DataFrame) -> pd.DataFrame:
    """
    Merges the (already publication-lagged) weekly COT features into a
    daily price DataFrame, using a BACKWARD as-of merge: each daily bar
    gets the most recent COT report whose `usable_from_date` is on or
    before that day -- i.e., only reports that had actually been
    published by that point in time. Never the report for the current,
    not-yet-released week.

    `daily_df` must have a DatetimeIndex (as oil_v101.py's `df` does).
    """
    cot_indexed = cot_df.dropna(subset=["net_m_money_percentile"]).copy()
    cot_indexed = cot_indexed.rename(columns={"usable_from_date": "date"})
    cot_indexed = cot_indexed.sort_values("date")

    daily = daily_df.copy()
    daily["date"] = daily.index

    merged = pd.merge_asof(
        daily.sort_values("date"),
        cot_indexed[["date", "net_m_money", "net_m_money_pct_oi", "net_m_money_percentile"]],
        on="date",
        direction="backward",  # only look BACKWARD in time -- never at a future-dated report
    )

    merged = merged.set_index("date")
    merged.index.name = daily_df.index.name
    return merged


def get_wti_cot_daily_features() -> pd.DataFrame:
    """One-call convenience wrapper: fetch -> lag -> compute features.
    Returns a DataFrame ready to be merged into oil_v101.py's `df` via
    `merge_cot_into_daily`."""
    raw = fetch_wti_cot_history()
    lagged = add_publication_lag(raw)
    featured = compute_cot_features(lagged)
    return featured


if __name__ == "__main__":
    print("Fetching WTI (NYMEX) COT history...")
    cot = get_wti_cot_daily_features()
    print(f"Got {len(cot)} weekly reports, "
          f"{cot['report_date'].min().date()} to {cot['report_date'].max().date()}")
    print("\nMost recent 5 reports:")
    print(cot[["report_date", "usable_from_date", "net_m_money", "net_m_money_pct_oi",
               "net_m_money_percentile"]].tail())
    cot.to_csv("wti_cot_history.csv", index=False)
    print("\nSaved to wti_cot_history.csv")
