# 091-JETAZ — Cushing Regional monthly Jet-A hunt (2026-09-10)

**Verdict: FAIL-CLOSED, no freeze.** The only dated numeric Jet-A for KCUH is
still the parked 091-O n=4 (report dates 2023-05-15, 2023-06-20, 2023-07-17,
2023-09-18 — report dates, not verified metric periods). No longer comparable
series exists in keyless public sources. Nothing was frozen, no reader, no test.

**Label:** Cushing Regional Jet-A gallons, monthly, not busy, not WTI.

## What was probed (all keyless, no login, no AirNav)

| # | probe | result |
| --- | --- | --- |
| 1 | Destiny meeting portal (`agenda_publish.cfm?id=28744`) text search `City Manager Report` | 7 monthly reports, BOC Feb–Aug 2026 |
| 2 | All 7 reports downloaded, `pypdf` text-extracted, fuel-keyword grep | **0 fuel rows** — 2026 format is a 3–4 pp narrative with no airport fuel section |
| 3 | Jan 2026 BOC packet (241 pp, AgendaCenter) | 1 `AVGAS` = dispenser-repair payable line; 0 `Jet`, 0 `gallon` — no sales table |
| 4 | AgendaCenter full-archive search `Airport` / `City Manager Report` (all 2025 + Jan 2026) | only the Jan 2026 packet matches; no 2025 fuel-sales item |
| 5 | `site:cityofcushing.com cm_report` + direct-URL probes + Wayback CDX | only the 4 parked 2023 reports; no Aug/Oct/Nov/Dec 2023 or 2024 files |
| 6 | Portal `Airport` search (2026 agenda items) | leases, budgets, grants, invoices only — no monthly sales item |
| 7 | FAA / ODAA keyless tables | no per-airport monthly fuel-sales product exists (5010 = facilities) |

## Why this fails the freeze bar

- New comparable months beyond 091-O: **0** (bar: ≥2 new months or ≥8 total).
- The 2023-format airport section (Jet-A/AvGas gallons with a "Monthly report"
  label but no per-metric period) died with the report-format change; the
  Ochsner-era reports carry no airport numbers at all.
- Per contract: no copying 091-O into a new freeze as if it were new, no
  0-fill, no gallons from based-aircraft counts (31 static in 091-O anyway).

## Pointers

- Raw + hashes: `research/gathering/raw/091-jeta-monthly/README.md`
- Parked n=4: `research/indexes/091-cushing-operations-nowcasting/20260908T091OZ/`
  and `research/gathering/raw/ALT-20260908-15/20260908T150000Z/README.md`
- If the city ever republishes monthly airport fuel numbers (or pre-2023-format
  reports surface), re-run this hunt from the raw README's portal recipe.
