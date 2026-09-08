# ALT-20260908-04 Sentinel-2 catalogue sample receipt

| field | value |
| --- | --- |
| source | Copernicus Data Space STAC `https://stac.dataspace.copernicus.eu/v1/search` |
| request | `collections=sentinel-2-l2a`; bbox `-96.80,35.96,-96.73,36.02`; datetime `2023-09-01/2023-09-30`; limit 5 |
| retrieved_at | 2026-09-08 (interactive scope run; exact client timestamp not retained) |
| sample | 5 metadata rows; no image asset downloaded |
| observed_at | acquisition datetimes in the JSON; latest listed 2023-09-26T17:10:51.024Z |
| available_at | catalogue search time only; product publication timing not yet reconstructed |
| raw_sha256 | `3d4d5d6bc53fe8dfad48307cc9bc16c7197f87ff4b08117057f4c4887ff6bcfa` (`sentinel2-cushing-metadata-sample.json`) |
| boundary | JSON describes scene metadata, not tank pixels, shadows, fill level, capacity, or inventory |
