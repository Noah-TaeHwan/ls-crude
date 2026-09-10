# opencode worker — Cushing city sales-tax receipts monthly

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md`. Hotel/motel tax pilots that failed their own tests stay **out** of this dash. This task is **city sales-tax collections** if a keyless dated public table exists.

## Outcome
Freeze a **monthly (or quarterly) sales-tax collection** series for Cushing city, Oklahoma from a keyless official table. Local fiscal trace, not busy, not WTI, not the failed hotel-tax sample.

Preferred keyless:
1. Oklahoma Tax Commission public allocations / city sales tax distributions for Cushing.
2. Cushing city published monthly financials with a dated sales-tax line.

Keep `period`, `sales_tax_usd` (or the unit printed). Missing periods stay missing. Do not fill 0. Do not substitute county-wide or statewide totals as city. Do not relabel hotel tax as sales tax.

If fewer than 2 dated points, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091STAXZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-sales-tax.ts` and `app/tests/cushing-sales-tax.test.mjs` only if ≥2 dated points

Do not edit observation UI, board JSON, PROGRAM.md, housing, EIA, QCEW. Do not commit.

## Rules
- Label: Cushing city sales tax, dated collections, not hotel tax, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled periods / geography swap.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing sales tax" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
