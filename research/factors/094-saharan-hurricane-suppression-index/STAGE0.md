# 094 Stage 0 — 20260910T094S0Z

HURDAT2 Atlantic best track pulled from NHC
`hurdat2-1851-2024-040425.txt` (7.0 MB).

Rule: first advisory date per AL storm, month in Jun–Nov, year 1980–2024.
n genesis = 691. Mean ≈ 15.4 / season.

Dust grid was **not** downloaded. GES DISC MERRA-2 needs Earthdata login.
Stage 1 (DustShock → formation) remains unopened.

## Context only — storm count vs JJASON WTI log return

Not SHSI. No dust. n=9 per split. 2020 is a 29-storm + crash-rebound year.

| split | n | r(count, WTI season) |
| --- | ---: | ---: |
| 2007–2015 | 9 | +0.24 |
| 2016–2024 | 9 | +0.62 |

Do not read OOS +0.62 as “more storms, oil up.” Sample is tiny and 2020 dominates.

## Next gate for Stage 1

Need daily or monthly `DUEXTTAU` mean over 10N–25N, 20W–60W, Jun–Nov, 1980+.
Until that file exists, no SHSI_t, no CL regression, no dashboard.
