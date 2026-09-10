# opencode worker — wire Payne County NFIP annual-claim-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091NFIPZ/`.

## Outcome
If `readCushingNfip` tests pass (100 Payne claims, countyCode **40119**, 1980-06-19..2021-06-27, paid-building cents 107090889, 21 paid-building nulls), attach **one annual count chart** of claims whose `dateOfLoss` year has ≥1 row. Flood-insurance log, not FEMA declarations, not NOAA storms, not Cushing city, not busy.

Do not fill missing years with 0. Count only years that have a dated claim (20 sparse years). Copy must say Payne County NFIP claims, not Cushing city (city is redacted as filed), not Oklahoma County 40109. Keep paid nulls off the chart values — the chart is claim **counts**, not dollars filled with 0.

Keep every existing chart including `cushing-fema-plot` and `cushing-usgs-gw-plot` if present.

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

Do not edit `cushing-nfip.ts`. Do not commit. Do not touch FEMA declaration / storm / GW freeze files.

## Pattern
- import `20260910T091NFIPZ/cushing_nfip_claims.json`
- reader from `~/lib/cushing-nfip`
- Chart id: `cushing-nfip-plot`
- dates: `{year}-07-01` for years with ≥1 dated claim (Map of years with rows only)
- values: count of claims in that year
- Copy: Payne County NFIP 홍수보험 청구 연간 건수. 쿠싱 시가 아니고 재난선포·폭풍 건수가 아니며 바쁨이 아닙니다. 청구가 없는 해는 0으로 채우지 않았습니다. 시 이름은 원문이 비공개입니다.
- Board lane `091-NFIP` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-nfip.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne NFIP claims" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
