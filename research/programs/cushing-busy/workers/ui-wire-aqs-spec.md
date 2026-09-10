# opencode worker — wire Payne Stillwater PM2.5 annual-mean chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091AQSZ/`.

## Outcome
If `readCushingAqs` tests pass (5 annual PM2.5 means 1999..2003, Stillwater 40-119-0614, mean sum 46.525954), attach **one annual mean chart**. Ambient air confounder, not VOC, not TRI, not Cushing-city air, not busy.

Do not fill 2004+ with 0. Keep 2003 as the disclosed 2-obs partial year. Copy must say Stillwater Payne County monitor, not Cushing city.

Keep every existing chart including `cushing-voc-plot` and `cushing-tri-plot`.

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

Do not edit `cushing-aqs.ts`. Do not commit. Do not touch VOC/TRI/ECHO freeze files.

## Pattern
- import `20260910T091AQSZ/payne_pm25_stillwater_annual.json`
- reader from `~/lib/cushing-aqs`
- Chart id: `cushing-aqs-plot`
- dates: `{year}-07-01` for years with a disclosed mean
- values: `annual_mean_ug_m3`
- Copy: Payne County Stillwater 모니터 연간 PM2.5. 쿠싱 시 대기가 아니고 VOC가 아니며 바쁨이 아닙니다. 2004년 이후는 모니터가 없어 0으로 채우지 않았습니다.
- Board lane `091-AQS` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-aqs.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne PM2.5" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
