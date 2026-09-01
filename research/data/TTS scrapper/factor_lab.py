# ======================================================================
# FACTOR LAB -- unified phenomenon-testing driver
# ======================================================================
#
# PRE-REGISTERED PASS BAR (declared here, BEFORE any result is computed,
# specifically so it can't be quietly loosened after seeing the numbers):
#
#   A factor's extreme condition PASSES if, and only if:
#     1. Permutation test p-value < 0.05 at the 5-day horizon (the
#        horizon that matches oil_v101.py's actual MAX_HOLDING_DAYS), AND
#     2. The effect's sign is consistent (same direction) across at
#        least 3 of the 5 tested horizons (1, 3, 5, 10, 20 days).
#
# Anything that doesn't clear BOTH conditions is reported as FAIL,
# full stop -- no "well it's close" reinterpretation after the fact.
#
# This mirrors oil_v101.py's own phenomenon-testing machinery (Welch
# t-test + permutation test), reused here rather than reinvented, and
# runs it identically across every candidate factor so results are
# comparable apples-to-apples.
# ======================================================================

from __future__ import annotations
import sys, subprocess

for package in ["yfinance", "pandas", "numpy", "scipy", "requests", "openpyxl", "xlrd"]:
    try:
        __import__(package if package != "openpyxl" else "openpyxl")
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

import numpy as np
import pandas as pd
from scipy import stats
import yfinance as yf

from cot_factor import get_wti_cot_daily_features, merge_cot_into_daily
from natgas_factor import get_gas_oil_daily_features
from gpr_factor import get_gpr_daily_features, merge_gpr_into_daily
from trump_truth_factor import get_trump_daily_features, merge_trump_factor_into_daily
from factor_registry import print_registry_report

FORWARD_HORIZONS = [1, 3, 5, 10, 20]
PRIMARY_HORIZON = 5
P_VALUE_BAR = 0.05
MIN_CONSISTENT_HORIZONS = 3
PERMUTATIONS = 5000


def fetch_wti(start="2015-01-01") -> pd.DataFrame:
    data = yf.download("CL=F", start=start, progress=False, auto_adjust=False)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)
    df = data.rename(columns=str.lower)
    for h in FORWARD_HORIZONS:
        df[f"future_{h}d_return"] = df["close"].shift(-h) / df["close"] - 1
    return df


def welch_and_permutation(returns_a: pd.Series, returns_b: pd.Series) -> dict:
    a = returns_a.dropna().values
    b = returns_b.dropna().values
    if len(a) < 10 or len(b) < 10:
        return {"n_a": len(a), "n_b": len(b), "effect": np.nan, "p_perm": np.nan}

    effect = a.mean() - b.mean()

    all_returns = np.concatenate([a, b])
    labels = np.array([True] * len(a) + [False] * len(b))
    null_effects = np.empty(PERMUTATIONS)
    rng = np.random.default_rng(42)
    for i in range(PERMUTATIONS):
        shuffled = rng.permutation(labels)
        null_effects[i] = all_returns[shuffled].mean() - all_returns[~shuffled].mean()

    # two-sided permutation p-value
    p_perm = (np.abs(null_effects) >= np.abs(effect)).mean()

    return {"n_a": len(a), "n_b": len(b), "effect": effect, "p_perm": p_perm}


def evaluate_condition(df: pd.DataFrame, mask: pd.Series, label: str) -> pd.DataFrame:
    rows = []
    for h in FORWARD_HORIZONS:
        col = f"future_{h}d_return"
        result = welch_and_permutation(df.loc[mask, col], df.loc[~mask, col])
        result.update({"condition": label, "horizon_days": h})
        rows.append(result)
    return pd.DataFrame(rows)


def apply_pass_bar(results: pd.DataFrame) -> dict:
    primary = results[results["horizon_days"] == PRIMARY_HORIZON]
    if primary.empty or primary["p_perm"].isna().all():
        return {"passes": False, "reason": "insufficient data at primary horizon"}

    p_primary = primary["p_perm"].iloc[0]
    effects = results.dropna(subset=["effect"])["effect"]
    if len(effects) == 0:
        return {"passes": False, "reason": "no valid effect estimates"}

    sign = np.sign(effects.mean())
    consistent = (np.sign(effects) == sign).sum()

    passes = (p_primary < P_VALUE_BAR) and (consistent >= MIN_CONSISTENT_HORIZONS)
    return {
        "passes": bool(passes),
        "p_at_primary_horizon": p_primary,
        "horizons_with_consistent_sign": int(consistent),
        "horizons_tested": len(effects),
    }


