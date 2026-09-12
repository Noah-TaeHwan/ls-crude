# NHTSA raw probe notes — 2026-09-10 (gitignored)

- Frozen source: USDOT Socrata `aayw-vxb3` (FMCSA Crash File, commercial
  motor vehicle crashes from state police reports), queried keyless, no login:
  `?$where=state='OK' AND upper(city)='CUSHING'`
  → 136 report rows, saved as `fmcsa_crash_cushing_ok_raw.json`
  (full Socrata row payloads, selected columns).
- NHTSA FARS tabular keyless does NOT exist: Socrata FARS assets
  (`mzrg-xkip`, `kcpj-k9k9`, `vzqv-j5g4`, `34up-ii43`, `er8h-eeja`) are all
  href links, not tables; `ftp.nhtsa.dot.gov` does not resolve (DNS fail);
  `crashviewer.nhtsa.dot.gov/CrashAPI` returns 403; `cdan.nhtsa.gov`
  returns 403; `nhtsa.gov` itself returns 403 to non-browser clients.
- Searched Socrata catalog (`api.us.socrata.com/api/catalog/v1`,
  `search_context=data.transportation.gov`): q=fars (61 hits), q=crash
  (174 hits), q=CISS (0 hits), q=fatality (132 hits) — the only city-level
  dated crash table is FMCSA `aayw-vxb3`. A&I crash statistics are href
  links; fatality measures/charts are national aggregates, not local.
- FMCSA doc note: one crash can carry multiple reports (one per CMV),
  distinguished by report number + sequence. Cushing set: 136 reports,
  129 unique `report_number` (7 pairs share a number with seq 1/2 on the
  same date — same crash). Freeze dedups to one row per `report_number`.
- `upper(city)` must sit inside `$where`; as a bare query param Socrata
  rejects it ("Unrecognized arguments").
- OK statewide total at probe time: 82055 rows. County mix in the Cushing
  filed-city set: 119 × 125, 000 × 9, 081 × 1, 131 × 1 — kept by the
  filed-city rule, documented in the run README.
