# opencode worker — US Drought Monitor Payne County weekly

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091PRCPZ/README.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/README.md`.

## Outcome
GHCN monthly precip and Mesonet OILT daily rain/temp are already frozen. This task freezes a **dated US Drought Monitor** series for Payne County, Oklahoma (FIPS 40119) if a keyless weekly or categorical table exists. Weather/hydrology confounder, not GHCN inches, not Mesonet rain, not busy, not WTI.

Preferred keyless: Drought Monitor GIS/statistics CSV (`https://droughtmonitor.unl.edu/DmData/DataTables.aspx` county statistics export, or documented `droughtmonitor.unl.edu` / `droughtmonitor.unl.edu/data` county CSV). Filter Oklahoma + Payne. Do not scrape the interactive map. Do not invent Cushing-city drought from statewide OK. Label county honestly.

Keep week-ending date (or map date) and a public field as filed (e.g. D0-D4 area percent, or a documented drought category). Missing weeks stay missing. Do not fill 0.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091DRTZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-drought.ts` and `app/tests/cushing-drought.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, precip/Mesonet/KCUH files. Do not commit.

## Rules
- Label: Payne County US Drought Monitor, dated, not Cushing city, not busy, not GHCN precip.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled weeks / statewide relabel / copying Mesonet rain.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "US Drought Monitor Payne" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
