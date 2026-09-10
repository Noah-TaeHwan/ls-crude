# 091-POPZ — Cushing city annual Census population series, 2010..2024 (2026-09-10)

**What this is:** a frozen **annual time series** of **Cushing city,
Oklahoma resident population** from the Census Population Estimates Program
(PEP) public subcounty CSVs. A slow-moving community-size footprint. It cannot
answer "is Cushing busy this week?" and is not tested against WTI, EIA
inventories, or other CFAM tracks.

**What this is not:** field activity, a weekly busy series, a 0–100 score, a
WTI overlay, or Payne County employment. Place-total rows only (SUMLEV 162,
`Cushing city`, Oklahoma) — not the Payne-county part row, not Cushing
townships elsewhere.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source 2020–2024 | `https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/cities/totals/sub-est2024_40.csv` (`POPESTIMATE2020`…`POPESTIMATE2024`) |
| Source 2010–2019 | `https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/cities/totals/sub-est2019_40.csv` (`POPESTIMATE2010`…`POPESTIMATE2019`, no 2020 overlap) |
| Raw | `research/gathering/raw/091-cushing-pop/` (gitignored) |
| Range | 2010..2024 — 15 rows, no gaps |
| Totals | 7827, 7878, 7873, 7918, 7859, 7874, 7820, 7747, 7682, 7615, 8318, 8336, 8364, 8433, 8444 (checksum **119988**, see `receipt.json`) |
| Vintage break | 2019 (7615, 2010-base vintage) → 2020 (8318, 2020-base vintage) is disclosed as published, not smoothed |

The reader is `app/app/lib/cushing-population.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a county/busy relabel, or
an ACS splice.
