# 091-WQPZ — Cushing/Payne-area WQP ambient pH samples, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated water-quality sample series** — field pH
at WQP monitoring location `IOWATROK_WQX-SND1` (`Sand1`, River/Stream, Iowa
Tribe of Oklahoma, Payne County OK, 35.9565236,-96.9468458, **16.71 km**
from Cushing center 35.9849,-96.7645): 366 dated valued rows on 283 distinct
dates, 2005-09-01..2021-09-17, kept exactly as filed. Ambient water
chemistry: **not** busy, **not** WTI, **not** streamflow cfs, **not**
depth-to-water, **not** CWA last-inspection counts, **not** DMR quantities.

**Keyless surface that worked (no login):** Water Quality Portal REST —
`https://www.waterqualitydata.us/data/Station/search`
(`countrycode=US`, `statecode=US:40`, `countycode=US:40:119` → Payne County
station table, complete) then
`https://www.waterqualitydata.us/data/Result/search`
(`lat=35.9849`, `long=-96.7645`, `within=12.5` miles, `sorted=no` → 62,839
local rows, complete http 200). No scraping of the interactive mapper.

| Field | Value |
| --- | --- |
| Run | `20260910T091WQPZ` |
| Site | `IOWATROK_WQX-SND1` Sand1, Payne County, 16.71 km from Cushing center |
| Characteristic | pH, unit `None` as filed (longest dated local panel: 283 dates; HQ2 pH 280, SND1 DO 277, Cimarron-SH33-Ripley pH 150, local nitrate shorter) |
| Rows | 366 dated valued rows (352 `Field Msr/Obs` + 14 QC field replicates, all `Final`) |
| Range | 2005-09-01..2021-09-17; sparse ambient sampling, missing dates stay missing, never 0-filled |
| As-filed quirks | some dates repeat the same field value under two activity-id conventions (kept, never deduped); one filed `0.0` on 2009-05-05 kept with note, never edited or dropped |
| CSV / JSON | `cushing_wqp_ph.csv`, `cushing_wqp_ph.json` |
| TS reader / test | `app/app/lib/cushing-wqp.ts`, `app/tests/cushing-wqp.test.mjs` (3 tests pass) |
| Checksum | 366 rows; 283 distinct dates; hundredths sum **297220** |

**Failed probes (discarded, documented in `receipt.json`):** `siteids=`
was ignored by the service (returned national ARS rows); one unconstrained
site download truncated at 160 MB / 1700 s; `characteristicName=Nitrate-N`
matches zero local rows (local orgs file it as `Nitrate`).

**Not this:** not Cushing busy, not throughput, not WTI, not USGS discharge
(`07161450` cfs not copied), not well levels, not CWA inspections, not DMR,
not a statewide Oklahoma relabel.
