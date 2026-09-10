# opencode worker — Cushing city housing units annual time series (Census)

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`. BPS on the board is **monthly permits**. This task is **stock of housing units**, not permit flow.

## Outcome
Freeze an **annual housing-unit count** for Cushing city, Oklahoma from Census PEP/housing estimates or ACS 1-year if a keyless table exists. Community housing stock, not busy, not BPS permits, not WTI.

Preferred keyless:
1. Census PEP housing unit estimates by place (www2.census.gov city housing files for Oklahoma).
2. ACS 1-year B25001 for place if a downloadable CSV exists without a key.

Keep `year`, `housing_units`. Missing years stay missing. Do not fill 0. Do not splice ACS 5-year into PEP.

If fewer than 2 annual points, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091HUZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-housing.ts` and `app/tests/cushing-housing.test.mjs` only if ≥2 years

Do not edit observation UI, board JSON, PROGRAM.md, BPS files. Do not commit.

## Rules
- Label: Cushing city housing units, annual stock, not monthly permits.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / city swap / busy relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing housing units series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
