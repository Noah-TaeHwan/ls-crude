# opencode worker — wire Cushing SDWIS annual-violation-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091SDWISZ/`.

## Outcome
If `readCushingSdwis` tests pass (23 dated violations, PWS **OK2006061** CUSHING, 2017-01-01..2024-10-17, enforcement sum 4), attach **one annual count chart** of violations whose `complianceBeginDate` year has ≥1 row. Drinking-water log, not CWA NPDES, not VOC tons, not busy.

Do not fill missing years with 0. Count only years that have a dated begin (2017=21 VOC MR, 2024=2 LCRR). The 21 VOC rows share begin 2017-01-01 as filed — keep 21, do not spread across 2018–2022. Copy must say Cushing city PWS OK2006061, not statewide, not CWA.

Keep every existing chart including `cushing-echo-cwa-plot` and `cushing-nfip-plot`.

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

Do not edit `cushing-sdwis.ts`. Do not commit. Do not touch CWA/ECHO/VOC freeze files.

## Pattern
- import `20260910T091SDWISZ/cushing_sdwis_violations.json`
- reader from `~/lib/cushing-sdwis`
- Chart id: `cushing-sdwis-plot`
- dates: `{year}-07-01` for years with ≥1 dated begin (Map of years with rows only)
- values: count of violations in that year
- Copy: 쿠싱 시 상수도(PWS OK2006061) SDWIS 위반 연간 건수. CWA 점검이 아니고 바쁨이 아닙니다. 시작일이 없는 해는 0으로 채우지 않았습니다. 2017년 21건은 VOC 모니터링 행이 같은 시작일을 공유합니다.
- Board lane `091-SDWIS` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-sdwis.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing SDWIS" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
