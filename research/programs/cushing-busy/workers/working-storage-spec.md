# opencode worker — EIA Cushing working storage capacity time series

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260909T091EIAZ/README.md` then `20260909T091EIAMZ/README.md`.

## Outcome
Freeze a **dated working-storage-capacity** series for the Cushing, OK crude hub from EIA, if a keyless public table exists. This is **tank capacity**, not stocks already on the board, not busy, not WTI.

Preferred keyless:
1. EIA petroleum dnav / API for Cushing, OK (`YCUOK`) **working storage capacity** (or net available shell capacity if that is the published capacity series). Weekly or monthly as published.
2. Distinct from weekly stocks (`WCESTUS1` / already frozen `20260909T091EIAZ`) and monthly stocks (`MCRST_YCUOK_1` / `20260909T091EIAMZ`). If the only download is stocks, fail closed — do not re-freeze stocks.

Keep `period` (ISO date or EIA period as published), `working_storage_mbbl` (or the unit EIA prints). Missing periods stay missing. Do not fill 0. Do not convert stocks into capacity.

If fewer than 2 dated capacity points, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091CAPZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-working-storage.ts` and `app/tests/cushing-working-storage.test.mjs` only if ≥2 dated points

Do not edit observation UI, board JSON, PROGRAM.md, stocks files, housing files. Do not commit.

## Rules
- Label: Cushing working storage capacity, EIA, not stocks, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / stocks relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing working storage capacity" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
