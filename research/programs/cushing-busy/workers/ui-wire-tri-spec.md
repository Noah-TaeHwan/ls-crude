# opencode worker — wire Cushing city TRI annual chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/`.

## Outcome
If `readCushingTri` tests pass, attach **one annual time-series chart** of Cushing-city TRI on-site releases (lb). Keep every existing chart including `cushing-voc-plot`.

Receipt: 16 years 1989–2003 + 2024, checksum 924142 lb, last 2024 = 0 (Batch Plant, all media NA, observed 0). **2004–2023 have no rows — omit those years, never fill 0.** 2024 zero stays on the chart as an observed point. Reporter break 1989–2003 Evans vs 2024 Batch Plant — one city aggregate, not one facility trend. Not busy, not DEQ VOC substitute.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md`
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-tri.ts`. Do not commit.

## Pattern
- import `20260910T091TRIZ/cushing_city_tri_onsite_annual.json`
- `readCushingTri` from `~/lib/cushing-tri`
- Chart id: `cushing-tri-plot`
- dates: `${year}-07-01` for disclosed years only
- axis 0–200000, unit lb
- Copy: 쿠싱 시 TRI 현장 배출(lb). 독성 배출 신고이지 바쁨이 아닙니다. 2004–2023은 결측입니다. 2024년 0lb는 공시된 값입니다.
- Board lane `091-TRI` under physical_context.
- Keep INSUFFICIENT. deployment-cwd must still match `1,206.389`, `cushing-voc-plot`, `아직 판단할 수 없습니다`, and add `cushing-tri-plot`.

## Acceptance
`cd app && node --test tests/cushing-tri.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired TRI annual series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
