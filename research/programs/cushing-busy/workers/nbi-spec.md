# opencode worker — FHWA NBI bridges in Cushing / Payne

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md`.

## Outcome
AADT East Main is already frozen. This task freezes a **dated National Bridge Inventory inspection or condition series** for bridges in Cushing city or Payne County if a keyless FHWA NBI table exists. Bridge log, not AADT, not busy, not WTI.

Preferred keyless: FHWA NBI public ASCII/CSV/API (no login), filter Oklahoma + city CUSHING or county Payne (FIPS 40119). Do not scrape interactive maps. Do not invent Cushing from statewide OK.

Keep inspection/inventory year and a public count or rating as filed. Missing years stay missing. Do not fill 0. If only county rows exist, label Payne County.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091NBIZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-nbi.ts` and `app/tests/cushing-nbi.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, AADT files. Do not commit.

## Rules
- Label: Cushing/Payne NBI, dated, not AADT, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled years / statewide relabel.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "FHWA NBI Cushing bridges" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
