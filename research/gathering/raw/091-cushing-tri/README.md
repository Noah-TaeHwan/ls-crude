# 091 Cushing TRI raw set (keyless EPA Envirofacts dmapservice)

- Universe: `tri.tri_facility` where `county_name = PAYNE` → 9 facilities;
  exactly 2 with `city_name = CUSHING`, `state_abbr = OK`:
  `EVANS CUSHING INC` (2400 S LITTLE ST, TRIFID `74023VNSCS2400S`) and
  `CUSHING BATCH PLANT` (703 N WILSON AVE, TRIFID `7402WCSHNG73NWI`).
- City sweep: `tri.tri_reporting_form` with `reporting_year = {1987..2024}`,
  joined to `tri.tri_facility` with `city_name = CUSHING` and
  `state_abbr = OK`, one query per year (38/38 HTTP 200). Forms exist only
  for 1989–2003 (Evans, Form R) and 2024 (Batch Plant, lead compounds Form R).
  2004–2023 and 1987–1988 have no Cushing-city forms — missing, not zero.
- Endpoint templates (no key, follow redirect `enviro.epa.gov` → `data.epa.gov`):
  - `https://data.epa.gov/dmapservice/tri.tri_facility/county_name/equals/PAYNE/json`
  - `https://data.epa.gov/dmapservice/tri.tri_reporting_form/reporting_year/equals/{YYYY}/join/tri.tri_facility/city_name/equals/CUSHING/state_abbr/equals/OK/json`
  - `https://data.epa.gov/dmapservice/tri.tri_reporting_form/tri_facility_id/equals/{TRIFID}/json`
  - `https://data.epa.gov/dmapservice/tri.tri_release_qty/doc_ctrl_num/equals/{DOC_CTRL_NUM}/json`
- Files: `facilities_payne_county.json` (county universe),
  `city_forms_1987_2024.json` (merged 38 year-scans, full form rows),
  `forms_{TRIFID}.json` (per-facility form rows),
  `releases_by_doc.json` (`doc_ctrl_num` → `tri_release_qty` rows),
  `manifest.json` (bytes + SHA-256).
- Aggregation rule: per doc, on-site lb = sum of `total_release` over rows
  with `release_na = 0` and non-null value (all observed releases are
  `AIR FUG` + `AIR STACK`; no range codes; no dioxin, all pounds).
  1991 has 3 byte-identical duplicate doc pairs — deduped by
  (`reporting_year`, `tri_chem_id`), keeping the max `doc_ctrl_num`.
  2024 Batch Plant form is all-media-NA → disclosed 0, kept as an observed row.
- Retrieved 2026-09-10. Raw JSONs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/`](../../../indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/).
