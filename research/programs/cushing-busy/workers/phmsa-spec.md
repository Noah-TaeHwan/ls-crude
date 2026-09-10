# opencode worker — PHMSA Cushing pipeline incident dated events

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **dated event list** of PHMSA pipeline incidents whose location is Cushing, Oklahoma (city or clearly Cushing hub), if a keyless public table exists. This is an incident log, not activity, not busy, not WTI.

Preferred keyless surfaces:
1. PHMSA incident data files / open data CSV (distribution or transmission hazardous liquid) that can be filtered to OK + Cushing without login.
2. Any already-frozen PHMSA excerpt in-repo.

Keep only rows with a real incident date (report date is not a substitute unless the file labels it as the incident date). Fields if disclosed: `incident_date`, `system` (HL/GT/GD as labeled), `narrative-or-cause` short, `fatalities`/`injuries` if public aggregates. Do not invent Cushing from statewide OK.

If fewer than 2 dated Cushing rows, fail closed: receipt only, no TS reader, outcome failed `no dated rows`. A 1-row list is context, not a series — still fail closed for the reader; you may write the receipt.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091PHMSAZ/` (README, receipt, csv/json if ≥2 dated rows)
- `app/app/lib/cushing-phmsa.ts` and `app/tests/cushing-phmsa.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, TRI files. Do not commit.

## Rules
- Label: PHMSA Cushing incident dates, not throughput, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled dates / statewide relabel.
- Do not scrape a map into invented dates.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "PHMSA Cushing incidents" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
