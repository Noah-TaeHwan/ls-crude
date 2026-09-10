# opencode worker — KCUH/Cushing Regional monthly airport operations

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260908T091OZ/README.md` then `20260910T091JETAZ/README.md`.

## Outcome
Jet-A gallons fail-closed (091-JETAZ). This task freezes **monthly airport operations counts** for Cushing Regional / KCUH if a keyless dated public table exists. Operations (itinerant/local/total as published), not fuel sales, not busy, not WTI.

Preferred keyless:
1. FAA TFMSC / OPSNET / airport operations counts that can be filtered to KCUH/Cushing without login.
2. Any other keyless FAA or Oklahoma Aeronautics table with monthly ops for this airport.

Keep `period`, `operations` (and split itinerant/local only if disclosed). Missing months stay missing. Do not fill 0. Do not scrape AirNav. Do not invent ops from based-aircraft.

If fewer than 2 dated months, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091OPSZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-airport-ops.ts` and `app/tests/cushing-airport-ops.test.mjs` only if ≥2 months

Do not edit observation UI, board JSON, PROGRAM.md, Jet-A receipt, KCUH weather. Do not commit.

## Rules
- Label: Cushing Regional airport operations, monthly, not Jet-A, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / AirNav scrape.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing airport operations" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
