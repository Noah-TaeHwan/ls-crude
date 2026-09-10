# 091-QCEW-QZ — Payne County QCEW quarterly series, 2015-Q1..2026-Q1 (2026-09-09)

**What this is:** a frozen **quarterly time series** of Quarterly Census of
Employment and Wages employment for **Payne County, Oklahoma (FIPS 40119)**.
One point per year-quarter, month3 of each quarter (Mar / Jun / Sep / Dec).
County context only. Stillwater and OSU dominate this county; nothing here
describes Cushing city activity and nothing here is a busy signal.

**What this is not:** a Cushing-city series, a 0–100 score, a WTI overlay, or
a filled series. Missing quarters stay missing (none in this window).
Suppressed cells (`disclosure_code N`, source writes 0) are kept as missing,
never 0.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T15:15:26Z |
| Source | `https://data.bls.gov/cew/data/api/{year}/{qtr}/area/40119.csv` (no key, User-Agent `ls-crude-observations/1.0`) |
| Range | 2015-Q1 through 2026-Q1, 45 quarters, no gaps |
| Trailing probe | 2026-Q2 → HTTP 404, stop, no invented points |
| Raw | 45 CSVs under `research/gathering/raw/091-qcew-quarterly/` (gitignored, see `manifest.json`) |
| Total covered (Mar 2026) | **35,001** |
| Private NAICS 21 mining (Mar 2026) | **345** |
| Disclosed sums | totals **1,518,531** · mining **24,630** (see `receipt.json`) |
| Suppressed → missing | none in this window for these two cells; format keeps empty cells |

The reader is `app/app/lib/cushing-qcew-quarterly.ts`; it fails closed on
swapped years, filled zeros, last-value copies, or a Cushing-city relabel.
