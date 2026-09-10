# 091-VOCYZ — Cushing city terminal-context annual VOC series, 2020..2024 (2026-09-10)

**What this is:** a frozen **annual time series** of disclosed **VOC (and HAP)
totals** for Cushing-city terminal-like Operating facilities, one vintage DEQ
GIS layer per year (2020→layer 5, 2021→layer 7, 2022→layer 6, 2023→layer 1,
2024→layer 8). Same `City = Cushing` + `Status = Operating` + name-contains
`TERMINAL`/`TANK FARM`/`CRUDE` filter as `20260908T091WENVZ`, applied
identically on every layer. Terminal-context footprint, not AQI, not busy.

**Parity gate (passed, evidence in
`research/gathering/raw/VOCYZ-20260910/README.md`, gitignored):** all five
layers expose identical field names for year (`Year_Emissions_Reported`), city
(`City`), name (`Facility`), status (`Status`), VOC (`VOC_Total_Tons`), and HAP
(`HAP_Tons`). No year is missing a VOC field; no filter fell back. 2024
reproduces the frozen WENVZ checksum exactly: 17 rows, VOC **1206.389** tons,
HAP **19.715** tons.

| Field | Value |
| --- | --- |
| Run | `20260910T091VOCYZ` |
| Geography | Cushing city (`City = Cushing`), terminal-like name filter, `Status = Operating` |
| Range | 2020..2024 — 5 annual rows, no gaps, no filled zeros |
| Annual VOC tons | 1440.861, 1399.065, 1177.399, 1247.220, 1206.389 (checksum **6470.934**, see `receipt.json`) |
| Annual HAP tons | 21.278, 20.770, 21.819, 22.802, 19.715 (sum 106.384) |
| Raw | `research/gathering/raw/VOCYZ-20260910/` (gitignored) |
| Reader | `app/app/lib/cushing-voc.ts` — fails closed on filled years, Agra merge, busy relabel, or 2024 mismatch |

Disclosed-universe notes (same filter, rows as disclosed, not filled): 2020
has no KEYERA WILDHORSE row (17 rows); 2024 has no PLAINS CUSHING TANK FARM
row (17 rows). Counts 17–18 are the disclosed terminal-like universe per
vintage, not a completeness claim for the physical storage system.

**Not this:** not AQI, not real-time emissions, not utilization, not busy, not
a relabel of the frozen 2024 footprint. No value is carried into the 091-W
live widget or CFAM.
