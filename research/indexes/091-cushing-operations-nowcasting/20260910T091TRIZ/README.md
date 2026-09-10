# 091-TRIZ — Cushing city annual TRI on-site releases, 1989–2003 + 2024 (2026-09-10)

**What this is:** a frozen **annual time series** of EPA Toxics Release
Inventory **on-site total releases (lb)** summed over every Form R filed by a
facility in **Cushing city, Oklahoma**. A chemical-specific toxic-release
footprint. It cannot answer "is Cushing busy this week?" and is not tested
against WTI, EIA inventories, or other CFAM tracks. It complements — never
substitutes — the DEQ VOC annual totals (`20260908T091WENVZ`), which cover
terminal VOC/HAP below TRI chemical thresholds.

**What this is not:** field activity, a weekly busy series, a 0–100 score, a
WTI overlay, DEQ VOC, or Stillwater/Payne County employment. City =
`CUSHING`, ST = `OK` only — Stillwater rows are never merged in.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source | EPA Envirofacts dmapservice, keyless (`tri.tri_facility`, `tri.tri_reporting_form` ⨝ facility city/state, `tri.tri_release_qty`) |
| Raw | `research/gathering/raw/091-cushing-tri/` (gitignored; 38/38 year-scan queries HTTP 200) |
| Universe | 2 Cushing-city facilities out of 9 Payne County TRI facilities |
| Range | 1989..2003 + 2024 — 16 rows; 1987–1988 and 2004–2023 have no Cushing-city forms (missing, not 0) |
| Totals (lb) | 66339, 88630, 102678, 176921, 67888, 86688, 63096, 87666, 39065, 25232, 25232, 25232, 23230, 23230, 23015, 0 (checksum **924142**, see `receipt.json`) |
| 1991 duplicates | 3 byte-identical doc pairs deduped by (year, chem), keeping max `doc_ctrl_num` |
| 2024 zero | Cushing Batch Plant lead-compounds Form R with every medium NA → disclosed 0, kept as an observed row |
| Reporter break | 1989–2003 Evans Cushing Inc (xylene/MEK/n-butyl alcohol/toluene, air only) → 2024 Cushing Batch Plant; one city aggregate, not one facility's trend |

The reader is `app/app/lib/cushing-tri.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a Stillwater/county/busy
relabel, or any edited pound value.
