# opencode worker — 091-U dated job events only

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091UZ/README.md`.

## Outcome
If and only if public 091-U listings have real observation dates, freeze an event log. Hiring list is not crew-on-site. If time was not preserved, do **not** invent dates; fail closed with a receipt.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260909T091UBOARDZ/` (README, receipt, events json)
- `app/app/lib/cushing-jobs.ts`
- `app/tests/cushing-jobs.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, or QCEW files.

## Rules
- No scraping job boards beyond what is already frozen in-repo unless a public listing page is keyless and already in REGISTRY.
- No 0–100 score, no WTI, no filling missing weeks with 0.
- Korean JSDoc. Fail-closed reader.
- If there are no dated rows, write a receipt that says so, skip the TS reader, and report outcome failed with reason `no dated rows`.

## Do not ask the human
Use `orca orchestration ask` if blocked.

When done:
`orca orchestration send --type worker_done --subject "091-U dated jobs" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