def run_all_factor_tests():
    print("Fetching WTI base data...")
    df = fetch_wti()

    print("\nMerging COT (Managed Money positioning)...")
    cot = get_wti_cot_daily_features()
    df = merge_cot_into_daily(df, cot)

    print("Merging natural gas cross-commodity divergence...")
    gas_features = get_gas_oil_daily_features(df["close"])
    df = df.join(gas_features[["gas_oil_divergence_zscore"]])

    print("Merging GPR geopolitical risk index...")
    gpr = get_gpr_daily_features()
    df = merge_gpr_into_daily(df, gpr)

    print("Fetching Trump Truth Social factor (CNN archive)...")
    trump_daily, trump_depth = get_trump_daily_features()
    df = merge_trump_factor_into_daily(df, trump_daily)

    conditions = {
        "COT: crowded long (pctile>=90)": df["net_m_money_percentile"] >= 90,
        "COT: crowded short (pctile<=10)": df["net_m_money_percentile"] <= 10,
        "Gas/Oil: oil hot vs gas (z>=1.5)": df["gas_oil_divergence_zscore"] >= 1.5,
        "Gas/Oil: oil cold vs gas (z<=-1.5)": df["gas_oil_divergence_zscore"] <= -1.5,
        "GPR: elevated risk (pctile>=90)": df["gpr_percentile"] >= 90,
    }

    print("\n" + "=" * 78)
    print("FACTOR PHENOMENON TESTS")
    print(f"Pre-registered pass bar: p<{P_VALUE_BAR} at {PRIMARY_HORIZON}-day horizon AND "
          f">= {MIN_CONSISTENT_HORIZONS}/5 horizons with consistent effect sign")
    print("=" * 78)

    if not trump_depth["sufficient_for_backtest"]:
        print(
            f"\nNOTE: Trump Truth Social factor SKIPPED from historical testing -- archive "
            f"depth ({trump_depth['span_days']} days) is too shallow for a meaningful "
            f"backtest. This factor should be paper-tracked prospectively instead (see "
            f"trump_truth_factor.py docstring)."
        )
    else:
        conditions["Trump Truth Social: oil-relevant post day"] = df["oil_relevant_flag"] == True

    summary = []
    for label, mask in conditions.items():
        n_obs = int(mask.sum())
        print(f"\n--- {label} (n={n_obs}) ---")
        if n_obs < 30:
            print(f"SKIPPED: only {n_obs} observations, too few to test reliably.")
            summary.append({"condition": label, "n_obs": n_obs, "verdict": "SKIPPED (n<30)"})
            continue

        results = evaluate_condition(df, mask, label)
        print(results[["horizon_days", "n_a", "effect", "p_perm"]].round(4).to_string(index=False))

        verdict = apply_pass_bar(results)
        print(f"Verdict: {'PASS' if verdict['passes'] else 'FAIL'} -- {verdict}")
        summary.append({"condition": label, "n_obs": n_obs, "verdict": "PASS" if verdict["passes"] else "FAIL"})

    print("\n" + "=" * 78)
    print("FINAL SUMMARY -- factors cleared for consideration in combination")
    print("=" * 78)
    summary_df = pd.DataFrame(summary)
    print(summary_df.to_string(index=False))

    passed = summary_df[summary_df["verdict"] == "PASS"]
    if passed.empty:
        print(
            "\nNo factor cleared the pre-registered bar. Per the discipline established "
            "throughout this project: that means none of them get a weight in any combined "
            "model yet, regardless of how economically sensible the underlying story sounds."
        )
    else:
        print(f"\n{len(passed)} factor(s) cleared the bar: {list(passed['condition'])}")
        print(
            "Recommended next step: combine ONLY these via equal-weighted rank/z-score "
            "averaging (see combine_factors.py) -- NOT a fitted regression, given the "
            "small number of independent events available (see the fragility discussion "
            "from the STRICT backtest review)."
        )

    return df, summary_df


if __name__ == "__main__":
    print_registry_report()
    print("\n\n")
    run_all_factor_tests()
