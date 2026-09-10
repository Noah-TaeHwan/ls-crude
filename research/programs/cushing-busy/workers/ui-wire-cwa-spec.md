# opencode worker — wire Cushing ECHO CWA last-inspection annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/`.

## Outcome
If `readCushingEchoCwa` tests pass (18 Cushing-city CWA permits, 4 dated last inspections 2025-04-10..2026-01-06, inspection-count sum 19), attach **one annual count chart** of permits whose last CWA Inspection/Evaluation date falls in that year. Water regulatory log, not CAA air FCE, not TRI, not VOC, not busy.

Do not fill missing years with 0. Count only years that have a dated last-inspection row (2025=3, 2026=1). The 14 undisclosed dates stay off the chart (null, not 0). Copy must say Cushing city CWA/NPDES last inspection, not air FCE, not statewide OK. The CRUSHING ZIP-74023 typo row is already excluded — do not add it.

Keep every existing chart including `cushing-echo-plot` (air) and `cushing-bea-income-plot`.

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

Do not edit `cushing-echo-cwa.ts`. Do not commit. Do not touch CAA ECHO/TRI/VOC freeze files.

## Pattern
- import `20260910T091CWAZ/cushing_echo_cwa_inspections.json`
- reader from `~/lib/cushing-echo-cwa` (`readCushingEchoCwa`)
- Chart id: `cushing-echo-cwa-plot`
- dates: `{year}-07-01` for years with ≥1 dated last inspection (Map of years with rows only)
- values: count of dated rows in that year
- Copy: 쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 연간 건수. 대기 FCE가 아니고 바쁨이 아닙니다. 날짜가 없는 14곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-CWA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-echo-cwa.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired ECHO Cushing CWA" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
