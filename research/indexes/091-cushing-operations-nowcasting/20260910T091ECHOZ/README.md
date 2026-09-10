# 091-ECHOZ — Cushing city EPA ECHO air inspections, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated inspection list** of EPA ECHO Clean Air
Act stationary-source facilities whose filed city is **CUSHING, OK** —
44 facilities, 29 with a disclosed last Full Compliance Evaluation (FCE)
date, 1998-11-19..2026-05-05. A regulatory log: **not** busy, **not** WTI,
**not** TRI pounds, **not** DEQ VOC tons, **not** throughput.

**Keyless surface that worked (no login):** ECHO REST air facility search —
`https://echodata.epa.gov/echo/air_rest_services.get_facilities`
(`p_st=OK`, `p_zip=74023`) then `air_rest_services.get_qid` (QueryID 280,
all 50 rows one page). Raw JSON saved under
`research/gathering/raw/091-cushing-echo/` (gitignored; probe notes in that
folder's README). `caa_rest_services`, `sdwa_rest_services`, and
`enforcement_rest_services.get_cases` return HTTP 404; CWA facility rows
carry no inspection-date field, so the frozen series is air (CAA) only.

| Field | Value |
| --- | --- |
| Run | `20260910T091ECHOZ` |
| Geography | Cushing city, Oklahoma (ECHO `AIRCity=CUSHING`, state OK; county per row as filed: 33 Payne + 11 Lincoln) |
| Rows | 44 facilities (one row per AIR `SourceID`, no duplicates) |
| Dated | 29 rows disclose `AIRLastFceDate` (1998-11-19..2026-05-05); 15 rows undisclosed (null, not 0) |
| Eval dates | Same 29 rows disclose `AIRLastEvalDate`; FCE-date set == eval-date set |
| Counts | FCE disclosed 19 (sum 33); eval disclosed 24 (sum 167); recent violations 44/44 disclosed, sum 0 |
| Status | Operating 34, Permanently Closed 10 (as filed) |
| Classes | Minor 18, Major 12, Synthetic Minor 7, 80% Synthetic Minor 7 (as filed) |
| Excluded | 6 ZIP-74023 rows filed under other cities (Cement/Ripley/Agra/Cyril/Fox/Healton) — never Cushing |
| CSV / JSON | `cushing_echo_air_inspections.csv`, `cushing_echo_air_inspections.json` |
| TS reader / test | `app/app/lib/cushing-echo.ts`, `app/tests/cushing-echo.test.mjs` (3 tests pass) |
| Checksum | 44 rows; dated FCE 29; FCE sum 33; eval sum 167; recent-violation sum 0 |

**Filed-data notes (kept, not relabeled):** city is the filter, county is an
attribute — 11 Cushing-city rows sit in Lincoln County as filed (same rule
as TRI city aggregate). `Permanently Closed` facilities stay in the table;
closure is not deletion. `AIRComplStatus` is `No Violation Identified` on
all 44 rows while 18 rows carry an older `AIRLastViolDate` — both kept as
disclosed, no reconciliation. Counts that ECHO leaves null stay null; the
reader fails closed on any null→0 fill, redate, reorder, or statewide
relabel.

**Not this:** not Cushing-city busy, not throughput, not WTI, not TRI, not
DEQ VOC, not a statewide Oklahoma relabel, not an enforcement-case list.
