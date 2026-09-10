# opencode worker — HUD USPS ZIP 74023 address vacancy

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091HUCZ/README.md` then `20260910T091POPZ/README.md`.

## Outcome
County housing units and city population are already frozen. This task freezes a **dated ZIP 74023 (Cushing) HUD USPS vacancy / address-count** series from a keyless HUDUSER USPS file if one exists. Local occupancy of addresses, not housing-unit stock, not Census BPS permits, not busy, not WTI.

Preferred keyless: HUD USPS Administrative Data on Address Vacancies quarterly Excel/CSV at huduser.gov, no API key. Filter ZIP **74023** only. Do not use paid USPS or HUD APIs that need a key.

Keep quarter (or year-month) and a public vacancy or total-address count as filed. Missing quarters stay missing. Do not fill 0. Do not copy county HU or city POP. Do not invent city-wide vacancy from county or statewide ZIP lists.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091VACZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-usps-vacancy.ts` and `app/tests/cushing-usps-vacancy.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, population/housing/BPS/PEP/BEA files. Do not commit.

## Rules
- Label: ZIP 74023 HUD USPS vacancy, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled quarters / wrong ZIP.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "HUD USPS 74023 vacancy" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
