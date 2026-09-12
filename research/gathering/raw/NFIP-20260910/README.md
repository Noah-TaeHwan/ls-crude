# NFIP raw probe notes — 2026-09-10 (gitignored payload)

- Frozen source: OpenFEMA `NfipClaims` v3 (NFIP Redacted Claims v3, keyless,
  no login):
  `https://www.fema.gov/api/open/v3/NfipClaims`
  `?$filter=countyCode%20eq%20%2740119%27`
  `&$select=id,countyCode,state,dateOfLoss,yearOfLoss,asOfDate,amountPaidOnBuildingClaim,amountPaidOnContentsClaim,netBuildingPaymentAmount,netContentsPaymentAmount,ratedFloodZone`
  `&$orderby=dateOfLoss&$top=1000`
  → 100 rows, all `state=OK` + `countyCode=40119` (Payne County),
  zero duplicates by `id`, zero empty `dateOfLoss`.
- Saved as `nfip_claims_payne_raw.json` (fetched row payloads + source URL).
- SHA256: `9d67c56e4d9a085cc95932ee8a1688d116df4b0ac2d6177a7857d6ada09addb8`
  (36169 bytes, API `rundate` 2026-09-09T21:22:21.657Z,
  row `asOfDate` uniform 2026-09-08).
- Re-fetch: same URL above. No key, plain HTTPS GET.
- v2 `FimaNfipClaims` returns the same 100 Payne rows but is deprecated
  (frozen 2026-06-01, removal 2026-10-15), so v3 is the frozen surface.
- Not Oklahoma County: the county filter ran server-side; `40119` only,
  never `40109`. Not disaster declarations (`20260910T091FEMAZ` untouched).
- Filed-data notes kept, not relabeled: `reportedCity` is
  `Currently Unavailable` on all 100 rows (dropped from the freeze);
  `amountPaidOnBuildingClaim` / `amountPaidOnContentsClaim` are null on
  21 rows each (closed without payment; null stays null, never 0).
