# opencode worker — wire Payne County NFIP policies-in-force chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091NFPPZ/`.

## Outcome
If `readCushingNfipPolicies` tests pass (214 dated months 2009-01..2026-10, policy sum 4039, censusGeoid prefix 40119, not claims, not 40109), attach **one monthly count chart**. Policy stock, not claims, not busy.

Do not fill missing periods with 0. Plot only periods with a dated policy row. Copy must say Payne County NFIP policies, not claims, not Cushing city.

Keep every existing chart including `cushing-nfip-plot` (claims) and `cushing-fema-plot`.

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

Do not edit `cushing-nfip-policies.ts` or the claims freeze. Do not commit.

## Pattern
- import `20260910T091NFPPZ/` json
- reader from `~/lib/cushing-nfip-policies`
- Chart id: `cushing-nfip-policies-plot`
- dates: `{yearMonth}-01` for months with ≥1 dated policy row only
- values: `policies` as frozen (do not fill missing months)
- Copy: Payne County NFIP 유효 증권 건수. 청구 건수가 아니고 바쁨이 아닙니다. 행이 없는 기간은 0으로 채우지 않았습니다.
- Board lane `091-NFPP` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-nfip-policies.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne NFIP policies" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
