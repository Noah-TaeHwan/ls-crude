# 091-SOILZ — Mesonet OILT Oilton daily soil temperature (SAVG, 10cm), 2015-01-01..2026-09-08 (2026-09-10)

**What this is:** a frozen **dated daily time series** of soil temperature at
Oklahoma Mesonet station `OILT` (Oilton, OK, 36.03,-96.50, station no. 71) —
the nearest keyless Mesonet station to Cushing, OK (35.9849,-96.7645),
**24.3 km** ENE. Field `SAVG`: average temperature under native vegetation
(sod) at **10 cm** depth, °F, per station-local day. **A weather/soil
confounder for the Cushing desk, explicitly not activity, not busy, never
joined with WTI.**

**What this is not:** air temperature (`TMAX`/`TMIN`/`TAVG`, frozen in
`20260910T091MESOZ`), rain inches (`RAIN`, same freeze), bare-soil
`BAVG`/`BMAX`/`BMIN` (same 10 cm depth, not stitched here), a volumetric-water
series (the frozen `.mts` daily rows carry **no** `VW05`/`VW25`/`TR05`
columns — soil moisture is not disclosed in this path), the `CUH`/`KCUH`
airport series, a busy score, or a trading signal. Never relabel as Cushing
city station. Never copy tmax/rain values here.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09/10 (reuses the 141 monthly `.mts` chunks frozen for 091-MESOZ; no re-download) |
| Source | Oklahoma Mesonet public monthly `.mts` daily summaries, keyless HTTP (no login, no interactive map) |
| Source dir | `http://www.mesonet.org/data/public/mesonet/summaries/monthly/mts/` |
| Field docs | Mesonet daily-summaries table: `SAVG` = Average Temperature Under Native Vegetation at 10cm (°F); `SBAD` = errant 15-min obs count that day |
| Station choice | `OILT` Oilton nearest to Cushing (24.3 km); runner-up `PERK` Perkins 25.7 km not stitched — one station, one depth |
| Raw | `research/gathering/raw/091-mesonet-oilt/` (gitignored data + kept README) |
| Range | 2015-01-01 through 2026-09-08, **4269** days, calendar-continuous, no backfill before 2015 |
| End rule | last dated row available at fetch (September 2026 chunk holds Sep 1–8); partial future days absent, never filled |
| Soil | disclosed iff `SBAD == 0` and not a `-996`/`-999` sentinel; **4081** disclosed, **188** missing |
| Missing rule | missing stays `null` / empty cell, never 0; partial-bad days (e.g. 2026-07-07 `SAVG 81.27` with `SBAD 9`) stay missing; whole-station outages (e.g. 2016-02 `-996`) stay missing |
| Checksums | `savgSum100` **25436779** (sum of `Math.round(v*100)` over disclosed rows) |

The reader is `app/app/lib/cushing-mesonet-soil.ts`; it fails closed on
swapped station, reordered/redated periods, filled zeros, sentinel leakage
(`-996`/`-999`), extra days past 2026-09-08, edited values, a tmax/rain copy
(single-field rows), a busy-score relabel, a Cushing-city relabel, or a WTI
mix-in.
