# opencode worker — wire Cushing city Census population chart

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091POPZ/`.

## Outcome
If `readCushingPopulation` tests pass, attach **one annual time-series chart** of Cushing city Census PEP population. Keep every existing chart including `cushing-kcuh-plot` if present.

Receipt: 15 years 2010..2024, last 2024=8444, checksum 119988, place 4018850. 2010–2019 and 2020–2024 are **two PEP vintages concatenated** (2019=7615 then 2020=8318). That jump is a vintage break, not a filled gap. Do not smooth it. Do not treat it as busy.

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md`
- `app/tests/cushing-context.test.mjs`
- `app/tests/deployment-cwd.test.mjs`

Do not edit `cushing-population.ts`. Do not commit.

## Pattern
- import `20260910T091POPZ/cushing_city_population_annual.json`
- reader export: inspect `app/app/lib/cushing-population.ts` and use the actual function name
- Chart id: `cushing-population-plot`
- dates: `${year}-07-01`
- axis 0–12000, unit 명
- Copy: 쿠싱 시 연간 인구(Census PEP). 현장 바쁨 아님. 2010–2019와 2020–2024 빈티지가 이어져 있으며 2020 단차는 빈티지 교체다.
- Board lane `091-POP` under physical_context.
- Keep INSUFFICIENT, no score, no WTI.
- deployment-cwd must still match enrollment/kush/QCEW strings and add `cushing-population-plot` plus `8,444`.

## Acceptance
`cd app && node --test tests/cushing-population.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired city population series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
