# 091-MESOZ — Mesonet nearest-Cushing daily weather (OILT Oilton), 2015-01-01..2026-09-08 (2026-09-10)

**What this is:** a frozen **daily time series** of weather at Oklahoma
Mesonet station `OILT` (Oilton, OK, 36.03,-96.50, station no. 71) — the
nearest keyless Mesonet station to Cushing, OK (35.9849,-96.7645), **24.3 km**
ENE. Disclosed daily max/min/mean air temperature °F and daily rain inches
per station-local day. **A weather confounder for the Cushing desk,
explicitly not activity, not busy, never joined with WTI.**

**What this is not:** the `CUH`/`KCUH` airport ASOS series (IEM `OK_ASOS`,
frozen in `20260910T091KCUHZ`), the GHCN monthly precip series
(`20260910T091PRCPZ`), a busy score, a worker/truck count, tank levels, or a
trading signal. Rain or heat moves the field but does not measure it. Never
relabel as busy. Never copy KCUH values here — different station, different
gauge, different provenance.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09/10 (141 monthly `.mts` chunks; frozen here 2026-09-10) |
| Source | Oklahoma Mesonet public monthly `.mts` daily summaries, keyless HTTP (no login, no interactive map) |
| Source dir | `http://www.mesonet.org/data/public/mesonet/summaries/monthly/mts/` |
| Station choice | `OILT` Oilton nearest to Cushing (24.3 km); runner-up `PERK` Perkins 25.7 km not stitched — one station, one series |
| Station table | `station-table-excerpt.txt` (STID/NAME/LAT/LON snapshot 2026-09-09; station no. 71; full `current.csv.txt` not kept) |
| Raw | `research/gathering/raw/091-mesonet-oilt/` (gitignored data + kept README) |
| Range | 2015-01-01 through 2026-09-08, **4269** days, calendar-continuous, no backfill before 2015 |
| End rule | last dated row available at fetch (September 2026 chunk holds Sep 1–8); partial future days absent, never filled |
| Temps | disclosed iff `TBAD == 0` and not a `-996`/`-999` sentinel; **4159** disclosed, **110** missing |
| Rain | disclosed iff `RBAD == 0` and not a `-996`/`-999` sentinel; **4142** disclosed (incl. observed `0.00` dry), **127** missing |
| Missing rule | missing stays `null` / empty cell, never 0; whole-station outage days (e.g. 2016-02 `-996`) stay missing |
| Cross-check | `.mts` daily rows equal the all-station `daily.mdf` OILT row (fixed-width parse; e.g. 2015-01-04: 35.97/13.68/21.45 both paths; 2026-09-01: 102.54/70.12 both paths) |
| Checksums | `tmaxSum100` **30206129**, `tminSum100` **20148358**, `tavgSum100` **25138419**, `rainSum100` **48232** (sums of `Math.round(v*100)` over disclosed rows) |

The reader is `app/app/lib/cushing-mesonet.ts`; it fails closed on swapped
station, reordered/redated periods, filled zeros, sentinel leakage
(`-996`/`-999`), extra days past 2026-09-08, edited values, a KCUH copy
(station/label/source pinned to OILT), a busy-score relabel, or a WTI mix-in.
