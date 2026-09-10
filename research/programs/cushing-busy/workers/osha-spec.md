# opencode worker — OSHA inspections/violations in Cushing or Payne County

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`.

## Outcome
Freeze a **dated OSHA inspection or violation-count** series for Cushing city or Payne County from a keyless public table if one exists. Workplace-safety log, not busy, not WTI, not QCEW employment.

Preferred keyless: OSHA / DOL enforcement open data (data.osha.gov, enforcedata.dol.gov, or data.transportation-class government CSV/JSON) filterable to OK + Cushing or Payne without a key.

Keep inspection/open date (or year) and a public count/penalty field if disclosed. Missing years stay missing. Do not fill 0. Do not invent Cushing from statewide OK.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091OSHAZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-osha.ts` and `app/tests/cushing-osha.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, NHTSA/FRA/PHMSA files. Do not commit.

## Rules
- Label: Cushing/Payne OSHA inspections, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled years / statewide relabel.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "OSHA Cushing inspections" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
