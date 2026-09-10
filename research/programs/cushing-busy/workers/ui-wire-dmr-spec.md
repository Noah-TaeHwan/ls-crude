# opencode worker — wire Cushing ECHO DMR monthly flow-row chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/`.

## Outcome
If `readCushingEchoDmr` tests pass (1722 dated rows 2015-01-31..2026-07-31, 880 numeric / 842 NODI null, 6 Cushing-city permits, checksum thousandths 7487398621), attach **one monthly count chart** of dated DMR flow rows. Water discharge log, not CWA last-inspection counts, not CAA FCE, not busy.

Do **not** plot mixed MGD and gal/d as one quantity (units as filed, never totaled). Count months that have ≥1 dated flow row. Missing months stay missing. NODI nulls stay in the row count as dated no-discharge reports, never converted to 0 MGD. Copy must say Cushing city ECHO DMR flow reports, mixed units not summed, not last-inspection CWA, not busy.

Keep every existing chart including `cushing-echo-cwa-plot` and `cushing-mesonet-plot`.

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

Do not edit `cushing-echo-dmr.ts`. Do not commit. Do not touch CWA inspection freeze files.

## Pattern
- import `20260910T091DMRZ/cushing_echo_dmr_flow.json`
- reader from `~/lib/cushing-echo-dmr` (`readCushingEchoDmr`)
- Chart id: `cushing-echo-dmr-plot`
- dates: `${yearMonth}-01` for year-months with ≥1 dated row (Map of months with rows only)
- values: count of dated rows in that month
- Copy: 쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수. 점검 횟수가 아니고 바쁨이 아닙니다. MGD와 gal/d를 한 축에 더하지 않았고, NODI 무방류는 0 유량으로 바꾸지 않았으며 행이 없는 달은 그리지 않았습니다.
- Board lane `091-DMR` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-echo-dmr.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired ECHO Cushing DMR" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
