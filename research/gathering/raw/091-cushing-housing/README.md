# Raw probe log — 091-HUZ Cushing city annual housing units (2026-09-10)

Keyless probe for a **Cushing city, Oklahoma annual housing-unit stock** series.
Result: **0 dated place-level rows on any allowed keyless surface** — receipt only.

## Probed (all keyless, no key, no login)

1. PEP subcounty city datasets (population + hoped-for housing):
   - `https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/cities/totals/` → 52 files, all `sub-est2024_*.csv` population-only (`ESTIMATESBASE2020`, `POPESTIMATE2020`…`POPESTIMATE2024`). Zero `*hu*`/`*housing*` files. Saved: `cities-totals-2020-2024-file-list.txt`.
   - `.../datasets/2010-2019/cities/totals/` → same, 52 population-only files. Saved: `cities-totals-2010-2019-file-list.txt`.
   - `.../datasets/2020-2025/cities/totals/` (newest vintage) → `sub-est2025_*.csv` population-only, zero housing files.
   - `.../datasets/2020-2024/cities/` and `2020-2023/cities/` contain only `totals/` (no `housing/` subdir).
2. PEP housing tables:
   - `https://www2.census.gov/programs-surveys/popest/tables/2020-2024/housing/totals/` → 56 xlsx, all `CO-EST2024-HU-*` **county** + `NST-EST2024-HU-*` national. Oklahoma = `CO-EST2024-HU-40.xlsx` (county-level, not place). Zero place/city files. Saved: `housing-totals-2020-2024-file-list.txt`.
   - `tables/2020-2024/cities/totals/` → `SUB-IP-EST2024-POP-*` population-only xlsx. Same for 2010-2019 (`SUB-IP-EST2019-ANNRES-*`).
   - Census data-sets page confirms: housing unit estimates are published for **nation, states, and counties** only; city/town products are population totals.
3. Census API (`api.census.gov`, ACS 1-year B25001 / ACS 5-year B25001 / 2020 Decennial PL H1 for `place:18850/state:40`):
   - All return HTTP 200 with an HTML `Missing Key` page — the API now requires a key, so **no** keyless table exists there. Saved: `api-census-gov-missing-key.html`.
   - Independent of the key wall, ACS 1-year never publishes places under 65,000 population (Cushing city ≈ 8,444), so B25001 1-year rows for Cushing city do not exist in any vintage.

## Not used (out of scope per task)

- Payne County PEP housing units (`CO-EST2024-HU-40.xlsx`) — county, not Cushing city; substituting it would be a city swap → fail-closed.
- ACS 5-year B25001 place estimates — 5-year period averages, not annual stock; splicing them into PEP is explicitly forbidden.
- Census BPS permits — monthly permit *flow*, not housing-unit *stock*; owned by another lane.
- Decennial counts via API — behind the same key wall.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `cities-totals-2020-2024-file-list.txt`, `cities-totals-2010-2019-file-list.txt` (gitignored raw)
- `housing-totals-2020-2024-file-list.txt` (gitignored raw)
- `api-census-gov-missing-key.html` (gitignored raw)
