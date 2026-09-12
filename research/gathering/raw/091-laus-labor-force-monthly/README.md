# Raw probe log — 091-LAUFZ Payne County monthly civilian labor force (2026-09-09)

Keyless probe for **Payne County, Oklahoma monthly civilian labor force**
(labor-force level count, persons, FIPS 40119, LAUS). Result: **139 dated
county months frozen** (2015-01..2026-07; 138 disclosed counts + 2025-10
published-missing).

## Probed (all keyless, no key, no login)

1. **BLS Public API v2 `POST https://api.bls.gov/publicAPI/v2/timeseries/data/`
   (preferred surface #1):** `REQUEST_SUCCEEDED`, no key, User-Agent
   `ls-crude-observations/1.0`. Series `LAUCN401190000000006`
   (LAUS county 40119, measure 006 = civilian labor force level, persons
   count — not the 003 unemployment rate, not the 005 employment level,
   not QCEW).
   - `{"seriesid":[...],"startyear":"2015","endyear":"2024"}` → 120 rows.
   - `{"seriesid":[...],"startyear":"2025","endyear":"2026"}` → 19 rows
     (2025-01..2026-07; no M13 annual rows in either payload).
2. **Blocked surfaces (documented, not used):** `www.bls.gov/lau/` and
   `download.bls.gov/pub/time.series/` return Akamai `Access Denied`
   (bot policy) per the 091-LAUSZ probe on this network. FRED not re-probed:
   BLS keyless already succeeded per preference order.

## Published-missing month (stays missing, never 0)

- `2025-10` value `"-"` with footnote `X`: *"Data unavailable due to the 2025
  lapse in appropriations."* Frozen as `null` / empty CSV cell.
- Latest month `2026-07 = 40352` carries footnote `P` (preliminary); kept as
  published, flagged in the index receipt. `2026-08` absent → stop, no
  invented points.

## Cross-check (not joined, sanity only)

- Spot months satisfy `labor_force ≈ employed / (1 − rate)` within BLS
  one-decimal rate rounding (e.g. 2015-01: 37394 vs 37383; 2020-04: 35407
  vs 35401), confirming measure 006 is the count level, not a rate.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `bls_LAUCN401190000000006_2015_2024.json`,
  `bls_LAUCN401190000000006_2025_2026.json` (gitignored raw API payloads)
