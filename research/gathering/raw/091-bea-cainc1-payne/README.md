# Raw probe log — 091-INCZ Payne County annual personal income, BEA CAINC1 (2026-09-10)

Keyless probe for **Payne County, Oklahoma annual personal income**
(GeoFIPS 40119, BEA Regional CAINC1 LineCode 1). Result: **56 dated county
rows frozen** (1969..2024, no gaps, no suppressed cells).

## Probed (all keyless, no key, no login)

1. **BEA Regional CAINC1 zip (preferred surface):**
   `https://apps.bea.gov/regional/zip/CAINC1.zip` → 200 OK, 3,467,441 bytes.
   Member `CAINC1_OK_1969_2024.csv` (sha256
   `504781fe813bed12cba9ba7d7e7968acb7ef8374b1967a0e50922925a2adf4dc`)
   holds one row per county per LineCode. Payne row:
   GeoFIPS `"40119"`, GeoName `Payne, OK`, LineCode `1`,
   Description `Personal income (thousands of dollars)`,
   Unit `Thousands of dollars`, 1969=121389 … 2024=4121797.
   Member `CAINC1__definition.xml` carries the table/line definitions
   (personal income = wages + supplements + proprietors' + rental + dividends
   + interest + transfers, less social insurance, plus residence adjustment).
   Zip sha256 `e1465c8b0e7e75f541241fe2fa64364b784dd6d2223901f9d576c4c5d49480b5`.
   No HTML scraping; no `downloadzip.cfm` fallback needed.
2. **Blocked / not used:** FRED (needs a key — out of scope per task),
   `apps.bea.gov` HTML pages (scraping prohibited), BEA API (needs a key).
   LAUS employment, PEP population, and PEP housing units are separate frozen
   series and were never copied here.

## FIPS guard

Oklahoma County (Oklahoma City) is GeoFIPS **40109** — a different row in the
same file (2024=62672140). Frozen rows take **40119 only**; 40109 is quoted
here as a swap guard, never frozen.

## Unit (as filed, never converted)

**Thousands of dollars**, exactly as the file's `Unit` column states.
2024 = 4,121,797 thousand dollars. No dollar conversion, no per-capita
(LineCode 3) splice, no population (LineCode 2) copy.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `CAINC1.zip`, `CAINC1_OK_1969_2024.csv`, `CAINC1__definition.xml`
  (gitignored raw BEA payloads)
