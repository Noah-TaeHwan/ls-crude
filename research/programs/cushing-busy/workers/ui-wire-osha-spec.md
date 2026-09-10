# opencode worker — wire OSHA Cushing inspection annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091OSHAZ/`.

## Outcome
If `readCushingOsha` tests pass (162 dated IMIS inspections 1973-04-25..2026-08-14, ZIP 74023, 86 disclosed violations summing to 354), attach **one annual count chart** of those inspections. Workplace-safety log, not QCEW, not busy, not WTI.

Do not fill missing years with 0 (1978, 1984, 1995, 1999, 2001, 2007, 2010, 2011, 2015, 2020, 2021). Count only years that have a dated row. Undisclosed violation counts stay null in the freeze; the chart is inspection counts, not filled penalties.

Keep every existing chart including `cushing-nhtsa-plot` and `cushing-fra-plot`.

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

Do not edit `cushing-osha.ts`. Do not commit. Do not touch NHTSA freeze files.

## Pattern
- import `20260910T091OSHAZ/cushing_osha_inspections.json`
- reader from `~/lib/cushing-osha`
- Chart id: `cushing-osha-plot`
- dates: inspection year `-07-01` for years with ≥1 inspection
- values: count
- Copy: 쿠싱 시 ZIP 74023 OSHA 점검 연간 건수. 고용이 아니고 벌금이 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-OSHA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-osha.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired OSHA Cushing inspections" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
