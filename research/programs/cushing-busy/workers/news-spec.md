# opencode worker — 091-Z dated Cushing industry cues

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/README.md`.

## Outcome
Freeze **only** rows from the already-frozen `headline_audit.csv` that have a real `published_at` **and** `is_cushing_context=true` **and** `is_industry_cue=true`. This is an event list, not a headline count, not activity, not a busy score.

A coordinator pre-count of that CSV on 2026-09-09 found **1** matching row (South Bow / Bridger pipeline to Cushing, `published_at` 2026-09-07T15:59:45Z). Re-count from the file. If you find 0 matching dated rows, fail closed. Do not invent extra matches.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260909T091ZBOARDZ/` (README, receipt.json, events json/csv)
- `app/app/lib/cushing-news.ts`
- `app/tests/cushing-news.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, QCEW files, or jobs files.

## Rules
- Source of truth is the frozen CSV: `research/indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/headline_audit.csv`. Do not scrape live RSS in this task.
- Keep `published_at`, title, source, url, lanes, matched_terms. Do not fill missing dates.
- Market-context-only rows and Cushing's Syndrome medical hits stay out.
- No 0–100 score, no WTI overlay, no “N headlines = busy”.
- Korean JSDoc on exported functions (`@param`/`@returns`).
- Fail-closed reader: swapped dates, extra invented rows, or treating `is_industry_cue=false` as a cue must return null.
- Tests: happy path checksum of the matching row(s) + fail-closed on damage.

## Do not ask the human
Use `orca orchestration ask` if blocked. Do not invent data.

When done, from this terminal:
`orca orchestration send --type worker_done --subject "091-Z dated cues" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
