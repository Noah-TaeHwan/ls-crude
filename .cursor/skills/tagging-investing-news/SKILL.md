---
name: tagging-investing-news
description: Use when ingesting Investing.com oil headlines, tagging Hormuz or US inflation/Fed policy news, or converting news CSV into LS CRUDE features.
---

# Tagging Investing News

Investing.com CSV is the narrative source of record. Do not scrape the site. Yahoo `Search(...).news` is a recent-headline fallback only.

CSV columns: `published_at,title,url,source`

```python
from ls_crude.data.news import load_news_csv, classify_headline
news = load_news_csv("research/data/event_calendar.csv")
```

Tags:

- `hormuz` — Hormuz, tanker, Red Sea, Iran supply risk
- `inflation_policy` — CPI, Fed, rates, dollar, inflation
- `other`

A headline may have both `hormuz` and `inflation_policy`. Use `other` only when neither matches.

Historical coverage starts from `research/data/event_calendar.csv` plus operator-exported Investing.com rows.
