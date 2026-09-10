# opencode worker — USGS streamflow near Cushing / Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091PRCPZ/README.md`.

## Outcome
Freeze a **dated streamflow (cfs)** series for a USGS NWIS gage whose station name or county is Cushing or Payne, Oklahoma, if a keyless daily/monthly table exists. Hydrology confounder, not GHCN precip, not NOAA storm counts, not busy, not WTI.

Preferred keyless: USGS Waterservices / NWIS IV or DV JSON (`waterservices.usgs.gov`) without a key. Pick the nearest named Cushing or Payne gage with a public daily mean discharge. Keep the station id as filed.

Keep date and discharge. Missing days/months stay missing. Do not fill 0. Do not invent Cushing from a distant Oklahoma River gage.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-usgs.ts` and `app/tests/cushing-usgs.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, precip/storm files. Do not commit.

## Rules
- Label: Cushing/Payne USGS streamflow, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "USGS Cushing streamflow" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
