from __future__ import annotations

from pathlib import Path
from typing import Literal

import pandas as pd

NewsTag = Literal["hormuz", "inflation_policy", "other"]

HORMUZ_KEYWORDS = (
    "hormuz",
    "strait of hormuz",
    "iran",
    "이란",
    "호르무즈",
    "houthi",
    "houthis",
    "red sea",
    "홍해",
    "tanker",
    "유조선",
    "blockade",
    "봉쇄",
    "persian gulf",
    "arabian gulf",
    "이란산",
    "tehran",
)

INFLATION_KEYWORDS = (
    "inflation",
    "인플레이션",
    "물가",
    "cpi",
    "pce",
    "fomc",
    "fed ",
    "federal reserve",
    "연준",
    "금리",
    "rate cut",
    "rate hike",
    "powell",
    "dollar",
    "달러",
    "treasury",
    "국채",
)


def classify_headline(title: str) -> list[NewsTag]:
    text = f" {title.lower()} "
    tags: list[NewsTag] = []
    if any(keyword.lower() in text for keyword in HORMUZ_KEYWORDS):
        tags.append("hormuz")
    if any(keyword.lower() in text for keyword in INFLATION_KEYWORDS):
        tags.append("inflation_policy")
    if not tags:
        tags.append("other")
    return tags


def load_news_csv(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    required = {"published_at", "title"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"News CSV missing columns: {sorted(missing)}")
    out = frame.copy()
    if "url" not in out.columns:
        out["url"] = ""
    if "source" not in out.columns:
        out["source"] = "investing.com"
    out["published_at"] = pd.to_datetime(out["published_at"], errors="coerce")
    out = out.dropna(subset=["published_at", "title"])
    out["published_at"] = out["published_at"].dt.tz_localize(None).dt.normalize()
    out["title"] = out["title"].astype(str).str.strip()
    out["source"] = out["source"].fillna("investing.com").astype(str)
    out["tags"] = out["title"].map(classify_headline)
    return out.loc[:, ["published_at", "title", "url", "source", "tags"]].sort_values(
        "published_at"
    )


def news_to_daily_counts(news: pd.DataFrame) -> pd.DataFrame:
    if news.empty:
        return pd.DataFrame(
            columns=["hormuz_count", "inflation_count", "other_count", "headline_count"]
        )

    rows: list[dict[str, object]] = []
    for _, item in news.iterrows():
        tags = list(item["tags"])
        rows.append(
            {
                "date": pd.Timestamp(item["published_at"]).normalize(),
                "hormuz_count": int("hormuz" in tags),
                "inflation_count": int("inflation_policy" in tags),
                "other_count": int(tags == ["other"]),
                "headline_count": 1,
            }
        )
    daily = pd.DataFrame(rows).groupby("date", as_index=True).sum(numeric_only=True)
    daily.index.name = "date"
    return daily.sort_index()
