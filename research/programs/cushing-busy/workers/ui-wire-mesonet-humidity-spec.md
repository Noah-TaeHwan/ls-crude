# opencode worker — wire Mesonet OILT daily mean relative humidity chart

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091HUMZ/`.

## Outcome
If `readMesonetHumidityDaily` tests pass (OILT Oilton 4269 days, havgSum100 29276766, 114 humidity null, field HAVG), attach **one daily mean-relative-humidity chart**. Weather confounder, not air tmax, not rain, not soil temperature, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `havgPct` only. Copy must say Mesonet OILT Oilton 24.3 km daily mean relative humidity, not air temp, not rain, not soil, not busy.

Keep every existing chart including `cushing-wqp-plot` and `cushing-mesonet-soil-plot`.

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

Do not edit `cushing-mesonet-humidity.ts`. Do not commit. Do not touch HUMZ freeze files.

## Pattern
- import `20260910T091HUMZ/mesonet_oilt_humidity_daily.json`
- reader from `~/lib/cushing-mesonet-humidity`
- Chart id: `cushing-mesonet-humidity-plot`
- dates: row.date for rows with disclosed havgPct
- values: havgPct as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 상대습도. 공기 최고기온·강수·지온이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-HUM` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet-humidity.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Mesonet OILT humidity" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
