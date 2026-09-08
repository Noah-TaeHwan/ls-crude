# 091-W raw-data receipt

| route | actual retrieval result | usable Cushing time series? |
| --- | --- | --- |
| AirCasting public API, mobile PM2.5 | six documented AirBeam naming variants; `fetchableSessionsCount = 0` in a Cushing-centred 0.12° × 0.16° box, 2024-01-01 to 2026-09-05 | no |
| AirCasting public API, fixed active/dormant PM2.5 | no session returned for the same box/window | no |
| Oklahoma DEQ current monitoring network | official current-site table contains no Cushing site | no |
| IQAir Cushing map | public page exists, but automated access received a Vercel checkpoint; its visible map page does not provide a reproducible, station-identified long raw export in this audit | no |

`aircasting-cushing-pm25-query-20260908.json` preserves the representative public API response. SHA-256: `ecf4092e0d5aeefd16cf710bf00a4684616a1afa5694d7524478a6a076590ea3`.

No individual, mobile-device, contributor identity, or home/location inference is collected.
