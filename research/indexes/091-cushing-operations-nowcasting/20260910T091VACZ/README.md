# 091-VACZ — ZIP 74023 HUD USPS vacancy hunt (2026-09-09)

**Verdict: FAIL-CLOSED, no freeze.** No keyless HUDUSER USPS file carries
dated ZIP 74023 vacancy or total-address counts. Nothing was frozen, no
reader, no test.

**Label:** ZIP 74023 HUD USPS vacancy, dated, not busy.

## Why this fails the freeze bar

- The HUD Aggregated USPS Administrative Data on Address Vacancies is
  restricted by the HUD–USPS agreement to registered governmental and
  nonprofit users (`huduser.gov/apps/public/usps/login`); the public product
  is tract-level, not ZIP-level. No key, no registration, no paid USPS
  Occupancy Trends product were used, per contract.
- The keyless HUD-USPS crosswalk files carry only allocation ratios
  (`RES_RATIO`/`BUS_RATIO`/`OTH_RATIO`/`TOT_RATIO`), never vacancy or
  total-address counts as filed. Ratios are not counts.
- SOCDS has no vacancy series (only permits are actively updated; permits are
  out of scope). Third-party 74023 vacancy snapshots (repit 15.8%,
  ACS-derived 18.77%) are not HUD USPS and not dated series — rejected, not
  copied.
- New dated local rows: **0** (bar: ≥2 dated local rows). No 0-fill, no
  county-HU / city-POP copies, no tract-to-ZIP invention.

## Pointers

- Raw probe recipe + quoted restriction evidence:
  `research/gathering/raw/091-hud-usps-74023/README.md`
- If a keyless HUDUSER USPS ZIP vacancy file surfaces (or registered access
  is approved through proper channels), re-run from the raw README's probe
  recipe and freeze ≥2 dated 74023 rows before writing
  `app/app/lib/cushing-usps-vacancy.ts`.

| Field | Value |
| --- | --- |
| Run | `20260910T091VACZ` |
| Retrieved | 2026-09-09T21:05:00Z |
| Geography | ZIP 74023 (Cushing, OK) |
| Dated local rows | 0 |
