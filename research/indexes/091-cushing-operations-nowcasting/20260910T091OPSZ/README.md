# 091-OPSZ — Cushing Regional monthly airport-operations hunt (2026-09-10)

**Verdict: FAIL-CLOSED, no freeze.** No keyless dated public table carries
monthly operations (itinerant / local / total) for Cushing Regional / KCUH
(FAA LID `CUH`). Dated monthly rows found: **0** (bar: ≥2). Nothing was
frozen, no reader, no test.

**Label:** Cushing Regional airport operations, monthly, not Jet-A, not busy.

## What was probed (all keyless, no login, no AirNav scrape)

| # | probe | result |
| --- | --- | --- |
| 1 | FAA OPSNET/ATADS Airport Ops form (guest) | loads keyless (HTTP 200, `guest=true`) |
| 2 | OPSNET facility universe: `CUH`, `KCUH`, `Cushing`, `CUS`, `CU` | empty / no Cushing row (controls `OKC`, `TUL` positive; non-towered `PNC` negative) |
| 3 | FAA TFMSC query pages (guest) | 302 to ASPM login landing — login-walled, not keyless |
| 4 | FAA 5010 master record for CUH | annual operations estimate only — not monthly by definition |
| 5 | Oklahoma ODAA airport tables | per-airport impact/construction/annual reports — no monthly ops table |

## Why this fails the freeze bar

- New comparable months for KCUH operations: **0** (bar: ≥2 dated months).
- OPSNET counts tower-reported operations; Cushing Regional is non-towered
  (CTAF 122.8, no ATCT), hence absent from the universe. Missing months stay
  missing — no 0-fill, no ops from based-aircraft, no AirNav scrape.
- Per contract: receipt only, outcome failed `no dated rows`.

## Pointers

- Raw + probe recipe: `research/gathering/raw/091-ops-monthly/README.md`
- Parked Jet-A n=4 (different metric, not operations):
  `research/indexes/091-cushing-operations-nowcasting/20260908T091OZ/`
- Jet-A fail-closed hunt: `research/indexes/091-cushing-operations-nowcasting/20260910T091JETAZ/`
- If a keyless monthly ops table for CUH ever appears (FAA or ODAA), re-run
  the hunt from the raw README's reproduce recipe.
