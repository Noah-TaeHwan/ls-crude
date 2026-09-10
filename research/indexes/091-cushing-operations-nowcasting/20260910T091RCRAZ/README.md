# 091-RCRAZ — Cushing city EPA ECHO RCRA hazardous-waste handlers, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated handler list** of EPA ECHO Resource
Conservation and Recovery Act (RCRAInfo) handlers whose filed city is
**CUSHING, OK** — 51 handlers, 17 with a disclosed lifetime last RCRA
inspection date, 1985-08-28..2021-07-15, plus DFR waste-history quantities
for 11 handlers (2023..2026 as disclosed). A waste log: **not** busy,
**not** WTI, **not** TRI pounds, **not** DEQ VOC tons, **not** throughput,
**not** the CAA air FCE series (`20260910T091ECHOZ` — no rows copied),
**not** the CWA water series (`20260910T091CWAZ` — no rows copied).

**Keyless surface that worked (no login):** ECHO REST RCRA facility search —
`https://echodata.epa.gov/echo/rcra_rest_services.get_facilities`
(`p_st=OK`, `p_zip=74023` → 51 rows, `QueryID = 204`) then
`rcra_rest_services.get_qid` (all 51 rows one page). (`rcr_rest_services`
returns HTTP 404; the working service name is `rcra_rest_services`.) Each
Cushing-city handler was resolved through the keyless Detailed Facility
Report —
`https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<SourceID>&output=JSON`
— keeping only `Statute = RCRA` rows: `InspectionEnforcementSummary.Source`
(`InspectionCount`, `FormalEnfActCount`, `TotalPenalties`) and
`RCRAWasteHistory` (Hazardous / Acute / Pharmaceutical waste, 2023..2026 as
disclosed). Raw JSON saved under `research/gathering/raw/091-cushing-rcra/`
(gitignored; probe notes in that folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091RCRAZ` |
| Geography | Cushing city, Oklahoma (ECHO `RCRACity=CUSHING`, state OK; county per row as filed: 50 Payne + 1 Lincoln) |
| Rows | 51 handlers (one row per RCRA `SourceID`, no duplicates; all 51 filed CUSHING — no exclusions) |
| Dated inspections | 17 rows disclose lifetime `RCRALastInspectionDate` (1985-08-28..2021-07-15); 34 rows undisclosed (null, not 0) |
| Eval/action dates | 8 rows disclose `RCRALastIeaDate` (1989-02-01..2017-03-17); 1 row discloses `RCRALastFeaDate` (1987-09-30, HUDSON REFNG) |
| Window counts | DFR window (2021-09-05..2026-09-30) inspection counts disclosed on all 51 rows, sum 0; formal actions sum 0; penalties `$0` on all 51 rows — kept as published, never invented |
| Waste history | 11 handlers disclose `RCRAWasteHistory`; 21 Hazardous-Waste year cells + disclosed Acute/Pharma cells kept as verbatim strings (ranges like `161 - 167`, commas like `183,161`); undisclosed cells null, not 0; DFR payload discloses no units |
| Status | Active 27, Inactive 24 (as filed; `RCRAStatus` spacing kept verbatim) |
| Universe | Other 26, VSQG 19, SQG 5, Transporter 1 (as filed) |
| CSV / JSON | `cushing_rcra_handlers.csv`, `cushing_rcra_handlers.json` |
| TS reader / test | `app/app/lib/cushing-rcra.ts`, `app/tests/cushing-rcra.test.mjs` (3 tests pass) |
| Checksum | 51 rows; dated inspections 17; window inspection-count sum 0; formal-action sum 0; waste-history handlers 11 |

**Window-vs-lifetime note (kept, not reconciled):** all 17 lifetime last
inspections predate the DFR window start (2021-09-05), so the DFR-window
counts are 0 on those rows too — both kept as disclosed, like the CWA
freeze. `Inactive` handlers stay in the table; handler end is not deletion.
`RCRAComplStatus` is `No Violation Identified` on all 51 rows with zero
`RCRAQtrsWithNC/SNC` — kept as disclosed. Counts that ECHO leaves null stay
null; the reader fails closed on any null→0 fill, redate, reorder, or
statewide relabel.

**Not this:** not Cushing-city busy, not throughput, not WTI, not TRI, not
DEQ VOC, not CAA air FCE, not CWA water inspections, not a statewide
Oklahoma relabel, not an enforcement-case list.
