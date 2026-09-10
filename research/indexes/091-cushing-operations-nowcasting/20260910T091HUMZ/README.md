# 091-HUMZ — Mesonet OILT Oilton daily mean relative humidity (HAVG), 2015-01-01..2026-09-08 (2026-09-10)

**What this is:** a frozen **dated daily time series** of mean relative humidity at
Oklahoma Mesonet station `OILT` (Oilton, OK, 36.03,-96.50, station no. 71) —
the nearest keyless Mesonet station to Cushing, OK (35.9849,-96.7645),
**24.3 km** ENE. Field `HAVG`: daily mean relative humidity (%), with `HMAX`/
`HMIN` daily extremes in the same filed row but not stitched here. Per
station-local day. **A weather confounder for the Cushing desk, explicitly not
activity, not busy, never joined with WTI.**

**What this is not:** air temperature (`TMAX`/`TMIN`/`TAVG`, frozen in
`20260910T091MESOZ`), rain inches (`RAIN`, same freeze), soil temperature
(`SAVG` at 10 cm under sod, frozen in `20260910T091SOILZ`), the `CUH`/`KCUH`
airport series, a busy score, or a trading signal. Never relabel as Cushing
city station. Never copy tmax/rain/SAVG values here.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09/10 (reuses the 141 monthly `.mts` chunks frozen for 091-MESOZ; no re-download) |
| Source | Oklahoma Mesonet public monthly `.mts` daily summaries, keyless HTTP (no login, no interactive map) |
| Source dir | `http://www.mesonet.org/data/public/mesonet/summaries/monthly/mts/` |
| Field docs | Mesonet daily-summaries table: `HAVG` = Average Relative Humidity (%); `HBAD` = errant 15-min obs count that day |
| Station choice | `OILT` Oilton nearest to Cushing (24.3 km); runner-up `PERK` Perkins 25.7 km not stitched — one station, one field |
| Raw | `research/gathering/raw/091-mesonet-oilt/` (gitignored data + kept README) |
| Range | 2015-01-01 through 2026-09-08, **4269** days, calendar-continuous, no backfill before 2015 |
| End rule | last dated row available at fetch (September 2026 chunk holds Sep 1–8); partial future days absent, never filled |
| Humidity | disclosed iff `HBAD == 0` and not a `-996`/`-999` sentinel; **4155** disclosed, **114** missing |
| Missing rule | missing stays `null` / empty cell, never 0; partial-bad days (e.g. 2026-07-07 `HAVG 77.02` with `HBAD 25`) stay missing; whole-station outages (e.g. 2016-02 `-996`) stay missing; no disclosed `0.00` sentinel-fill occurred (no `HBAD == 0` sentinel rows) |
| Checksums | `havgSum100` **29276766** (sum of `Math.round(v*100)` over disclosed rows) |

The reader is `app/app/lib/cushing-mesonet-humidity.ts`; it fails closed on
swapped station, reordered/redated periods, filled zeros, sentinel leakage
(`-996`/`-999`), extra days past 2026-09-08, edited values, a tmax/rain/SAVG copy
(single-field rows), a busy-score relabel, a Cushing-city relabel, or a WTI
mix-in.
