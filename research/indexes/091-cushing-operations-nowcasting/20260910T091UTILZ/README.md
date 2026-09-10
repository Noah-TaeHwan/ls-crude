# 091-UTILZ — Cushing city monthly water/electric volume hunt (2026-09-09)

**Verdict: FAIL-CLOSED, no freeze.** No dated monthly municipal water-pumped
(gallons/MG) or electric (kWh/MWh) volume rows exist on any keyless public
surface probed. Nothing was frozen, no reader, no test.

**Label:** Cushing city water or electric volumes, dated, not busy.

## What was probed (all keyless, no login)

| # | probe | result |
| --- | --- | --- |
| 1 | All 7 2026 City Manager Reports, `pdftotext` + water/electric grep | 0 volume numbers — project narratives only |
| 2 | BOC 2026-01-20 packet, 241 pp (SHA-256 `917d1cc2…`, matches 091-JETAZ) | fund dollars only; 0 `kwh`, 0 `mwh` in ~1.02 M chars |
| 3 | Destiny portal 2026 text search `water` (8) / `electric` (5) / `gallon` (1) | purchases, studies, specs — no volume table |
| 4 | 2023-format `cm_report_*_23` static PDFs | dead URLs; Wayback offline → unverifiable, not used |
| 5 | EIA-861M 2026 monthly sales file (737,659 bytes, SHA-256 `4eea25b5…`) | state×sector aggregates; **zero `cushing` strings** |
| 6 | OWRB water-use program | annual reporting only, no keyless monthly table |
| 7 | OCC electric/water jurisdiction | not applicable (oil/gas only; munis outside) |

## Why this fails the freeze bar

- New dated monthly volume rows: **0** (bar: ≥2 dated local rows).
- No 0-fill, no copying the parked 091-O Jet-A four points, no OCR-guessed rows
  (no image-PDF row had a text-layer sibling month to reproduce it — there was
  no candidate row at all).
- Annual-only alternatives (EIA-861 annual, OWRB annual, ACFR dollar revenues)
  are documented as pointers in the raw README, not frozen under a monthly
  label.

## Pointers

- Raw + hashes: `research/gathering/raw/091-util-monthly/README.md`
- If monthly water-pumped or kWh tables surface (city departmental reports,
  published DEQ MORs, or a per-muni monthly EIA product), re-run from the raw
  README's probe recipe.

| Field | Value |
| --- | --- |
| Run | `20260910T091UTILZ` |
| Geography | Cushing city, Oklahoma (municipal utility throughput) |
| Verdict | `no dated rows` — receipt only |
| CSV / JSON | none (nothing dated to freeze) |
| TS reader / test | none (`app/app/lib/cushing-utility.ts`, `app/tests/cushing-utility.test.mjs` intentionally absent) |
| Checksum | none (no disclosed gallons or kWh) |

**Not this:** not busy, not WTI, not sales tax, not Jet-A, not tank throughput,
not county/state aggregates.
