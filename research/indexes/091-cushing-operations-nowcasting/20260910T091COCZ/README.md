# 091-COCZ — Payne County annual PEP population components, 2010..2024 (2026-09-10)

**What this is:** a frozen **annual time series** of **Payne County,
Oklahoma resident-population components of change** (births, deaths, natural
change, international / domestic / net migration, plus the July 1 total) from
the Census Population Estimates Program (PEP) keyless county `co-est` CSVs. A
slow-moving county-demographics footprint. It cannot answer "is Cushing busy
this week?" and is not tested against WTI, EIA inventories, or other CFAM
tracks.

**What this is not:** Cushing-city components (no place-level component rows
exist keyless — never invent city shares from county totals), county housing
units (091-HUCZ), monthly flow, a weekly busy series, a 0–100 score, or a WTI
overlay. County rows only (`STATE 40`, `COUNTY 119`, FIPS 40119) — never
relabeled as Cushing city.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source 2010–2019 | `https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv` (`POPESTIMATE`, `BIRTHS`, `DEATHS`, `NATURALINC`, `INTERNATIONALMIG`, `DOMESTICMIG`, `NETMIG`; 2010 is the partial Apr 1–Jul 1 period, as published) |
| Source 2020–2024 | `https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv` (`POPESTIMATE`, `BIRTHS`, `DEATHS`, `NATURALCHG`, `INTERNATIONALMIG`, `DOMESTICMIG`, `NETMIG`; 2020 is the partial Apr 1–Jun 30 period, as published) |
| Raw | `research/gathering/raw/091-payne-county-components/` (gitignored CSVs; README kept) |
| Range | 2010..2024 — 15 rows, no gaps |
| Checksums | births **11379**, deaths **8193**, net migration **3807** (see `receipt.json`) |
| Vintage break | 2019 (pop 81784, 2010-base vintage) → 2020 (pop 81649, 2020-base vintage) is disclosed as published, not smoothed |
| Arithmetic | every row: births − deaths = natural_change; international + domestic = net_mig, as published |

The reader is `app/app/lib/cushing-pep-components.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a Cushing-city/busy
relabel, or a housing-unit/POPESTIMATE-only swap.
