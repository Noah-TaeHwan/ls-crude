# opencode worker — EPA GHGRP / FLIGHT Cushing-city annual CO2e

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/README.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091VOCYZ/README.md`.

## Outcome
TRI pounds and DEQ VOC tons are already frozen. This task freezes a **dated annual greenhouse-gas (CO2e) series for Cushing-city GHGRP facilities** if a keyless EPA table exists. Terminal/facility emissions log, not TRI pounds, not VOC tons, not busy, not WTI.

Preferred keyless (probe in this order, do not scrape FLIGHT HTML/JS):
1. EPA Envirofacts GHGRP REST, e.g. `https://data.epa.gov/efservice/` facility + emissions tables filtered to Oklahoma and city **CUSHING** (or ZIP 74023 **and** city CUSHING).
2. EPA GHGRP public data-set zip/CSV from `https://www.epa.gov/ghgreporting/data-sets` (no API key). Filter the same geography after download.

Do not copy TRI or VOC rows. Exclude Stillwater, Drumright, and other non-Cushing cities even if they share Payne County. Statewide Oklahoma is not Cushing.

Keep reporting year and a public CO2e (or CO2 equivalent as filed). Missing years stay missing. Do not fill 0. Do not convert units. Do not invent Cushing from county/state totals.

If fewer than 2 dated local years, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091GHGZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-ghg.ts` and `app/tests/cushing-ghg.test.mjs` only if ≥2 dated years

Do not edit observation UI, board JSON, PROGRAM.md, TRI/VOC/ECHO/RCRA files. Do not commit.

## Rules
- Label: Cushing city EPA GHGRP annual CO2e, dated, not busy, not TRI.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc on exported functions (`@param`/`@returns`).
- Fail-closed on filled years / statewide relabel / copying TRI pounds / copying VOC tons.
- Typecheck with `cd app && npm run typecheck`. Do not run `npx tsc` from repo root.

## Do not ask the human
Use `orca orchestration ask` if blocked. Do not invent data.

When done, from this terminal:
`orca orchestration send --type worker_done --subject "EPA GHGRP Cushing CO2e" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
