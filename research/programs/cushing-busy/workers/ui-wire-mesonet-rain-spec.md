# opencode worker — wire Mesonet OILT daily rain chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/`.

## Outcome
If `readMesonetDaily` tests pass (OILT Oilton 4269 days, rainSum100 48232, 127 rain null, observed dry 0.00 kept) **and** `cushing-mesonet-plot` already shows daily **tmax**, attach **one daily rain chart**. Weather confounder, not GHCN monthly precip, not KCUH, not busy.

Do not fill missing days with 0. Plot disclosed `rainIn` only (skip null rain days; keep observed 0.00 dry days). Copy must say Mesonet OILT Oilton 24.3 km daily rain, not GHCN, not KCUH, not busy.

Keep every existing chart including `cushing-mesonet-plot`, `cushing-kcuh-plot`, and `cushing-precip-plot`.

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

Do not edit `cushing-mesonet.ts`. Do not commit. Do not touch KCUH/precip freeze files.

## Pattern
- reuse `20260910T091MESOZ/` json and `~/lib/cushing-mesonet`
- Chart id: `cushing-mesonet-rain-plot`
- dates: row.date for rows with disclosed rainIn (including 0.00 dry)
- values: rainIn as filed
- Copy: 쿠싱에서 24.3 km Mesonet OILT(Oilton) 일강수량. GHCN 월강수·KCUH 공항이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았고, 관측된 건조 0.00은 그대로 둡니다.
- Board lane `091-MESR` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-mesonet.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Mesonet OILT rain" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
