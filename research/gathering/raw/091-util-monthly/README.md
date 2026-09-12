# 091-UTIL monthly raw — Cushing municipal water/electric volume hunt (2026-09-09)

- **retrieved_at:** 2026-09-09T19:40–19:47Z (keyless public HTTP, no login)
- **purpose:** hunt for dated monthly municipal **water-pumped (gallons/MG)** or
  **electric (kWh/MWh)** volumes for Cushing city — utility throughput, not busy,
  not WTI, not sales tax, not Jet-A.
- **extraction method:** `pdftotext -layout` text extraction + keyword grep
  (`water|gallon|MGD|million|electric|kWh|kwh|MWh|mwh|pump|sewer|utility|meter|
  consumption|usage|produced|treated`). Numbers below were checked against the
  extracted text, not inferred.
- **finding:** 0 dated monthly volume rows on every keyless surface probed.
  Verdict: fail-closed, no freeze.

## Probe log (all keyless, no login, no scraping of gated systems)

| # | probe | evidence on disk / pointer | result |
| --- | --- | --- | --- |
| 1 | All 7 2026 City Manager Reports re-extracted (`pdftotext`), water/electric grep | source PDFs in `research/gathering/raw/091-jeta-monthly/` (hashes there); 3.7–5.7 KB text each | **0 volume numbers** — project narratives only (waterline upgrades, AMI meters, lineworker school, "electricity demand has been very high" with no MWh) |
| 2 | BOC 2026-01-20 packet, 241 pp, re-downloaded | `packet_2026_0120.pdf`, 32,067,493 bytes, SHA-256 `917d1cc256d48eef8a71c1a62dd92e192275e0ce731f1edefa334e27cd7bf2d2` (matches 091-JETAZ hash; deleted after hashing, reproducible via URL below) | fund dollars only (CMA Operating/Meter-Deposit funds); **0 `kwh`, 0 `mwh`** in 1,023,490 chars of text; "non-pay utility report" = delinquency, not volumes |
| 3 | Destiny portal agenda-text search `water` / `electric` / `gallon` (2026, `form_type=AG_MEMO`) | `portal2_water.html` (8 records), `portal2_electric.html` (5), `portal2_gallon.html` (1) in this folder | valves, water-model study, digger-derrick/transformer/AMI purchases, fire-truck 3,000-gallon tank spec — **no monthly volume table** |
| 4 | 2023-format `cm_report_*_23_*.pdf` static URLs (the parked 091-O era) | `curl` returns ~71 KB HTML error pages, not PDFs | dead after CivicPlus migration; Wayback CDX offline at probe time → **unverifiable, not used** (fail-closed rule; parked 091-O airport numbers NOT copied) |
| 5 | EIA Form 861M monthly sales file 2026 (`sales_ult_cust_2026.xlsx`) | 737,659 bytes, SHA-256 `4eea25b5f020bc5a653c2cefa4f8b73ce6d6f8bf0478e4561bfb6c38bec37062`; EIA's own page: monthly = **state×sector aggregates**, sample-based | sharedStrings contain **zero `cushing`** hits — no per-muni monthly kWh exists in the keyless monthly product |
| 6 | OWRB water-use reporting program | oklahoma.gov/owrb + USGS SIR2009-5212 | reporting is **annual** (forms mailed each January, acre-feet/gallons per year); permit-level monthly detail lives in OWRB's internal DB, no keyless monthly table |
| 7 | OCC electric/water jurisdiction | 091-OCCZ precedent | OCC covers oil/gas; municipal electric/water are outside OCC public monthly tables — not applicable |

## Source URLs (reproducible)

- Portal: `http://public.destinyhosted.com/agenda_publish.cfm?id=28744` (POST
  `adv_search_results.cfm?fp=ADVSRCH&id=28744` with `sstr=<term>`,
  `form_type=AG_MEMO`, `mt=ALL`, month range ALL, year 2026)
- Jan 2026 packet: `https://www.cityofcushing.com/AgendaCenter/ViewFile/Agenda/_01202026-29?packet=true`
- EIA 861M: `https://www.eia.gov/electricity/data/eia861m/` →
  `xls/sales_ult_cust_2026.xlsx`
- Dead 2023 static dir: `https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_may_23_final_copy.pdf` (+ jun/jul/sep variants)

## Pointers for a future worker

- If the city republishes 2023-format departmental reports (or pre-2023 PDFs
  surface with a Water/Electric section carrying monthly pumped gallons or kWh),
  re-run from probes 1–4; a text-layer sibling month must reproduce any row
  before an image-PDF row is trusted.
- Annual-only alternatives (NOT monthly, do not freeze under a monthly label):
  EIA-861 annual utility file (Cushing muni MWh sold), OWRB annual water-use
  county rollups, city ACFR/budget water-sewer-electric revenues (dollars, not
  volumes).
- No passenger, pilot, employee, or individual-customer meter data was sought.

Raw PDFs/xlsx on disk are intentionally ignored by Git (see root `.gitignore`
`research/gathering/raw/**`); this README + the three portal HTML files are the
kept pointers.
