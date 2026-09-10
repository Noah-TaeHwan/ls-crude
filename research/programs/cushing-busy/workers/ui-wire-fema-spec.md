# opencode worker — wire Payne County FEMA declaration annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091FEMAZ/`.

## Outcome
If `readCushingFema` tests pass (39 dated Payne County declarations 1974-06-10..2025-05-21, DR 24 / EM 8 / FM 7), attach **one annual count chart**. Disaster log, not NOAA storms, not busy, not Cushing-city-only.

Do not fill missing years with 0. Count only years that have a dated declaration. Copy must say Payne County FEMA designations, not Cushing city.

Keep every existing chart including `cushing-usgs-plot` and `cushing-storm-plot`.

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

Do not edit `cushing-fema.ts`. Do not commit. Do not touch USGS freeze files.

## Pattern
- import `20260910T091FEMAZ/cushing_fema_declarations.json`
- reader from `~/lib/cushing-fema`
- Chart id: `cushing-fema-plot`
- dates: declaration year `-07-01` for years with ≥1 declaration
- values: count
- Copy: Payne County FEMA 재난선포 연간 건수. 폭풍 건수가 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-FEMA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-fema.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired FEMA Payne declarations" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
