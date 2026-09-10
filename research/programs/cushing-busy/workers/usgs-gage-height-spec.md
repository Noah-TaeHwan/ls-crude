# opencode worker — USGS 07161450 daily mean gage height, not discharge

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/README.md`.

## Outcome
USGS 07161450 daily **discharge (cfs)** is already frozen. This task freezes a **dated daily mean gage height** series for the **same site** if NWIS discloses parameter 00065 (gage height, feet). Hydrology confounder, not cfs, not groundwater 72019, not WQP pH, not busy, not WTI.

Preferred keyless: USGS NWIS DV `https://waterservices.usgs.gov/nwis/dv/?sites=07161450&parameterCd=00065&format=json` (or rdb). Label Cimarron near Ripley 12.8 km, not a Cushing-city gage.

Keep observation date and gage height as filed. Missing days stay missing. Do not fill 0. Do not copy dischargeCfs into this freeze.

If fewer than 2 dated disclosed gage-height rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091GAGEZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-usgs-gage.ts` and `app/tests/cushing-usgs-gage.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, `cushing-usgs.ts`, USGSZ/GWZ/WQPZ freeze files. Do not commit.

## Rules
- Label: USGS 07161450 daily mean gage height, dated, 12.8 km, not discharge cfs, not busy.
- Korean JSDoc. Fail-closed on filled days / copying cfs / relabel as Cushing-city gage.
- Typecheck with `cd app && npm run typecheck`.
- worker_done MUST include `--from` of your terminal handle.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --from $ORCA_TERMINAL_HANDLE --type worker_done --subject "USGS Cimarron gage height" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle. If dispatch-capability is missing, idle after tests; the coordinator inspects.
