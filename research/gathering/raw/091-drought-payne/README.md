# 091-DRTZ Payne County drought — US Drought Monitor raw fetch (2026-09-10)

- Source: U.S. Drought Monitor REST statistics, keyless HTTPS
  (documented at `https://droughtmonitor.unl.edu/DmData/DataDownload/WebServiceInfo.aspx`).
- Request: `CountyStatistics/GetDroughtSeverityStatisticsByAreaPercent`
  `?aoi=40119&startdate=1/1/2015&enddate=9/9/2026&statisticsType=1`
  (traditional cumulative percent-of-area; fields `None,D0..D4` as filed,
  where `D0` = percent of county in D0-or-worse, …, `D4` = exceptional).
- Files: `usdm_payne_40119_2015-2026.json` is the byte-for-byte JSON response
  (`Accept: application/json`, 610 rows); `usdm_payne_40119_2015-2026.csv`
  is the same query with default CSV output (610 data rows, newest-first).
  Both fetched 2026-09-10.
- Scope: FIPS `40119`, `Payne County, OK` on every row — county label kept
  honestly, never relabeled to Cushing city. Interactive map not scraped.
- Weeks: `mapDate` Tuesdays 2014-12-30..2026-09-01 (the week containing
  2015-01-01 starts 2014-12-30), 610 rows, 7-day steps, zero gaps.
  No missing weeks, so nothing filled and nothing left missing.
- Not GHCN inches, not Mesonet rain, not busy, no WTI. Weather/hydrology
  confounder only.
