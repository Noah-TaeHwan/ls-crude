# opencode worker — wire Cushing monthly precipitation chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091PRCPZ/`.

## Outcome
If `readCushingPrecip` tests pass (55 months 2017-05..2021-11, 47 disclosed, 8 missing, tenths checksum 44838), attach **one monthly precip chart**. Weather confounder, not CUH airport temp, not busy.

Missing months stay missing (empty CSV). **2021-09 = 0.000 is observed dry**, plot it. Do not plot 0 for the 8 missing months.

Keep every existing chart including `cushing-laus-plot` and `cushing-working-storage-plot`.

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

Do not edit `cushing-precip.ts`. Do not commit.

## Pattern
- import `20260910T091PRCPZ/cushing_precip_monthly.json`
- reader from `~/lib/cushing-precip`
- Chart id: `cushing-precip-plot`
- dates: `${period}-01` only for disclosed (non-null) months
- values: precip_in
- Copy: 쿠싱 시 GHCN 월간 강수량(인치). 공항 기온이 아니고 바쁨이 아닙니다. 부분월은 비워 두었습니다.
- Board lane `091-PRCP` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-precip.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing precip series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
