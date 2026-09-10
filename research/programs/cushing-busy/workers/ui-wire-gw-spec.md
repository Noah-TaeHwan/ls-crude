# opencode worker — wire Payne USGS groundwater daily-depth chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091GWZ/`.

## Outcome
If `readCushingUsgsGw` tests pass (site **360339096450201** Cimarron3, 481 gapless days 2017-06-29..2018-10-22, parameter 72019 depth-to-water ft, hundredths sum 347450, 8.7 km from Cushing), attach **one daily depth chart**. Hydrology confounder, not streamflow cfs, not 07161450, not precip, not busy.

Do not fill days after 2018-10-22 with 0. Copy must say Payne well 8.7 km from Cushing, not a Cushing-city well, not discharge. Larger value = deeper water table.

Keep every existing chart including `cushing-usgs-plot` (streamflow) and `cushing-echo-cwa-plot`.

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

Do not edit `cushing-usgs-gw.ts`. Do not commit. Do not touch streamflow USGS files.

## Pattern
- import `20260910T091GWZ/cushing_groundwater_daily.json`
- reader from `~/lib/cushing-usgs-gw`
- Chart id: `cushing-usgs-gw-plot`
- dates: daily `date`
- values: `depthToWaterFt`
- Copy: Payne County USGS 우물 일평균 지하수위(지표 아래 피트). 쿠싱 시 우물이 아니고 유량(07161450)이 아니며 바쁨이 아닙니다. 2018-10-22 이후는 관측이 없어 0으로 채우지 않았습니다. 관정 360339096450201, Cushing에서 8.7 km.
- Board lane `091-GW` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-usgs-gw.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne groundwater" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
