# opencode worker — Payne County annual housing units (Census PEP)

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091HUZ/README.md`.

## Outcome
City-level housing-unit PEP files were not found (091-HUZ fail-closed). This task freezes **Payne County** annual housing-unit estimates if a keyless county HU file exists. County housing stock, not Cushing-city busy, not BPS permits, not city population.

Preferred keyless: Census PEP housing-unit estimates by county on www2.census.gov (`hu-est*` / `co-est` housing files). FIPS 40119. Keep `year`, `housing_units`. Missing years stay missing. Do not fill 0. Do not relabel as Cushing city.

If the only files are population (POPESTIMATE), fail closed — population is already 091-POP. If no county HU series, receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091HUCZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-county-housing.ts` and `app/tests/cushing-county-housing.test.mjs` only if ≥2 years

Do not edit observation UI, board JSON, PROGRAM.md, city population files. Do not commit.

## Rules
- Label: Payne County housing units, annual, not Cushing city, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / city relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne county housing units" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
