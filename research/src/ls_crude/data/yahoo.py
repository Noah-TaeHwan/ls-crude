from __future__ import annotations

from typing import Any

import pandas as pd
import yfinance as yf

from ls_crude.config import PRICE_COLUMNS, WTI_TICKER


def _flatten_columns(frame: pd.DataFrame) -> pd.DataFrame:
    if not isinstance(frame.columns, pd.MultiIndex):
        return frame
    flattened = []
    for column in frame.columns:
        if isinstance(column, tuple):
            flattened.append(str(column[0]))
            continue
        flattened.append(str(column))
    copy = frame.copy()
    copy.columns = flattened
    return copy


def download_ohlcv(
    ticker: str = WTI_TICKER,
    start: str = "2015-01-01",
    end: str | None = None,
) -> pd.DataFrame:
    raw = yf.download(
        ticker,
        start=start,
        end=end,
        interval="1d",
        auto_adjust=True,
        progress=False,
        threads=False,
        group_by="column",
        multi_level_index=False,
    )
    if raw is None or raw.empty:
        raise ValueError(f"Yahoo Finance returned no rows for {ticker}")

    frame = _flatten_columns(raw.copy())
    frame.index = pd.to_datetime(frame.index).tz_localize(None)
    frame.index.name = "date"
    missing = [column for column in PRICE_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing Yahoo columns {missing} for {ticker}")
    return frame.loc[:, list(PRICE_COLUMNS)].sort_index()


def fetch_yahoo_news(query: str, news_count: int = 25) -> list[dict[str, Any]]:
    search = yf.Search(query, news_count=news_count)
    news = getattr(search, "news", None)
    if not news:
        return []
    return list(news)


def yahoo_news_to_frame(items: list[dict[str, Any]]) -> pd.DataFrame:
    rows: list[dict[str, str]] = []
    for item in items:
        content = item.get("content") if isinstance(item.get("content"), dict) else {}
        title = str(
            item.get("title")
            or item.get("headline")
            or content.get("title")
            or ""
        ).strip()
        if not title:
            continue
        published = (
            item.get("providerPublishTime")
            or item.get("pubDate")
            or content.get("pubDate")
            or ""
        )
        url = str(
            item.get("link")
            or item.get("url")
            or content.get("canonicalUrl", {}).get("url")
            or ""
        )
        rows.append(
            {
                "published_at": str(published),
                "title": title,
                "url": url,
                "source": "yahoo-finance",
            }
        )
    if not rows:
        return pd.DataFrame(columns=["published_at", "title", "url", "source"])
    frame = pd.DataFrame(rows)
    frame["published_at"] = pd.to_datetime(
        frame["published_at"],
        errors="coerce",
        utc=True,
        format="mixed",
    )
    frame["published_at"] = frame["published_at"].dt.tz_convert(None).dt.normalize()
    return frame.dropna(subset=["published_at", "title"])
