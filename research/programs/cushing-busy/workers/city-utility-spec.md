# opencode worker — Cushing city water or electric monthly utility volumes

Read first: `loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then `20260910T091STAXZ/README.md` then `20260910T091JETAZ/README.md`.

## Outcome
Sales-tax months and Jet-A are already handled. This task freezes **dated municipal water-pumped or electric-kWh** monthly volumes for Cushing city from public city-manager / utility reports if a keyless table exists. Utility throughput, not busy, not WTI, not sales tax, not Jet-A.

Preferred keyless: city of Cushing monthly/annual reports, OCC public utility filings, or other no-login PDFs/HTML with numeric volumes and a period.

Keep period (year-month) and a public volume field. Missing months stay missing. Do not fill 0. Do not copy the parked 091-O Jet-A four points. Do not OCR-trust image PDFs unless a text-layer sibling month reproduces the same row.

If fewer than 2 dated local rows, fail closed: receipt only, outcome failed `no dated rows`.

## Own these files only
- `research/indexes/091-cushing-operations-nowcasting/20260910T091UTILZ/` (README, receipt, csv/json if series)
- `app/app/lib/cushing-utility.ts` and `app/tests/cushing-utility.test.mjs` only if ≥2 dated rows

Do not edit observation UI, board JSON, PROGRAM.md, sales-tax/Jet-A files. Do not commit.

## Rules
- Label: Cushing city water or electric volumes, dated, not busy.
- Save raw under `research/gathering/raw/`.
- Korean JSDoc. Fail-closed on filled months / guessed OCR.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "Cushing city utility volumes" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
