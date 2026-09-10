# opencode worker — EPA ECHO air/water inspections in Cushing or Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091TRIZ/README.md` then `20260910T091VOCZ/README.md`.

## Outcome
TRI and DEQ VOC are already frozen. This task freezes a **dated EPA ECHO inspection or enforcement-action** series for Cushing city or Payne County if a keyless public table exists. Regulatory log, not TRI pounds, not VOC tons, not busy, not WTI.

Preferred keyless: EPA ECHO / ECHO REST (echo.epa.gov) facility inspections filterable to OK + Cushing or Payne without a key.

Keep inspection/action date (or year) and a public count/type field if disclosed. Missing years stay missing. Do not fill 0. Do not invent Cushing from statewide OK. Do not copy TRI or VOC values.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091ECHOZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-echo.ts` and `app/tests/cushing-echo.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, TRI/VOC/OSHA files. Do not commit.

## Rules
- Label: Cushing/Payne EPA ECHO inspections, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA ECHO Cushing inspections" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
