# 091-NHTSA-Z — FMCSA Cushing filed-city crash dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated crash list** of commercial motor vehicle
crashes whose filed city is Cushing, Oklahoma — 129 unique crashes
(136 reports), 1993-01-27..2025-10-06. This is a traffic-safety log:
**not** busy, **not** WTI, **not** AADT, **not** FARS fatalities.

**Keyless surface that worked (no login):** USDOT Socrata `aayw-vxb3`
("Crash File", FMCSA state police crash reports involving motor carriers),
queried keyless:
`?$where=state='OK' AND upper(city)='CUSHING'` → 136 report rows.
Raw saved under `research/gathering/raw/NHTSA-20260910/` (gitignored; probe
notes in that folder's README). No tabular keyless NHTSA FARS/CISS surface
exists (all Socrata FARS assets are href links; FARS FTP DNS-dead;
CrashAPI/CDAN return 403), so the open FMCSA crash table is the frozen
source — labeled as what it is, not relabeled as FARS.

| Field | Value |
| --- | --- |
| Run | `20260910T091NHTSAZ` |
| Geography | Cushing, Oklahoma (`CITY=CUSHING` as filed + `state=OK`) |
| Scope | Commercial motor vehicle crashes only (FMCSA); not all crashes, not FARS |
| Rows | 129 dated crashes (one row per `REPORT_NUMBER`; 7 multi-vehicle duplicate reports collapsed) |
| Date range | 1993-01-27 .. 2025-10-06 (`REPORT_DATE` YYYYMMDD date part; zero empty dates) |
| Annual crash counts | 1993:2, 1997:1, 1999:1, 2000:2, 2001:2, 2002:1, 2003:1, 2005:3, 2006:1, 2007:3, 2008:2, 2009:1, 2010:2, 2011:1, 2012:9, 2013:16, 2014:17, 2015:8, 2016:5, 2017:7, 2018:4, 2019:5, 2020:5, 2021:10, 2022:4, 2023:3, 2024:5, 2025:8 (missing years stay missing; no zeros filled) |
| Fatalities / injuries | 5 / 99 across all 129 crashes (as filed: `fatalities`, `injuries`; first report row per crash) |
| CSV / JSON | `cushing_nhtsa_crashes.csv`, `cushing_nhtsa_crashes.json` |
| TS reader / test | `app/app/lib/cushing-nhtsa.ts`, `app/tests/cushing-nhtsa.test.mjs` (3 tests pass) |
| Checksum | 129 crashes; 136 reports; fatal sum 5; injury sum 99 |

**Filed-data quirks (kept, not relabeled):** 125 rows file county `119`
(Payne FIPS); 9 rows file `000`, 1 row `081`, 1 row `131` — all filed under
city CUSHING, so they stay by the filed-city rule, mirroring the
PHMSA-Z/FRA-Z quirk rule. Missing years (e.g. 1994–1996, 1998, 2004) stay
missing; no zeros are filled.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not FARS fatalities, not AADT.
