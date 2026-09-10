# 091-USGSZ — Cushing/Payne USGS daily streamflow, 1987-10-01..2026-09-09 (2026-09-10)

**What this is:** a frozen **daily time series** of mean streamflow at USGS
NWIS site `07161450` (`Cimarron River near Ripley, OK`, Payne County,
35.9858927,-96.9122504): disclosed daily means in cubic feet per second.
**A hydrology confounder for the Cushing desk, explicitly not activity, not
busy, never joined with WTI, never mixed with GHCN precipitation or NOAA
storm counts.**

**What this is not:** a Cushing-city gauge (no Cushing-named Oklahoma gage
carries public daily discharge — the site service was checked), a statewide
Oklahoma series, a filled or estimated-by-us reconstruction, a busy score, a
worker/truck count, or a trading signal. River flow moves the field but does
not measure it. Never relabel as busy.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T04:55:00Z (USGS Waterservices NWIS DV RDB, keyless HTTPS; frozen here 2026-09-10) |
| Source | USGS Waterservices `dv`, site `07161450`, parameter `00060`, stat `00003` (daily mean) |
| Station | `07161450` Cimarron River near Ripley, OK — nearest Payne County DV gage to Cushing town center (**12.8 km**); Yale `07163300` is 12.9 km but ends 2018-08-20, Perkins `07161000` ends 1991-09-30 |
| Raw | `research/gathering/raw/091-usgs-cushing/` (gitignored RDB + kept README) |
| Range | 1987-10-01 through 2026-09-09, **14224** rows, **zero** missing days in span |
| Missing rule | NWIS publishes one row per day; a missing day would be an absent row, never 0 — nothing was filled |
| Unit | `discharge_cfs` = daily mean discharge in cfs, as filed |
| Approval | `A` approved (12144), `A:e` approved estimate incl. ice effects (1783), `P`/`P:e`/`P:[4]` provisional tail (297) — estimates kept as filed, never smoothed |
| Observed range | min **15.7** cfs, max **137000** cfs on 1993-05-10 |
| Zero-fill check | 0 zero values, 0 negatives in the filed record |
| Checksum | thousandths sum **24894472300** (see `receipt.json`) |

The reader is `app/app/lib/cushing-usgs.ts`; it fails closed on swapped
site, reordered/redated/noncontiguous dates, edited values, filled zeros,
unknown approval codes, a busy-score relabel, or a WTI mix-in.
