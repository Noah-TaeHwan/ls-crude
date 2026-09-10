# opencode worker — Cushing city Census population annual time series

Read first: `research/programs/cushing-busy/loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze an **annual city population** time series for **Cushing city, Oklahoma** from Census Population Estimates (PEP) public CSVs. Community size, not weekly busy, not WTI, not Payne County.

Primary (keyless):
`https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/cities/totals/sub-est2024_40.csv`

Keep rows where `STNAME` is Oklahoma and `NAME` is exactly `Cushing city` (or the equivalent place name the file actually uses — do not grab Cushing townships elsewhere). Use the annual estimate columns the file discloses (`POPESTIMATE2020` … `POPESTIMATE2024` or vintage equivalent).

If a 2010–2019 Oklahoma subcounty file is also keyless on www2.census.gov, append those years **without overlapping 2020 twice**. Do not splice ACS 5-year into PEP. Missing years stay missing.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091POPZ/` (README, receipt.json, csv, json)
- `app/app/lib/cushing-population.ts`
- `app/tests/cushing-population.test.mjs`

Do not edit observation UI, board JSON, PROGRAM.md, enrollment, kush, QCEW, or KCUH files.

## Rules
- Label: Cushing city Census population, annual, not field activity.
- Save raw under `research/gathering/raw/` (gitignored).
- Korean JSDoc. Checksum = sum of disclosed annual estimates.
- Fail-closed: filling a missing year with 0, swapping cities, relabel as busy → null.
- Tests: n + last year/value + checksum + fail-closed.
- Acceptance: `cd app && node --test tests/cushing-population.test.mjs` passes.
- If the CSV has no Cushing city row, receipt + outcome failed `no dated rows`.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing city population series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
