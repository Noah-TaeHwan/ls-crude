# opencode worker — KCUH daily METAR time series from IEM

Read first: `research/programs/cushing-busy/loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`. The board already has **live** KCUH as 091-Q. This task freezes a **dated daily series**, not the live snapshot.

## Outcome
Freeze a daily weather time series for Cushing Municipal Airport (ICAO `KCUH` / FAA `CUH`) from the Iowa Environmental Mesonet. This is a **weather confounder**, not activity, not busy, not WTI.

Prefer IEM daily ASOS (keyless CSV), for example:
`https://mesonet.agron.iastate.edu/cgi-bin/request/daily.py?network=OK_ASOS&stations=KCUH&year1=2015&month1=1&day1=1&year2=2026&month2=9&day2=10`

If that URL 404s, probe the IEM ASOS hourly request and aggregate to **calendar UTC days** yourself. Do not scrape a browser. User-Agent `ls-crude-observations/1.0`.

Keep per day, only if the source actually disclosed a number:
- date (YYYY-MM-DD)
- max temperature F
- min temperature F
- precip inches (numeric 0 is observed dry; IEM `M` / missing stays missing; IEM `T` trace stays missing, never coerced to 0)

Do not invent days after the last complete UTC day. Do not backfill 2014. If the station has a start gap after 2015-01-01, start at the first real day and record it.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091KCUHZ/` (README, receipt.json, csv, json)
- `app/app/lib/cushing-kcuh.ts`
- `app/tests/cushing-kcuh.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, weather live reader (`cushing-weather.ts`), enrollment, kush, or QCEW files.

## Rules
- Label: KCUH daily airport weather, confounder, not activity.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc `@param`/`@returns`.
- Fail-closed reader: swapped dates, filled missing precip as 0, relabel as busy, or mixed-in WTI → null.
- Tests: n + first/last date + checksum of disclosed max-temp sum (integer °F) + fail-closed on damage.
- Acceptance: `cd app && node --test tests/cushing-kcuh.test.mjs` passes.
- If KCUH has no dated rows, write a receipt that says so, skip the TS reader, outcome failed `no dated rows`.

## Do not ask the human
Use `orca orchestration ask` if blocked. Do not invent data.

When done:
`orca orchestration send --type worker_done --subject "KCUH daily weather series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
