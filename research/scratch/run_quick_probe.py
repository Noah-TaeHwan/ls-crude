import json
import ssl
import time
import urllib.request
from urllib.error import HTTPError
import numpy as np
import pandas as pd

ARTICLES = [
    "United_States_Fifth_Fleet",
    "Anti-Americanism",
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
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        if e.code == 404:
            return None
        raise
    except Exception as e:
        return None

    items = payload.get("items", [])
    if not items:
        return None
    index = [pd.Timestamp(str(item["timestamp"])[:8]).normalize() for item in items]
    values = [float(item["views"]) for item in items]
    return pd.Series(values, index=index, name=article)

def fetch_article_views(article: str, start: str = "2016-01-01", end: str = "2026-02-28") -> pd.Series:
    chunks = []
    cursor = pd.Timestamp(start).normalize()
    last = pd.Timestamp(end).normalize()
    while cursor <= last:
        year_end = min(pd.Timestamp(year=cursor.year, month=12, day=31), last)
        chunk = fetch_chunk(article, cursor, year_end)
        if chunk is not None and not chunk.empty:
            chunks.append(chunk)
        cursor = year_end + pd.Timedelta(days=1)
        time.sleep(0.05)
    if not chunks:
        return pd.Series(dtype="float64")
    return pd.concat(chunks).sort_index()

def main():
    print("=== Step 1: Collecting Wikimedia Pageviews ===", flush=True)
    views_dict = {}
    for art in ARTICLES:
        print(f"Fetching {art}...", end=" ", flush=True)
        t0 = time.time()
        s = fetch_article_views(art)
        print(f"done in {time.time()-t0:.2f}s ({len(s)} days)", flush=True)
        views_dict[art] = s

    views_df = pd.DataFrame(views_dict).fillna(0.0)
    views_df["anti_us_raw"] = views_df.sum(axis=1)
    
    # 30-day rolling z-score
    roll_mean = views_df["anti_us_raw"].rolling(30, min_periods=10).mean()
    roll_std = views_df["anti_us_raw"].rolling(30, min_periods=10).std().replace(0, np.nan)
    views_df["anti_us_z"] = ((views_df["anti_us_raw"] - roll_mean) / roll_std).fillna(0.0)

    print("\n=== Step 2: Merging with WTI CL=F Data ===", flush=True)
    clf = pd.read_csv("research/data/clf-daily-2015-2026.csv")
    clf["date"] = pd.to_datetime(clf["date"]).dt.normalize()
    clf = clf.sort_values("date").set_index("date")

    # Future 5-day realized volatility (using percentage returns)
    clf["ret"] = clf["Close"].pct_change()
    clf["fut_5d_vol"] = clf["ret"].shift(-5).rolling(5).std() * np.sqrt(252)
    clf["fut_1d_ret"] = (clf["Close"].shift(-1) - clf["Close"]) / clf["Close"]
    clf["fut_5d_ret"] = (clf["Close"].shift(-5) - clf["Close"]) / clf["Close"]

    # Align T-1 calendar views to trading day T
    aligned = views_df.copy()
    aligned.index = aligned.index + pd.Timedelta(days=1)
    merged = clf.join(aligned[["anti_us_raw", "anti_us_z"]], how="inner")

    # Spike flag: > 2.0x of 20-day median
    median_20d = views_df["anti_us_raw"].shift(1).rolling(20, min_periods=20).median()
    aligned_spikes = (views_df["anti_us_raw"] > 2.0 * median_20d)
    aligned_spikes.index = aligned_spikes.index + pd.Timedelta(days=1)
    merged["spike"] = aligned_spikes.reindex(merged.index).fillna(False)

    print(f"Total merged sessions: {len(merged)}", flush=True)

    print("\n=== Step 3: Correlation & Spike Validation Results ===", flush=True)
    for split_name, split_df in [("In-Sample (2016-2023)", merged[merged["sample"] == "in"]), 
                                 ("Out-of-Sample (2024-2026)", merged[merged["sample"] == "out"])]:
        valid_vol = split_df.dropna(subset=["anti_us_z", "fut_5d_vol"])
        r_vol = np.corrcoef(valid_vol["anti_us_z"], valid_vol["fut_5d_vol"])[0, 1]

        valid_ret1 = split_df.dropna(subset=["anti_us_z", "fut_1d_ret"])
        r_ret1 = np.corrcoef(valid_ret1["anti_us_z"], valid_ret1["fut_1d_ret"])[0, 1]

        valid_ret5 = split_df.dropna(subset=["anti_us_z", "fut_5d_ret"])
        r_ret5 = np.corrcoef(valid_ret5["anti_us_z"], valid_ret5["fut_5d_ret"])[0, 1]

        n_spikes = int(split_df["spike"].sum())
        spike_rows = split_df[split_df["spike"]]
        spike_mean_vol = spike_rows["fut_5d_vol"].mean()
        normal_mean_vol = split_df[~split_df["spike"]]["fut_5d_vol"].mean()
        vol_ratio = spike_mean_vol / normal_mean_vol if normal_mean_vol > 0 else 0

        # Up direction probability after spike
        spike_up_1d = (spike_rows["fut_1d_ret"] > 0).mean()
        spike_up_5d = (spike_rows["fut_5d_ret"] > 0).mean()

        print(f"\n[{split_name}] (N = {len(split_df)})", flush=True)
        print(f"  * Correlation with Next 5-Day Realized Volatility: r = {r_vol:+.4f}", flush=True)
        print(f"  * Correlation with Next 1-Day Return:              r = {r_ret1:+.4f}", flush=True)
        print(f"  * Correlation with Next 5-Day Return:              r = {r_ret5:+.4f}", flush=True)
        print(f"  * Spike Events Count (>2.0x median):               {n_spikes} days", flush=True)
        print(f"    - Avg Volatility after Spike:  {spike_mean_vol:.2%}", flush=True)
        print(f"    - Avg Volatility normal days:  {normal_mean_vol:.2%}", flush=True)
        print(f"    - Volatility Jump Ratio:       {vol_ratio:.2f}x", flush=True)
        print(f"    - T+1 WTI Up Rate after Spike: {spike_up_1d:.2%}", flush=True)
        print(f"    - T+5 WTI Up Rate after Spike: {spike_up_5d:.2%}", flush=True)

if __name__ == "__main__":
    main()
