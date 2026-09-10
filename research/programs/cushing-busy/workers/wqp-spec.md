# opencode worker — EPA Water Quality Portal samples near Cushing

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/README.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/README.md`.

## Outcome
USGS streamflow, groundwater, and ECHO CWA last-inspection counts are already frozen. This task freezes a **dated water-quality sample** series from the keyless Water Quality Portal for a Cushing-city or Payne County / Cimarron-near-Cushing site if one exists. Ambient water chemistry, not cfs, not depth-to-water, not last-inspection counts, not DMR quantities, not busy, not WTI.

Preferred keyless: Water Quality Portal Station/Result REST (`https://www.waterqualitydata.us/` or documented `data.waterqualitydata.us` Result/Station services). Filter Oklahoma + Cushing or Payne, or a Cimarron site within ~20 km of Cushing (35.9849,-96.7645). Do not scrape the interactive mapper. Do not copy `07161450` discharge or well `360339096450201` levels.

Keep sample date and one public characteristic as filed (e.g. dissolved oxygen, specific conductance, pH, or nitrate — pick the characteristic with the longest dated local panel). Missing dates stay missing. Do not fill 0. Label the site id and distance honestly.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091WQPZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-wqp.ts` and `app/tests/cushing-wqp.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, USGS flow/GW files, CWA/DMR files. Do not commit.

## Rules
- Label: Cushing/Payne-area WQP water-quality samples, dated, not busy, not streamflow, not DMR.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled periods / statewide relabel / copying USGS cfs or CWA inspections.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "EPA WQP Cushing water quality" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
