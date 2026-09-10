# opencode worker — wire ZIP 74023 IRS SOI annual chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091SOIZ/`.

## Outcome
If `readCushingIrsSoi` tests pass (≥2 dated ZIP 74023 years, not BEA CAINC1), attach **one annual chart** of the frozen public field (returns or AGI as filed). ZIP tax stats, not county income, not busy.

Do not fill missing years with 0. Plot only years with a dated SOI row. Copy must say ZIP 74023 IRS SOI, not Payne BEA.

Keep every existing chart including `cushing-bea-income-plot`.

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

Do not edit `cushing-irs-soi.ts`. Do not commit. Do not touch BEA freeze files.

## Pattern
- import `20260910T091SOIZ/` json
- reader from `~/lib/cushing-irs-soi`
- Chart id: `cushing-irs-soi-plot`
- dates: `{year}-07-01` for years with ≥1 dated row (Map of years with rows only)
- values: the frozen public field as filed (do not convert)
- Copy: ZIP 74023 IRS SOI. Payne County BEA 개인소득이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-SOI` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-irs-soi.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing IRS SOI" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
