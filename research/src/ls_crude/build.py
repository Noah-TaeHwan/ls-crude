from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START, WTI_TICKER
from ls_crude.data.fred import fetch_macro_panel
from ls_crude.data.news import classify_headline, load_news_csv
from ls_crude.data.yahoo import download_ohlcv, fetch_yahoo_news, yahoo_news_to_frame
from ls_crude.features.panel import build_daily_panel
from ls_crude.models.rsi_overlay import rsi_position

ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = ROOT.parent
EVENT_CALENDAR = ROOT / "data" / "event_calendar.csv"
PROCESSED_DIR = ROOT / "data" / "processed"
SNAPSHOT_PATH = REPO_ROOT / "app" / "public" / "baseline-snapshot.json"


def _load_news() -> pd.DataFrame:
    frames = [load_news_csv(EVENT_CALENDAR)]
    try:
        yahoo_items = fetch_yahoo_news("crude oil Hormuz", news_count=20)
        yahoo_items.extend(fetch_yahoo_news("US inflation Federal Reserve", news_count=20))
        yahoo_frame = yahoo_news_to_frame(yahoo_items)
        if not yahoo_frame.empty:
            yahoo_frame["tags"] = yahoo_frame["title"].map(classify_headline)
            frames.append(yahoo_frame.loc[:, ["published_at", "title", "url", "source", "tags"]])
    except Exception as error:  # noqa: BLE001 - live news is optional
        print(f"Yahoo news skipped: {error}")
    news = pd.concat(frames, ignore_index=True)
    news["title_key"] = news["title"].str.lower().str.strip()
    news = news.drop_duplicates(subset=["published_at", "title_key"]).drop(columns=["title_key"])
    return news.sort_values("published_at")


def build_baseline() -> pd.DataFrame:
    prices = download_ohlcv(WTI_TICKER, start=IN_SAMPLE_START)
    news = _load_news()
    try:
        macro = fetch_macro_panel()
    except Exception as error:  # noqa: BLE001 - FRED is optional
        print(f"FRED macro skipped: {error}")
        macro = None
    panel = build_daily_panel(prices, news, macro)
    panel["rsi_position"] = rsi_position(panel["rsi_14"])
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    panel.to_parquet(PROCESSED_DIR / "daily_panel.parquet")
    news.to_csv(PROCESSED_DIR / "news_tagged.csv", index=False)
    _write_snapshot(panel, news)
    return panel


def _write_snapshot(panel: pd.DataFrame, news: pd.DataFrame) -> None:
    cutoff = pd.Timestamp(IN_SAMPLE_END)
    public_panel = panel.loc[(panel.index <= cutoff) & panel["sample"].eq("in")]
    tail = public_panel.tail(180).reset_index()
    tail["date"] = pd.to_datetime(tail["date"]).dt.strftime("%Y-%m-%d")
    public_news = news.loc[pd.to_datetime(news["published_at"]) <= cutoff]
    news_tail = public_news.tail(40).copy()
    news_tail["published_at"] = pd.to_datetime(news_tail["published_at"]).dt.strftime(
        "%Y-%m-%d"
    )
    payload = {
        "ticker": WTI_TICKER,
        "in_sample": {"start": "2015-01-01", "end": "2023-12-31"},
        "out_sample": {"start": "2024-01-01", "end": None},
        "rows": json.loads(tail.to_json(orient="records")),
        "news": json.loads(news_tail.to_json(orient="records")),
    }
    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    built = build_baseline()
    print(f"rows={len(built)} snapshot={SNAPSHOT_PATH}")
