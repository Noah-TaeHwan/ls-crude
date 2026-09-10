# opencode worker — Mesonet OILT daily mean wind speed from existing freeze raw

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/README.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091HUMZ/README.md`.

## Outcome
Mesonet OILT daily air temperature, rain, 10cm soil temperature, and mean relative humidity are already frozen. This task freezes a **dated daily mean wind speed** series for the **same OILT station** from the already-downloaded monthly `.mts` files. Weather confounder, not air tmax, not rain, not soil, not humidity, not KCUH, not busy, not WTI.

Preferred source: reuse `research/gathering/raw/091-mesonet-oilt/mts/` monthly `.mts` (do not re-download the whole archive unless a needed year is missing). Parse filed column `WSPD` with quality `WBAD`. One station. Do not stitch PERK. Do not copy tmax/rain/SAVG/HAVG into this freeze.

Keep observation date and WSPD as filed. Missing days stay missing (`WBAD != 0` or sentinel `-996`/`-999`). Do not fill 0. Observed 0.00 is allowed only if that is the filed wind value, not a sentinel.

If fewer than 2 dated disclosed wind rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091WSPDZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-mesonet-wind.ts` and `app/tests/cushing-mesonet-wind.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, `cushing-mesonet.ts`, `cushing-mesonet-soil.ts`, `cushing-mesonet-humidity.ts`, MESOZ/SOILZ/HUMZ freeze files. Do not commit.

## Rules
- Label: Mesonet OILT daily mean wind speed WSPD, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not busy.
- Korean JSDoc. Fail-closed on filled days / copying tmax, rain, SAVG, or HAVG / relabel as Cushing city station.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Mesonet OILT wind" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
