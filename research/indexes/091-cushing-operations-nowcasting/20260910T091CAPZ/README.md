# 091-CAP — Cushing working storage capacity (2026-09-09)

**What this is:** EIA 탱크 작업 저장 용량(tank working storage
capacity) for the Cushing, OK commercial crude oil market center, from
the keyless `crudeoilstorage.xlsx` workbook behind EIA's Working and
Net Available Shell Storage Capacity report (Form EIA-813 source).
Thousand barrels.
**What this is not:** weekly stocks (`WCESTUS1` / `20260909T091EIAZ`),
monthly stocks (`MCRST_YCUOK_1` / `20260909T091EIAMZ`), net available
shell capacity, utilization, busy, or WTI. Stocks rows from the same
sheet were read for row-identity only and are not frozen here.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T17:14:28Z |
| XLSX | `crudeoilstorage.xlsx` HTTP 200, 77,953 bytes, SHA-256 `283fc78a92a8c04b50f5c92f61485906dd84d8a45d2837a0cf01227c6efa2176` |
| File stamp | Last-Modified Tue, 27 Aug 2024 14:57:09 GMT |
| Report release date | 2024-05-31 (data for March 2024) |
| Next release | **Discontinued** — series ends at 2024-03, no future points expected |
| Frequency | Semiannual March/September 2011–2019, annual March from 2020 |
| First period | 2011-03-31 → 48,001 kbbl working |
| Latest period | **2024-03-01** → 78,410 kbbl working |
| Rows kept | 23 dated capacity points |
| Sum / min / max | 1,642,412 / 48,001 / 78,449 (kbbl) |

Periods are the workbook cell dates verbatim. EIA's convention labels
these snapshots March 31 / September 30, but the file itself carries
day-1 dates from 2015-09 onward (2016-09-30 and 2017-09-30 excepted);
they were not normalized — inventing month-end dates would break the
frozen checksum. No periods are missing inside the published range, so
nothing was filled and no 0 appears.

- [Processed CSV](cushing_working_storage_capacity.csv)
- [Frozen JSON](cushing_working_storage_capacity.json)
- [Receipt](receipt.json)

Raw XLSX + report page stay under
`research/gathering/raw/091-cushing-working-storage/` (gitignored).
