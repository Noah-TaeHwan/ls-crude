# 091 Cushing ECHO raw set (keyless EPA ECHO REST)

- Goal: dated EPA ECHO inspection/enforcement series for Cushing city
  (or Payne County). Regulatory log — not TRI pounds, not VOC tons,
  not busy, not WTI.
- Working surface (no key): ECHO REST on `echodata.epa.gov`:
  - `https://echodata.epa.gov/echo/air_rest_services.get_facilities?p_st=OK&p_zip=74023&output=JSON`
    → `QueryRows = 50`, `QueryID = 280` (INSPRows 21, FCERows 20 disclosed).
  - `https://echodata.epa.gov/echo/air_rest_services.get_qid?qid=280&output=JSON`
    → all 50 facility rows in one page (`echo_air_zip74023_facilities.json`).
  - `https://echodata.epa.gov/echo/cwa_rest_services.get_facilities` +
    `get_qid` also work keyless (`p_zip=74023` → 19 rows, `p_co=Payne` →
    30 rows), but CWA facility rows carry no per-facility inspection-date
    field, so CWA is context only (`echo_cwa_zip74023_facilities.json`).
- Dead ends (probed 2026-09-09, no key, no login):
  - `caa_rest_services`, `sdwa_rest_services`,
    `enforcement_rest_services.get_cases` → HTTP 404 on echodata host.
  - `p_city` / `p_county` params are ignored (statewide rows back);
    `p_zip` and `p_co` filter correctly.
  - Per-facility DFR (`dfr_rest_services.get_dfr?p_id=…`) works keyless
    (spot-checked `OKG270018`, Centurion Cushing terminal, 0 inspections)
    but adds nothing over the air facility table for the frozen series.
- Geography rule: keep rows with `AIRCity = CUSHING`, `AIRState = OK`
  only (44/50). 6 ZIP-74023 rows filed under other cities (CEMENT,
  RIPLEY, AGRA incl. South Bow Cushing tank terminal, CYRIL, FOX,
  HEALDTON) are excluded, not relabeled. County stays per row as filed
  (33 Payne + 11 Lincoln) — city is the filter, county is an attribute.
- Date rule: `AIRLastFceDate` (Full Compliance Evaluation = CAA on-site
  inspection analog) is the inspection date, `MM/DD/YYYY` → ISO.
  `AIRLastEvalDate` kept as disclosed secondary date. Null stays null;
  `AIRFceCnt`/`AIREvalCnt` null stays null, never 0.
- Retrieved 2026-09-09T19:30:03Z. Raw JSONs are intentionally Git-ignored.
  Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091ECHOZ/`](../../../indexes/091-cushing-operations-nowcasting/20260910T091ECHOZ/).
