# opencode worker — Payne County LAUS labor force monthly

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091LAUSZ/README.md` then `20260910T091LAUEZ/README.md`.

## Outcome
The board already has Payne unemployment **rate** and **employed persons**. This task freezes the **monthly civilian labor force** for Payne County FIPS 40119 from BLS LAUS if a keyless dated table exists. County labor-force count, not rate, not employed, not QCEW, not busy.

Preferred keyless: BLS Public API `LAUCN401190000000006` without a key.

Keep `period` (YYYY-MM), `labor_force`. Missing months stay missing (including 2025-10 if unpublished). Do not fill 0. Do not relabel as Cushing city. Do not copy the rate or employed freezes.

If fewer than 2 months, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091LAUFZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-laus-labor-force.ts` and `app/tests/cushing-laus-labor-force.test.mjs` only if ≥2 months

Do not edit observation UI, board JSON, PROGRAM.md, `cushing-laus.ts`, `cushing-laus-employed.ts`. Do not commit.

## Rules
- Label: Payne County civilian labor force, monthly LAUS, not unemployment rate, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / city relabel / rate-as-count swap.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne LAUS labor force" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
