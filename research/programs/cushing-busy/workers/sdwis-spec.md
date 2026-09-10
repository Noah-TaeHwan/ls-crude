# opencode worker — EPA SDWIS drinking-water violations in Cushing / Payne

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091CWAZ/README.md`.

## Outcome
ECHO CWA inspections are already frozen. This task freezes a **dated SDWIS drinking-water violation or sample-result** series for Cushing city or Payne County PWS if a keyless EPA Envirofacts / SDWIS table exists. Drinking-water log, not NPDES inspections, not TRI, not busy, not WTI.

Preferred keyless: EPA Envirofacts SDWIS REST or ECHO SDWA facility search, filter Oklahoma + Cushing or Payne. Do not copy CWA inspection rows.

Keep violation/sample date and a public count/type if disclosed. Missing dates stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091SDWISZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-sdwis.ts` and `app/tests/cushing-sdwis.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, CWA/ECHO files. Do not commit.

## Rules
- Label: Cushing/Payne SDWIS drinking water, dated, not busy, not CWA NPDES.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled dates / statewide relabel.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA SDWIS Cushing water" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
