# 091-SDWISZ — Cushing city SDWIS drinking-water violations, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated violation list** for the City of Cushing
community water system (**PWS `OK2006061`**, Payne County, pop 8,371, ground
water, local government) — 23 SDWA violations with disclosed compliance-period
begin dates, 2017-01-01..2024-10-17. A drinking-water regulatory log: **not**
busy, **not** WTI, **not** TRI pounds, **not** DEQ VOC tons, **not**
throughput, **not** the CWA NPDES inspection series (`20260910T091CWAZ` — no
rows copied), **not** a statewide Oklahoma relabel.

**Keyless surface that worked (no login):** ECHO SDWA system search —
`https://echodata.epa.gov/echo/sdw_rest_services.get_systems`
(`p_st=OK`, `p_co=Payne` → 115 rows, `QueryID = 837`) then
`sdw_rest_services.get_qid` (all 115 rows one page; re-queried qid 163 ↔ 837
return identical PWSID sets). The system table carries no violation-date
field, so each Cushing-named PWS was resolved through the keyless Detailed
Facility Report —
`https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<PWSID>&output=JSON`
— keeping only `ViolationsEnforcementActions.Sources[].Violations` rows with
a disclosed `CompliancePeriodBeginDate`. Raw JSON saved under
`research/gathering/raw/091-cushing-sdwis/` (gitignored; probe notes in that
folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091SDWISZ` |
| Geography | Cushing city, Oklahoma (SDWIS `PWSName=CUSHING`, state OK; `CountiesServed=Payne`, FIPS 40119) |
| System | `OK2006061` CUSHING — active community water system, GW source, pop 8,371 (SDWIS extract 2026-07-09) |
| Rows | 23 violations (one row per DFR violation, no duplicates) |
| Dated | 23 rows disclose a compliance begin date (2017-01-01..2024-10-17); no null dates in this series |
| Counts | 21 VOC monitoring/reporting (2017-01-01..2022-12-31, Archived) + 2 Lead and Copper Rule Revisions TT/RPT (begin 2024-10-17, resolved 2025-07-15); enforcement actions disclosed 4 |
| Status | DFR summary window 2021-04-01..2026-03-31: `No Violation Identified`, QtrsInNC 4, last SDWA visit 2025-04-17 (context, not rows) |
| Excluded | `OK1020908` CUSHING — 12 DFR rows carry enforcement-action dates only (1981–1996), no violation ID/rule/contaminant/compliance date disclosed; never dated, not relabeled. `OK2006065` CUSHING COUNTRY CLUB — 0 violation rows. 7 SDWA sanitary-survey inspection rows on `OK2006061` — a different log, not copied. |
| CSV / JSON | `cushing_sdwis_violations.csv`, `cushing_sdwis_violations.json` |
| TS reader / test | `app/app/lib/cushing-sdwis.ts`, `app/tests/cushing-sdwis.test.mjs` (3 tests pass) |
| Checksum | 23 rows; dated 23; MR 21 / TT 1 / RPT 1; enforcement-count sum 4 |

**Filed-data notes (kept, not relabeled):** the two 2024-10-17 LCRR rows
disclose no compliance end date (null, not 0). The 21 VOC rows share one
compliance window (2017-01-01..2022-12-31, resolved 2022-12-31, Archived) —
kept as 21 per-contaminant rows, never merged. The reader fails closed on any
null→date fill, redate, reorder, statewide relabel, or CWA-row copy.

**Not this:** not Cushing-city busy, not throughput, not WTI, not TRI, not
DEQ VOC, not CWA NPDES inspections, not a statewide Oklahoma relabel, not a
sample-result table.
