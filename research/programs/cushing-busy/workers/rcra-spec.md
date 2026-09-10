# opencode worker — EPA RCRA hazardous-waste handlers in Cushing city

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091ECHOZ/README.md` then `20260910T091TRIZ/README.md`.

## Outcome
ECHO CAA/CWA and TRI are already frozen. This task freezes a **dated RCRA hazardous-waste inspection, violation, or biennial-report quantity** series for Cushing-city handlers if a keyless ECHO RCRA REST table exists. Waste log, not TRI pounds, not CAA FCE, not CWA, not busy, not WTI.

Preferred keyless: EPA ECHO `rcr_rest_services.get_facilities` then DFR, filter `p_st=OK` and city CUSHING. Do not copy TRI, CAA, or CWA rows. Exclude non-Cushing ZIP-74023 cities.

Keep inspection/report date and a public count/quantity if disclosed. Missing dates stay missing. Do not fill 0.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091RCRAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-rcra.ts` and `app/tests/cushing-rcra.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, TRI/ECHO/CWA files. Do not commit.

## Rules
- Label: Cushing city RCRA, dated, not busy, not TRI.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled dates / statewide relabel / copying TRI.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA RCRA Cushing waste" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
