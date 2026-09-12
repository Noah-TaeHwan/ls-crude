# NFPP raw probe notes — 2026-09-10 (gitignored payload)

- Frozen source: OpenFEMA `NfipPolicies` v3 (NFIP Redacted Policies v3, keyless,
  no login):
  `https://www.fema.gov/api/open/v3/NfipPolicies`
  `?$filter=startswith(censusGeoid,'40119')`
  `&$select=id,censusGeoid,propertyState,reportedCity,reportedZipCode,asOfDate,policyEffectiveDate,originalNBDate,policyTerminationDate,cancellationDateOfFloodPolicy,policyCount,ratedFloodZone,nfipCommunityName,nfipCommunityNumberCurrent`
  `&$orderby=id&$top=1000`
  then `... and id gt <lastId>` cursor pages (deep `$skip=4000` 503s on the
  Drupal front door, so `$skip` paging was abandoned after 3000; id-cursor
  paging ran to an empty page).
  → 4039 rows, all `propertyState=OK` + `censusGeoid` starting `40119`
  (Payne County), zero duplicate `id`, zero empty `policyEffectiveDate`.
- Saved as `nfip_policies_payne_raw.json` (fetched row payloads + source URL).
- SHA256: `98cf7af7169245a06e711e89718ccc6d5201d972d00f1746ec255375ee8f7ee5`
  (2056821 bytes, API `rundate` 2026-09-09T22:34:24.954Z,
  row `asOfDate` uniform 2026-09-08).
- Re-fetch: same URL above. No key, plain HTTPS GET. Expect ~60s per page;
  back off on Drupal 503s and resume by `id gt` cursor.
- Field notes: `NfipPolicies` v3 has no `countyCode` field (filtering by it
  returns `OF_OQP_002`), so the county cut is `startswith(censusGeoid,'40119')`
  server-side. `reportedCity` is `NA` (redacted) on all 4039 rows, so no
  Cushing-city rows are split out. `policyCount` is 1 on every row.
- Not Oklahoma County: the geoid filter ran server-side; `40119` only,
  never `40109`. Not claims (`20260910T091NFIPZ` untouched).
