---
name: collecting-yahoo-crude
description: Use when downloading WTI crude futures prices, Yahoo Finance CL=F OHLCV, RSI inputs, or in-sample/out-sample price history for LS CRUDE.
---

# Collecting Yahoo Crude

Yahoo Finance is the only programmatic price source. Ticker is `CL=F`.

```python
from ls_crude.data.yahoo import download_ohlcv
prices = download_ohlcv("CL=F", start="2015-01-01")
```

Call `yf.download` with `interval="1d"`, `auto_adjust=True`, `multi_level_index=False`. Flatten MultiIndex columns if a yfinance version still returns them.

## Rules

- Do not scrape Investing.com for prices.
- Do not use random walk or dummy OHLC as a substitute for Yahoo.
- Keep Yahoo build outputs under `research/data/processed/` (gitignored). Web-research dumps go to `research/gathering/raw/` instead.
- After a successful pull, run `add_sample_split` before any model work.

## Common mistakes

- Fitting on dates after 2023-12-31
- Treating `BZ=F` as the primary series without an explicit experiment note
