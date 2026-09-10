# opencode worker — Census LODES annual workplace employment, Payne/Cushing

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md` then `research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/README.md`.

## Outcome
091-I already has a **2022-only** LODES workplace-OD snapshot. QCEW quarterly county employment is already frozen. This task freezes a **multi-year annual LODES workplace employment** series for Payne County (FIPS 40119) and, if the same files disclose it, Cushing place/blocks, from keyless LEHD LODES WAC/OD CSV. Community employment structure, not QCEW, not busy, not WTI.

Preferred keyless: Census LEHD LODES downloads, Oklahoma, years with public CSV (typically `https://lehd.ces.census.gov/data/lodes/LODES8/ok/`). Do not scrape HTML. Do not invent later years. Do not copy QCEW quarter totals.

Keep year and a public workplace-job count as filed (all jobs, or private primary jobs if that is the longest panel). Missing years stay missing. Do not fill 0. If Cushing-city blocks exist, freeze a city series **and** keep the county series labeled as county. Do not relabel county as city.

If fewer than 2 dated local years, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091LODEZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-lodes.ts` and `app/tests/cushing-lodes.test.mjs` only if ≥2 dated years

Do not edit observation UI, board JSON, PROGRAM.md, QCEW files, 091-I snapshot files. Do not commit.

## Rules
- Label: Payne (and Cushing if disclosed) LODES annual workplace jobs, dated, not QCEW, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled years / statewide relabel / copying QCEW.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Census LODES annual jobs" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
