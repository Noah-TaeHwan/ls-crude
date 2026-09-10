# opencode worker — wire Cushing city GHGRP annual CO2e chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091GHGZ/`.

## Outcome
If `readCushingGhg` tests pass (≥2 dated Cushing-city GHGRP years, CO2e as filed, not TRI pounds, not VOC tons), attach **one annual CO2e chart**. Emissions log, not TRI, not VOC, not busy.

Do not fill missing years with 0. Plot only years with a dated GHGRP row. Copy must say Cushing city GHGRP CO2e, not TRI, not statewide.

Keep every existing chart including `cushing-tri-plot`, `cushing-voc-plot`, and `cushing-rcra-plot`.

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

Do not edit `cushing-ghg.ts`. Do not commit. Do not touch TRI/VOC/RCRA freeze files.

## Pattern
- import `20260910T091GHGZ/` json
- reader from `~/lib/cushing-ghg`
- Chart id: `cushing-ghg-plot`
- dates: `{year}-07-01` for years with ≥1 dated GHGRP row (Map of years with rows only)
- values: CO2e as filed (do not convert)
- Copy: 쿠싱 시 EPA GHGRP 연간 CO2e. TRI 파운드·VOC 톤이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다.
- Board lane `091-GHG` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-ghg.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired Cushing GHGRP" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
