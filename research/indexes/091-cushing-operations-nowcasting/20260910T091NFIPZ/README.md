# 091-NFIP-Z — Payne County NFIP flood-claim dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated claim list** of NFIP flood-insurance
claims whose filed county is Payne County, Oklahoma — 100 unique claims,
1980-06-19..2021-06-27, one row per claim `id`, no duplicates. This is a
flood-insurance log: **not** busy, **not** WTI, **not** disaster
declarations, **not** NOAA storm counts, **not** Cushing city.

**Keyless surface that worked (no login):** OpenFEMA `NfipClaims` v3 (NFIP
Redacted Claims v3) over plain HTTPS —
`https://www.fema.gov/api/open/v3/NfipClaims`
(`?$filter=countyCode eq '40119'`, `$orderby=dateOfLoss`, `$top=1000`).
Raw saved under `research/gathering/raw/NFIP-20260910/` (gitignored; SHA
and re-fetch in that folder's README). v2 `FimaNfipClaims` returns the same
100 Payne rows but is deprecated (frozen 2026-06-01, removal 2026-10-15),
so v3 is the frozen surface.

| Field | Value |
| --- | --- |
| Run | `20260910T091NFIPZ` |
| Geography | Payne County, Oklahoma (`state=OK`, `countyCode=40119` as filed) |
| Rows | 100 dated claims (one row per claim `id`, zero duplicates) |
| Date range | 1980-06-19 .. 2021-06-27 (`dateOfLoss` date part; zero empty dates) |
| Loss years | 20 disclosed years (1980..2021, sparse; missing years absent, not zero-filled) |
| Public amounts | `amountPaidOnBuildingClaim` + `amountPaidOnContentsClaim` + `netBuildingPaymentAmount` + `netContentsPaymentAmount` as filed; 21 rows null on paid building/contents (closed without payment, never filled with 0) |
| Zones | `ratedFloodZone` as filed (C 22, A02 22, AE 20, A 11, X 11, A04 6, B 3, A01 2, A09 1, A08 1, A03 1) |
| CSV / JSON | `cushing_nfip_claims.csv`, `cushing_nfip_claims.json` |
| TS reader / test | `app/app/lib/cushing-nfip.ts`, `app/tests/cushing-nfip.test.mjs` (3 tests pass) |
| Checksum | 100 rows; paid-building cents 107090889; paid-contents cents 17696939; net-building cents 105864614; net-contents cents 17696939 |

**Missing stays missing:** loss years without Payne claims are absent, not
zero-filled. Cushing city is not separated: OpenFEMA redacts the city
(`reportedCity=Currently Unavailable` on all 100 rows), so no Cushing-only
rows are invented from the county file.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not Oklahoma County (`40109` never
pulled; the county filter ran server-side), not FEMA disaster declarations
(`20260910T091FEMAZ` rows never copied), not NOAA Storm Events counts.
