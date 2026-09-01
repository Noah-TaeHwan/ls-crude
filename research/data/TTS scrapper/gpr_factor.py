# ======================================================================
# GEOPOLITICAL RISK (GPR) FACTOR -- Caldara & Iacoviello index
# ======================================================================
#
# SOURCE
# ------
# Free, public, monthly index counting geopolitical-tension word
# frequency across major newspapers. Direct file:
#   https://www.matteoiacoviello.com/gpr_files/data_gpr_export.xls
#
# PUBLICATION LAG -- VERIFIED FROM THE SOURCE'S OWN DOCUMENTATION
# ------------------------------------------------------------------
# "The data are updated for each month around the 10th of the
# following month." So the GPR value for, say, March is not known
# until roughly April 10th. This module treats each month's value as
# usable starting the 15th of the following month (10th release date +
# a conservative buffer, since "around the 10th" is not an exact
# commitment and can slip).
#
# HONESTY NOTE ON VERIFICATION
# ------------------------------
# Unlike the CFTC COT API (verified against a live JSON response with
# exact field names confirmed), this sandbox could not verify the
# actual column names inside the .xls file directly -- matteoiacoviello.com
# is not reachable from this environment's network. The parsing below
# is defensive (searches for likely column names rather than assuming
# an exact match) and prints what it finds immediately, specifically so
# you can sanity-check the parse the first time you actually run it
# with real network access, rather than silently trusting it.
#
# CADENCE LIMITATION -- BE HONEST ABOUT WHAT THIS CAN AND CAN'T DO
# --------------------------------------------------------------------
# This is a MONTHLY series feeding a strategy that holds positions for
# ~5 trading days. It can only ever act as a slow regime filter (e.g.
# "only take the STRICT signal when GPR is elevated"), never as a
# timing trigger. Don't expect it to explain day-to-day moves.
# ======================================================================

from __future__ import annotations
import pandas as pd
import numpy as np

GPR_URL = "https://www.matteoiacoviello.com/gpr_files/data_gpr_export.xls"
ROLLING_PERCENTILE_WINDOW_MONTHS = 60  # 5-year lookback for "how elevated is GPR right now"


def fetch_gpr_raw() -> pd.DataFrame:
    """
    Downloads and lightly parses the raw GPR Excel file. Requires
    `openpyxl` or `xlrd` installed (pip install openpyxl xlrd) and a
    live network connection to matteoiacoviello.com.
    """
    raw = pd.read_excel(GPR_URL)
    print("Columns found in the raw GPR file (verify these look right):")
    print(list(raw.columns))
    return raw


def _find_column(columns, candidates: list[str]) -> str:
    lower_map = {c.lower(): c for c in columns}
    for candidate in candidates:
        if candidate.lower() in lower_map:
            return lower_map[candidate.lower()]
    # fallback: substring search
    for c in columns:
        for candidate in candidates:
            if candidate.lower() in c.lower():
                return c
    raise KeyError(
        f"Could not find any of {candidates} among columns {list(columns)}. "
        "The source file's column names may have changed -- open the .xls "
        "manually and update `_find_column` candidates accordingly."
    )


def parse_gpr(raw: pd.DataFrame) -> pd.DataFrame:
    date_col = _find_column(raw.columns, ["month", "date", "Month", "Date"])
    gpr_col = _find_column(raw.columns, ["GPR", "gpr"])

    df = raw[[date_col, gpr_col]].copy()
    df.columns = ["month", "gpr"]
    df["month"] = pd.to_datetime(df["month"])
    df["gpr"] = pd.to_numeric(df["gpr"], errors="coerce")
    df = df.dropna(subset=["gpr"]).sort_values("month").reset_index(drop=True)
    return df


def add_publication_lag(gpr_df: pd.DataFrame) -> pd.DataFrame:
    """Each month's value becomes usable on the 15th of the FOLLOWING
    month (10th documented release + safety buffer)."""
    df = gpr_df.copy()
    next_month = df["month"] + pd.DateOffset(months=1)
    df["usable_from_date"] = next_month.values.astype("datetime64[M]") + pd.Timedelta(days=14)
    return df


def compute_gpr_features(gpr_df: pd.DataFrame) -> pd.DataFrame:
    df = gpr_df.copy()
    df["gpr_percentile"] = (
        df["gpr"]
        .rolling(ROLLING_PERCENTILE_WINDOW_MONTHS, min_periods=24)
        .apply(lambda w: pd.Series(w).rank(pct=True).iloc[-1] * 100, raw=False)
    )
    return df


def merge_gpr_into_daily(daily_df: pd.DataFrame, gpr_df: pd.DataFrame) -> pd.DataFrame:
    """Same backward-merge_asof pattern as cot_factor.py -- each daily
    bar only ever sees a GPR reading that had actually been published
    by that date."""
    gpr_indexed = gpr_df.dropna(subset=["gpr_percentile"]).copy()
    gpr_indexed = gpr_indexed.rename(columns={"usable_from_date": "date"}).sort_values("date")

    daily = daily_df.copy()
    daily["date"] = daily.index

    merged = pd.merge_asof(
        daily.sort_values("date"),
        gpr_indexed[["date", "gpr", "gpr_percentile"]],
        on="date",
        direction="backward",
    )
    merged = merged.set_index("date")
    merged.index.name = daily_df.index.name
    return merged


def get_gpr_daily_features() -> pd.DataFrame:
    raw = fetch_gpr_raw()
    parsed = parse_gpr(raw)
    lagged = add_publication_lag(parsed)
    featured = compute_gpr_features(lagged)
    return featured


if __name__ == "__main__":
    gpr = get_gpr_daily_features()
    print(f"\nParsed {len(gpr)} monthly GPR readings, "
          f"{gpr['month'].min().date()} to {gpr['month'].max().date()}")
    print(gpr.tail())
    gpr.to_csv("gpr_history.csv", index=False)
    print("\nSaved to gpr_history.csv")
