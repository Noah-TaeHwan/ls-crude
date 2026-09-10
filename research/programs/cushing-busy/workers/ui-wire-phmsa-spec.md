# opencode worker — wire PHMSA Cushing incident annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091PHMSAZ/`.

## Outcome
If `readCushingPhmsa` tests pass, attach **one annual count chart** derived from the 141 dated HL incidents (2010-01-11..2025-12-08). Count incidents per calendar year. Do not fill a year with 0 unless that year is inside the span and truly has zero rows — if a year has no incidents, 0 is an observed count of dated filings that year, same as KUSH zeros. This is an incident log, not throughput, not busy.

Keep every existing chart including `cushing-tri-plot`.

Receipt: n=141, fatalities=0, injuries=0, HL only. Not WTI.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md`
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-phmsa.ts`. Do not commit.

## Pattern
- import `20260910T091PHMSAZ/cushing_phmsa_incidents.json`
- `readCushingPhmsa` from `~/lib/cushing-phmsa`
- Chart id: `cushing-phmsa-plot`
- Build year → count from `incidentDate` (inspect the JSON field name).
- dates: `${year}-07-01`
- axis 0–20 or data-driven, unit 건
- Copy: 쿠싱 시 PHMSA 위험액체 사고 연간 건수. 처리량이 아니고 바쁨이 아닙니다. 사상자 0.
- Board lane `091-PHMSA` under physical_context.
- Keep INSUFFICIENT. deployment-cwd must still match `cushing-tri-plot` and add `cushing-phmsa-plot` plus `141`.

## Acceptance
`cd app && node --test tests/cushing-phmsa.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired PHMSA incident series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
