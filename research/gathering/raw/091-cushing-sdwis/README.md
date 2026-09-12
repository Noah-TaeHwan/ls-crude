# 091 Cushing SDWIS raw set (keyless ECHO SDWA REST)

- Goal: dated SDWIS drinking-water violation series for Cushing city PWS.
  Drinking-water regulatory log — not CWA NPDES, not TRI, not VOC, not busy,
  not WTI.
- Working surface (no key), retrieved 2026-09-09T21:34:38Z:
  - `https://echodata.epa.gov/echo/sdw_rest_services.get_systems?output=JSON&p_st=OK&p_co=Payne`
    → `QueryRows = 115`, `QueryID = 837` (method is `get_systems`, not
    `get_facilities`; `p_city`/`p_cit`/`p_sysname` are ignored by this
    service, so the county filter + PWS-name match is the local gate).
  - `https://echodata.epa.gov/echo/sdw_rest_services.get_qid?qid=837&output=JSON`
    → all 115 Payne systems in one page
    (`sdw_payne_systems_qid837.json`). Repeat of an earlier identical query
    (`QueryID = 163`) returns the identical PWSID set — no session drift.
    System rows carry violation flags but no violation-date field.
  - `https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=<PWSID>&output=JSON`
    → per-system DFR, keyless, for all 3 Cushing-named PWSIDs
    (`dfr_<PWSID>.json`). Only
    `ViolationsEnforcementActions.Sources[].Violations` rows with a disclosed
    `CompliancePeriodBeginDate` kept:
    `OK2006061` 23 dated rows; `OK1020908` 12 rows with enforcement dates
    only (no violation ID/rule/date — excluded, not dated); `OK2006065`
    0 rows.
- Geography rule: keep SDWA violations whose DFR `SourceID` is a
  Cushing-named PWS (`OK2006061` CUSHING, `CountiesServed=Payne`, FIPS 40119)
  in state OK. No statewide rows relabeled.
- Date rule: DFR `CompliancePeriodBeginDate` `MM/DD/YYYY` → ISO. Null stays
  null; disclosed enforcement count `0` is kept as published, never invented
  for dates.
- SDWIS extract vintage: `SystemExtractDate = 07/09/2026` (as filed).
- Raw JSONs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091SDWISZ/`](../../indexes/091-cushing-operations-nowcasting/20260910T091SDWISZ/).
