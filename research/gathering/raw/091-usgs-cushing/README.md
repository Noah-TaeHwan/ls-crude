# 091-USGSZ streamflow — USGS raw fetch (2026-09-10)

- Source: USGS Waterservices NWIS daily values, keyless HTTPS (User-Agent default curl).
- DV file: `https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=07161450&parameterCd=00060&statCd=00003&startDT=1900-01-01&endDT=2026-09-09`
  (`nwis_dv_07161450_00060_raw.rdb` here is the byte-for-byte response, 14224
  data rows, 1987-10-01..2026-09-09, gapless).
- Site meta: `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=07161450&siteOutput=expanded`
  (`nwis_site_07161450_raw.rdb`) → `07161450 Cimarron River near Ripley, OK`,
  ST, 35.9858927, -96.9122504, state 40, county 119 (Payne), HUC 11050003.
- Fetched: 2026-09-10T04:55Z.
- Station choice: all Payne County DV stream gages listed
  (`07160810` Wildhorse Creek near Perkins, `07161000` Cimarron at Perkins
  ends 1991, `07161450` Cimarron near Ripley active, `07162000` Stillwater
  Creek, `07162500` West Fork Brush Creek, `07163000` Council Creek,
  `07163300` Cimarron near Yale ends 2018). No station named Cushing carries
  OK DV data (`stationNm=Cushing` returns nothing). Ripley is nearest to
  Cushing town center (12.8 km) and the only active Payne DV gage — one gage,
  one provenance, no stitching, no distant Oklahoma River substitute.
- DV parsing: tab-delimited RDB, `datetime` + first `00060_00003` value column
  + qualifier column; `#`-comment and width rows skipped. Approval class as
  filed (`A`, `A:e`, `P`, `P:e`, one `P:[4]`).
- Not activity, not busy, no WTI. Hydrology confounder only.
