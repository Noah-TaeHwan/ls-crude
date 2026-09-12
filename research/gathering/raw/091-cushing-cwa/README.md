# 091 Cushing ECHO CWA raw set (keyless EPA ECHO REST)

- Goal: dated EPA ECHO Clean Water Act / NPDES inspection series for Cushing
  city. Water regulatory log — not CAA air FCE, not TRI, not VOC, not busy,
  not WTI.
- Working surface (no key), retrieved 2026-09-09T21:06:07Z:
  - `https://echodata.epa.gov/echo/cwa_rest_services.get_facilities?p_st=OK&p_zip=74023&output=JSON`
    → `QueryRows = 19`, `QueryID = 625` (`INSPRows` 4 disclosed).
  - `https://echodata.epa.gov/echo/cwa_rest_services.get_qid?qid=625&output=JSON`
    → all 19 facility rows in one page
    (`echo_cwa_zip74023_qid625_facilities.json`). CWA facility rows carry no
    per-facility inspection-date field.
  - `https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<SourceID>&output=JSON`
    → per-permit DFR, keyless, for all 18 Cushing-city permits
    (`dfr_<SourceID>.json`). Only `Statute = CWA` rows kept:
    `InspectionEnforcementSummary.Source` (`DateLastInspection`,
    `InspectionCount`) cross-checked against the `ComplianceHistory`
    Inspection/Evaluation list — counts agree permit by permit (8 / 4+4 /
    3 / 0x14).
- Geography rule: keep rows with `CWPCity = CUSHING`, `CWPState = OK` only
  (18/19). 1 ZIP-74023 row filed under `CRUSHING` (`OK0044881` MARKETLINK)
  is excluded, not relabeled.
- Date rule: DFR `DateLastInspection` (CWA Inspection/Evaluation)
  `MM/DD/YYYY` → ISO. Null stays null; disclosed DFR-window count `0` is
  kept as published, never invented for dates.
- Shared FRS note: `OK0043320` + `OK0044598` (Greenfield) resolve to one
  FRS record (`110011006570`); the DFR status/formal/penalty block is one
  FRS-level disclosure. Series keeps one row per permit with per-permit
  counts (4 + 4), never merged.
- Raw JSONs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/`](../../indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/).
