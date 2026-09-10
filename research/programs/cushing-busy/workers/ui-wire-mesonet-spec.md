# opencode worker — wire Mesonet OILT daily temperature chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/`.

## Outcome
If `readMesonetDaily` tests pass (OILT Oilton 4269 days 2015-01-01..2026-09-08, 24.3 km, 110 temp null, not KCUH), attach **one daily max-temp chart**. Weather confounder, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed tmax only via the frozen rows (nulls stay in the series as gaps if the chart skips nulls, or omit null days — do not convert null to 0). Copy must say Mesonet OILT Oilton 24.3 km, not KCUH airport, not busy.

Keep every existing chart including `cushing-kcuh-plot` and `cushing-precip-plot`.

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

Do not edit `cushing-mesonet.ts`. Do not commit. Do not touch KCUH/precip freeze files.

## Pattern
- import `20260910T091MESOZ/` json
- reader from `~/lib/cushing-mesonet`
- Chart id: `cushing-mesonet-plot`
- dates: row.date for rows with disclosed tmaxF only (skip null temp days)
- values: tmaxF as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일최고기온. KCUH 공항 기온이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.
- Board lane `091-MESO` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Mesonet OILT" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
