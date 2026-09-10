# opencode worker — Payne County LAUS employment level monthly

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091LAUSZ/README.md`.

## Outcome
The board already has Payne **unemployment rate**. This task freezes the **monthly employment level** (employed persons count) for Payne County FIPS 40119 from BLS LAUS / FRED if a keyless dated table exists. County labor-market count, not the rate series, not QCEW, not busy, not WTI.

Preferred keyless:
1. BLS Public API series `LAUCN401190000000005` (employment level) without a key.
2. FRED equivalent if downloadable without a key.

Keep `period` (YYYY-MM), `employed`. Missing months stay missing (including any 2025-10 published-unavailable). Do not fill 0. Do not relabel as Cushing city. Do not copy the unemployment-rate freeze.

If fewer than 2 months, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091LAUEZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-laus-employed.ts` and `app/tests/cushing-laus-employed.test.mjs` only if ≥2 months

Do not edit observation UI, board JSON, PROGRAM.md, the rate series `cushing-laus.ts`. Do not commit.

## Rules
- Label: Payne County employed persons, monthly LAUS, not unemployment rate, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / city relabel / rate-as-count swap.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne LAUS employment level" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
