# opencode worker — wire Payne County LAUS labor-force chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091LAUFZ/`.

## Outcome
If `readPayneLausLaborForce` tests pass (139 months 2015-01..2026-07, disclosed sum 5336427, last 2026-07 = 40352), attach **one monthly labor-force chart**. County civilian labor force, not unemployment rate, not employed-persons, not busy.

**2025-10 is published missing.** Do not plot 0 for that month.

Keep every existing chart including `cushing-laus-plot` and `cushing-laus-employed-plot`.

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

Do not edit `cushing-laus-labor-force.ts`. Do not commit.

## Pattern
- import `20260910T091LAUFZ/payne_laus_labor_force_monthly.json`
- reader from `~/lib/cushing-laus-labor-force`
- Chart id: `cushing-laus-labor-force-plot`
- dates: `${period}-01` only for non-null labor_force
- values: labor_force
- Copy: Payne County 월간 LAUS 경제활동인구. 실업률·취업자 수 차트와 다르고 쿠싱 시가 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다.
- Board lane `091-LAUF` under physical_context.
- Keep INSUFFICIENT. deployment-cwd add plot id plus `40352`.

## Acceptance
`cd app && node --test tests/cushing-laus-labor-force.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne LAUS labor force" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
