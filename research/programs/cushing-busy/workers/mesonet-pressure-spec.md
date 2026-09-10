# opencode worker — Mesonet OILT daily mean station pressure from existing freeze raw

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/README.md`.

## Outcome
Mesonet OILT daily air temperature, rain, soil temperature, humidity, and wind are already frozen. This task freezes a **dated daily mean station pressure** series for the **same OILT station** from the already-downloaded monthly `.mts` files. Weather confounder, not air tmax, not rain, not soil, not humidity, not wind, not KCUH, not busy, not WTI.

Preferred source: reuse `research/gathering/raw/091-mesonet-oilt/mts/` monthly `.mts` (do not re-download). Parse filed column `PAVG` with quality `PBAD`. One station. Do not stitch PERK. Do not copy tmax/rain/SAVG/HAVG/WSPD into this freeze.

Keep observation date and PAVG as filed. Missing days stay missing (`PBAD != 0` or sentinel `-996`/`-999`). Do not fill 0.

If fewer than 2 dated disclosed pressure rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091PRESZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-mesonet-pressure.ts` and `app/tests/cushing-mesonet-pressure.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, other mesonet readers, MESOZ/SOILZ/HUMZ/WSPDZ freeze files. Do not commit.

## Rules
- Label: Mesonet OILT daily mean station pressure PAVG, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not wind, not busy.
- Korean JSDoc. Fail-closed on filled days / copying other fields / relabel as Cushing city station.
- Typecheck with `cd app && npm run typecheck`.
- worker_done MUST include `--from` of your terminal handle.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "Mesonet OILT pressure" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
