# opencode worker — KUSH monthly operational-attention time series

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091PZ/README.md`.

## Outcome
Freeze the already-in-repo KUSH monthly count as a **time series**. It is editorial attention (Cushing + an operational word in public titles), not workers/trucks/busy, not WTI.

Source CSV (do not scrape live WordPress in this task): `research/indexes/091-cushing-operations-nowcasting/20260908T091PZ/091p_kush_operational_attention_monthly.csv`

Coordinator pre-count: 221 months, 2008-02-01 .. 2026-06-01, sum of `article_count` = 101, max = 3, 144 months are 0. **Zero is an observed count of matching titles that month, not a missing month.** Do not drop zeros. Do not invent months after 2026-06.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091KUSHZ/` (README, receipt.json, copy of csv/json)
- `app/app/lib/cushing-kush.ts`
- `app/tests/cushing-kush.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, enrollment files, QCEW files.

## Rules
- Label: KUSH local operational-attention count, not activity.
- Fail-closed: changing a 0 to missing, filling extra months, swapping dates, relabel as busy score → null.
- Korean JSDoc. Checksum sum=101, n=221.
- Tests: happy path + fail-closed on damage.
- Acceptance: `cd app && node --test tests/cushing-kush.test.mjs` passes.

## Do not ask the human
Use `orca orchestration ask` if blocked.

When done:
`orca orchestration send --type worker_done --subject "KUSH monthly attention series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
