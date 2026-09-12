# Raw probe log — 091-LAUSZ Payne County monthly unemployment rate (2026-09-09)

Keyless probe for a **Payne County, Oklahoma monthly unemployment rate**
(FIPS 40119, LAUS). Result: **139 dated county months frozen**
(2015-01..2026-07; 138 disclosed values + 2025-10 published-missing).

## Probed (all keyless, no key, no login)

1. **FRED `fredgraph.csv?id=OKPAYN5URN` (preferred surface #1):** unreachable
   from this worker network — `https://fred.stlouisfed.org/graph/fredgraph.csv`
   timed out twice (HTTP/1.1, 60 s, 0 bytes; also for the `UNRATE` control).
   Not a 404/series-ID verdict, a transport failure. Fell through to surface #2.
2. **BLS Public API v2 `POST https://api.bls.gov/publicAPI/v2/timeseries/data/`
   (preferred surface #2):** `REQUEST_SUCCEEDED`, no key, User-Agent
   `ls-crude-observations/1.0`. Series `LAUCN401190000000003`
   (LAUS county 40119, measure 003 = unemployment rate, %).
   - `{"seriesid":[...],"startyear":"2015","endyear":"2024"}` → 120 rows.
   - `{"seriesid":[...],"startyear":"2025","endyear":"2026"}` → 19 rows
     (2025-01..2026-07; no M13 annual rows in either payload).
3. **Blocked surfaces (documented, not used):** `www.bls.gov/lau/` and
   `download.bls.gov/pub/time.series/` both return Akamai `Access Denied`
   (bot policy) from this network. `data.bls.gov/cew` still returns 200
   (QCEW control probe), so the block is host-specific, not a total outage.

## Published-missing month (stays missing, never 0)

- `2025-10` value `"-"` with footnote `X`: *"Data unavailable due to the 2025
  lapse in appropriations."* Frozen as `null` / empty CSV cell.
- Latest month `2026-07 = 4.5` carries footnote `P` (preliminary); kept as
  published, flagged in the index receipt. `2026-08` absent → stop, no
  invented points.

## Files in this folder

- `README.md` (this log — kept in git as pointer)
- `bls_LAUCN401190000000003_2015_2024.json`,
  `bls_LAUCN401190000000003_2025_2026.json` (gitignored raw API payloads)
