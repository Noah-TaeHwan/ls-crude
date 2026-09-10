# 091-FEMA-Z — Payne County FEMA disaster declaration dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated declaration list** of FEMA disaster
declarations whose designated area is Payne County, Oklahoma — 39 unique
declarations, 1974-06-10..2025-05-21, one row per `femaDeclarationString`, no
duplicates. This is a disaster log: **not** busy, **not** WTI, **not** NOAA
storm counts.

**Keyless surface that worked (no login):** OpenFEMA
`DisasterDeclarationsSummaries` v2 over plain HTTPS —
`https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries`
(`?$filter=state eq 'OK' and fipsCountyCode eq '119'`,
`$orderby=declarationDate`, `$top=1000`). Raw saved under
`research/gathering/raw/FEMA-20260910/` (gitignored; SHA and re-fetch in
that folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091FEMAZ` |
| Geography | Payne County, Oklahoma (`state=OK`, `fipsStateCode=40`, `fipsCountyCode=119`, `designatedArea=Payne (County)` as filed) |
| Rows | 39 dated declarations (one row per `femaDeclarationString`, zero duplicates) |
| Date range | 1974-06-10 .. 2025-05-21 (`declarationDate` date part; zero empty dates) |
| Declaration mix | DR 24, EM 8, FM 7 |
| Public count/type | `declarationType` + `incidentType` + program flags (PA/IA/IH/HM) kept as filed; undisclosed `incidentEndDate` stays null, never filled |
| CSV / JSON | `cushing_fema_declarations.csv`, `cushing_fema_declarations.json` |
| TS reader / test | `app/app/lib/cushing-fema.ts`, `app/tests/cushing-fema.test.mjs` (3 tests pass) |
| Checksum | 39 rows; DR 24; EM 8; FM 7 |

**Missing stays missing:** years without Payne declarations are absent, not
zero-filled. Cushing city is not separated: OpenFEMA designates by county,
so no Cushing-only rows are invented from the statewide or county file.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma, not NOAA Storm Events counts. Statewide OK
rows were never pulled; the county filter ran server-side in the query.
