# opencode worker — wire Cushing RCRA last-inspection annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091RCRAZ/`.

## Outcome
If `readCushingRcra` tests pass (51 Cushing-city handlers, 17 dated last inspections 1985-08-28..2021-07-15, window inspection-count sum 0 as disclosed), attach **one annual count chart** of handlers whose `lastInspectionDate` year has ≥1 row. Waste log, not TRI pounds, not CAA FCE, not CWA, not busy.

Do not fill missing years with 0. Count only years that have a dated last inspection. The 34 undisclosed dates stay off the chart. Copy must say Cushing city RCRA last inspection, not TRI, not statewide. Window counts of 0 are disclosed DFR zeros, not invented fill — do not chart those zeros as a series.

Keep every existing chart including `cushing-tri-plot`, `cushing-echo-plot`, and `cushing-sdwis-plot`.

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

Do not edit `cushing-rcra.ts`. Do not commit. Do not touch TRI/ECHO/CWA/SDWIS freeze files.

## Pattern
- import `20260910T091RCRAZ/cushing_rcra_handlers.json`
- reader from `~/lib/cushing-rcra`
- Chart id: `cushing-rcra-plot`
- dates: `{year}-07-01` for years with ≥1 dated last inspection (Map of years with rows only)
- values: count of dated rows in that year
- Copy: 쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수. TRI 파운드가 아니고 바쁨이 아닙니다. 날짜가 없는 34곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-RCRA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-rcra.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing RCRA" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
