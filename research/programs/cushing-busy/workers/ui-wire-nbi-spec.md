# opencode worker — wire Payne County NBI inspection-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091NBIZ/`.

## Outcome
If `readCushingNbi` tests pass (384 Payne county-119 bridges, inspection months 2022-03..2024-01, no Cushing place 18850), attach **one annual inspection-count chart** of years with ≥1 dated Item-90 row. Bridge log, not AADT, not busy.

Do not fill missing years with 0. Plot only 2022/2023/2024 (27/283/74). Copy must say Payne County NBI, not Cushing city, not AADT.

Keep every existing chart including `cushing-aadt-plot`.

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

Do not edit `cushing-nbi.ts`. Do not commit. Do not touch AADT freeze files.

## Pattern
- import `20260910T091NBIZ/` json
- reader from `~/lib/cushing-nbi`
- Chart id: `cushing-nbi-plot`
- dates: `{year}-07-01` for years with ≥1 dated inspection (Map of years with rows only)
- values: count of dated rows in that year
- Copy: Payne County FHWA NBI 교량 점검 연간 건수. Cushing 시 단독이 아니고 AADT·바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-NBI` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-nbi.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne NBI" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
