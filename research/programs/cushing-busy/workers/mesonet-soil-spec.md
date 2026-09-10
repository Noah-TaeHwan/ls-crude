# opencode worker — Mesonet OILT daily soil moisture from existing freeze raw

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/README.md`.

## Outcome
Mesonet OILT daily air temperature and rain are already frozen in `20260910T091MESOZ`. This task freezes a **dated daily soil-moisture (or soil-temperature)** series for the **same OILT station** if the already-downloaded monthly `.mts` files disclose a soil column. Weather/soil confounder, not air tmax, not rain inches, not KCUH, not busy, not WTI.

Preferred source: reuse `research/gathering/raw/091-mesonet-oilt/` monthly `.mts` (do not re-download the whole archive unless a needed year is missing). Parse the documented soil volumetric-water or soil-temp columns (e.g. VW05/VW25/TR05 — use the column names as filed in the `.mts` header). One station, one depth. Do not stitch PERK. Do not copy tmax/rain into this freeze.

Keep observation date and the public soil field as filed. Missing days stay missing. Do not fill 0. Observed 0.00 is allowed only if that is the filed soil value, not a sentinel.

If fewer than 2 dated disclosed soil rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091SOILZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-mesonet-soil.ts` and `app/tests/cushing-mesonet-soil.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, `cushing-mesonet.ts`, MESOZ freeze files. Do not commit.

## Rules
- Label: Mesonet OILT daily soil, dated, 24.3 km, not air temp, not rain, not busy.
- Korean JSDoc. Fail-closed on filled days / copying tmax or rain / relabel as Cushing city station.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Mesonet OILT soil moisture" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
