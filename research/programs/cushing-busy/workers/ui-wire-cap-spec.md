# opencode worker — wire Cushing working-storage-capacity chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091CAPZ/`.

## Outcome
If `readCushingWorkingStorage` tests pass (23 points, working sum 1642412, last 2024-03-01 = 78410 kbbl), attach **one working-storage-capacity chart**. Tank room, not stocks, not busy, not WTI. Report discontinued after March 2024 — do not invent later points.

Keep every existing chart including `cushing-county-housing-plot`.

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

Do not edit `cushing-working-storage.ts`. Do not commit.

## Pattern
- import `20260910T091CAPZ/cushing_working_storage_capacity.json`
- `readCushingWorkingStorage` from `~/lib/cushing-working-storage`
- Chart id: `cushing-working-storage-plot`
- dates: row.period (verbatim, including 2015-09-01 style day-1 dates)
- values: workingStorageKbbl
- Copy: 쿠싱 허브 EIA 탱크 작업 저장 용량(천 배럴). 재고가 아니고 바쁨이 아닙니다. 보고는 2024-03 이후 중단.
- Board lane `091-CAP` under physical_context.
- Keep INSUFFICIENT. deployment-cwd add `cushing-working-storage-plot` plus `78410`. Scope numeric guards to visible text, not SVG path coords.

## Acceptance
`cd app && node --test tests/cushing-working-storage.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing working storage series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
