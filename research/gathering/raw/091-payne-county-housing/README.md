# Raw probe log — 091-HUCZ Payne County annual housing units (2026-09-10)

Keyless probe for a **Payne County, Oklahoma annual housing-unit stock** series
(FIPS 40119). Result: **15 dated county rows frozen** (2010..2024, no gaps).

## Probed (all keyless, no key, no login)

1. PEP county housing tables (preferred surface):
   - `https://www2.census.gov/programs-surveys/popest/tables/2020-2024/housing/totals/CO-EST2024-HU-40.xlsx`
     → July 1 `2020`…`2024` for `.Payne County, Oklahoma`
     (base 36707; 2020=36732, 2021=36835, 2022=37058, 2023=37258, 2024=37437).
     Saved: `CO-EST2024-HU-40.xlsx`.
   - `https://www2.census.gov/programs-surveys/popest/tables/2010-2019/housing/totals/CO-EST2019-ANNHU-40.xlsx`
     → July 1 `2010`…`2019` (2010-base vintage; 2010=34011 … 2019=36859).
     Saved: `CO-EST2019-ANNHU-40.xlsx`.
   - `https://www2.census.gov/programs-surveys/popest/tables/2020-2023/housing/totals/CO-EST2023-HU-40.xlsx`
     → superseded intermediate 2020-base vintage (2020=36733, 2021=36835,
     2022=37057, 2023=37257); kept in raw only, frozen rows take the newer
     2024 vintage. Saved: `CO-EST2023-HU-40.xlsx`.
2. Directory listing `tables/2020-2024/housing/totals/` saved as
   `housing-totals-2020-2024-file-list.html` (county `CO-EST2024-HU-*` + national
   files; zero place-level housing files — that gap is 091-HUZ).

## Vintage rule (mirrors 091-POPZ)

2010..2019 from the 2010-base vintage, 2020..2024 from the newest 2020-base
vintage, no 2020 overlap. The 2019 (36859) → 2020 (36732) step is disclosed as
published, not smoothed. Missing years stay missing; no 0-fill; never
relabeled as Cushing city.

## Not used (out of scope per task)

- POPESTIMATE population columns — population is already 091-POP.
- Subcounty `sub-est*` city CSVs — population-only, no housing files (091-HUZ).
- ACS B25001 / BPS permits — splice and flow, both forbidden here.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `CO-EST2019-ANNHU-40.xlsx`, `CO-EST2024-HU-40.xlsx`, `CO-EST2023-HU-40.xlsx` (gitignored raw)
- `housing-totals-2020-2024-file-list.html` (gitignored raw)
