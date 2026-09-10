# 091-DRTZ — Payne County weekly US Drought Monitor, 2014-12-30..2026-09-01 (2026-09-10)

**What this is:** a frozen **weekly time series** of U.S. Drought Monitor
traditional cumulative percent-of-area for **Payne County, Oklahoma
(FIPS 40119)** — map-date (`mapDate`) Tuesdays with disclosed `None` and
`D0`–`D4` county-area percents as filed. **A weather/hydrology confounder
for the Cushing desk, explicitly not activity, not busy, never joined
with WTI.**

**What this is not:** Cushing-city drought (the USDM county table has no
city cut — the county label stays honest), GHCN monthly inches
(`20260910T091PRCPZ`), Mesonet OILT daily rain (`20260910T091MESOZ`), a
busy score, tank levels, or a trading signal. Drought moves the field but
does not measure it. Never relabel as busy. Never copy Mesonet rain here —
different source, different provenance.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10 (USDM REST, frozen here 2026-09-10) |
| Source | U.S. Drought Monitor county statistics, keyless REST (`CountyStatistics/GetDroughtSeverityStatisticsByAreaPercent`, `statisticsType=1` traditional) |
| Docs | `https://droughtmonitor.unl.edu/DmData/DataDownload/WebServiceInfo.aspx` |
| County | FIPS `40119`, Payne County, OK — pinned on every raw row; **not** Cushing city |
| Raw | `research/gathering/raw/091-drought-payne/` (gitignored data + kept README; byte-for-byte JSON + CSV cross-check) |
| Range | 2014-12-30 through 2026-09-01, **610** map-date weeks (the week containing 2015-01-01 starts 2014-12-30), all Tuesdays, 7-day steps, zero gaps |
| Missing rule | no missing weeks in range — nothing filled, nothing left missing; a future gap would stay `null` / empty cell, never 0 |
| Fields | `none` + `d0`–`d4` cumulative percent of county area as filed (`d0` = D0-or-worse, …, `d4` = exceptional); `none + d0 = 100`, monotone `d0 ≥ d1 ≥ d2 ≥ d3 ≥ d4` |
| Extremes | 212 drought-free weeks (`d0 = 0`, e.g. 2019-12-03); `d3 = 100` on 2023-02-07; `d4 > 0` only 3 weeks (max 0.03 on 2022-11-08) |
| Checksums | `noneSum100` **2757016**, `d0Sum100` **3342984**, `d1Sum100` **2050380**, `d2Sum100` **1035269**, `d3Sum100` **362456**, `d4Sum100` **5** (sums of `Math.round(v*100)` over disclosed rows) |

The reader is `app/app/lib/cushing-drought.ts`; it fails closed on swapped
FIPS/county, reordered/redated weeks, non-Tuesday or non-7-day steps, range
or monotonicity violations, `none + d0 ≠ 100`, edited values, a
statewide/city relabel, a Mesonet-rain copy (fips/label/source pinned to
Payne USDM), a busy-score relabel, or a WTI mix-in.
