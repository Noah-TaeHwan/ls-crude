# ======================================================================
# COMBINE FACTORS -- deliberately NOT a fitted regression
# ======================================================================
#
# Why equal-weight rank/z-score averaging instead of optimizing weights:
#
# The original proposal wanted ~30 free weights fit to data. Given the
# STRICT backtest's own evidence -- 18 signals over a decade, with 100%
# of the profit traced to 5 trades -- the actual number of independent
# "oil regime events" in this dataset is in the single digits. You
# cannot honestly fit 30 (or even 5-6) parameters on that. Equal
# weighting of ONLY the factors that individually passed the
# phenomenon test is a form of shrinkage: it refuses to let the data
# tell a more elaborate story than the sample size can support.
#
# This is intentionally simple. If you later have enough validated,
# passing factors (and enough independent events) that a fitted
# combination seems justified, that decision should be revisited
# explicitly -- not defaulted into.
# ======================================================================

from __future__ import annotations
import pandas as pd
import numpy as np


def combine_passing_factors(df: pd.DataFrame, factor_columns: list[str]) -> pd.Series:
    """
    factor_columns: list of column names in df, each ALREADY on a
    comparable scale (percentile 0-100, or z-score) for a factor that
    passed the phenomenon test. Returns an equal-weighted average
    z-score-standardized composite -- NOT a fitted regression.
    """
    if not factor_columns:
        raise ValueError("No passing factors to combine -- see factor_lab.py output.")

    standardized = []
    for col in factor_columns:
        series = df[col]
        z = (series - series.mean()) / series.std()
        standardized.append(z)

    composite = pd.concat(standardized, axis=1).mean(axis=1)
    composite.name = "composite_factor_score"
    return composite


if __name__ == "__main__":
    print(
        "This module expects a DataFrame with the passing factor columns "
        "already merged in (see factor_lab.py's run_all_factor_tests output). "
        "Example:\n\n"
        "    df, summary = run_all_factor_tests()\n"
        "    passing_cols = [...]  # map summary['condition'] PASS entries to their df columns\n"
        "    composite = combine_passing_factors(df, passing_cols)\n"
    )
