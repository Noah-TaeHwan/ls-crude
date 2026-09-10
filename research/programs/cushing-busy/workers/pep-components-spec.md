# opencode worker — Census PEP Payne County components of change

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091POPZ/README.md` then `20260910T091HUCZ/README.md`.

## Outcome
City population and county housing units are already frozen. This task freezes **dated Payne County population components** (births, deaths, net migration, or total population) from a keyless Census PEP county file if one exists. County demographics, not Cushing-city busy, not housing units, not WTI.

Preferred keyless: Census PEP county components-of-change CSV (co-est or similar) for FIPS 40119 without a key.

Keep year and a public count. Missing years stay missing. Do not fill 0. Do not copy city POP or county HU. Do not invent Cushing-city components from county totals.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091COCZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-pep-components.ts` and `app/tests/cushing-pep-components.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, population/housing files. Do not commit.

## Rules
- Label: Payne County PEP components, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / city relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne PEP components" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
