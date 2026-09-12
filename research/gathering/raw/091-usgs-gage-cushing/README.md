# 091-GAGEZ gage height — USGS raw probe (2026-09-10)

- Source: USGS Waterservices NWIS, keyless HTTPS (User-Agent default curl).
- Site: `07161450 Cimarron River near Ripley, OK` (ST, 35.9858927,-96.9122504,
  state 40, county 119 Payne, HUC 11050003) — nearest Payne County DV gage to
  Cushing town center (**12.8 km**). Not a Cushing-city gage: no Cushing-named
  Oklahoma gage carries public daily values (checked in 091-USGSZ).
- DV probes for parameter `00065` (gage height, feet), all returned
  `# No sites found matching all criteria` (81-byte RDB, header only):
  - `https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=07161450&parameterCd=00065&statCd=00003&startDT=1900-01-01&endDT=2026-09-09`
  - same URL without `statCd`
  - same URL with `statCd=00001` and with `statCd=00002`
  - `https://waterservices.usgs.gov/nwis/dv/?sites=07161450&parameterCd=00065&format=json`
    → `timeSeries: []` (requestId `12ea0260-acb5-11f1-83d7-005056beda50`,
    requestDT `2026-09-10T01:15:13.159Z`).
- DV inventory for the site (no parameter filter,
  `startDT=2026-08-01&endDT=2026-09-09`) lists exactly one daily series:
  `TS_ID 111131, Parameter 00060, Statistic 00003, Discharge, cubic feet per
  second (Mean)`. No `00065` daily series is published for this site.
- IV probe `https://waterservices.usgs.gov/nwis/iv/?sites=07161450&parameterCd=00065&format=json`
  returns one latest instantaneous unit value (`00065`, stat `00000`,
  `6.56 ft`, qualifiers `P`, `2026-09-09T20:00:00.000-05:00`). Unit values are
  not daily means — rejected for this freeze, not copied, not relabeled.
- Fetched: 2026-09-10T01:16Z.
- Dated daily-mean gage-height rows disclosed: **0** (bar: ≥2). No 0-fill, no
  discharge-cfs copy, no IV-to-DV invention. Hydrology confounder only, never
  busy, never WTI.
