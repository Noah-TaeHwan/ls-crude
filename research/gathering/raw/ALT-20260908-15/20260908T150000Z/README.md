# ALT-20260908-15 — Cushing Municipal Airport monthly-report receipt

- **retrieved_at:** 2026-09-08 15:00:00 Asia/Seoul
- **purpose:** public, read-only acquisition of four official City Manager Reports for CFAM 091-O.
- **extraction method:** `pypdf` text extraction; numerical values below were visually/source-text checked against the Airport section. The reports label them “Monthly report,” but do not explicitly state the start/end date for every individual metric, so the report date—not an inferred observation month—is retained.

| local file | report date | source URL | bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| `cm_report_may_23_final_copy.pdf` | 2023-05-15 | `https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_may_23_final_copy.pdf` | 518,119 | `a4cd79c49ba567ed1c11deec6d411bb749bc6a60c3bb838f3ab1134c27ae8c2f` |
| `cm_report_june_23_final.pdf` | 2023-06-20 | `https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_june_23_final_.pdf` | 1,139,660 | `70032db37c9af951b0a69ea0646a564379542d7a9feab8e392fa9c781586713b` |
| `cm_report_july_23_final.pdf` | 2023-07-17 | `https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_july_23_final.pdf` | 891,528 | `035773091152dc6515e8439f91f3b7d43a03a0c9f31057eea4ed55a48179bb65` |
| `cm_report_september_23_final.pdf` | 2023-09-18 | `https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cm_report_september_23_final_.pdf` | 1,216,017 | `c9813bae45a6b546ded76454d0ab9fdf90b0e55f8629e5fa1cded7b732cbaa99` |

| report date | transient overnight ramp stays / hangar rentals | Survival Flight operations supported | Jet-A gallons | AvGas gallons | based aircraft |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2023-05-15 | 11 | 36 | 3,600 | 3,200 | 31 |
| 2023-06-20 | 7 | 38 | 4,800 | 4,700 | 31 |
| 2023-07-17 | 6 | 41 | 4,400 | 4,500 | 31 |
| 2023-09-18 | 4 | 48 | 5,300 | 3,600 | 31 |

Original PDFs are intentionally ignored by Git; this receipt preserves source URLs, sizes and hashes. It contains no passenger, pilot, employee, or individual aircraft data.
