# opencode worker — wire KCUH daily weather chart on the Cushing board

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091KCUHZ/`.

## Outcome
If and only if `readKcuhDaily` unit tests pass, attach **one time-series chart** of daily KCUH/CUH max temperature (and optionally min as a second series) on the dated-context board. Keep every existing chart.

This is weather confounder, not activity. Live METAR (091-Q) stays as the live snapshot. Do not replace live weather with this freeze.

Receipt: n=4269 days, 2015-01-01..2026-09-08, maxTempSumInt=307313, station CUH on OK_ASOS. Trace precip stays missing.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md` (add 091-Q-D daily weather as dated context, keep 091-Q live)
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-kcuh.ts`. Do not commit. Do not remove `cushing-enrollment-plot` or `cushing-kush-plot`.

## Pattern
- import json from `20260910T091KCUHZ/kcuh_daily_weather.json`
- `readKcuhDaily` from `~/lib/cushing-kcuh`
- Chart id: `cushing-kcuh-plot`
- Axis: temperature F, 0–120 or data-driven but not a busy score
- Copy: 쿠싱 공항 일별 기온. 교란변수. 바쁨 아님.
- Board lane under physical_context, not activity.
- deployment-cwd must still contain `아직 판단할 수 없습니다`, `529`, `cushing-enrollment-plot`, `cushing-kush-plot`, and now `cushing-kcuh-plot`.

## Acceptance
`cd app && node --test tests/cushing-kcuh.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired KCUH daily series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
