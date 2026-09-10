# opencode worker — wire Payne County NOAA storm-event monthly-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091STMZ/`.

## Outcome
If `readCushingStorm` tests pass (112 dated Payne County NOAA events 2024-01-13..2026-05-08, injuries 10, deaths 0, 44 magnitudes disclosed), attach **one monthly count chart** of those events. Weather confounder, not GHCN precip, not KCUH temperature, not busy.

Do not fill missing months with 0. Count only year-months that have a dated row. Window is 2024–2026 YTD as frozen; do not invent older years.

Copy must say Payne County NOAA Storm Events, not Cushing-city-only (only 3 rows locate at CUSHING). Keep INSUFFICIENT.

Keep every existing chart including `cushing-osha-plot`, `cushing-nhtsa-plot`, `cushing-precip-plot`, `cushing-kcuh-plot`.

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

Do not edit `cushing-storm.ts`. Do not commit. Do not touch OSHA/NHTSA freeze files.

## Pattern
- import `20260910T091STMZ/cushing_storm_events.json`
- reader from `~/lib/cushing-storm`
- Chart id: `cushing-storm-plot`
- dates: `{year-month}-01` for months with ≥1 event
- values: count
- Copy: Payne County NOAA 폭풍 사건 월간 건수. 강수·기온이 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 달은 0으로 채우지 않았습니다.
- Board lane `091-STM` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-storm.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne NOAA storms" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
