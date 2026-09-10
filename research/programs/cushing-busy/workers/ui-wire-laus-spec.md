# opencode worker — wire Payne County LAUS unemployment chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091LAUSZ/`.

## Outcome
If `readPayneLausMonthly` tests pass (139 months 2015-01..2026-07, disclosed tenths checksum 4731, last 2026-07 = 4.5 preliminary), attach **one monthly unemployment-rate chart**. County labor market, not Cushing city, not QCEW, not busy.

**2025-10 is a published missing month** (empty CSV cell / JSON null). Do not plot 0 for that month. Skip the null point or break the line — do not fill.

Keep every existing chart including `cushing-working-storage-plot` and `cushing-county-housing-plot`.

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

Do not edit `cushing-laus.ts`. Do not commit.

## Pattern
- import `20260910T091LAUSZ/payne_laus_monthly.json`
- `readPayneLausMonthly` from `~/lib/cushing-laus`
- Chart id: `cushing-laus-plot`
- dates: `${period}-01` only for rows whose rate is not null
- values: unemployment_rate
- Copy: Payne County 월간 LAUS 실업률. 쿠싱 시가 아니고 QCEW 고용이 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다.
- Board lane `091-LAUS` under physical_context.
- Keep INSUFFICIENT. deployment-cwd add `cushing-laus-plot` plus `4.5`. Scope numeric guards to visible text.

## Acceptance
`cd app && node --test tests/cushing-laus.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne LAUS series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
