# opencode worker — Payne County LAUS unemployment monthly

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260909T091QCEWQZ/README.md`.

## Outcome
Freeze a **monthly unemployment rate** for Payne County, Oklahoma (FIPS 40119) from BLS LAUS or FRED, if a keyless dated table exists. County labor-market rate, not QCEW employment levels already on the board, not busy, not WTI.

Preferred keyless:
1. FRED series for Payne County unemployment rate (LAUS), if downloadable without a key.
2. BLS LAUS public CSV/API for county 40119.

Keep `period` (YYYY-MM), `unemployment_rate`. Missing months stay missing. Do not fill 0. Do not substitute statewide Oklahoma. Do not relabel as Cushing city.

If the only files are QCEW employment counts, fail closed — QCEW is already 091-QCEWQ. If fewer than 2 months, receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091LAUSZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-laus.ts` and `app/tests/cushing-laus.test.mjs` only if ≥2 months

Do not edit observation UI, board JSON, PROGRAM.md, QCEW files, housing files, EIA files. Do not commit.

## Rules
- Label: Payne County unemployment rate, monthly LAUS, not Cushing city, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / city relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne LAUS unemployment" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
