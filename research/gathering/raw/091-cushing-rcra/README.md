# 091 Cushing ECHO RCRA raw set (keyless EPA ECHO REST)

- Goal: dated EPA ECHO RCRA hazardous-waste handler series for Cushing
  city. Waste log — not CAA air FCE, not CWA water, not TRI, not VOC, not
  busy, not WTI.
- Working surface (no key), retrieved 2026-09-10:
  - `https://echodata.epa.gov/echo/rcra_rest_services.get_facilities?p_st=OK&p_zip=74023&output=JSON`
    → `QueryRows = 51`, `QueryID = 204` (`INSPRows` 0 disclosed).
    `rcr_rest_services.get_facilities` returns HTTP 404; the working
    service name is `rcra_rest_services` (`rcra_facilities.json`).
  - `https://echodata.epa.gov/echo/rcra_rest_services.get_qid?qid=204&output=JSON`
    → all 51 handler rows in one page (`rcra_qid.json`). All 51 rows file
    `RCRACity = CUSHING`, `RCRAState = OK` — no non-Cushing exclusions.
    Facility rows carry lifetime `RCRALastInspectionDate` (17 disclosed),
    `RCRALastIeaDate` (8), `RCRALastFeaDate` (1); windowed
    `RCRAInspCnt`/`RCRAIeaCnt`/`RCRAFeaCnt` are `0` on all 51 rows.
  - `https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<SourceID>&output=JSON`
    → per-handler DFR, keyless, for all 51 Cushing-city handlers
    (`dfr_<SourceID>.json`). Only `Statute = RCRA` rows kept:
    `InspectionEnforcementSummary.Source` (`InspectionCount`,
    `FormalEnfActCount`, `TotalPenalties` — all `$0`/0 as published) over
    window 2021-09-05..2026-09-30, plus `RCRAWasteHistory`
    (Hazardous / Acute / Pharmaceutical waste, 2023..2026) for 11
    handlers. DFR window has zero dated inspections — all 17 lifetime
    last inspections predate 2021-09-05.
- Geography rule: keep rows with `RCRACity = CUSHING`, `RCRAState = OK`
  only (51/51). County is an attribute (50 Payne + 1 Lincoln as filed).
- Date rule: `MM/DD/YYYY` → ISO. Null stays null; disclosed DFR-window
  count `0` and penalty `$0` are kept as published, never invented for
  dates. Waste values kept as verbatim strings (ranges, commas); DFR
  discloses no units.
- Raw JSONs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091RCRAZ/`](../../indexes/091-cushing-operations-nowcasting/20260910T091RCRAZ/).
