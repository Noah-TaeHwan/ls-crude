# opencode worker — BEA CAINC1 Payne County personal income

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091POPZ/README.md` then `20260910T091HUCZ/README.md` then `20260910T091LAUEZ/README.md`.

## Outcome
City population, county housing units, and LAUS employment are already frozen. This task freezes **dated Payne County annual personal income** from a keyless BEA CAINC1 county file if one exists. County income, not Cushing-city busy, not population, not housing units, not LAUS, not WTI.

Preferred keyless: BEA Regional CAINC1 zip (no API key), GeoFIPS **40119** Payne, Oklahoma. Typical surface: `https://apps.bea.gov/regional/zip/CAINC1.zip` or the same table from `https://apps.bea.gov/regional/downloadzip.cfm`. Do not use FRED if it needs a key. Do not scrape apps.bea.gov HTML.

Keep year and a public dollar (or thousands-of-dollars) personal-income figure as filed. Missing years stay missing. Do not fill 0. Do not copy city POP, county HU, or LAUS. Do not invent Cushing-city income from county totals. Do not convert units unless the file itself states the unit; record the unit in README.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091INCZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-bea-income.ts` and `app/tests/cushing-bea-income.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, population/housing/LAUS/PEP files. Do not commit.

## Rules
- Label: Payne County BEA CAINC1 personal income, dated, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc on exported functions (`@param`/`@returns`).
- Fail-closed on filled years / city relabel / swapped FIPS (Oklahoma County 40109 is not Payne 40119).
- Tests: happy-path checksum of disclosed years + fail-closed on damage.
- Typecheck with `cd app && npm run typecheck` (do not run bare `npx tsc`).

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Payne BEA personal income" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
