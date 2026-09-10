# opencode worker — OpenFEMA NFIP policies in force, Payne County

Read first: `research/programs/cushing-busy/loop-contract.md` then `research/programs/cushing-busy/loop-lessons.md` then `research/programs/cushing-busy/PROGRAM.md` then `research/indexes/091-cushing-operations-nowcasting/20260910T091NFIPZ/README.md`.

## Outcome
Payne NFIP **claims** are already frozen (`20260910T091NFIPZ`, countyCode 40119, 100 claims). This task freezes a **dated NFIP policies-in-force** series for Payne County if a keyless OpenFEMA table exists. Policy stock, not claims, not FEMA declarations, not NOAA storms, not busy, not WTI.

Preferred keyless: OpenFEMA `NfipPolicies` v3 (or current documented name), server-side filter `countyCode eq '40119'` (Payne). Do **not** use FIPS 40109 (Oklahoma County). Do not scrape Drupal HTML. Reject deprecated v2 if it 404s. Do not copy the claims freeze.

Keep a policy date (as-of, effective, or reported year-month as filed) and a public count. Missing periods stay missing. Do not fill 0. Do not invent Cushing city from county totals — label Payne County if that is what the file contains.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091NFPPZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-nfip-policies.ts` and `app/tests/cushing-nfip-policies.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, NFIP claims files. Do not commit.

## Rules
- Label: Payne County NFIP policies, dated, not claims, not busy.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Fail-closed on filled periods / FIPS 40109 / relabeling claims as policies.
- Typecheck with `cd app && npm run typecheck`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "OpenFEMA NFIP Payne policies" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
