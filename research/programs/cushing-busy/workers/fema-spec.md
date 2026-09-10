# opencode worker — FEMA disaster declarations for Payne County / Cushing

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **dated FEMA disaster-declaration** series for Payne County or Cushing, Oklahoma if a keyless OpenFEMA table exists. Disaster log, not busy, not WTI, not NOAA storm counts.

Preferred keyless: OpenFEMA DisasterDeclarationsSummaries or similar JSON without a key, filtered to Oklahoma + Payne or Cushing.

Keep declaration date (or incident begin) and a public count/type field. Missing years stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091FEMAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-fema.ts` and `app/tests/cushing-fema.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, storm/USGS files. Do not commit.

## Rules
- Label: Cushing/Payne FEMA declarations, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "FEMA Payne declarations" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
