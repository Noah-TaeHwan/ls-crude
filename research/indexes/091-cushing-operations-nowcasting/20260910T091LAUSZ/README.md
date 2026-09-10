# 091-LAUSZ — Payne County monthly unemployment rate series, 2015-01..2026-07 (2026-09-09)

**What this is:** a frozen **monthly time series** of the **Payne County,
Oklahoma unemployment rate** from BLS Local Area Unemployment Statistics
(LAUS), series `LAUCN401190000000003`, via the keyless BLS Public API v2.
One point per month, percent. County labor-market context only. Stillwater
and OSU dominate this county; nothing here describes Cushing city activity
and nothing here is a busy signal.

**What this is not:** a Cushing-city series, statewide Oklahoma, QCEW
employment levels (already 091-QCEWQ), a 0–100 score, a WTI overlay, or a
filled series. Missing months stay missing: **2025-10** is published by BLS
as unavailable (2025 lapse in appropriations) and is frozen as `null` / an
empty CSV cell, never 0. **2026-07 = 4.5** is preliminary (`P`) as published.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T17:26:06Z |
| Source | `POST https://api.bls.gov/publicAPI/v2/timeseries/data/` (no key, User-Agent `ls-crude-observations/1.0`), series `LAUCN401190000000003` |
| FRED probe | `fredgraph.csv?id=OKPAYN5URN` timed out twice from this network (0 bytes); BLS API used per preference order |
| Range | 2015-01 through 2026-07, 139 months, no gaps except 2025-10 published-missing |
| Raw | 2 API payloads under `research/gathering/raw/091-laus-monthly/` (gitignored, see that folder's README) |
| Disclosed (138) tenths checksum | **4731** (sum of disclosed rates × 10, see `receipt.json`) |
| Latest | 2026-07 = 4.5 (preliminary); 2026-08 absent → stop, no invented points |

The reader is `app/app/lib/cushing-laus.ts`; it fails closed on
reordered months, redated periods, filled zeros, last-value copies, a
Cushing-city relabel, or a statewide FIPS swap.
