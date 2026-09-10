# opencode worker — EPA AirNow / AQS ozone or PM for Cushing or Payne

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091VOCZ/README.md`.

## Outcome
DEQ VOC is already frozen. This task freezes a **dated ozone or PM2.5** series for a Cushing or Payne monitor from a keyless EPA AQS / AirData table if one exists. Ambient air confounder, not VOC tons, not TRI, not busy, not WTI.

Preferred keyless: EPA AirData pre-generated files or AQS API-without-key public CSV, filterable to OK + Cushing or Payne.

Keep sample date (or year-month) and a public concentration. Missing periods stay missing. Do not fill 0. Do not invent Cushing from statewide OK. Do not copy VOC or TRI.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091AQSZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-aqs.ts` and `app/tests/cushing-aqs.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, VOC/TRI/ECHO files. Do not commit.

## Rules
- Label: Cushing/Payne ambient ozone or PM, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA AQS Cushing air" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
