# 091-NBI-Z — NBI Payne County bridge inspection log, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated bridge log** of the Federal Highway
Administration National Bridge Inventory (NBI) 2024 submittal for
**Payne County, Oklahoma (FIPS 40119, NBI county 119)** — 384 bridges, each
with its filed inspection month (Item 90, MMYY) and filed condition ratings
(deck / superstructure / substructure / channel / culvert, Items 58–62).
This is a bridge log: **not** AADT, **not** busy, **not** WTI.

**Keyless surface that worked (no login):** FHWA NBI ASCII download —
`https://www.fhwa.dot.gov/bridge/nbi/2024/OK24.txt`
(Oklahoma 2024 submittal, 22,917 fixed-width 445-char records).
Raw saved under `research/gathering/raw/NBI-20260910/` (gitignored; probe
notes in that folder's README). Record layout per
`https://www.fhwa.dot.gov/bridge/nbi/format.cfm` (Item positions 1-indexed).
No interactive maps were scraped.

| Field | Value |
| --- | --- |
| Run | `20260910T091NBIZ` |
| Geography | Payne County, Oklahoma (`FIPS 40119`, NBI county `119`) |
| Inventory year | `2024` (the submittal file; one inventory year, not a multi-year join) |
| Rows | 384 dated bridges (one row per structure number, no duplicates) |
| Date range | 2022-03 .. 2024-01 (Item 90 `MMYY` read as `YYYY-MM`; raw MMYY kept; zero empty dates) |
| Ratings | Items 58/59/60/61/62 as filed (`N` kept for culvert-type spans, not filled) |
| Year built | 1910 .. 2023 as filed; `year_reconstructed` `0000` kept where filed |
| ADT | As filed with `adt_year` (all rows `2022` in this submittal; traffic count, not busy) |
| CSV / JSON | `cushing_nbi_bridges.csv`, `cushing_nbi_bridges.json` |
| TS reader / test | `app/app/lib/cushing-nbi.ts`, `app/tests/cushing-nbi.test.mjs` (3 tests pass) |
| Checksum | 384 rows; 2022 = 27, 2023 = 283, 2024 = 74; deck 7 × 134 / 6 × 122 / N × 72 / 5 × 32 / 4 × 9 / 8 × 10 / 9 × 4 / 0 × 1 |

**Filed-data quirks (kept, not relabeled):** no NBI row files Cushing place
code `18850` — Cushing-city bridges are not separately identifiable in this
submittal, so the freeze is labeled **Payne County**, not Cushing city. Two
county rows mention `CUSHING` in the location text
(`311900000000000`, `311910000000000`, both place `00000`, `3E of CUSHING`);
they stay inside the county set, mirroring the PHMSA/FRA quirk rule.
`place 02300` (42 rows) is Stillwater and stays a county row, not a city
filter. Missing months stay missing; no zeros are filled.

**Not this:** not Cushing-city busy, not throughput, not WTI, not a busy
relabel, not statewide Oklahoma (22,917 − 384 rows excluded by the county
rule and documented here, not merged), not AADT series (ADT is carried per
bridge only as filed).
