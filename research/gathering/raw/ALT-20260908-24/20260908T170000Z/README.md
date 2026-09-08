# ALT-20260908-24 — CFAM public-source collection receipt

**Collection date:** 2026-09-08  
**Scope:** links supplied for Cushing storage, traffic, airport imagery and
publicly mapped ALPR infrastructure.

`sources_manifest.json` records URL, HTTP status, byte count and SHA-256 for
every response. The collector retains no licence plates, individual vehicles,
identifiers, or movement history.

## Collection outcome

| source | raw response | intended observation | result |
| --- | --- | --- | --- |
| OilPriceAPI Cushing Storage | public page response | EIA storage display | collected; duplicate delivery layer of EIA |
| MacroMicro Cushing collection | HTTP status retained | EIA inventory charts | access outcome retained; source is EIA charting layer |
| FAA WeatherCams CUH | public application shell + API status response | airport imagery/history | API access outcome retained; no aggregate airport-activity series collected |
| ODOT Payne County AADT | official 2023 PDF + `odot_avc40_2023.csv` | fixed Cushing-area traffic/classification site | collected; only one annual AADT value, no time-series test |
| DeFlock / OSM | public map/page + two OSM node JSON records | fixed camera locations | collected; locations/directions only, no traffic-count series |

The resulting visualisation and interpretation are in
[`20260908T091SOURCEZ`](../../../../indexes/091-cushing-operations-nowcasting/20260908T091SOURCEZ/README.md).
