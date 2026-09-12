# STORM probe 2026-09-10 — NOAA NCEI Storm Events, Payne County OK

Keyless official source: NOAA NCEI Storm Events bulk Details CSV over plain HTTPS (no key, no login).

## Sources (retrieved 2026-09-10 UTC)

- `StormEvents_details-ftp_v1.0_d2024_c20260728.csv.gz`
  `https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2024_c20260728.csv.gz`
  SHA-256 `2070b83eccab041b36360ab73645b9a249c3eefc5b92b5b3fc0cbba4d9fcc09c`
- `StormEvents_details-ftp_v1.0_d2025_c20260819.csv.gz`
  `https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2025_c20260819.csv.gz`
  SHA-256 `d9b46b4c6aae554723cadbb9691f3d5258371c02e530ba815d6fe41e4550149f`
- `StormEvents_details-ftp_v1.0_d2026_c20260901.csv.gz`
  `https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2026_c20260901.csv.gz`
  SHA-256 `da9ef977ec16f2fb275dd21aa2f40936700419f90ee9aa9b459f92e8dbf47f49`

## Filter (frozen, not relabeled)

`STATE=OKLAHOMA` and `CZ_NAME` contains `PAYNE`, as filed. One row per `EVENT_ID`.
Date rule: `BEGIN_DATE_TIME` date part -> ISO, cross-checked against `YEAR` + `BEGIN_DAY`.
Missing months/years stay missing; no zeros filled. Not statewide OK, not Cushing-invented.

## Re-fetch

```sh
curl -O https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2024_c20260728.csv.gz
curl -O https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2025_c20260819.csv.gz
curl -O https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2026_c20260901.csv.gz
```
