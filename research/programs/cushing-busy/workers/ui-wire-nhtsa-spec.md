# opencode worker — wire FMCSA Cushing filed-city crash annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091NHTSAZ/`.

## Outcome
If `readCushingNhtsa` tests pass (129 dated FMCSA CMV crashes 1993-01-27..2025-10-06, fatalities 5, injuries 99), attach **one annual count chart** of those crashes. Traffic-safety log, not FARS, not all crashes, not AADT, not busy.

Do not fill missing years with 0 (1994–1996, 1998, 2004 and any other year without a dated row). Count only years that have a dated row. Same sparse rule as FRA/PHMSA.

Keep every existing chart including `cushing-fra-plot` and `cushing-phmsa-plot`.

Copy must say this is FMCSA commercial-motor-vehicle crashes whose filed city is Cushing, **not** NHTSA FARS fatalities.

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

Do not edit `cushing-nhtsa.ts`. Do not commit. Do not touch OSHA freeze files.

## Pattern
- import `20260910T091NHTSAZ/cushing_nhtsa_crashes.json`
- reader from `~/lib/cushing-nhtsa`
- Chart id: `cushing-nhtsa-plot`
- dates: crash year `-07-01` for years with ≥1 crash
- values: count
- Copy: 쿠싱 시 신고 상용차(FMCSA) 사고 연간 건수. FARS 사망자가 아니고 전체 사고가 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-NHTSA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-nhtsa.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired FMCSA Cushing crashes" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
