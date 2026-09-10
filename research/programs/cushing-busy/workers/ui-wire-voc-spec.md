# opencode worker — wire DEQ Cushing terminal VOC annual chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091VOCYZ/`.

## Outcome
If `readCushingVoc` tests pass, attach **one annual time-series chart** of Cushing-city terminal-context VOC tons. Keep every existing chart (`cushing-population-plot`, `cushing-kcuh-plot`, enrollment, kush, QCEW, EIA).

Receipt: 5 years 2020–2024, VOC 1440.861 / 1399.065 / 1177.399 / 1247.22 / 1206.389, checksum 6470.934. 2024 matches WENVZ (17 rows, 1206.389 t, HAP 19.715). Layers 5/7/6/1/8. Not AQI, not busy, not Agra.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md`
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-voc.ts`. Do not commit.

## Pattern
- import `20260910T091VOCYZ/cushing_terminal_voc_annual.json`
- `readCushingVoc` from `~/lib/cushing-voc`
- Chart id: `cushing-voc-plot`
- dates: `${year}-07-01`
- axis 0–2000, unit t (or 톤)
- Copy: 쿠싱 시 터미널류 시설 연간 VOC. 대기 질 지수가 아니고 바쁨이 아닙니다. 2024는 기존 091-WENVZ 1,206.389톤과 같습니다.
- Board lane `091-VOC` under physical_context.
- Keep INSUFFICIENT. deployment-cwd must still match `8,444`, `cushing-population-plot`, `아직 판단할 수 없습니다`, and add `cushing-voc-plot` plus `1,206.389`.

## Acceptance
`cd app && node --test tests/cushing-voc.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired VOC annual series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
