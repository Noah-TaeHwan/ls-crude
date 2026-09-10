# opencode worker — Payne County monthly oil/gas production (OCC/EIA)

Read first: `research/programs/cushing-busy/loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **monthly county production** time series for **Payne County, Oklahoma** (FIPS 40119). County petroleum context, not Cushing-city busy, not tank-farm throughput, not WTI.

Preferred keyless public surfaces, in order:
1. EIA petroleum county production if a Payne, OK crude monthly series exists without an API key (HTML/XLS like the Cushing stocks freeze). Do not call EIA v2 without a key.
2. Oklahoma Corporation Commission public monthly county oil/gas production tables if they are downloadable CSV/XLS without login.

If neither surface returns dated monthly rows, fail closed: receipt only, no TS reader, outcome failed `no dated rows`. Do not scrape a GIS map into invented months. Do not substitute statewide Oklahoma production.

Keep per month if disclosed: `month` (YYYY-MM), `crude_bbl` and/or `gas_mcf` as the source labels them. Missing months stay missing. Do not fill 0.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091OCCZ/` (README, receipt.json, csv, json)
- `app/app/lib/cushing-occ.ts`
- `app/tests/cushing-occ.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, KCUH, population, enrollment, kush, or QCEW files.

## Rules
- Label: Payne County monthly production, not Cushing field busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Checksum = sum of disclosed crude_bbl (or gas if crude absent).
- Fail-closed: filled zeros, swapped counties, relabel as busy → null.
- Tests: n + last month/value + checksum + fail-closed.
- Acceptance: `cd app && node --test tests/cushing-occ.test.mjs` passes.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne county production series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
