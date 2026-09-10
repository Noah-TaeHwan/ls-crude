# opencode worker — KCUH/Cushing Regional monthly Jet-A gallons

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260908T091OZ/README.md`.

## Outcome
Freeze a **monthly Jet-A (and optionally AvGas) fuel-sales** series for Cushing Regional / KCUH if a keyless dated public table exists with **≥2 months**. 091-O already parks n=4 irregular city-manager report points (2023-05-15, 2023-06-20, 2023-07-17, 2023-09-18) as not a long series. This task must find a **longer comparable series**, not re-plot those four.

Preferred keyless:
1. Additional Cushing city manager / airport monthly reports with numeric Jet-A gallons and a period (not just a report date), if they are public PDFs/HTML without login.
2. Any other keyless municipal or FAA fuel-sales table for this airport.

Keep `period`, `jet_a_gallons` (AvGas only as a second column if disclosed). Missing months stay missing. Do not fill 0. Do not scrape AirNav. Do not invent gallons from based-aircraft counts.

If the only dated numeric Jet-A is still those four 091-O points, fail closed: receipt only, outcome failed `no dated rows` (n=4 already parked). Do not copy 091-O into a new freeze as if it were new.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091JETAZ/` (README, receipt, csv/json if ≥2 *new* months beyond 091-O, or ≥8 total comparable months)
- `app/app/lib/cushing-jet-a.ts` and `app/tests/cushing-jet-a.test.mjs` only if the freeze has ≥2 comparable months that were not already parked as n=4

Do not edit observation UI, board JSON, PROGRAM.md, KCUH weather files. Do not commit.

## Rules
- Label: Cushing Regional Jet-A gallons, monthly, not busy, not WTI.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / n=4 replay.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing Jet-A gallons" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
