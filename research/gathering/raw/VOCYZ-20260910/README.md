# VOCYZ-20260910 — DEQ sibling-layer 2020–2024 parity probe (raw, gitignored)

Date: 2026-09-09T16:14:41Z (retrieved). User-Agent: `ls-crude-observations/1.0`.
Keyless ArcGIS MapServer: `https://gis.deq.ok.gov/server/rest/services/AirWeb/MapServer`.

## Per-year layer assignment (task spec)

| Year | Layer | Layer name |
| --- | --- | --- |
| 2020 | 5 | 2020 Point Source Emissions |
| 2021 | 7 | 2021 Point Source Emissions |
| 2022 | 6 | 2022 Point Source Emissions |
| 2023 | 1 | 2023 Point Source Emissions |
| 2024 | 8 | 2024 Point Source Emissions |

Layers are cumulative snapshots (layer 8 holds 2020–2024 statewide), so each
year is read from its own vintage layer with an explicit
`Year_Emissions_Reported=<year>` filter — never by trusting the layer name.

## Identical filter on every layer (WENVZ-identical)

`City='Cushing' AND Status='Operating' AND Year_Emissions_Reported=<year>`,
then facility name contains `TERMINAL`, `TANK FARM`, or `CRUDE`
(case-insensitive). No Agra expansion. Files `layer-<L>-year-<Y>-cushing-operating.json`
hold the full unfiltered-by-name Cushing Operating rows per layer-year
(request URL inside each file); `layer-<L>-meta.json` holds the layer schema.

## Field parity (all 5 layers identical for every field this task uses)

year=`Year_Emissions_Reported`, city=`City`, name=`Facility`,
status=`Status`, VOC=`VOC_Total_Tons`, HAP=`HAP_Tons`
(+`Company`, `Latitude`, `Longitude`). Cosmetic-only differences elsewhere:
`SIC` is string on layer 5, double on 7/6/1/8; `PM25_Tons` is string on
layers 5/7, double on 6/1/8. Neither field is used here.

## Result

| Year | Layer | Cushing Operating rows | Terminal-like n | VOC tons | HAP tons |
| --- | --- | --- | --- | --- | --- |
| 2020 | 5 | 34 | 17 | 1440.861 | 21.278 |
| 2021 | 7 | 27 | 18 | 1399.065 | 20.770 |
| 2022 | 6 | 27 | 18 | 1177.399 | 21.819 |
| 2023 | 1 | 31 | 18 | 1247.220 | 22.802 |
| 2024 | 8 | 25 | 17 | 1206.389 | 19.715 |

2024 reproduces the frozen WENVZ checksum exactly (17 rows, VOC 1206.389,
HAP 19.715). Sibling sums independently reproduce the earlier read-only probe
(`research/gathering/raw/VOC-20260910/deq-sibling-layers-terminal-sums.json`).
Disclosed-universe composition notes (same filter, rows as disclosed):
2020 has no KEYERA WILDHORSE row; 2024 has no PLAINS CUSHING TANK FARM row.
Nothing filled, nothing merged from Agra.

Verdict: parity holds on all 5 layer-years → freeze as series.
