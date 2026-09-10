# 091-FRA-Z — FRA Cushing highway-rail crossing incident dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated event list** of Federal Railroad
Administration highway-rail crossing incidents (Form 57) whose filed city is
Cushing, Oklahoma — 3 unique incidents, 1976-10-15..1982-05-11, all reported
by `ATSF`. This is a rail safety log: **not** throughput, **not** busy,
**not** WTI, **not** PHMSA.

**Keyless surface that worked (no login):** USDOT DataHub Socrata mirror of
FRA Office of Safety source data —
`https://datahub.transportation.gov/resource/7wn6-i5b9.json`
("Highway-Rail Grade Crossing Incident Data (Form 57)", FRA Safe Team).
Raw saved under `research/gathering/raw/FRA-20260910/` (gitignored; probe
notes in that folder's README). `railroads.dot.gov` data-download pages
return 403 to non-browser clients, so the DataHub Socrata mirror is the
frozen source; it is the same FRA safety source file.

| Field | Value |
| --- | --- |
| Run | `20260910T091FRAZ` |
| Geography | Cushing, Oklahoma (`CITYNAME=CUSHING` as filed + `statecode=40`) |
| Form | `57` only (highway-rail crossing incidents) |
| Rows | 3 dated incidents (one row per `reportkey`, no duplicates) |
| Date range | 1976-10-15 .. 1982-05-11 (`date` date part; `incidentyear`/`incidentmonth` agree; zero empty dates) |
| Killed / injured | 0 / 1 across all 3 rows (as filed: `totalkilledform57`, `totalinjuredform57`; Form 55A totals agree) |
| Narratives | Absent (null) for all 3 rows in this Socrata slice — date + highway user carry the rows |
| Form 54 | 0 Cushing rows (no city field; zero `station` like Cushing in any state) — Form 57 only |
| CSV / JSON | `cushing_fra_incidents.csv`, `cushing_fra_incidents.json` |
| TS reader / test | `app/app/lib/cushing-fra.ts`, `app/tests/cushing-fra.test.mjs` (3 tests pass) |
| Checksum | 3 rows; killed sum 0; injured sum 1 |

**Filed-data quirks (kept, not relabeled):** two rows file
`CITYNAME=CUSHING` with county `PAWNEE` (reportkeys `ATSF24106210…`,
`ATSF140280206…`) — their `neareststation=CUSHING` and crossing IDs sit on
the Cushing area, so they stay, mirroring the PHMSA-Z quirk rule. Missing
years stay missing; no zeros are filled.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not PHMSA. Excluded by filed-city rule and
documented here, not merged: one `neareststation=CUSHING` row filed under
city `QUAY`, Osage county (1975-01-09 `ATSF7015305…`); seven null-city Payne
County rows whose stations are Yale/Stillwater/Pawnee; one Form 54 Payne row
with station `STILWELL` (a different city, county misfiled).
