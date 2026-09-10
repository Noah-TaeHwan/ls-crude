# 091-QCEW-Z — Payne County QCEW slice, 2025-Q1 (2026-09-09)

**What this is:** a dated Quarterly Census of Employment and Wages table for
**Payne County, Oklahoma (FIPS 40119)**, quarter 2025-Q1. County context only.
Stillwater and OSU dominate this county; nothing here describes Cushing city
activity and nothing here is a busy signal.

**What this is not:** a Cushing-city series, a 0–100 score, a WTI overlay, or a
filled time series. Missing quarters were not filled. Suppressed cells (`N`)
are kept as missing, never 0.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T14:38:55Z |
| Source | `https://data.bls.gov/cew/data/api/2025/1/area/40119.csv` (no key) |
| Raw | 191,817 bytes, SHA-256 `332ef8c0…7856b2f` (see `receipt.json`) |
| Quarter | 2025-Q1 → Jan / Feb / **Mar 2025** employment |
| Rows in source | 1278; rows kept: 7 |
| Total covered (Mar 2025) | **35,418** |
| Private NAICS 21 mining (Mar 2025) | **402** |
| Private NAICS 213112 oil & gas support (Mar 2025) | **231** |
| Private NAICS 721 accommodation (Mar 2025) | **450** |
| Suppressed → missing | 5/211 oil & gas extraction, 5/212 mining (except oil & gas) |

Raw CSV stays under `research/gathering/raw/` (gitignored). The reader is
`app/app/lib/cushing-qcew.ts`; it fails closed on swapped rows, invented
dates, or filled zeros.
