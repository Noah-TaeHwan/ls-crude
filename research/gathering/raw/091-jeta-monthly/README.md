# 091-JETA monthly raw — Cushing City Manager Reports (2026) + Jan 2026 packet

- **retrieved_at:** 2026-09-10 Asia/Seoul (keyless public HTTP, no login)
- **purpose:** hunt for a monthly Jet-A (and AvGas) fuel-sales series for Cushing
  Regional / KCUH longer than the parked 091-O n=4 (2023-05-15, 2023-06-20,
  2023-07-17, 2023-09-18 report-date points, no verified metric period).
- **extraction method:** `pypdf` text extraction + keyword grep
  (`Jet`, `AvGas`, `AVGAS`, `gallon`, `Airport Monthly`, `AIRPORT`,
  `Survival Flight`, `based aircraft`). Numbers below were checked against the
  extracted text, not inferred.
- **finding:** the 2026 City Manager Reports are 3–4 page narrative project
  updates with NO airport fuel section (0 hits on every fuel keyword in all 7).
  The Jan 2026 packet has 1 `AVGAS` hit = an "AVGAS DISPENSER REPAIR" payables
  line, 0 `Jet`, 0 `gallon` — not fuel sales. No new dated Jet-A rows.

## Portal discovery (all keyless)

- Meeting portal: `http://public.destinyhosted.com/agenda_publish.cfm?id=28744`
  (linked from cityofcushing.com footer "Meeting Agendas and Minutes").
- `adv_search_results.cfm` text search `City Manager Report` (2026) → 7 items,
  BOC Feb–Aug 2026 (agenda-item seqs 31, 83, 122, 166, 225, 255, 278).
- Attachment URLs follow
  `/cushidocs/2026/BOC/<meeting>_<seq>/<seq>_Commission_Managers_Report_<Month>.pdf`.

| local file | meeting / report | source URL (public.destinyhosted.com) | bytes | SHA-256 | fuel-keyword hits |
| --- | --- | --- | ---: | --- | --- |
| `cm_report_2026_31.pdf` | BOC 2026-02-17, February 2026 | `/cushidocs/2026/BOC/20260217_1/31_Commission_Managers_Report_February.pdf` | 246,108 | `7b2ee6b25ee9438236271d3af9e509989959386667d714478b63710e658a0ec8` | 0 |
| `cm_report_2026_83.pdf` | BOC 2026-03-16, March 2026 | `/cushidocs/2026/BOC/20260316_6/83_Commission_Managers_Report_March_2026.pdf` | 764,460 | `7b442e9eeb4a6a95771f9c24aa571aca077e87e79d35a8b412a3377e4a010442` | 0 |
| `cm_report_2026_122.pdf` | BOC 2026-04-20, April 2026 | `/cushidocs/2026/BOC/20260420_12/122_Commission_Managers_Report_April_2026.pdf` | 496,329 | `b77059fe2d0cc1ffb0c4bb17c4e51f6e296edc2280cfaec1e59e5682c09f3229` | 0 |
| `cm_report_2026_166.pdf` | BOC 2026-05-18, May 2026 | `/cushidocs/2026/BOC/20260518_18/166_Commission_Managers_Report_May_2026_%28003%29.pdf` | 2,763,675 | `22085b586cbcff0bd47ec480246e31af138d46f31ca0ff8720969a7c2e2a58e0` | 0 |
| `cm_report_2026_225.pdf` | BOC 2026-06-15, June 2026 | `/cushidocs/2026/BOC/20260615_27/225_Commission_Managers_Report_June_2026.pdf` | 426,242 | `931bfb5398297c33bbe8bf5ab417108ea13d684a7d4c44a5811ced5033254f0c` | 0 |
| `cm_report_2026_255.pdf` | BOC 2026-07-20, July 2026 | `/cushidocs/2026/BOC/20260720_33/255_Commission_Managers_Report_July_2026.pdf` | 1,069,128 | `a40d42da8ae4383248e25d98f94d811db14434c0c97067532853211ea61696e1` | 0 |
| `cm_report_2026_278.pdf` | BOC 2026-08-17, August 2026 | `/cushidocs/2026/BOC/20260817_40/278_Commission%20Managers%20Report%20August%202026.pdf` | 206,366 | `1882eea6a374988befde0fb67bac6fc58812c5622eb5d0b204223d26b3b11edf` | 0 |

Plus (deleted after hashing to keep the checkout lean; reproducible via URL):

| local file (removed) | meeting | source URL | bytes | SHA-256 | finding |
| --- | --- | --- | ---: | --- | --- |
| `packet_2026_0120.pdf` | BOC 2026-01-20 packet, 241 pp | `https://www.cityofcushing.com/AgendaCenter/ViewFile/Agenda/_01202026-29?packet=true` | 32,067,493 | `917d1cc256d48eef8a71c1a62dd92e192275e0ce731f1edefa334e27cd7bf2d2` | 35 `AIRPORT`, 1 `AVGAS` (dispenser-repair payable), 0 `Jet`, 0 `gallon` — no fuel-sales table |

## Negative probes (no new files)

- AgendaCenter (`cityofcushing.com/AgendaCenter`) full-archive text search:
  `Airport` matches only the Jan 2026 packet above; `City Manager Report`
  matches only Jan 2026 meetings. All 19 2025 meeting materials contain no
  airport fuel-sales item.
- `site:cityofcushing.com cm_report` web search: only the four parked 2023
  reports (May/Jun/Jul/Sep 2023); no Aug/Oct/Nov/Dec 2023 or 2024 report files
  indexed; direct URL guesses for those months 404.
- Wayback CDX of the 2023 agendas dir: no additional `cm_report*` captures.
- Portal `Airport` text search (2026): only leases, budget amendments, grants,
  invoices — no monthly fuel-sales item.
- FAA/ODAA: no keyless per-airport monthly fuel-sales table exists (5010/GCR =
  facilities, not sales; ODAA reports are not monthly fuel). Not scraped,
  not applicable.

Original PDFs on disk are intentionally ignored by Git (see root `.gitignore`
`research/gathering/raw/**`); this README is the kept pointer. No passenger,
pilot, employee, or individual aircraft data.
