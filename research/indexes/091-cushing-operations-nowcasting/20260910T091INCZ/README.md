# 091-INCZ — Payne County annual BEA CAINC1 personal income, 1969..2024 (2026-09-10)

**What this is:** a frozen **annual time series** of **Payne County,
Oklahoma personal income** from the keyless BEA Regional CAINC1 county file
(GeoFIPS **40119**, LineCode 1). A slow-moving county income footprint that
contains Cushing city. It cannot answer "is Cushing busy this week?" and is
not tested against WTI, EIA inventories, or other CFAM tracks.

**What this is not:** Cushing-city income (BEA publishes counties, not the
city — no city figure is invented from the county total), population
(LineCode 2), per-capita income (LineCode 3), housing units, LAUS employment,
a weekly busy series, a 0–100 score, or a WTI overlay. County row 40119 only
— Oklahoma County 40109 is a different row and is never substituted.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source | `https://apps.bea.gov/regional/zip/CAINC1.zip`, member `CAINC1_OK_1969_2024.csv` (GeoFIPS `"40119"`, `Payne, OK`, LineCode `1`) |
| Raw | `research/gathering/raw/091-bea-cainc1-payne/` (gitignored zip + csv + definition xml; README kept) |
| Range | 1969..2024 — 56 rows, no gaps, no suppressed cells |
| Unit | **Thousands of dollars**, as the file's `Unit` column states (never converted) |
| Totals | 1969=121389 … 2024=4121797 (disclosed sum checksum **85834209**, see `receipt.json`) |

The reader is `app/app/lib/cushing-bea-income.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a Cushing-city/busy
relabel, a 40109 FIPS swap, or a population/per-capita unit swap.
