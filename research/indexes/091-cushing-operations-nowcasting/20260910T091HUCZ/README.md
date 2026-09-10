# 091-HUCZ — Payne County annual housing units series, 2010..2024 (2026-09-10)

**What this is:** a frozen **annual time series** of **Payne County,
Oklahoma housing-unit stock** from the Census Population Estimates Program
(PEP) county housing-unit tables. A slow-moving county housing footprint that
contains Cushing city. It cannot answer "is Cushing busy this week?" and is
not tested against WTI, EIA inventories, or other CFAM tracks.

**What this is not:** Cushing-city housing stock (091-HUZ fail-closed: no
place-level HU rows exist keyless), monthly BPS permit flow, a weekly busy
series, a 0–100 score, a WTI overlay, or Payne County population/employment.
County rows only (`.Payne County, Oklahoma`) — never relabeled as Cushing city.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source 2010–2019 | `https://www2.census.gov/programs-surveys/popest/tables/2010-2019/housing/totals/CO-EST2019-ANNHU-40.xlsx` (July 1 `2010`…`2019`, 2010-base vintage) |
| Source 2020–2024 | `https://www2.census.gov/programs-surveys/popest/tables/2020-2024/housing/totals/CO-EST2024-HU-40.xlsx` (July 1 `2020`…`2024`, 2020-base vintage, no 2020 overlap) |
| Raw | `research/gathering/raw/091-payne-county-housing/` (gitignored xlsx; README kept) |
| Range | 2010..2024 — 15 rows, no gaps |
| Totals | 34011, 34098, 34363, 34594, 35298, 35569, 36033, 36361, 36763, 36859, 36732, 36835, 37058, 37258, 37437 (checksum **539269**, see `receipt.json`) |
| Vintage break | 2019 (36859, 2010-base vintage) → 2020 (36732, 2020-base vintage) is disclosed as published, not smoothed |
| Superseded | `CO-EST2023-HU-40.xlsx` (intermediate 2020-base vintage, kept in raw only; 2020..2023 taken from the newer 2024 vintage) |

The reader is `app/app/lib/cushing-county-housing.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a Cushing-city/busy
relabel, or a population/POPESTIMATE swap.
