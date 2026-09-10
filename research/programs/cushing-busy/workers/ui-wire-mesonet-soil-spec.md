# opencode worker — wire Mesonet OILT daily soil-temperature chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091SOILZ/`.

## Outcome
If `readMesonetSoilDaily` tests pass (OILT Oilton 4269 days, savgSum100 25436779, 188 soil null, field SAVG 10cm sod), attach **one daily soil-temperature chart**. Weather/soil confounder, not air tmax, not rain, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `savgF` only. Copy must say Mesonet OILT Oilton 24.3 km soil temperature at 10 cm, not air temp, not rain, not busy. Moisture was not disclosed in the `.mts` path — do not relabel as soil moisture.

Keep every existing chart including `cushing-mesonet-plot` and `cushing-mesonet-rain-plot`.

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

Do not edit `cushing-mesonet.ts` or `cushing-mesonet-soil.ts`. Do not commit. Do not touch MESOZ freeze files.

## Pattern
- import `20260910T091SOILZ/mesonet_oilt_soil_daily.json`
- reader from `~/lib/cushing-mesonet-soil`
- Chart id: `cushing-mesonet-soil-plot`
- dates: row.date for rows with disclosed savgF
- values: savgF as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 10cm 잔디 밑 지온. 공기 최고기온·강수가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-SOIL` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet-soil.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Mesonet OILT soil" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
