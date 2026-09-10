# opencode worker — EPA ECHO CWA/NPDES inspections in Cushing city

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091ECHOZ/README.md`.

## Outcome
ECHO **CAA / air** last-FCE is already frozen. This task freezes a **dated ECHO Clean Water Act / NPDES inspection or last-eval** series for Cushing-city facilities if a keyless ECHO REST table exists. Water regulatory log, not CAA FCE, not TRI, not VOC, not busy, not WTI.

Preferred keyless: EPA ECHO REST `get_facilities` / facility QID for CWA, filter `p_st=OK` and city CUSHING (or ZIP 74023 **and** city CUSHING). Do not copy `20260910T091ECHOZ` air rows. Exclude non-Cushing ZIP-74023 cities.

Keep inspection/eval date and a public count/type if disclosed. Missing dates stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-echo-cwa.ts` and `app/tests/cushing-echo-cwa.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, CAA ECHO/TRI/VOC files. Do not commit.

## Rules
- Label: Cushing city ECHO CWA/NPDES, dated, not busy, not air FCE.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / statewide relabel / copying CAA rows.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA ECHO Cushing CWA" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
