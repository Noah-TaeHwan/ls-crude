# opencode worker — wire Cushing city sales-tax chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091STAXZ/`.

## Outcome
If `readCushingSalesTax` tests pass (4 dated city points, cents checksum 229231800, last 2026-09 = 577814.84), attach **one monthly sales-tax chart**. Sparse OTC distribution months, not hotel tax, not use tax, not busy.

Do not fill the missing months between 2025-09 and 2026-08. Plot only the four disclosed points.

Keep every existing chart including `cushing-precip-plot`.

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

Do not edit `cushing-sales-tax.ts`. Do not commit.

## Pattern
- import `20260910T091STAXZ/cushing_city_sales_tax_monthly.json`
- reader from `~/lib/cushing-sales-tax`
- Chart id: `cushing-sales-tax-plot`
- dates: `${period}-01`
- values: sales_tax_usd
- Copy: 쿠싱 시 OTC 월간 판매세 분배액. 호텔세가 아니고 바쁨이 아닙니다. 공개된 4개월만 그렸습니다.
- Board lane `091-STAX` under physical_context.
- Keep INSUFFICIENT. deployment-cwd add plot id plus `577814`.

## Acceptance
`cd app && node --test tests/cushing-sales-tax.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing sales-tax series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
