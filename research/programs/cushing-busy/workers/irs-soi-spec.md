# opencode worker — IRS SOI ZIP 74023 annual income-tax stats

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091INCZ/README.md`.

## Outcome
Payne BEA CAINC1 personal income is already frozen. This task freezes a **dated annual IRS SOI ZIP-code series for 74023 (Cushing)** if a keyless SOI zip file exists. ZIP tax stats, not county BEA income, not busy, not WTI.

Preferred keyless: IRS SOI Individual Income Tax ZIP Code Data CSV/Excel from `https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-statistics-zip-code-data-soi` (no API key). Filter ZIP **74023**. Do not scrape interactive tables. Do not use county SOI as a Cushing-city substitute.

Keep tax year and a public field as filed (number of returns, AGI, or both if disclosed). Missing years stay missing. Do not fill 0. Do not convert thousands.

If fewer than 2 dated ZIP 74023 years, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091SOIZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-irs-soi.ts` and `app/tests/cushing-irs-soi.test.mjs` only if ≥2 dated years

Do not edit observation UI, board JSON, PROGRAM.md, BEA income files. Do not commit.

## Rules
- Label: ZIP 74023 IRS SOI, dated, not BEA, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled years / statewide relabel / copying CAINC1.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "IRS SOI ZIP 74023" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
