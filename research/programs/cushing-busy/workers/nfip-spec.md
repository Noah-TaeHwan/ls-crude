# opencode worker — OpenFEMA NFIP claims in Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091FEMAZ/README.md`.

## Outcome
OpenFEMA **disaster declarations** for Payne FIPS 119 are already frozen. This task freezes a **dated NFIP flood-claim or policy-count** series for Payne County (FIPS 40119) from a keyless OpenFEMA table if one exists. Flood insurance log, not declarations, not NOAA storms, not Cushing city, not busy, not WTI.

Preferred keyless: OpenFEMA FIMA NFIP Redacted Claims or Policy by county. Filter state OK and county FIPS **119** (Payne). Do not use Oklahoma County **109**. Do not copy `20260910T091FEMAZ` declaration rows.

Keep claim/policy date (or year-month) and a public count/amount if disclosed. Missing periods stay missing. Do not fill 0.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091NFIPZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-nfip.ts` and `app/tests/cushing-nfip.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, FEMA declaration files. Do not commit.

## Rules
- Label: Payne County NFIP, dated, not busy, not disaster declarations.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / FIPS 109 swap.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne NFIP claims" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
