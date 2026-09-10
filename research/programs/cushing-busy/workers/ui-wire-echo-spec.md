# opencode worker — wire Cushing EPA ECHO last-FCE annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091ECHOZ/`.

## Outcome
If `readCushingEcho` tests pass (44 Cushing-city CAA facilities, 29 dated last FCE 1998-11-19..2026-05-05), attach **one annual count chart** of facilities whose last FCE date falls in that year. Regulatory log of last evaluations, not TRI, not VOC, not all historical inspections, not busy.

Do not fill missing years with 0. Count only years that have a dated FCE row. The 15 undisclosed FCE dates stay off the chart (null, not 0). Copy must say last Full Compliance Evaluation date, Cushing city as filed (Payne 33 + Lincoln 11), not statewide OK.

Keep every existing chart including `cushing-storm-plot`, `cushing-osha-plot`, `cushing-voc-plot`, `cushing-tri-plot`.

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

Do not edit `cushing-echo.ts`. Do not commit. Do not touch TRI/VOC/OSHA freeze files.

## Pattern
- import `20260910T091ECHOZ/cushing_echo_air_inspections.json`
- reader from `~/lib/cushing-echo`
- Chart id: `cushing-echo-plot`
- dates: FCE year `-07-01` for years with ≥1 dated last FCE
- values: count
- Copy: 쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수. TRI·VOC가 아니고 바쁨이 아닙니다. 날짜가 없는 15곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-ECHO` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-echo.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired ECHO Cushing FCE" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
