# opencode worker — wire USGS Cimarron-near-Ripley daily streamflow chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/`.

## Outcome
If `readCushingUsgsDaily` tests pass (14224 daily means 1987-10-01..2026-09-09, site 07161450, thousandths sum 24894472300), attach **one daily discharge chart**. Hydrology confounder, not GHCN precip, not NOAA storms, not busy.

Do not fill zeros. The span is gapless as published by NWIS; do not invent extra days. Copy must say Cimarron River near Ripley, Payne County, 12.8 km from Cushing — not a Cushing-city gage.

Keep every existing chart including `cushing-precip-plot`, `cushing-storm-plot`, `cushing-kcuh-plot`.

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

Do not edit `cushing-usgs.ts`. Do not commit. Do not touch FEMA freeze files.

## Pattern
- import `20260910T091USGSZ/cushing_streamflow_daily.json`
- reader from `~/lib/cushing-usgs`
- Chart id: `cushing-usgs-plot`
- dates: daily `row.date`
- values: `dischargeCfs`
- Copy: Cimarron River near Ripley (USGS 07161450) 일평균 유량. Payne County 게이지이며 쿠싱 시 전용이 아니고 바쁨이 아닙니다. 결측일을 0으로 채우지 않았습니다.
- Board lane `091-USGS` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-usgs.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired USGS Cimarron flow" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
