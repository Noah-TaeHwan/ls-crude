# opencode worker — wire Mesonet OILT daily total solar-radiation chart

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091ATOTZ/`.

## Outcome
If `readMesonetSolarDaily` tests pass (OILT Oilton 4269 days, atotSum100 6698585, 115 solar null, field ATOT MJ/m2), attach **one daily total-solar-radiation chart**. Weather confounder, not air tmax, not rain, not soil, not humidity, not wind, not pressure, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `atotMjM2` only. Copy must say Mesonet OILT Oilton 24.3 km daily total solar radiation, not air temp, not rain, not busy.

Keep every existing chart including `cushing-mesonet-pressure-plot` if present.

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

Do not edit `cushing-mesonet-solar.ts`. Do not commit. Do not touch ATOTZ freeze files.

## Pattern
- import `20260910T091ATOTZ/mesonet_oilt_solar_daily.json`
- reader from `~/lib/cushing-mesonet-solar`
- Chart id: `cushing-mesonet-solar-plot`
- dates: row.date for rows with disclosed atotMjM2
- values: atotMjM2 as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일누적 일사량. 공기 최고기온·강수가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-ATOT` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet-solar.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "wired Mesonet OILT solar" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded --files-modified "<paths>" --json`
Then idle. If dispatch-capability is missing, idle after tests; the coordinator inspects.
