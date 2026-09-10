# opencode worker — wire Payne County BEA CAINC1 personal-income chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091INCZ/`.

## Outcome
If `readPayneCountyIncome` tests pass (56 years 1969..2024, FIPS 40119, thousands-of-dollars as filed, checksum 85834209, 2024=4121797), attach **one annual personal-income chart**. County income, not Cushing-city income, not population, not per-capita, not busy.

Do not convert thousands-of-dollars into dollars. Do not fill extra years. Copy must say Payne County, unit 천 달러, not Cushing city. Oklahoma County 40109 must not appear as this series.

Keep every existing chart including `cushing-pep-plot` and `cushing-population-plot`.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/lib/cushing-context.ts`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md`
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-bea-income.ts`. Do not commit. Do not touch PEP/POP/HU freeze files.

## Pattern
- import `20260910T091INCZ/payne_county_personal_income_annual.json`
- reader from `~/lib/cushing-bea-income` (`readPayneCountyIncome`)
- Chart id: `cushing-bea-income-plot`
- dates: `{year}-07-01` for disclosed years only
- values: `personal_income_thousands_dollars`
- Copy: Payne County 연간 BEA CAINC1 개인소득. 단위는 파일 그대로 천 달러이며 쿠싱 시 소득이 아니고 바쁨이 아닙니다. 2024=4,121,797.
- Board lane `091-INC` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-bea-income.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne BEA income" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
