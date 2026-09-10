# opencode worker — wire Payne LODES annual workplace-jobs chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091LODEZ/`.

## Outcome
If `readPayneLodesAnnual` tests pass (22 years 2002..2023, FIPS 40119, jobs sum 713340, 2023=35589), attach **one annual workplace-jobs chart**. County employment structure, not QCEW, not Cushing city, not busy.

Do not fill missing years with 0 (this freeze has no gap years). Copy must say Payne County LODES workplace jobs, not Cushing city, not QCEW, not busy. 2022 WAC 33401 is not the 091-I OD 32543 table — do not mix them.

Keep every existing chart including `cushing-qcew-quarterly-plot` and `cushing-echo-dmr-plot`.

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

Do not edit `cushing-lodes.ts`. Do not commit. Do not touch QCEW freeze files.

## Pattern
- import `20260910T091LODEZ/payne_lodes_annual.json`
- reader from `~/lib/cushing-lodes`
- Chart id: `cushing-lodes-plot`
- dates: `{year}-07-01` for years with rows only
- values: jobs as filed
- Copy: 페이네 카운티 Census LODES 연간 직장 일자리. 쿠싱 시가 아니고 QCEW가 아니며 바쁨이 아닙니다. 결측 연도는 0으로 채우지 않았습니다.
- Board lane `091-LODE` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-lodes.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Payne LODES annual" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
