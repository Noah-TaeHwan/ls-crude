# opencode worker — Cushing High School annual enrollment time series

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091PZ/README.md`.

## Outcome
Freeze the already-in-repo Cushing High School annual enrollment as a **time series with the 2023-24 gap kept missing**. Community footprint, not weekly busy, not WTI.

Source CSV (do not scrape): `research/indexes/091-cushing-operations-nowcasting/20260908T091PZ/091p_cushing_hs_enrollment_sample.csv`

Rows: 2019-20=505, 2020-21=474, 2021-22=494, 2022-23=530, 2024-25=529. There is **no 2023-24 row**. Do not insert 0.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091PENRZ/` (README, receipt.json, copy of csv/json)
- `app/app/lib/cushing-enrollment.ts`
- `app/tests/cushing-enrollment.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, KUSH files, QCEW files.

## Rules
- Label: Cushing High School enrollment, annual, not city-wide busy.
- Fail-closed: filling 2023-24 with 0, swapping years, last-value copy → null.
- Korean JSDoc `@param`/`@returns`.
- Checksum of the five disclosed totals = 2532.
- Tests: happy path + fail-closed on a filled 2023-24 zero.
- Acceptance: `cd app && node --test tests/cushing-enrollment.test.mjs` passes.

## Do not ask the human
Use `orca orchestration ask` if blocked.

When done:
`orca orchestration send --type worker_done --subject "Cushing HS enrollment series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
