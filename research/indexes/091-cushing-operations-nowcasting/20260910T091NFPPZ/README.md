# 091-NFPP-Z — Payne County NFIP policy effective months, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated monthly series** of NFIP policy records
whose filed census tract sits in Payne County, Oklahoma — 214 disclosed
effective months, 2009-01..2026-10, 4039 policy records total, one row per
`YYYY-MM` of `policyEffectiveDate` as filed. This is a policy file log:
**not** claims, **not** busy, **not** WTI, **not** disaster declarations,
**not** NOAA storm counts, **not** Cushing city.

**Keyless surface that worked (no login):** OpenFEMA `NfipPolicies` v3 (NFIP
Redacted Policies v3) over plain HTTPS —
`https://www.fema.gov/api/open/v3/NfipPolicies`
(`$filter=startswith(censusGeoid,'40119')`, `$orderby=id`, `$top=1000` plus
`id gt` cursor pages; deep `$skip` 503s, never used).
Raw saved under `research/gathering/raw/NFPP-20260910/` (gitignored; SHA
and re-fetch in that folder's README). v3 has no `countyCode` field, so the
county cut is the `censusGeoid` prefix server-side.

| Field | Value |
| --- | --- |
| Run | `20260910T091NFPPZ` |
| Geography | Payne County, Oklahoma (`propertyState=OK`, `censusGeoid` prefix 40119 as filed) |
| Rows | 214 dated months (one row per effective `YYYY-MM`, zero duplicates) |
| Date range | 2009-01 .. 2026-10 (`policyEffectiveDate` year-month part; zero empty dates) |
| Public count | `policies` per month as filed (`policyCount` is 1 on all 4039 raw rows); sum 4039 |
| Peak / edges | 2010-08 = 44 (peak); 2009-01 = 12; 2026-10 = 1 |
| CSV / JSON | `cushing_nfip_policies.csv`, `cushing_nfip_policies.json` |
| TS reader / test | `app/app/lib/cushing-nfip-policies.ts`, `app/tests/cushing-nfip-policies.test.mjs` (3 tests pass) |
| Checksum | 214 months; policy sum 4039 |

**Missing stays missing:** effective months without Payne policy records are
absent, not zero-filled. Row `asOfDate` is uniform 2026-09-08. Cushing city
is not separated: OpenFEMA redacts the city (`reportedCity=NA` on all 4039
rows), so the 95 `CUSHING, CITY OF` community rows stay inside the county
total and no Cushing-only rows are invented from the county file.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not Oklahoma County (`40109` never
pulled; the geoid filter ran server-side), not FEMA disaster declarations
(`20260910T091FEMAZ` rows never copied), not NOAA Storm Events counts, not
NFIP claims (`20260910T091NFIPZ` rows never copied or relabeled).
