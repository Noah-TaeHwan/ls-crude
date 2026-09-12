# FEMA raw probe notes — 2026-09-10 (gitignored payload)

- Frozen source: OpenFEMA `DisasterDeclarationsSummaries` v2, queried keyless,
  no login:
  `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries`
  `?$filter=state eq 'OK' and fipsCountyCode eq '119'`
  `&$orderby=declarationDate&$top=1000&$format=json`
  → 39 rows, all `designatedArea=Payne (County)`,
  `fipsStateCode=40` + `fipsCountyCode=119`, zero duplicates by
  `femaDeclarationString`, zero null `declarationDate`.
- Saved as `disaster_declarations_payne_raw.json` (full OpenFEMA row payloads).
- SHA256: `0f554bb6c16a1299b087f65f40c7ab78b750dfcd455947a248b88ea6d03c1309`
  (35912 bytes, API `rundate` 2026-09-09T19:53:44.497Z).
- Re-fetch: same URL above. No key, plain HTTPS GET.
- Not Cushing-city: OpenFEMA designates by county, so the freeze is Payne
  County, kept as filed, never relabeled to Cushing city.
