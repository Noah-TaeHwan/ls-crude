# 091-AQSZ — Payne County ambient PM2.5, Stillwater monitor, 1999–2003 (2026-09-10, FROZEN)

**What this is:** a frozen **annual time series** of EPA AQS **ambient
PM2.5 annual means (µg/m³, local conditions)** at the Stillwater monitor
**40-119-0614** (1506 S. MAIN, Stillwater, Payne County, OK). An ambient-air
confounder: **not** VOC tons, **not** TRI pounds, **not** busy, **not** WTI.
It cannot answer "is Cushing busy this week?" and is not tested against WTI,
EIA inventories, or other CFAM tracks.

**Keyless surface that worked (no login):** EPA AirData pre-generated files —
`https://aqs.epa.gov/aqsweb/airdata/aqs_monitors.zip` (monitor universe) and
`annual_conc_by_monitor_{1999..2003}.zip` (concentrations). Raw zips saved
under `research/gathering/raw/091-cushing-aqs/` (gitignored; probe notes in
that folder's README). No AQS API account was needed or used.

| Field | Value |
| --- | --- |
| Run | `20260910T091AQSZ` |
| Geography | Payne County, Oklahoma — Stillwater site 40-119-0614 (**not** Cushing city; no Cushing-city ozone/PM monitor exists in AQS) |
| Pollutant | PM2.5 – Local Conditions (88101), POC 1, 24-HOUR, Daily Mean; one row/year from the `PM25 Annual 1997` standard slice |
| Range | 1999..2003 — 5 annual rows; 2004+ monitor discontinued (missing, not 0) |
| Annual means (µg/m³) | 9.464103, 10.635185, 9.398333, 10.328333, 6.7 (sum **46.525954**, see `receipt.json`) |
| 2003 partial | kept as disclosed: 2 obs, 3%, completeness N (monitor closed 2003-01-09); not filled, not re-annualized |
| Ozone | no 44201 monitor rows for OK/Payne in `aqs_monitors.csv` — PM2.5 only, no ozone invented |
| CSV / JSON | `payne_pm25_stillwater_annual.csv`, `payne_pm25_stillwater_annual.json` |
| TS reader / test | `app/app/lib/cushing-aqs.ts`, `app/tests/cushing-aqs.test.mjs` (3 tests pass) |
| Checksum | 5 rows; mean sum 46.525954; obs counts 39, 54, 60, 60, 2 |

The reader fails closed on a filled year, swapped years, last-value copies,
a Cushing-city/statewide/busy relabel, or any edited mean or obs count.

**Not this:** not Cushing-city air, not ozone, not DEQ VOC, not TRI, not
busy, not a statewide Oklahoma relabel, not a weekly series.
