# opencode worker — Mesonet OILT daily solar radiation from existing freeze raw

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/README.md`.

## Outcome
Mesonet OILT daily air temperature, rain, soil, humidity, wind, and pressure are already frozen. This task freezes a **dated daily total solar radiation** series for the **same OILT station** from the already-downloaded monthly `.mts` files. Weather confounder, not air tmax, not rain, not soil, not humidity, not wind, not pressure, not KCUH, not busy, not WTI.

Preferred source: reuse `research/gathering/raw/091-mesonet-oilt/mts/` monthly `.mts`. Parse filed column `ATOT` with quality `ABAD`. One station. Do not stitch PERK. Do not copy other Mesonet fields into this freeze.

Keep observation date and ATOT as filed. Missing days stay missing (`ABAD != 0` or sentinel `-996`/`-999`). Do not fill 0. Observed 0.00 is allowed only if that is the filed solar value, not a sentinel.

If fewer than 2 dated disclosed rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091ATOTZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-mesonet-solar.ts` and `app/tests/cushing-mesonet-solar.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, other mesonet readers, existing MESO freeze files. Do not commit.

## Rules
- Label: Mesonet OILT daily total solar radiation ATOT, dated, 24.3 km, not air temp, not rain, not busy.
- Korean JSDoc. Fail-closed on filled days / copying other fields / relabel as Cushing city station.
- Typecheck with `cd app && npm run typecheck`.
- worker_done MUST include `--from` of your terminal handle.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "Mesonet OILT solar" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle. If dispatch-capability is missing, idle after tests; the coordinator inspects.
