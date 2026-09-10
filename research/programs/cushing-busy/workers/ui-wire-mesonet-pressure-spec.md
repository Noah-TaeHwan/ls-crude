# opencode worker — wire Mesonet OILT daily mean station-pressure chart

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091PRESZ/`.

## Outcome
If `readMesonetPressureDaily` tests pass (OILT Oilton 4269 days, pavgSum100 12127694, 104 pressure null, field PAVG inches of mercury), attach **one daily mean-station-pressure chart**. Weather confounder, not air tmax, not rain, not soil, not humidity, not wind, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `pavgInhg` only. Copy must say Mesonet OILT Oilton 24.3 km daily mean station pressure, not air temp, not rain, not soil, not humidity, not wind, not busy.

Keep every existing chart including `cushing-wqp-plot`, `cushing-mesonet-humidity-plot`, and `cushing-mesonet-wind-plot` if present.

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

Do not edit `cushing-mesonet-pressure.ts`. Do not commit. Do not touch PRESZ freeze files.

## Pattern
- import `20260910T091PRESZ/mesonet_oilt_pressure_daily.json`
- reader from `~/lib/cushing-mesonet-pressure`
- Chart id: `cushing-mesonet-pressure-plot`
- dates: row.date for rows with disclosed pavgInhg
- values: pavgInhg as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 정지기압. 공기 최고기온·강수·지온·습도·풍속이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-PRES` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet-pressure.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "wired Mesonet OILT pressure" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded --files-modified "<paths>" --json`
Then idle. If dispatch-capability is missing from the preamble, idle after tests pass; the coordinator inspects.
