# 091-PENRZ — Cushing High School annual enrollment series, 2019-20..2024-25 with 2023-24 missing (2026-09-10)

**What this is:** a frozen **annual time series** of **Cushing High School
enrollment** (school-level annual totals from the Oklahoma SDE annual public
workbook, sampled under 091-PZ). A slow-moving community footprint. It cannot
answer "is Cushing busy this week?" and is not tested against WTI, EIA
inventories, or other CFAM tracks.

**What this is not:** a city-wide busy series, a weekly series, a 0–100
score, or a WTI overlay. There is **no 2023-24 row** — the gap stays missing,
never 0.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source | `../20260908T091PZ/091p_cushing_hs_enrollment_sample.csv` (do not scrape) |
| Range | 2019-20, 2020-21, 2021-22, 2022-23, 2024-25 — 5 rows, 2023-24 absent |
| Totals | 505, 474, 494, 530, 529 (checksum **2532**, see `receipt.json`) |
| Missing | 2023-24 kept missing; filling it with 0 fails validation |

The reader is `app/app/lib/cushing-enrollment.ts`; it fails closed on a
filled 2023-24 zero, swapped years, last-value copies, or a city-wide-busy
relabel.
