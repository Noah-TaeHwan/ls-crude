# opencode worker — NHTSA/FARS crashes in Cushing or Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **dated crash-count** series for Cushing city or Payne County from a keyless NHTSA FARS / CISS / open crash table if one exists. Traffic-safety log, not busy, not WTI, not AADT.

Preferred keyless: NHTSA FARS FTP/API or data.transportation.gov filterable to OK + Cushing or Payne without a key.

Keep year (or crash date) and count. Missing years stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091NHTSAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-nhtsa.ts` and `app/tests/cushing-nhtsa.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, FRA files. Do not commit.

## Rules
- Label: Cushing/Payne crash counts, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "NHTSA Cushing crashes" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
