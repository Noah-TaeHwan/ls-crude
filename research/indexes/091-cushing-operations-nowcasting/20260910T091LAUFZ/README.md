# 091-LAUFZ — Payne County monthly civilian labor force, 2015-01..2026-07 (2026-09-09)

**What this is:** a frozen **monthly time series** of the **Payne County,
Oklahoma civilian labor force** (labor-force level count, persons) from BLS
Local Area Unemployment Statistics (LAUS), series `LAUCN401190000000006`, via
the keyless BLS Public API v2. One point per month, persons. County
labor-market context only. Stillwater and OSU dominate this county; nothing
here describes Cushing city activity and nothing here is a busy signal.

**What this is not:** a Cushing-city series, statewide Oklahoma, QCEW
employment levels (already 091-QCEWQ), the LAUS unemployment *rate* series
(already 091-LAUSZ `cushing-laus.ts`, never copied here), the LAUS *employed
persons* series (already 091-LAUEZ `cushing-laus-employed.ts`, never copied
here), a 0–100 score, a WTI overlay, or a filled series. Missing months stay
missing: **2025-10** is published by BLS as unavailable (2025 lapse in
appropriations) and is frozen as `null` / an empty CSV cell, never 0.
**2026-07 = 40352** is preliminary (`P`) as published.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T18:27:00Z |
| Source | `POST https://api.bls.gov/publicAPI/v2/timeseries/data/` (no key, User-Agent `ls-crude-observations/1.0`), series `LAUCN401190000000006` |
| Range | 2015-01 through 2026-07, 139 months, no gaps except 2025-10 published-missing |
| Raw | 2 API payloads under `research/gathering/raw/091-laus-labor-force-monthly/` (gitignored, see that folder's README) |
| Disclosed (138) sum checksum | **5336427** (sum of disclosed labor-force counts, see `receipt.json`) |
| Latest | 2026-07 = 40352 (preliminary); 2026-08 absent → stop, no invented points |

The reader is `app/app/lib/cushing-laus-labor-force.ts`; it fails closed on
reordered months, redated periods, filled zeros, last-value copies, a
Cushing-city relabel, a statewide FIPS swap, or a rate/employed-as-count swap
(unemployment-rate or employed values, or the `unemployment_rate` / `employed`
keys, are rejected).
