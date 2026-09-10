# opencode worker — QCEW Payne county context (not Cushing busy)

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/PROGRAM.md`.

## Outcome
Freeze a dated Payne County QCEW slice as **county context**, never as Cushing-city busy. Provide a fail-closed TypeScript reader and unit tests.

## Own these files only (create/update)
- `research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWZ/` (README, receipt.json, parsed json/csv)
- `app/app/lib/cushing-qcew.ts`
- `app/tests/cushing-qcew.test.mjs`

Do not edit `cushing-observation.tsx`, board JSON, PROGRAM.md, loop-contract.md, or any other app route.

## Source
GET `https://data.bls.gov/cew/data/api/2025/1/area/40119.csv` (no API key). User-Agent `ls-crude-observations/1.0`. Save raw under `research/gathering/raw/` (gitignored). Do not scrape www.bls.gov HTML.

Keep at least: area 40119, own_code/industry codes you actually parsed, March 2025 employment for total covered and any NAICS 21 / 721 rows if present. Preserve `N` suppression as missing, never 0.

## Rules
- Label geography Payne County, not Cushing city. Stillwater/OSU dominate the county.
- No 0–100 score, no WTI overlay, no filling missing quarters.
- Korean JSDoc on exported functions (`@param`/`@returns`).
- Reader returns null/throws on swapped rows, invented dates, or filled zeros.
- Tests: happy path checksums + fail-closed on damage.

## Acceptance
`cd app && node --test tests/cushing-qcew.test.mjs` passes.

## Do not ask the human
If blocked, `orca orchestration ask` the coordinator. Do not invent data.

When done, from this terminal:
`orca orchestration send --type worker_done --subject "QCEW Payne frozen" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded --files-modified "<paths>" --json`
Use failed outcome if you cannot freeze a dated county table honestly.
Then idle. Do not start more work.
