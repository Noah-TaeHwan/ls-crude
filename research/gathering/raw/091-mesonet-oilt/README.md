# 091-MESOZ Mesonet OILT — keyless raw fetch (2026-09-09/10)

- Source: Oklahoma Mesonet public summaries, keyless HTTP, no login, no
  interactive map. User-Agent `ls-crude-research/1.0`, sequential, ~0.3 s
  between requests.
- Monthly per-station chunks:
  `http://www.mesonet.org/data/public/mesonet/summaries/monthly/mts/<YYYY>/<MM>/<YYYYMM>oilt.mts`
  — 141 files, 2015-01 through 2026-09, all HTTP 200, `mts/` (1.1 MB total).
- Each `.mts` file holds one row per calendar day (`TIME = 360 + 1440*day`,
  minutes from month start); row count equals days in the month (September
  2026 holds 8 rows: Sep 1–8). Station row tag `OILT`, station no. 71.
- Fields kept as filed: `TMAX`/`TMIN`/`TAVG` (°F), `RAIN` (in), with group
  bad-obs counters `TBAD`/`RBAD` (288 = full day bad). Disclosed iff counter
  is 0 and the value is not a `-996`/`-999` sentinel. Whole-station outages
  (e.g. 2016-02 `-996` days) and recent rain-gauge outages (2026-06..08
  `RAIN -999` with `RBAD 288`, temps still disclosed) stay missing, never 0.
- Station choice: `station-table-excerpt.txt` (STID/NAME/LAT/LON snapshot
  from `current.csv.txt`, 2026-09-09, 120 stations; full snapshot not kept).
  Distance from Cushing, OK (35.9849,-96.7645, haversine): OILT Oilton
  (36.03,-96.50) 24.3 km — nearest; PERK Perkins 25.7 km runner-up, not
  stitched. Oilton sits in Creek County; the series is labeled nearest
  Cushing, never relabeled as Cushing-town or Payne County.
- Cross-check: `.mts` daily rows equal the all-station `daily.mdf`
  fixed-width OILT rows — 2015-01-04 (`35.97/13.68/21.45`) and 2026-09-01
  (`102.54/70.12`) verified on both paths. (`daily.mdf` is fixed-width;
  naive whitespace splitting misaligns it — header-label index slicing
  drops leading digits. `.mts` is whitespace-safe and is the frozen path.)
- Window 2015-01-01..2026-09-08 (4269 days) aligns with the KCUH confounder
  window for side-by-side reading; values are independent Mesonet gauge
  observations, never copied from KCUH/GHCN.
- Not activity, not busy, no WTI. Weather confounder only.
