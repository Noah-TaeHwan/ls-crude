# 091-CWAZ — Cushing city EPA ECHO Clean Water Act inspections, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated last-inspection list** of EPA ECHO Clean
Water Act (NPDES) permits whose filed city is **CUSHING, OK** — 18 permits,
4 with a disclosed last CWA Inspection/Evaluation date, 2025-04-10..2026-01-06.
A water regulatory log: **not** busy, **not** WTI, **not** TRI pounds,
**not** DEQ VOC tons, **not** throughput, **not** the CAA air FCE series
(`20260910T091ECHOZ` — no rows copied).

**Keyless surface that worked (no login):** ECHO REST CWA facility search —
`https://echodata.epa.gov/echo/cwa_rest_services.get_facilities`
(`p_st=OK`, `p_zip=74023` → 19 rows, `QueryID = 625`) then
`cwa_rest_services.get_qid` (all 19 rows one page). The CWA facility table
carries no inspection-date field, so each Cushing-city permit was resolved
through the keyless Detailed Facility Report —
`https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<SourceID>&output=JSON`
— keeping only `Statute = CWA` rows: `InspectionEnforcementSummary.Source`
(`DateLastInspection`, `InspectionCount`) cross-checked against the full
`ComplianceHistory` Inspection/Evaluation list (counts agree permit by
permit). Raw JSON saved under `research/gathering/raw/091-cushing-cwa/`
(gitignored; probe notes in that folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091CWAZ` |
| Geography | Cushing city, Oklahoma (ECHO `CWPCity=CUSHING`, state OK; county per row as filed: 12 Payne + 1 Lincoln + 5 null) |
| Rows | 18 permits (one row per CWA `SourceID`, no duplicates) |
| Dated | 4 rows disclose a last CWA Inspection/Evaluation date (2025-04-10..2026-01-06); 14 rows undisclosed (null, not 0) |
| Counts | DFR-window (2021-09-05..2026-03-31) inspection counts disclosed on all 18 rows, sum 19 |
| Last types | All 4 dated rows: `Base Program - Evaluation`, State-led, `Inspection/Evaluation` |
| Status | `No Violation Identified` 9, `Terminated Permit` 5, `Not Applicable` 4, formal actions disclosed 5 (3 + 1 + 1), penalties `$35,000` on OK0026701 only |
| Excluded | 1 ZIP-74023 row filed under another city (`OK0044881` MARKETLINK, city `CRUSHING` as filed) — never Cushing, not relabeled |
| CSV / JSON | `cushing_echo_cwa_inspections.csv`, `cushing_echo_cwa_inspections.json` |
| TS reader / test | `app/app/lib/cushing-echo-cwa.ts`, `app/tests/cushing-echo-cwa.test.mjs` (3 tests pass) |
| Checksum | 18 rows; dated 4; inspection-count sum 19; formal-action sum 5 |

**Filed-data notes (kept, not relabeled):** city is the filter, county is an
attribute — 5 construction/general-permit rows carry no county as filed.
`Terminated` / `Not Needed` permits stay in the table; permit end is not
deletion. The two Greenfield permits (`OK0043320`, `OK0044598`) share FRS
`110011006570`, so their DFR status/formal/penalty block is one FRS-level
disclosure repeated on both rows — counts stay per permit (4 + 4), never
merged. Undisclosed dates and null formal/penalty cells stay null; the
reader fails closed on any null→0 fill (except the DFR-disclosed count `0`,
which is kept as published), redate, reorder, or statewide relabel.

**Not this:** not Cushing-city busy, not throughput, not WTI, not TRI, not
DEQ VOC, not CAA air FCE, not a statewide Oklahoma relabel, not an
enforcement-case list.
