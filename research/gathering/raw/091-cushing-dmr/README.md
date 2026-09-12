# 091 Cushing ECHO DMR raw set (keyless EPA ECHO effluent REST)

- Goal: dated NPDES Discharge Monitoring Report (DMR) effluent quantities
  for Cushing city. Water discharge log — not last-inspection counts, not
  CAA air FCE, not TRI, not VOC, not busy, not WTI.
- Working surface (no key), retrieved 2026-09-10:
  - `https://echodata.epa.gov/echo/eff_rest_services.get_effluent_chart?p_id=<NPDES>&start_date=01/01/2015&end_date=09/09/2026&output=JSON`
    → `dmr_<NPDES>.json` for all 18 Cushing-city permits from 091-CWAZ.
    `p_id` is the NPDES permit number; `p_pid` errors. `output=JSON` required.
  - Windowing trap: omitting `start_date`/`end_date` silently returns only
    the current permit window (e.g. OK0026701 04/01/2023..09/04/2026).
    Passing the range returns real history (OK0026701 4047 DMR rows).
- Geography rule: every response header inspected — all 18 confirm
  `CWPCity = CUSHING`, `CWPState = OK`. No CRUSHING row in this pull.
- Freeze rule: parameter `50050` Flow only, `MonitoringPeriodEndDate`
  `DD-MON-YY` → ISO, value `DMRValueNmbr` as filed (string preserved),
  null stays null (all 842 carry NODI `C` No Discharge), units as filed
  (MGD / gal/d / null on older rows). 13 permits disclose no flow and
  contribute zero rows — missing stays missing.
- Raw JSONs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/`](../../indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/).
