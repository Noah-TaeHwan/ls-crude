# 091-GWZ — Cushing/Payne USGS daily groundwater, 2017-06-29..2018-10-22 (2026-09-09)

**What this is:** a frozen **daily time series** of mean depth to water at USGS
NWIS well `360339096450201` (`18N-05E-03 DDA 1 Cimarron3`, Payne County,
36.06092778,-96.750675): disclosed daily means in feet below land surface.
**A hydrology confounder for the Cushing desk, explicitly not activity, not
busy, never joined with WTI, never mixed with streamflow cfs, GHCN
precipitation, or NOAA storm counts.**

**What this is not:** a Cushing-named well (no Cushing-named well exists —
station names are PLSS; `CUSHING` appears only as the topo quad name), a
statewide Oklahoma series, a filled or estimated-by-us reconstruction, a busy
score, a worker/truck count, a trading signal, or streamflow discharge. Deeper
water moves the field but does not measure it. Never relabel as busy.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T21:14:00Z (USGS Waterservices NWIS DV RDB, keyless HTTPS; frozen here 2026-09-09) |
| Source | USGS Waterservices `dv`, site `360339096450201`, parameter `72019`, stat `00003` (daily mean depth to water) |
| Station | `360339096450201` 18N-05E-03 DDA 1 Cimarron3 — nearest Payne County GW well with a DV series to Cushing town center (**8.7 km**); nearer wells carry no DV series; legacy `gwlevels` API is decommissioned (301) |
| Raw | `research/gathering/raw/091-usgs-gw-cushing/` (gitignored RDB + kept README) |
| Range | 2017-06-29 through 2018-10-22, **481** rows, **zero** missing days in span |
| Missing rule | NWIS publishes one row per day; a missing day would be an absent row, never 0 — nothing was filled |
| Unit | `depth_to_water_ft` = daily mean depth to water in feet below land surface, as filed |
| Approval | `A` approved (479), `A:[4]` approved with remark flag (2) — kept as filed, never smoothed |
| Observed range | min **5.73** ft, max **7.74** ft (larger = deeper water table) |
| Zero-fill check | 0 zero values, 0 negatives in the filed record |
| Checksum | hundredths sum **347450** (see `receipt.json`) |

The reader is `app/app/lib/cushing-usgs-gw.ts`; it fails closed on swapped
site, reordered/redated/noncontiguous dates, edited values, filled zeros,
unknown approval codes, a busy-score relabel, a streamflow mix-in, or a WTI
mix-in.
