"""Deep Volatility Factor Validation for Factor 050 (Anti-USA Tension Index).

Tests:
1. Multi-horizon forward realized volatility correlation (3d, 5d, 10d, 20d).
2. Volatility Quintile Classification & Lift (Top 20% / Top 10% High Vol Regime hit rate).
3. Entity-by-entity volatility contribution breakdown (all 8 articles).
4. Long-Volatility Breakout Strategy Simulation (Cumulative Return & Sharpe of volatility trading).
"""

from __future__ import annotations

import json
import ssl
import time
import urllib.request
from urllib.error import HTTPError
import numpy as np
import pandas as pd

import sys
sys.path.insert(0, "research/src")

from ls_crude.data.anti_usa_tension import (
    ALL_ARTICLES,
    CHOKEPOINT_ARTICLES,
    MILITARY_ARTICLES,
    SANCTIONS_ARTICLES,
    USER_AGENT,
    fetch_article_views,
)

def run_deep_volatility_analysis():
    print("==================================================================", flush=True)
    print(" 🔬 Factor 050: Deep Volatility Detection & Regime Validation", flush=True)
    print("==================================================================", flush=True)

    # 1. Collect / Load all 8 articles
    print("\n[Step 1] Collecting 8-entity multi-thematic dataset (2016-2026)...", flush=True)
    views_dict = {}
    for art in ALL_ARTICLES:
        print(f"  Fetching: {art:<32}", end=" ", flush=True)
        t0 = time.time()
        s = fetch_article_views(art, start="2016-01-01", end="2026-02-28")
        print(f"-> {len(s)} days ({time.time()-t0:.1f}s)", flush=True)
        views_dict[art] = s

    views_df = pd.DataFrame(views_dict).fillna(0.0)
    views_df.index = pd.to_datetime(views_df.index).tz_localize(None).normalize()

    # 2. Build sub-indices and composite index
    views_df["mil_raw"] = views_df[[c for c in MILITARY_ARTICLES if c in views_df.columns]].sum(axis=1)
    views_df["chk_raw"] = views_df[[c for c in CHOKEPOINT_ARTICLES if c in views_df.columns]].sum(axis=1)
    views_df["snc_raw"] = views_df[[c for c in SANCTIONS_ARTICLES if c in views_df.columns]].sum(axis=1)
    views_df["total_raw"] = views_df["mil_raw"] + views_df["chk_raw"] + views_df["snc_raw"]

    def _zscore_30(s: pd.Series) -> pd.Series:
        m = s.rolling(30, min_periods=10).mean()
        std = s.rolling(30, min_periods=10).std().replace(0, np.nan)
        return ((s - m) / std).fillna(0.0)

    views_df["z_mil"] = _zscore_30(views_df["mil_raw"])
    views_df["z_chk"] = _zscore_30(views_df["chk_raw"])
    views_df["z_snc"] = _zscore_30(views_df["snc_raw"])
    views_df["z_composite"] = 0.40 * views_df["z_mil"] + 0.35 * views_df["z_chk"] + 0.25 * views_df["z_snc"]

    # 3. Load WTI CL=F prices
    clf = pd.read_csv("research/data/clf-daily-2015-2026.csv")
    clf["date"] = pd.to_datetime(clf["date"]).dt.normalize()
    clf = clf.sort_values("date").set_index("date")

    clf["pct_ret"] = clf["Close"].pct_change()
    clf["abs_ret_1d"] = clf["pct_ret"].shift(-1).abs()
    clf["abs_ret_5d"] = (clf["Close"].shift(-5) / clf["Close"] - 1.0).abs()

    # Future realized volatilities
    for h in [3, 5, 10, 20]:
        clf[f"fut_vol_{h}d"] = clf["pct_ret"].shift(-h).rolling(h).std() * np.sqrt(252)

    # Align T-1 calendar views to trading day T (as-of-safe)
    aligned_signals = views_df.copy()
    aligned_signals.index = aligned_signals.index + pd.Timedelta(days=1)
    merged = clf.join(aligned_signals, how="inner")

    # Spike flag (total_raw > 2.0x 20d median)
    median_20d = views_df["total_raw"].shift(1).rolling(20, min_periods=20).median()
    aligned_spikes = (views_df["total_raw"] > 2.0 * median_20d)
    aligned_spikes.index = aligned_spikes.index + pd.Timedelta(days=1)
    merged["spike_flag"] = aligned_spikes.reindex(merged.index).fillna(False)

    print(f"\n[Step 2] Merged {len(merged)} trading days (IS: 2016-2023, OOS: 2024-2026)", flush=True)

    # =========================================================================
    # Test 1: Horizon Sensitivity Analysis
    # =========================================================================
    print("\n" + "="*65, flush=True)
    print(" 📊 TEST 1: Forward Realized Volatility Horizon Sensitivity", flush=True)
    print("="*65, flush=True)
    print(f"{'Horizon':<12} | {'In-Sample (2016-2023)':<24} | {'Out-of-Sample (2024-2026)':<24}", flush=True)
    print("-" * 65, flush=True)
    for h in [3, 5, 10, 20]:
        col = f"fut_vol_{h}d"
        is_df = merged[merged["sample"] == "in"].dropna(subset=["z_composite", col])
        oos_df = merged[merged["sample"] == "out"].dropna(subset=["z_composite", col])
        
        r_is = np.corrcoef(is_df["z_composite"], is_df[col])[0, 1]
        r_oos = np.corrcoef(oos_df["z_composite"], oos_df[col])[0, 1]
        print(f"Next {h:2d}-Day Vol  | r = {r_is:+.4f} (N={len(is_df):<4})         | r = {r_oos:+.4f} (N={len(oos_df):<4})", flush=True)

    # =========================================================================
    # Test 2: High Volatility Regime Lift & Precision (Top 20% Quintile)
    # =========================================================================
    print("\n" + "="*65, flush=True)
    print(" 🎯 TEST 2: High Volatility Regime Capture Rate (Top 20% Vol Quintile)", flush=True)
    print("="*65, flush=True)
    for split_name, s_code in [("In-Sample (2016-2023)", "in"), ("Out-of-Sample (2024-2026)", "out")]:
        sub = merged[merged["sample"] == s_code].dropna(subset=["fut_vol_5d", "z_composite"])
        top_20_vol_thresh = sub["fut_vol_5d"].quantile(0.80)
        sub["is_top_20_vol"] = sub["fut_vol_5d"] >= top_20_vol_thresh

        base_rate = sub["is_top_20_vol"].mean()
        
        spike_sub = sub[sub["spike_flag"]]
        spike_hit_rate = spike_sub["is_top_20_vol"].mean() if len(spike_sub) > 0 else 0.0
        lift = spike_hit_rate / base_rate if base_rate > 0 else 0.0

        z2_sub = sub[sub["z_composite"] >= 1.5]
        z2_hit_rate = z2_sub["is_top_20_vol"].mean() if len(z2_sub) > 0 else 0.0
        lift_z2 = z2_hit_rate / base_rate if base_rate > 0 else 0.0

        print(f"\n[{split_name}]")
        print(f"  • Base High-Vol Rate (Top 20%):           {base_rate:.1%}")
        print(f"  • Spike Trigger Hit Rate:                 {spike_hit_rate:.1%} (Lift: {lift:.2f}x, N_spikes={len(spike_sub)})")
        print(f"  • Z >= 1.5 Trigger Hit Rate:              {z2_hit_rate:.1%} (Lift: {lift_z2:.2f}x, N_events={len(z2_sub)})")

    # =========================================================================
    # Test 3: Entity-by-Entity Volatility Prediction Breakdown
    # =========================================================================
    print("\n" + "="*65, flush=True)
    print(" 🔍 TEST 3: Entity-by-Entity Volatility Correlation Breakdown", flush=True)
    print("="*65, flush=True)
    print(f"{'Entity Article':<32} | {'IS 5d Vol (r)':<14} | {'OOS 5d Vol (r)':<14}", flush=True)
    print("-" * 65, flush=True)
    for art in ALL_ARTICLES:
        if art not in views_df.columns:
            continue
        art_z = _zscore_30(views_df[art])
        aligned_art = art_z.copy()
        aligned_art.index = aligned_art.index + pd.Timedelta(days=1)
        
        m_art = clf.join(aligned_art.rename("art_z"), how="inner").dropna(subset=["art_z", "fut_vol_5d"])
        is_r = np.corrcoef(m_art[m_art["sample"]=="in"]["art_z"], m_art[m_art["sample"]=="in"]["fut_vol_5d"])[0, 1]
        oos_r = np.corrcoef(m_art[m_art["sample"]=="out"]["art_z"], m_art[m_art["sample"]=="out"]["fut_vol_5d"])[0, 1]
        print(f"{art:<32} | r = {is_r:+.4f}      | r = {oos_r:+.4f}", flush=True)

    # =========================================================================
    # Test 4: Long-Volatility / Straddle Overlay Simulation
    # =========================================================================
    print("\n" + "="*65, flush=True)
    print(" 💰 TEST 4: Long-Volatility Strategy Backtest Simulation", flush=True)
    print(" Rule: Buy 5-day Long Straddle when Spike or Z >= 1.5, otherwise Flat", flush=True)
    print(" Benchmark: Constant Long Straddle (holding straddle every day)", flush=True)
    print("="*65, flush=True)

    # Approx daily straddle return = daily absolute return - daily theta cost (assume ~0.6% daily theta for ATM crude options)
    THETA_DAILY = 0.005  # 0.5% daily theta
    merged["straddle_daily_pnl"] = merged["abs_ret_1d"] - THETA_DAILY

    for s_name, s_code in [("In-Sample (2016-2023)", "in"), ("Out-of-Sample (2024-2026)", "out")]:
        sub = merged[merged["sample"] == s_code].copy()
        
        # Strategy: Hold 5 days after spike
        sub["strat_signal"] = sub["spike_flag"].rolling(5, min_periods=1).max().fillna(0).astype(bool)
        sub["strat_pnl"] = np.where(sub["strat_signal"], sub["straddle_daily_pnl"], 0.0)

        strat_tot_ret = sub["strat_pnl"].sum()
        bench_tot_ret = sub["straddle_daily_pnl"].sum()

        strat_sharpe = (sub["strat_pnl"].mean() / sub["strat_pnl"].std() * np.sqrt(252)) if sub["strat_pnl"].std() > 0 else 0.0
        bench_sharpe = (sub["straddle_daily_pnl"].mean() / sub["straddle_daily_pnl"].std() * np.sqrt(252)) if sub["straddle_daily_pnl"].std() > 0 else 0.0

        print(f"\n[{s_name}]")
        print(f"  • Days Active in Straddle:   {sub['strat_signal'].sum()} / {len(sub)} days ({sub['strat_signal'].mean():.1%})")
        print(f"  • Strategy Cumulative PnL:   {strat_tot_ret:+.2%}")
        print(f"  • Benchmark Constant PnL:    {bench_tot_ret:+.2%}")
        print(f"  • Strategy Sharpe Ratio:     {strat_sharpe:.2f} (vs Benchmark: {bench_sharpe:.2f})")

if __name__ == "__main__":
    run_deep_volatility_analysis()
