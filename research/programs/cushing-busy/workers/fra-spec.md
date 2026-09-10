# opencode worker — FRA rail incidents near Cushing / Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091PHMSAZ/README.md`.

## Outcome
PHMSA HL pipeline incidents are already on the board. This task freezes a **dated FRA rail incident** series for Cushing city or Payne County if a keyless public table exists. Rail safety log, not throughput, not busy, not WTI, not PHMSA.

Preferred keyless: FRA safety data / open data CSV (highway-rail crossing or train accidents) filterable to OK + Cushing or Payne without login.

Keep incident date and a public count/severity field if disclosed. Missing years stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091FRAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-fra.ts` and `app/tests/cushing-fra.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, PHMSA files. Do not commit.

## Rules
- Label: FRA Cushing/Payne rail incidents, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled dates / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "FRA Cushing rail incidents" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
