# 091-OSHA-Z — OSHA Cushing 현장 점검 날짜, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated inspection list** of OSHA IMIS
establishment inspections whose filed site ZIP is 74023 (Cushing, Oklahoma) —
162 unique inspections, 1973-04-25..2026-08-14. This is a workplace-safety
log: **not** busy, **not** WTI, **not** QCEW employment, **not** throughput.

**Keyless surface that worked (no login):** OSHA Establishment Search (IMIS
ORDS) — `https://www.osha.gov/ords/imis/establishment.search`
(`State=OK`, `sitezip=74023`). Raw HTML saved under
`research/gathering/raw/OSHA-20260910/` (gitignored; probe notes in that
folder's README). The server returns about 10 years per query, so 7
contiguous windows were pulled (1972-01-01..2026-09-09) and deduped by
activity id (zero cross-window duplicates). `inspectionNr.html` returns
CloudFront 403; `enforcedata.dol.gov` redirects to a JS-driven Drupal page —
the ORDS search is the frozen source.

| Field | Value |
| --- | --- |
| Run | `20260910T091OSHAZ` |
| Geography | Cushing, Oklahoma (OSHA IMIS site ZIP 74023 as filed, state OK) |
| Rows | 162 dated inspections (one row per activity id, no duplicates) |
| Date range | 1973-04-25 .. 2026-08-14 (`Date Opened`; zero empty dates) |
| Years | 43 years with rows, 1973..2026; 11 missing years stay missing: 1978, 1984, 1995, 1999, 2001, 2007, 2010, 2011, 2015, 2020, 2021 |
| Violations | 86 rows disclose a count (sum 354); 76 rows undisclosed (null, not 0) |
| Types | Planned 108, Complaint 20, FollowUp 12, Referral 7, Accident 4, Prog Related 4, Unprog Rel 3, Fat/Cat 2, Prog Other 1, Other 1 (as filed) |
| CSV / JSON | `cushing_osha_inspections.csv`, `cushing_osha_inspections.json` |
| TS reader / test | `app/app/lib/cushing-osha.ts`, `app/tests/cushing-osha.test.mjs` (3 tests pass) |
| Checksum | 162 rows; violations disclosed 86; violations sum 354 |

**Filed-data notes (kept, not relabeled):** site ZIP is the geography — three
spot-checked detail pages (`1342680.015` Transcanada Cushing Regional Offc,
`1760056.015` Oneok Inc, `1911485.015` South Fork Group Llc) all file Site
Address `Cushing, OK 74023` even when the mailing address is elsewhere
(Tulsa/Drumright). Report IDs are `0627700`/`0637200` as filed. Penalties live
only on per-inspection detail pages and are not frozen here. Missing years
stay missing; no zeros are filled; no statewide Oklahoma rows are relabeled
as Cushing.

**Not this:** not Cushing-city busy, not throughput, not WTI, not QCEW, not a
busy relabel, not statewide Oklahoma.
