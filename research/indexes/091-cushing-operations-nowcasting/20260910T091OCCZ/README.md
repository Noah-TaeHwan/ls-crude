# 091-OCC-Z — Payne County monthly production probe, 2026-09-10 (FAIL-CLOSED)

**What this is:** a freeze *receipt* for the attempted Payne County, Oklahoma
(FIPS 40119) **monthly oil/gas production** time series. **No dated monthly
rows were found on either preferred keyless surface, so no series is frozen
here.** No CSV, no JSON, no TS reader, no test — receipt only.

**What was probed (raw saved under `research/gathering/raw/OCC-20260910/`,
gitignored; probe notes in that folder's README):**

1. **EIA county production (no key):** EIA's own county-data FAQ confirms EIA
   publishes no monthly per-county oil/gas production — only Drilling
   Productivity Report *regional* estimates and statewide Oklahoma monthly
   series. EIA v2 was not called (key required). Statewide NOT substituted.
2. **OCC public monthly county tables (no login):** the OCC oil-and-gas-data
   page offers well lists, completions, and annual UIC injection volumes only.
   Its sole production pointer is the OTC OkTAP interactive per-lease lookup
   (session-gated, 50-redirect wall — not a downloadable monthly county
   table). OTC monthly apportionment is tax dollars, not bbl/mcf.

Third-party county aggregates (Buckhead Energy, shalexp) exist but are
neither EIA nor OCC and disagree with each other by an order of magnitude;
per the fail-closed rule they were not used, and no GIS map was scraped into
invented months.

| Field | Value |
| --- | --- |
| Run | `20260910T091OCCZ` |
| Geography | Payne County, Oklahoma, FIPS 40119 (county petroleum context) |
| Verdict | `no dated rows` — receipt only |
| CSV / JSON | none (nothing dated to freeze) |
| TS reader / test | none (`app/app/lib/cushing-occ.ts`, `app/tests/cushing-occ.test.mjs` intentionally absent) |
| Checksum | none (no disclosed crude_bbl or gas_mcf) |

**Not this:** not Cushing-city busy, not tank-farm throughput, not WTI, not a
busy relabel. A future worker may retry the two preferred surfaces; if dated
monthly county rows appear, freeze CSV+JSON, add the reader with the checksum
rule (sum of disclosed crude_bbl, else gas), and add the fail-closed tests.
