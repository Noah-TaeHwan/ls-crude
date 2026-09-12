# Raw probe log — 091-COCZ Payne County annual PEP population components (2026-09-10)

Keyless probe for **Payne County, Oklahoma annual population components of
change** (FIPS 40119): births, deaths, natural change, international /
domestic / net migration, plus the July 1 total. Result: **15 dated county
rows frozen** (2010..2024, no gaps).

## Probed (all keyless, no key, no login)

1. PEP county components (preferred surface):
   - `https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv`
     → `STATE 40` + `COUNTY 119` row: `POPESTIMATE`/`BIRTHS`/`DEATHS`/
     `NATURALCHG`/`INTERNATIONALMIG`/`DOMESTICMIG`/`NETMIG` for `2020`…`2024`
     (2020 components are the partial Apr 1–Jun 30 period, as published).
     Saved: `co-est2024-alldata.csv`.
   - `https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv`
     → same county row for `2010`…`2019` (2010-base vintage;
     `NATURALINC` field name; 2010 components are the partial Apr 1–Jul 1
     period, as published). Saved: `co-est2019-alldata.csv`.
2. Arithmetic check on every frozen row: births − deaths = natural_change and
   international + domestic = net_mig, as published (no residual column kept).

## Vintage rule (mirrors 091-POPZ / 091-HUCZ)

2010..2019 from the 2010-base vintage, 2020..2024 from the newest 2020-base
vintage, no 2020 overlap. The 2019 (81784) → 2020 (81649) step is disclosed as
published, not smoothed. Missing years stay missing; no 0-fill; never
relabeled as Cushing city; never used to invent Cushing-city components.

## Not used (out of scope per task)

- `RESIDUAL*` / rate (`R*`) columns — reconciliation detail, not frozen.
- Subcounty `sub-est*` city CSVs — population-only, no component rows (no city split).
- County HU columns — already 091-HUCZ. ACS / BPS — splice and flow, both forbidden here.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `co-est2019-alldata.csv`, `co-est2024-alldata.csv` (gitignored raw)
