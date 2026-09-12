# VOC-20260910 — DEQ layer-8 annual VOC series probe (fail-closed: one year is not a series)

Date: 2026-09-10. Target: annual VOC (and HAP if disclosed) time series for the
same 091-WENVZ universe — `City = CUSHING`, `Status = Operating`, facility name
contains `TERMINAL`, `TANK FARM`, or `CRUDE` — from the **same** DEQ GIS layer:

`https://gis.deq.ok.gov/server/rest/services/AirWeb/MapServer/8`
(layer name: "2024 Point Source Emissions").

## What layer 8 actually discloses (saved: `deq-layer8-cushing-evidence.json`)

- Distinct `Year_Emissions_Reported` values present in layer 8: 2020–2024
  (statewide rows; the layer aggregates more than its "2024" name suggests).
- `City='Cushing'` by year (any status): 2020: 4 rows (VOC 0.021 t),
  2023: 8 rows (VOC 15.901 t), 2024: 28 rows (VOC 1,291.256 t). No 2021/2022
  Cushing rows. Total 40 rows (34 Operating + 6 other-status).
- The 2020 Cushing rows are telecom only (AT&T cell/CTL sites); the 2023 rows
  are a meter facility, a repeater, and oil pads — **none** matches the
  TERMINAL / TANK FARM / CRUDE name filter.
- Non-Operating Cushing rows (6): 2023 shutdown pads/tower (VOC 0.0) and 2024
  `CUSHING TANK FARM` (Permanently Shutdown, VOC 0.0) — excluded by the
  `Status = Operating` filter regardless.
- Applying the exact WENVZ filter yields **2024 only: 17 rows, VOC 1,206.389 t,
  HAP 19.715 t** — identical to the frozen `20260908T091WENVZ` excerpt. One
  annual point is not a time series, so no series is frozen here.

## Sibling annual layers seen but NOT used (out of scope for this task)

Read-only probe only (`deq-sibling-layers-terminal-sums.json`, sums not frozen
rows). The same city+status+name filter returns rows on the sibling annual
layers: 2020/layer 5: 17 rows (VOC 1,440.861 t), 2021/layer 7: 18 rows
(1,399.065 t), 2022/layer 6: 18 rows (1,177.399 t), 2023/layer 1: 18 rows
(1,247.220 t). A follow-up task may validate cross-layer field/methodology
parity and freeze a 2020–2024 series from layers 5/7/6/1/8; that merge was
deliberately not done here ("the same layer" scope, no invented years).

## Verdict

`no dated rows` (no multi-year dated series in layer 8). No CSV/JSON frozen, no
TS reader, no test, no chart. Receipt only.
