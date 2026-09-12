# 091 Cushing AQS raw set (keyless EPA AirData pre-generated files)

- Universe: `aqs_monitors.zip` → `aqs_monitors.csv` filtered to
  `State Code = 40`, `County Code = 119` (Payne County) → **19 rows**:
  - 0610/0611 TSP + TSP metals (Stillwater, last samples 1970–1986),
  - 0612 TSP + sulfation rate (Cushing, ended 1971-01-01),
  - 0613 TSP (Cushing, ended 1974-09-14),
  - 0614 PM2.5 (88101) + sampler met params 68101–68109 (Stillwater,
    `WEATHER STATION - STILLWATER MESONET SITE`, 1506 S. MAIN,
    36.107274/-97.059479, 1999-01-01..2003-01-09).
- Ozone probe: **no 44201 rows** for 40-119 in the monitors file — no
  ozone series is freezable for Cushing or Payne. Frozen series is PM2.5.
- Concentrations: `annual_conc_by_monitor_{1999..2003}.zip` (all HTTP 200).
  Payne 88101 rows taken from the `PM25 Annual 1997` standard slice only —
  the same means repeat under the 2006/2012/2024 standard slices and the
  daily-mean metric slices, which are excluded to avoid duplicates.
- 2003 is a disclosed partial year (2 obs, 3%, completeness N; monitor
  closed 2003-01-09) — kept as published, not filled, not dropped.
- Files: `aqs_monitors.zip`, `annual_conc_by_monitor_{1999..2003}.zip`.
  Raw zips are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091AQSZ/`](../../../indexes/091-cushing-operations-nowcasting/20260910T091AQSZ/).
- Retrieved 2026-09-10.
