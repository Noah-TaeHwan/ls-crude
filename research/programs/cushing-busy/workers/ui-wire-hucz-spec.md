# opencode worker — wire Payne County housing-units chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091HUCZ/`.

## Outcome
If `readPayneCountyHousing` tests pass (checksum 539269, 15 years 2010..2024, last 37437), attach **one annual housing-units chart**. County housing stock, not Cushing city, not BPS permits, not busy.

Keep every existing chart including `cushing-phmsa-plot` and `cushing-kcuh-plot`.

Vintage break 2019 (36859) → 2020 (36732) is disclosed, not smoothed. Not WTI.

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

Do not edit `cushing-county-housing.ts`. Do not commit.

## Pattern
- import `20260910T091HUCZ/payne_county_housing_units_annual.json`
- `readPayneCountyHousing` from `~/lib/cushing-county-housing`
- Chart id: `cushing-county-housing-plot`
- dates: `${year}-07-01`
- values: housing_units
- Copy: Payne County 연간 Census 주택 호수. 쿠싱 시가 아니고 허가 건수가 아니며 바쁨이 아닙니다. 2019→2020은 빈티지 단절입니다.
- Board lane `091-HUC` under physical_context.
- Keep INSUFFICIENT. deployment-cwd must still match existing plot ids and add `cushing-county-housing-plot` plus `37437`. Scope numeric guards to visible text, not SVG path coords.

## Acceptance
`cd app && node --test tests/cushing-county-housing.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne county housing series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
