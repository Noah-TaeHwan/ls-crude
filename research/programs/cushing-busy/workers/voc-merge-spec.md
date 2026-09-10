# opencode worker — DEQ sibling-layer Cushing VOC 2020–2024 annual series

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091WVOCZ/README.md` and `20260908T091WENVZ/README.md`.

## Outcome
Layer 8 alone is 2024-only for terminal-like Cushing Operating rows. A previous probe *saw* sibling annual layers but did **not** freeze a series. This task may freeze an annual VOC (and HAP if disclosed) series **only after** proving field/methodology parity across layers.

Layers to query (keyless ArcGIS MapServer, User-Agent `ls-crude-observations/1.0`):
- 2020 → `AirWeb/MapServer/5`
- 2021 → `AirWeb/MapServer/7`
- 2022 → `AirWeb/MapServer/6`
- 2023 → `AirWeb/MapServer/1`
- 2024 → `AirWeb/MapServer/8`

Same filter as WENVZ: `City = CUSHING` (or the actual field name that layer uses) and facility name contains TERMINAL, TANK FARM, or CRUDE; keep Operating only if that status field exists on every layer. Do not expand to Agra.

## Parity gate (fail closed if any fail)
For each year, record the exact field names used for year, city, name, status, VOC tons, HAP tons. If a year is missing a VOC field, or city/name filter cannot be applied the same way, drop that year as missing — do not fill 0. Need **≥2 years** with comparable VOC totals or outcome failed `no dated rows`.

2024 total must match the frozen WENVZ checksum: 17 Operating terminal-like rows, VOC **1206.389** tons, HAP **19.715** tons. If 2024 does not match, fail closed.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091VOCYZ/` (README, receipt.json, csv, json with per-year `layerId`)
- `app/app/lib/cushing-voc.ts`
- `app/tests/cushing-voc.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, population, kcuh, enrollment. Do not commit.

## Rules
- Label: Cushing city terminal-context annual VOC by DEQ layer-year, not AQI, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Checksum = sum of disclosed annual VOC tons (do not round away the 2024 1206.389 match).
- Fail-closed: filled years, Agra merge, relabel as busy, 2024 mismatch vs WENVZ.
- Tests: n + 2024 match + checksum + fail-closed.
- Acceptance: `cd app && node --test tests/cushing-voc.test.mjs` passes, or honest failed receipt.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "DEQ VOC 2020-2024 series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
