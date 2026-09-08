# 091 — PARK sub-track recheck, 2026-09-08

## Outcome

No parked sub-track has gained a long, validated operational time series. Two
routes changed materially:

| track | recheck result | updated decision |
| --- | --- | --- |
| **091-A / 091-F** | The 2025 City agenda's comparison tables extend the accessible tax evidence to **three fiscal years / 36 monthly positions** for hotel/motel and use-tax comparisons. The source still does not supply the 60-month disclosure-vintage panel required for a residual or association test. | **PARK / E1, stronger collection route** — preserve the 36-month basis; continue agenda collection. |
| **091-V** | DEQ's public-review route currently exposes named Cushing industrial facility permit statuses, including Cushing South Terminal, Cushing Tank Terminal and Tidal Cushing Crude Terminal. | **FORWARD ONLY / E1** as a human-reviewed *industrial-permit event log*. It is not a building-permit count, construction volume, or busy score. |

The current DEQ event-route sample is retained in
[`current_deq_industrial_event_routes.csv`](../../../gathering/raw/ALT-20260908-27/20260908T200000Z/current_deq_industrial_event_routes.csv).

## All remaining PARK decisions rechecked

| tracks | decision after recheck | reason / restart condition |
| --- | --- | --- |
| **091-D** tank shadows | **PARK** | Free Sentinel-2 remains obtainable, but 10m imagery has not passed tank-fill measurement feasibility. Keep it separate from city nightlights. |
| **091-E** pipeline apportionment | **PARK** | Operator notice routes remain discoverable; a dated, structured Cushing history is still absent. |
| **091-G** public-safety calls | **PARK** | No repeatable monthly anonymous calls-for-service panel was found. |
| **091-H / 091-I / 091-J** search, LODES, mobility bundle | **PARK / context only** | Search is purpose-ambiguous; LODES is annual; footfall/parking/dwell/mobile aggregates lack a valid long Cushing series. |
| **091-L** energy policy | **PARK / context only** | Public annual adoption and policy material remain structurally too slow and do not identify Cushing field activity. |
| **091-M / 091-N** City jobs and pages | **PARK** | Current jobs and 2024/25 agenda indexes are public, but no dated operational ledger exists. Forward page snapshots may be stored; do not count page activity as field activity. |
| **091-O** airport | **PARK** | The City-report sample remains four irregular reports; FAA WeatherCams still lacks a public aggregate activity series in this collection route. |
| **091-W** air / emissions | **PARK / context only** | DEQ facility records are usable annual/regulatory context; no continuous Cushing public monitor passed reproducibility. |
| **091-X** location spreads | **PARK** | The Cushing leg is public, but a same-definition, free Houston/Midland historical pair is still missing. |
| **091-Q / 091-R / 091-T** weather, events, dining/delivery | **PARK / context only** | Weather is an external control; event posts lack attendance; private restaurant/delivery activity has no public panel. |

## What was actually re-collected

- [City 2025 agenda tax comparison](https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf)
- [City 2024 agenda index](https://www.cityofcushing.com/node/14/agenda/2024) and [2025 index](https://www.cityofcushing.com/node/14/agenda/2025)
- [Oklahoma DEQ public permit review](https://applications.deq.ok.gov/PermitsPublicReview/)
- [ODOT Payne County AADT map](https://oklahoma.gov/content/dam/ok/en/odot/maps/aadt/county-maps/60_Payne.pdf)
- [FAA WeatherCams](https://weathercams.faa.gov/)

Raw responses and SHA-256 values: [collection receipt](../../../gathering/raw/ALT-20260908-27/20260908T200000Z/README.md).

## Guardrail

This recheck does not manufacture a correlation from the new permit list or the
36-month tax basis. Each promoted/parked route must first meet its own stated
measurement gate before it can be combined with CFAM.
