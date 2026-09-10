# opencode worker — NOAA Storm Events in Cushing or Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **dated storm-event count** series for Cushing city or Payne County from keyless NOAA Storm Events if a local table exists. Weather confounder, not busy, not WTI, not GHCN precip, not KCUH temperature.

Preferred keyless: NOAA NCEI Storm Events CSV/API filterable to Oklahoma + Cushing or Payne County without a key.

Keep event begin date (or year-month) and a public count/magnitude field if disclosed. Missing months/years stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091STMZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-storm.ts` and `app/tests/cushing-storm.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, precip/KCUH/NHTSA/OSHA files. Do not commit.

## Rules
- Label: Cushing/Payne NOAA storm events, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "NOAA Cushing storm events" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
