# 091-WVOC-Z — Cushing terminal-context annual VOC series probe, 2026-09-10 (FAIL-CLOSED)

**What this is:** a freeze *receipt* for the attempted Cushing-city
terminal-context **annual VOC (and HAP) time series** from the same DEQ GIS
layer as `20260908T091WENVZ` (`AirWeb/MapServer/8`). **The identical
city+name filter yields terminal-like Operating rows for 2024 only, and one
annual point is not a series — so no series is frozen here.** No CSV, no JSON,
no TS reader, no test, no chart of a single point as a trend.

**What was probed (raw saved under `research/gathering/raw/VOC-20260910/`,
gitignored; probe notes in that folder's README):**

1. **Same layer, all disclosed years:** layer 8 holds `Year_Emissions_Reported`
   2020–2024 statewide, but `City='Cushing'` rows exist only for 2020 (4,
   telecom only), 2023 (8, meter/repeater/pads — none terminal-like), and 2024
   (28). The exact WENVZ filter reproduces 2024 only: 17 rows, VOC 1,206.389 t,
   HAP 19.715 t.
2. **No invented years:** 2015–2023 were not zero-filled; geography was not
   expanded to Agra (a hub-radius view stays a separately labelled universe).

Sibling annual layers (5/2020, 7/2021, 6/2022, 1/2023) return 17–18
terminal-like rows each under the same filter (read-only sums saved alongside
the raw probe), but merging separate annual snapshots is a different task with
its own field/methodology parity check — not done here.

| Field | Value |
| --- | --- |
| Run | `20260910T091WVOCZ` |
| Geography | Cushing city (`City = CUSHING`), terminal-like name filter (WENVZ-identical) |
| Verdict | `no dated rows` — no multi-year dated series in layer 8; receipt only |
| Annual points in scope | 1 (2024, already frozen in `20260908T091WENVZ`) |
| CSV / JSON | none (nothing multi-year to freeze) |
| TS reader / test | none (`app/app/lib/cushing-voc.ts`, `app/tests/cushing-voc.test.mjs` intentionally absent) |
| Checksum | none (no new disclosed annual total beyond frozen 2024) |

**Not this:** not AQI, not busy, not a relabel of the frozen 2024 footprint. A
future worker may take the sibling-layer 2020–2024 merge as its own task; if it
does, it freezes CSV+JSON with per-layer provenance, adds the reader with the
checksum rule (sum of disclosed VOC tons per year), and adds the fail-closed
tests.
