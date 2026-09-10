# opencode worker — wire Payne US Drought Monitor weekly D0 chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091DRTZ/`.

## Outcome
If `readPayneDroughtWeekly` tests pass (610 Tuesday weeks 2014-12-30..2026-09-01, FIPS 40119, d0Sum100 3342984), attach **one weekly D0-or-worse area-percent chart**. Weather confounder, not GHCN precip, not Mesonet rain, not Cushing city, not busy.

Do not fill missing weeks with 0 (this freeze has no gap weeks). Plot `d0` as filed (cumulative D0-or-worse percent of county area). Copy must say Payne County US Drought Monitor, not Cushing city, not Mesonet rain, not busy.

Keep every existing chart including `cushing-precip-plot` and `cushing-mesonet-rain-plot`.

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

Do not edit `cushing-drought.ts`. Do not commit. Do not touch precip/Mesonet freeze files.

## Pattern
- import `20260910T091DRTZ/payne_drought_weekly.json`
- reader from `~/lib/cushing-drought`
- Chart id: `cushing-drought-plot`
- dates: row.mapDate
- values: d0 as filed
- Copy: 페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율. 쿠싱 시가 아니고 Mesonet 강수가 아니며 바쁨이 아닙니다. 결측 주는 0으로 채우지 않았습니다.
- Board lane `091-DRT` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-drought.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne drought weekly" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
