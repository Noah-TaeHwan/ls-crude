# 091-STM-Z — Payne County NOAA storm event dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated event list** of NOAA NCEI Storm Events
whose filed state/county zone is Payne County, Oklahoma — 112 unique events,
2024-01-13..2026-05-08, one row per `EVENT_ID`, no duplicates. This is a
weather confounder log: **not** busy, **not** WTI, **not** GHCN
precipitation, **not** KCUH temperature.

**Keyless surface that worked (no login):** NOAA NCEI Storm Events bulk
Details CSV over plain HTTPS —
`https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/`
(`StormEvents_details-ftp_v1.0_d2024_c20260728`,
`_d2025_c20260819`, `_d2026_c20260901`). Raw saved under
`research/gathering/raw/STORM-20260910/` (gitignored; SHAs and re-fetch in
that folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091STMZ` |
| Geography | Payne County, Oklahoma (`STATE=OKLAHOMA`, `CZ_NAME=PAYNE` as filed) |
| Rows | 112 dated events (one row per `EVENT_ID`, zero duplicates) |
| Date range | 2024-01-13 .. 2026-05-08 (`BEGIN_DATE_TIME` date part → ISO, cross-checked against `YEAR` + `BEGIN_DAY`; zero empty dates) |
| Injuries / deaths | 10 / 0 across all rows (direct + indirect, as filed) |
| Magnitude | disclosed on 44 rows (hail inches, wind MG/EG, `TOR_F_SCALE` on the tornado); undisclosed stays null, never 0 |
| Cushing | 3 rows locate at `CUSHING` (2025-05-24 and 2025-06-17 thunderstorm wind, 2026-03-01 hail) — kept inside the Payne set, not a separate city series |
| Event mix | Heat 30, Hail 25, Thunderstorm Wind 15, Excessive Heat 15, Cold/Wind Chill 7, Drought 5, High Wind 4, Extreme Cold/Wind Chill 2, Flash Flood 2, Wildfire 2, Tornado 1, Winter Weather 1, Dense Fog 1, Heavy Snow 1, Winter Storm 1 |
| CSV / JSON | `cushing_storm_events.csv`, `cushing_storm_events.json` |
| TS reader / test | `app/app/lib/cushing-storm.ts`, `app/tests/cushing-storm.test.mjs` (3 tests pass) |
| Checksum | 112 rows; injuries sum 10; deaths sum 0; magnitude disclosed 44 |

**Missing stays missing:** months/years without Payne rows are absent, not
zero-filled. The window is bounded by the three source files
(2024 details, 2025 details, 2026 year-to-date); older history was not
pulled and is not claimed.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not GHCN precipitation, not KCUH
temperature. Statewide OK rows from the same files were counted for
identity only (2024: 3504, 2025: 2892, 2026: 1136) and excluded here.
