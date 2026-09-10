# opencode worker — EPA ECHO CWA DMR effluent quantities, Cushing city

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/README.md`.

## Outcome
ECHO CWA last-inspection counts are already frozen. This task freezes a **dated NPDES Discharge Monitoring Report (DMR) quantity** series for Cushing-city permits if a keyless ECHO effluent table exists. Water discharge log, not last-inspection counts, not CAA, not TRI, not busy, not WTI.

Preferred keyless: EPA ECHO effluent/DMR REST (`eff_rest_services` or documented CWA DMR surface), filter Oklahoma and city **CUSHING**. Do not copy `20260910T091CWAZ` last-inspection rows. Exclude CRUSHING typo and non-Cushing ZIP-74023 cities.

Keep monitoring period date and a public quantity as filed. Missing periods stay missing. Do not fill 0.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-echo-dmr.ts` and `app/tests/cushing-echo-dmr.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, CWA inspection files. Do not commit.

## Rules
- Label: Cushing city ECHO DMR, dated, not last-inspection counts, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled periods / statewide relabel / copying CWA inspections.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA ECHO Cushing DMR" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
