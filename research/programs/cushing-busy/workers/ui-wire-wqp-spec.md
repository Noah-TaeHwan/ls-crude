# opencode worker — wire Cushing/Payne WQP ambient pH chart

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091WQPZ/`.

## Outcome
If `readCushingWqp` tests pass (IOWATROK_WQX-SND1 Sand1, 366 filed pH rows on 283 dates, 2005-09-01..2021-09-17, hundredths 297220, 14 QC replicates kept, one filed 0.0 on 2009-05-05 kept), attach **one sample-date pH chart**. Ambient water chemistry, not USGS 07161450 streamflow, not groundwater, not DMR, not busy.

Do not fill missing dates with 0. Plot filed sample rows only (366 points, including same-day duplicates and QC replicates as filed). Copy must say Iowa Tribe Sand1, Payne County, 16.71 km from Cushing, pH as filed, not Cimarron discharge, not busy.

Keep every existing chart including `cushing-mesonet-soil-plot` and `cushing-usgs-plot`.

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

Do not edit `cushing-wqp.ts`. Do not commit. Do not touch WQPZ freeze files.

## Pattern
- import `20260910T091WQPZ/cushing_wqp_ph.json`
- reader from `~/lib/cushing-wqp`
- Chart id: `cushing-wqp-plot`
- dates: row.date (filed sample dates; skip calendar fill)
- values: row.ph as filed (include 0.0 on 2009-05-05)
- Copy: 쿠싱에서 16.71 km Payne County Iowa Tribe Sand1(IOWATROK_WQX-SND1) 하천 pH 시료. USGS 유량·지하수위가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-WQP` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-wqp.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired WQP Cushing pH" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
