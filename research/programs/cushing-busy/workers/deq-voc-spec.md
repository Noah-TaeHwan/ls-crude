# opencode worker — Cushing terminal VOC annual time series from DEQ GIS

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091WENVZ/README.md`.

## Outcome
091-WENVZ already froze **one year** (2024 VOC 1,206.389 tons, 17 Cushing-city terminal-like facilities). This task asks whether the same DEQ Point Source Emissions layer has **more than one year**. If it does, freeze an **annual VOC (and HAP if disclosed) time series** for the same city+name filter (`City = CUSHING` and name contains TERMINAL, TANK FARM, or CRUDE).

If only 2024 exists, fail closed: receipt that says one year is not a series, do not chart a single point as a trend, no TS reader, outcome failed `no dated rows` (meaning no multi-year dated series).

Source (keyless): DEQ GIS MapServer layer documented in 091-WENVZ README:
`https://gis.deq.ok.gov/server/rest/services/AirWeb/MapServer/8`

Query years the layer actually discloses. Do not invent 2015–2023 zeros. Do not expand geography to Agra.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091WVOCZ/` (README, receipt, csv/json if multi-year)
- `app/app/lib/cushing-voc.ts` and `app/tests/cushing-voc.test.mjs` only if ≥2 annual points

Do not edit observation UI, board JSON, PROGRAM.md, population, kcuh, enrollment.

## Rules
- Label: Cushing city terminal-context annual VOC, not AQI, not busy.
- Korean JSDoc. Fail-closed on filled years / city relabel.
- Save raw under `research/gathering/raw/`.
- Acceptance: tests pass, or honest failed receipt.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "DEQ VOC annual series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
