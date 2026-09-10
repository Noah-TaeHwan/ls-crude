# opencode worker — wire Mesonet OILT daily mean wind-speed chart

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091WSPDZ/`.

## Outcome
If `readMesonetWindDaily` tests pass (OILT Oilton 4269 days, wspdSum100 2573065, 272 wind null, field WSPD), attach **one daily mean-wind-speed chart**. Weather confounder, not air tmax, not rain, not soil, not humidity, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `wspdMph` only. Copy must say Mesonet OILT Oilton 24.3 km daily mean wind speed, not air temp, not rain, not soil, not humidity, not busy.

Keep every existing chart including `cushing-wqp-plot` and `cushing-mesonet-humidity-plot` if present.

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

Do not edit `cushing-mesonet-wind.ts`. Do not commit. Do not touch WSPDZ freeze files.

## Pattern
- import `20260910T091WSPDZ/mesonet_oilt_wind_daily.json`
- reader from `~/lib/cushing-mesonet-wind`
- Chart id: `cushing-mesonet-wind-plot`
- dates: row.date for rows with disclosed wspdMph
- values: wspdMph as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 풍속. 공기 최고기온·강수·지온·습도가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-WSPD` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet-wind.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "wired Mesonet OILT wind" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded --files-modified "<paths>" --json`
Then idle.
