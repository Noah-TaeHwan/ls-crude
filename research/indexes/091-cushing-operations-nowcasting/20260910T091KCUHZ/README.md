# 091-KCUH-Z — KCUH daily airport weather, 2015-01-01..2026-09-08 (2026-09-10)

**What this is:** a frozen **daily time series** of airport weather at Cushing
Municipal Airport (ICAO `KCUH`, IEM id `CUH`, `OK_ASOS`): disclosed max/min
temperature °F and precipitation inches per station-local calendar day.
**A weather confounder for the Cushing desk, explicitly not activity, not
busy, never joined with WTI.**

**What this is not:** a busy score, a worker/truck count, tank levels, or a
trading signal. Rain or heat moves the field but does not measure it. Never
relabel as busy.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T15:40:52Z (IEM daily CSV; frozen here 2026-09-10) |
| Source | Iowa Environmental Mesonet daily ASOS, `network=OK_ASOS`, `stations=CUH` |
| Raw | `research/gathering/raw/KCUH-20260910/` (gitignored; mapping + trace notes) |
| Range | 2015-01-01 through 2026-09-08, **4269** days, no gaps, no backfill of 2014 |
| End rule | last complete UTC day at fetch; partial 2026-09-09 and empty 2026-09-10 dropped |
| Temps | disclosed both-or-neither; **38** days null; max-temp int sum **307313** |
| Precip | disclosed **863** days (incl. 3 numeric `0.0` observed dry); **3406** null |
| Trace | 8 days of IEM `0.0001` in stay missing (hourly `p01i` shows `0.00` all day) |

The reader is `app/app/lib/cushing-kcuh.ts`; it fails closed on swapped
dates, filled missing precip as 0, extra days past 2026-09-08, edited values,
a busy-score relabel, or a WTI mix-in.
