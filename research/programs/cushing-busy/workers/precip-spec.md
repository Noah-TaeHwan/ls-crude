# opencode worker — CUH/Cushing monthly precipitation

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091KCUHZ/README.md`.

## Outcome
Freeze a **dated precipitation** series for Cushing Municipal (IEM stid `CUH`, not ICAO `KCUH`) if a keyless public table exists. Weather confounder, not busy, not WTI. Daily freeze `20260910T091KCUHZ` already has max temperature; **trace precip stayed missing** there. This task is precip only.

Preferred keyless:
1. IEM `daily.py` / CLI for `CUH` on `OK_ASOS` precip fields if they are actually populated (not empty/trace-only).
2. NCEI/NOAA monthly climate for Cushing, OK if a keyless CSV exists.

Keep `period`, `precip_in` (or the unit the source prints). Missing periods stay missing. Do not fill 0 for trace/missing. Do not re-freeze daily max temperature.

If precip is still empty/trace-only, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091PRCPZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-precip.ts` and `app/tests/cushing-precip.test.mjs` only if ≥2 dated points

Do not edit observation UI, board JSON, PROGRAM.md, KCUH daily temp files, housing, EIA. Do not commit.

## Rules
- Label: Cushing CUH precipitation, not temperature, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled zeros / station swap to KCUH ICAO.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing CUH precipitation" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
