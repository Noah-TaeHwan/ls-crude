# FRA raw probe notes — 2026-09-10 (gitignored)

- Frozen source: USDOT DataHub Socrata `7wn6-i5b9`
  (Highway-Rail Grade Crossing Incident Data, Form 57, FRA Safe Team),
  queried keyless, no login:
  `? $where=statecode='40' AND upper(cityname)='CUSHING'`
  → 3 rows, saved as `form57_cushing_raw.json` (full Socrata row payloads).
- `railroads.dot.gov/.../data-downloads` returns 403 to non-browser clients;
  `safetydata.fra.dot.gov/.../on_the_fly_download.aspx` returns 200 but is a
  form page with no direct CSV links, so the DataHub mirror is frozen instead.
- Socrata catalog search ignores `search=`; the working discovery path was
  `https://api.us.socrata.com/api/catalog/v1?domains=datahub.transportation.gov&q=...`.
- Form 54 mirror `85tf-25kj` (Rail Equipment Accident/Incident Data) has no
  city field and zero `station` like Cushing in any state; its 2 Payne-county
  rows are stations STILLWATER (in-scope city, out-of-scope series) and
  STILWELL (different city in Adair County, county misfiled) — both excluded
  from this Cushing-city freeze and documented in the run README.
- Form 57 OK total at probe time: 5759 rows. Null-city Payne rows (7) resolve
  to Yale/Stillwater/Pawnee stations, none Cushing. QUAY-city row with
  `neareststation=CUSHING` (1975-01-09) excluded by the filed-city rule.
