# 091-HUZ — Cushing city annual housing units probe, 2026-09-10 (FAIL-CLOSED)

**What this is:** a freeze *receipt* for the attempted **Cushing city, Oklahoma
annual housing-unit stock** (community housing count, not field activity).
**No dated place-level rows exist on either preferred keyless surface, so no
series is frozen here.** No CSV, no JSON, no TS reader, no test — receipt only.

**What was probed (raw saved under `research/gathering/raw/091-cushing-housing/`,
gitignored; probe notes in that folder's README):**

1. **PEP housing-unit estimates by place (www2.census.gov city housing files
   for Oklahoma):** do not exist. `datasets/2020-2024`, `2010-2019`, and
   `2020-2025` `cities/totals/` hold 52 population-only `sub-est*` CSVs each
   (zero `*hu*`/`*housing*` files); `tables/*/housing/totals/` holds only
   county (`CO-EST2024-HU-40.xlsx` for Oklahoma) and national files; the Census
   data-sets page states housing unit estimates cover nation, states, and
   counties only. County NOT substituted (city swap).
2. **ACS 1-year B25001 for place as keyless CSV:** does not exist.
   `api.census.gov` now returns a `Missing Key` page even for trivial queries,
   and ACS 1-year never publishes places under 65,000 population (Cushing city
   ≈ 8,444). ACS 5-year period averages were not spliced into PEP per the
   task rule, and BPS monthly permits are flow, not stock.

| Field | Value |
| --- | --- |
| Run | `20260910T091HUZ` |
| Geography | Cushing city, Oklahoma, place 4018850 (city housing stock) |
| Verdict | `no dated rows` — receipt only |
| CSV / JSON | none (nothing dated to freeze) |
| TS reader / test | none (`app/app/lib/cushing-housing.ts`, `app/tests/cushing-housing.test.mjs` intentionally absent) |
| Checksum | none (no disclosed housing_units) |

**Not this:** not monthly BPS permits, not busy, not WTI, not Payne County, not
a 0-filled or ACS-5-year-spliced series. A future worker may retry the two
preferred surfaces; if dated annual Cushing-city housing-unit rows appear,
freeze `year,housing_units` CSV+JSON, add the reader with the checksum rule
(sum of disclosed housing_units), and add the fail-closed tests.
