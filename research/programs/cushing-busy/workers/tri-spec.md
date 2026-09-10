# opencode worker — EPA TRI Cushing facility annual releases time series

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260908T091WENVZ/README.md` (TRI is complementary, not a substitute for DEQ VOC).

## Outcome
Freeze an **annual** time series of EPA Toxics Release Inventory on-site total releases for facilities in **Cushing city, Oklahoma**, if a keyless public table exists. Chemical-specific toxic releases, not busy, not VOC substitute, not WTI.

Preferred keyless surfaces:
1. EPA Envirofacts / TRI basic data files on www.epa.gov (CSV/zip by year or state).
2. Any already-frozen TRI excerpt under `research/indexes/091-cushing-operations-nowcasting/` or `research/gathering/raw/`.

Keep per year if disclosed: `year`, `on_site_release_lb` (or the column the file actually names), facility count. City = Cushing, ST = OK. Do not expand to Stillwater. Missing years stay missing. Do not fill 0.

If fewer than 2 annual city totals can be honestly dated, fail closed: receipt only, no TS reader, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-tri.ts` and `app/tests/cushing-tri.test.mjs` only if ≥2 years

Do not edit observation UI, board JSON, PROGRAM.md, VOC files. Do not commit.

## Rules
- Label: Cushing city TRI on-site releases, annual, not activity.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / city swap / busy relabel.
- Tests: n + checksum of disclosed lb + fail-closed.
- Do not scrape a map into invented years.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "TRI Cushing annual series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
