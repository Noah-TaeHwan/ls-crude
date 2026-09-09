# 091-FPATSI — Pipeline Apportionment & Tariff Stress

**Status:** PARK / E1 — individual FERC documents are public, but no complete,
machine-readable, dated operating-notice series was found for the frozen Cushing
pipeline universe.

This is a CFAM context track, not an oil-price signal and not a replacement for
physical Cushing activity observation. It asks a narrow question: does a named,
Cushing-linked pipeline operator publicly announce rationing, capacity allocation
or force majeure that can be collected as a reproducible dated series?

## Frozen scope

Only these operator families can enter the pilot:

| Canonical output name | Accepted label family |
| --- | --- |
| Plains Pipeline, L.P. | Plains Pipeline |
| Enbridge Pipelines | Enbridge Pipeline(s) |
| Enterprise Products | Enterprise Products Partners |

The collector retains dated documents only when their text includes an
apportionment, proration, capacity-allocation or force-majeure keyword. A future
source must also establish a plausible Cushing-linked route before it can be
called a CFAM observation. Generic corporate filings are excluded.

## Source-gate result — 2026-09-08

| Candidate | What is publicly accessible | Why it cannot start a panel |
| --- | --- | --- |
| [FERC eLibrary](https://www.ferc.gov/ferc-online/elibrary) | Public document search and individual Oil filings | It is a document library, not a documented real-time or historical operating-apportionment feed. Tariff/Form 6 filings do not establish a dated operating constraint. |
| [Public Plains Form 6 example](https://elibrary.ferc.gov/eLibrary/docinfo?accession_number=20260417-8019) | A public operator-specific Oil filing | The filing is a Form 6 report, not a Cushing route notice or an apportionment percentage. |
| Operator notice pages | No reproducible public archive located in this audit | No fixed URL / dated, complete history was demonstrated for the frozen operator set. |

No record was invented from a tariff, a press article, a price spread, a no-result
search, or an inaccessible shipper portal. The current output is intentionally a
header-only CSV: [data/fpatsi_daily.csv](data/fpatsi_daily.csv).

## Factor-local collector

`fpatsi.py` uses only the Python standard library and never assumes a source.

```powershell
python fpatsi.py
python fpatsi.py --input public_notice_export.json
python fpatsi.py --feed-url https://example.org/public-notices.rss
```

The local JSON/JSONL export must be a list of source records. Required fields are
`date`, `pipeline_name`, and a text field such as `title`, `description`,
`content`, `filing_text`, or `text`. `source_url` should be retained in the
source export / receipt even though it is not included in the derived CSV.

Output fields are exactly:

```text
date,pipeline_name,apportionment_pct,stress_score
```

`apportionment_pct` stays blank when a genuine notice names a constraint but does
not state a percentage. It is never imputed as `0`. `stress_score` is the maximum
confirmed event score observed during the preceding 30 calendar days; the script
does not emit zero rows for days with unknown source coverage.

## Reopen condition

Move from PARK only after all conditions below are met:

1. A stable public URL, RSS/Atom endpoint, or reproducible public export provides
   full-text notices for a fixed operator and Cushing-linked route.
2. Each record carries an explicit publication/effective date and source URL.
3. At least 60 monthly observations, or 90 daily/weekly observation opportunities,
   are available with documented coverage—not merely 60 files found by search.
4. A source receipt records collection timestamp, file hash and any scope gaps.
5. The raw notice is visually checked before the derived `fpatsi_daily.csv` is
   used with another CFAM track.

The 2026-09-08 no-source execution receipt is in
[receipts/20260908T090511Z-no-source-execution.json](receipts/20260908T090511Z-no-source-execution.json).
