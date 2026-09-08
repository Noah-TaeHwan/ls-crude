"""Anti-USA Geopolitical Tension Index (Factor 050) Data Collection & In-Sample/Out-of-Sample Validation.

Fetches 100% free Wikimedia Pageviews for key US Middle East military & geopolitical conflict articles,
constructs the daily Anti-USA Tension Index, and evaluates its correlation against WTI CL=F volatility & returns.
"""

from __future__ import annotations

import json
import ssl
import time
import urllib.request
from urllib.error import HTTPError
import numpy as np
import pandas as pd

ARTICLES = [
    "United_States_Fifth_Fleet",
    "United_States_Central_Command",
    "Anti-Americanism",
    "U.S._sanctions_against_Iran",
]

USER_AGENT = "ls-crude-research/0.1 (https://github.com/Noah-TaeHwan/ls-crude)"
API_TEMPLATE = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia/all-access/user/{article}/daily/{start}/{end}"
)

def fetch_chunk(article: str, start: pd.Timestamp, end: pd.Timestamp) -> pd.Series | None:
    ctx = ssl.create_default_context()
    url = API_TEMPLATE.format(
        article=article,
        start=start.strftime("%Y%m%d"),
        end=end.strftime("%Y%m%d"),
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        if e.code == 404:
            return None
        raise
    except Exception as e:
        print(f"Error: {e}")
        return None

    items = payload.get("items", [])
    if not items:
        return None
    index = [pd.Timestamp(str(item["timestamp"])[:8]).normalize() for item in items]
    values = [float(item["views"]) for item in items]
    return pd.Series(values, index=index, name=article)

def fetch_article_views(article: str, start: str = "2015-07-01", end: str = "2026-03-01") -> pd.Series:
    chunks: list[pd.Series] = []
    cursor = pd.Timestamp(start).normalize()
    last = pd.Timestamp(end).normalize()
    while cursor <= last:
        year_end = min(pd.Timestamp(year=cursor.year, month=12, day=31), last)
        chunk = fetch_chunk(article, cursor, year_end)
        if chunk is not None and not chunk.empty:
            chunks.append(chunk)
        cursor = year_end + pd.Timedelta(days=1)
        time.sleep(0.1)
    if not chunks:
        return pd.Series(dtype="float64")
    return pd.concat(chunks).sort_index()

def main():
    print("=== Step 1: Collecting Free Wikimedia Pageviews Data ===")
    views_dict = {}
    for art in ARTICLES:
        print(f"Fetching {art}...")
        s = fetch_article_views(art)
        print(f"  -> {len(s)} daily data points ({s.index.min().date()} to {s.index.max().date()})")
        views_dict[art] = s

    views_df = pd.DataFrame(views_dict).fillna(0.0)
    
    # Standardize each component (30-day rolling z-score)
    z_components = (views_df - views_df.rolling(30, min_periods=10).mean()) / views_df.rolling(30, min_periods=10).std().replace(0, np.nan)
    views_df["anti_usa_tension_raw"] = views_df.sum(axis=1)
    views_df["anti_usa_tension_z"] = z_components.mean(axis=1).fillna(0.0)
    
    print("\n=== Step 2: Merging with WTI CL=F Price Data ===")
    clf = pd.read_csv("research/data/clf-daily-2015-2026.csv")
    clf["date"] = pd.to_datetime(clf["date"]).dt.normalize()
    clf = clf.sort_values("date").set_index("date")
    
    # Calculate Future 5-day Realized Volatility (Annualized standard deviation of daily log returns)
    clf["log_ret"] = np.log(clf["Close"] / clf["Close"].shift(1))
    clf["fut_5d_vol"] = clf["log_ret"].shift(-5).rolling(5).std() * np.sqrt(252)
    clf["fut_1d_ret"] = (clf["Close"].shift(-1) - clf["Close"]) / clf["Close"]
    clf["fut_5d_ret"] = (clf["Close"].shift(-5) - clf["Close"]) / clf["Close"]
    
    # Shift signals by T-1 to prevent look-ahead bias (Signal on calendar day T-1 before market open on T)
    aligned_signals = views_df.copy()
    aligned_signals.index = aligned_signals.index + pd.Timedelta(days=1)
    
    merged = clf.join(aligned_signals[["anti_usa_tension_raw", "anti_usa_tension_z"]], how="inner")
    
    # Spike condition: when tension raw views > 2.0x of 20-day median
    median_20d = views_df["anti_usa_tension_raw"].shift(1).rolling(20, min_periods=20).median()
    aligned_spikes = (views_df["anti_usa_tension_raw"] > 2.0 * median_20d)
    aligned_spikes.index = aligned_spikes.index + pd.Timedelta(days=1)
    merged["spike"] = aligned_spikes.reindex(merged.index).fillna(False)
    
    print(f"Total merged trading sessions: {len(merged)}")
    
    print("\n=== Step 3: In-Sample (2015-2023) vs Out-of-Sample (2024+) Validation ===")
    for split_name, split_df in [("In-Sample (2015-2023)", merged[merged["sample"] == "in"]), 
                                 ("Out-of-Sample (2024+)", merged[merged["sample"] == "out"])]:
        valid_vol = split_df.dropna(subset=["anti_usa_tension_z", "fut_5d_vol"])
        r_vol = np.corrcoef(valid_vol["anti_usa_tension_z"], valid_vol["fut_5d_vol"])[0, 1]
        
        valid_ret1 = split_df.dropna(subset=["anti_usa_tension_z", "fut_1d_ret"])
        r_ret1 = np.corrcoef(valid_ret1["anti_usa_tension_z"], valid_ret1["fut_1d_ret"])[0, 1]
        
        valid_ret5 = split_df.dropna(subset=["anti_usa_tension_z", "fut_5d_ret"])
        r_ret5 = np.corrcoef(valid_ret5["anti_usa_tension_z"], valid_ret5["fut_5d_ret"])[0, 1]
        
        n_spikes = split_df["spike"].sum()
        spike_rows = split_df[split_df["spike"]]
        spike_mean_vol = spike_rows["fut_5d_vol"].mean()
        normal_mean_vol = split_df[~split_df["spike"]]["fut_5d_vol"].mean()
        
        print(f"\n[{split_name}] (N = {len(split_df)})")
        print(f"  • Correlation with Next 5-Day Realized Volatility: r = {r_vol:+.4f}")
        print(f"  • Correlation with Next 1-Day Return:              r = {r_ret1:+.4f}")
        print(f"  • Correlation with Next 5-Day Return:              r = {r_ret5:+.4f}")
        print(f"  • Spike Events (Tension > 2.0x 20d median):        {n_spikes} times")
        print(f"    - Avg Volatility after Spike:  {spike_mean_vol:.2%}")
        print(f"    - Avg Volatility normal days:  {normal_mean_vol:.2%}")
        if normal_mean_vol > 0:
            print(f"    - Volatility Ratio (Spike/Normal): {spike_mean_vol/normal_mean_vol:.2f}x")

if __name__ == "__main__":
    main()
