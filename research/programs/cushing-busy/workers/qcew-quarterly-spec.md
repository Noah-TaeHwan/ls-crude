# opencode worker — Payne QCEW quarterly time series

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md`.

## Outcome
Freeze a **quarterly time series** of Payne County QCEW employment (FIPS 40119), not a one-quarter table and not Cushing-city busy. One point per year-quarter. Missing quarters stay missing. Never fill with 0.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/` (README, receipt.json, `payne_qcew_quarterly.csv`, parsed json)
- `app/app/lib/cushing-qcew-quarterly.ts`
- `app/tests/cushing-qcew-quarterly.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, `cushing-qcew.ts`, or 091-Z files.

## Source
Keyless GET `https://data.bls.gov/cew/data/api/{year}/{qtr}/area/40119.csv` with User-Agent `ls-crude-observations/1.0`. Probe from 2015 Q1 through the latest quarter that returns HTTP 200. Stop at the first trailing 404 without inventing later points. Save raw under `research/gathering/raw/` (gitignored). Do not scrape www.bls.gov HTML.

Keep, per quarter if disclosed:
- own 0 / industry 10 month3 (total covered March/June/September/December)
- own 5 / industry 21 month3 (private mining) if present
- preserve `N` as missing, never 0

CSV columns: `year,qtr,month,total_covered,private_mining_21` with empty cells for suppression.

## Rules
- Geography is Payne County, not Cushing city.
- No 0–100 score, no WTI overlay, no interpolating skipped quarters.
- Korean JSDoc (`@param`/`@returns`).
- Fail-closed reader: swapped years, filled zeros, last-value copy, or relabel to Cushing city → null.
- Tests: row count + checksum of disclosed totals + fail-closed on damage.
- Acceptance: `cd app && node --test tests/cushing-qcew-quarterly.test.mjs` passes.

## Do not ask the human
Use `orca orchestration ask` if blocked. Do not invent data.

When done:
`orca orchestration send --type worker_done --subject "QCEW quarterly series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
