# opencode worker — USGS groundwater near Cushing / Payne

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091USGSZ/README.md`.

## Outcome
USGS **streamflow** at 07161450 (Cimarron near Ripley) is already frozen. This task freezes a **dated groundwater-level** series from a keyless USGS NWIS site in Payne County or within ~20 km of Cushing if one exists. Hydrology confounder, not streamflow cfs, not precip, not storms, not busy, not WTI.

Preferred keyless: USGS Waterservices / NWIS DV or GW levels (`https://waterservices.usgs.gov/` or `https://nwis.waterdata.usgs.gov/`), parameter groundwater (e.g. 72019 depth to water, or 62610/62611). Do not copy site 07161450 discharge. If no Cushing-named well exists, pick the nearest Payne well and label distance honestly.

Keep sample date and a public level. Missing days stay missing. Do not fill 0.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091GWZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-usgs-gw.ts` and `app/tests/cushing-usgs-gw.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, streamflow USGS files. Do not commit.

## Rules
- Label: Payne/Cushing-area USGS groundwater, dated, not busy, not 07161450 cfs.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled days / copying streamflow.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "USGS Payne groundwater" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
