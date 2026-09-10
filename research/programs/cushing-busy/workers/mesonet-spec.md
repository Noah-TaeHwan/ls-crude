# opencode worker — Oklahoma Mesonet nearest Cushing daily/monthly series

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091KCUHZ/README.md`.

## Outcome
KCUH/CUH daily airport temperature and GHCN monthly precip are already frozen. This task freezes a **dated Oklahoma Mesonet series** from the nearest keyless station to Cushing if one exists. Weather confounder, not KCUH ASOS, not GHCN precip, not busy, not WTI.

Preferred keyless: Mesonet public CSV/API (no login). Probe stations near Cushing (Payne County) and pick the nearest with ≥2 dated days or months. Do not scrape interactive maps. Do not invent Cushing from statewide OK.

Keep observation date and a public field as filed (precip, temperature, or soil moisture). Missing periods stay missing. Do not fill 0. Label the station id and distance.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-mesonet.ts` and `app/tests/cushing-mesonet.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, KCUH/precip files. Do not commit.

## Rules
- Label: Mesonet nearest Cushing, dated, not KCUH, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled periods / statewide relabel / copying KCUH.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Oklahoma Mesonet Cushing" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
