# opencode worker — wire FRA Cushing crossing-incident annual-count chart

Read first: `loop-contract.md` then `PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091FRAZ/`.

## Outcome
If `readCushingFra` tests pass (3 dated Form 57 incidents 1976-10-15..1982-05-11, killed 0, injured 1), attach **one annual count chart** of those incidents. Sparse log, not throughput, not PHMSA, not busy.

Do not fill years after 1982 with 0. Count only years that have a dated row. Same as a 3-point series.

Keep every existing chart including `cushing-phmsa-plot` and `cushing-laus-labor-force-plot`.

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

Do not edit `cushing-fra.ts`. Do not commit.

## Pattern
- import `20260910T091FRAZ/cushing_fra_incidents.json`
- reader from `~/lib/cushing-fra`
- Chart id: `cushing-fra-plot`
- dates: incident year `-07-01` for years with ≥1 incident
- values: count
- Copy: 쿠싱 시 FRA 철도건널목 사고 연간 건수. 처리량이 아니고 PHMSA가 아니며 바쁨이 아닙니다. 1983년 이후는 공개 행이 없어 비워 두었습니다.
- Board lane `091-FRA` under physical_context.
- Keep INSUFFICIENT.

## Acceptance
`cd app && node --test tests/cushing-fra.test.mjs tests/cushing-context.test.mjs tests/deployment-cwd.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired FRA Cushing incidents" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
