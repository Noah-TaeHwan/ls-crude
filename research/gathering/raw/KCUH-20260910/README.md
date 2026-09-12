# KCUH daily weather — IEM raw fetch (2026-09-09)

- Source: Iowa Environmental Mesonet daily ASOS (keyless CSV)
- URL: `https://mesonet.agron.iastate.edu/cgi-bin/request/daily.py?network=OK_ASOS&stations=CUH&year1=2015&month1=1&day1=1&year2=2026&month2=9&day2=10`
- Fetched: 2026-09-09T15:40:52Z, User-Agent `ls-crude-observations/1.0`
- Station id mapping: Cushing Municipal Airport is ICAO `KCUH` / FAA `CUH`;
  IEM keys it as `CUH` under `OK_ASOS`. `stations=KCUH` returns
  `station: KCUH not found`; `stations=CUH` returns 4271 contiguous rows.
- Raw file `kcuh_daily_2015-2026_raw.csv` is the byte-for-byte IEM response
  (4271 rows, 2015-01-01..2026-09-10, station column always `CUH`).
- IEM day rows are station-local calendar days. Fetch ran 2026-09-09 ~10:40 CDT,
  so the 2026-09-09 row is partial (averages `None`) and 2026-09-10 is empty.
  Frozen series ends at the last complete UTC day, 2026-09-08.
- Trace encoding: 8 days carry precip `0.0001` in (physically unobservable;
  hourly `p01i` for e.g. 2017-11-28 shows `0.00` on all 72 obs). Treated as
  trace → missing, never coerced to 0. Three days carry numeric `0.0`
  (observed dry, kept as 0). `None` stays missing.
- Not activity, not busy, no WTI. Weather confounder only.
