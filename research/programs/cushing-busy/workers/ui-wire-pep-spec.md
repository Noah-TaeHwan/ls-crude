# opencode worker — wire Payne County PEP components population chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091COCZ/`.

## Outcome
If `readPayneCountyComponents` tests pass (15 years 2010..2024, FIPS 40119, births sum 11379, deaths sum 8193, net-mig sum 3807, 2024 pop 84199), attach **one annual county-population chart**. County demographics, not Cushing-city population, not housing units, not busy.

Do not fill extra years. 2019 (81784, 2010-base) → 2020 (81649, 2020-base) is a vintage break as published, not a filled gap. Copy must say Payne County, not Cushing city. 2010 and 2020 component flows are partial periods as published; the chart values are July 1 `population`, not annualized births.

Keep every existing chart including `cushing-population-plot` (city) and `cushing-county-housing-plot`.

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

Do not edit `cushing-pep-components.ts`. Do not commit. Do not touch city POP / county HU freeze files. Do not touch BEA income files (`cushing-bea-income.ts`, `20260910T091INCZ/`) if they appear.

## Pattern
- import `20260910T091COCZ/payne_county_population_components_annual.json`
- reader from `~/lib/cushing-pep-components` (`readPayneCountyComponents`)
- Chart id: `cushing-pep-plot`
- dates: `{year}-07-01` for disclosed years only
- values: `population`
- axis 0–100000, unit 명
- Copy: Payne County 연간 Census PEP 인구. 쿠싱 시 인구(8,444)가 아니고 주택 호수가 아니며 바쁨이 아닙니다. 2019→2020은 빈티지 단절이며 0으로 채우지 않았습니다. 마지막 2024=84,199명.
- Board lane `091-COC` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-pep-components.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne PEP population" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
