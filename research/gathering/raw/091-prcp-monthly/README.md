# 091-PRCPZ monthly precipitation — NCEI raw fetch (2026-09-09)

- Source: NOAA NCEI GHCN-Daily bulk `.dly`, keyless HTTPS (User-Agent default curl).
- Station file: `https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/US1OKPY0019.dly`
  (`US1OKPY0019.dly` here is the byte-for-byte response, 2017-05-25..2021-11-03 rows).
- Station meta: `https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt`
  → `US1OKPY0019  35.9705  -96.7057  256.0 OK CUSHING 3.2 E`
  (excerpt in `ghcnd-cushing-stations.txt`).
- Inventory: `https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-inventory.txt`
  → `US1OKPY0019 PRCP 2017 2021`. Fetched 2026-09-09T17:31Z (not kept; 36 MB).
- Fetched: 2026-09-09T17:33Z.
- Station choice: Cushing-town gauges only. Long-record `USC00342318`
  (CUSHING COOP, PRCP 1937–2013) ends 2013 — unusable for a 2015+ series.
  `US1OKPY0008` (CUSHING 3.2 WNW, PRCP 2011–2018) overlaps but is a different
  volunteer gauge — not stitched, to keep one gauge and one provenance.
- IEM path (preferred order #1) fails for monthly: `daily.py`
  `network=OK_ASOS&stations=CUH` returns `precip None` for 2026-08-01..10
  (`iem_probe_2026-08.csv`), and the frozen KCUH daily CSV (2015-01-01..2026-09-08,
  863/4269 days disclosed) yields **0 complete calendar months** out of 141.
  Probe kept here; full IEM raw lives under `research/gathering/raw/KCUH-20260910/`.
- GHCN `.dly` parsing: `PRCP` element, 31 × 8-char fields (value tenths of mm,
  mflag, qflag, sflag); `-9999` = missing. All disclosed daily values in range
  carry blank `qflag`. `mflag T` (trace, value 0) on 45 days file-wide, 42 inside
  disclosed months — adds 0 to monthly sums.
- Monthly rule: disclosed only if every calendar day present; else missing.
  47 disclosed / 8 missing over 2017-05..2021-11. `precip_in` = round(sum/254, 3).
- Not activity, not busy, no WTI. Weather confounder only.
