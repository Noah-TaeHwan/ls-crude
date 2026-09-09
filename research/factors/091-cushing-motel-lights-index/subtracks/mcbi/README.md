# 091-X / MCBI — CME WTT Midland Differential Receipt

## Decision

**SOURCE-PASS / SERIES-PARK.** The public CME Energy Futures Products daily
bulletin exposes the listed `WTT` futures settlement. It is a real, public,
reproducible market observation—but it is **not** a free Midland cash-price
history, and it is not automatically an EIA Cushing spot match.

`WTT = WTI Midland (Argus) vs. WTI Trade Month futures.` The stored number is
the CME-listed differential quoted in the bulletin. It must never be relabelled
as either `WTI Midland spot` or `Midland − Cushing spot`.

This subtrack preserves the one valid free leg without fabricating the missing
one. It replaces neither [091-X's existing source gate](../../../indexes/091-cushing-operations-nowcasting/20260908T091XZ/README.md)
nor its **PARK / E1** status for a true Midland-to-Cushing spot basis.

## What is collected

`collect_mcbi.py` downloads CME's public current Section 61 bulletin, extracts
only its `WTT FUT` table, and stores:

| File | Contents |
| --- | --- |
| [`results/wtt_daily_observations.csv`](results/wtt_daily_observations.csv) | Bulletin date, contract month, displayed WTT settlement, source URL and the hash of the retrieved source representation. |
| [`results/latest_receipt.json`](results/latest_receipt.json) | Retrieval timestamp, source byte count/hash, whether the input was an official PDF or an official-PDF text extraction, parser status and row count. |
| [`raw/current_wtt_excerpt.txt`](raw/current_wtt_excerpt.txt) | Small, human-auditable WTT table excerpt; no copied full CME bulletin. |

The script only appends/deduplicates by `(bulletin_date, contract_month)`. It
does not calculate a 14/30-day z-score, an MCBI level, a WTI forecast, or a
CFAM busy-ness score.

## Initial real sample — 2026-09-04 bulletin

The current official PDF exposed a 2026-09-04 preliminary bulletin. Its first
three retained WTT rows are below. These are **settled WTT differentials**, not
cash Midland prices.

| Bulletin date | Contract | Displayed WTT settlement ($/bbl differential) |
| --- | --- | ---: |
| 2026-09-04 | OCT26 | 1.23 |
| 2026-09-04 | NOV26 | 0.96 |
| 2026-09-04 | DEC26 | 0.88 |

The direct programmatic binary-PDF request received CME HTTP 403; that outcome
is retained in [`results/direct_pdf_attempt_2026-09-08.json`](results/direct_pdf_attempt_2026-09-08.json).
The official document viewer's text extraction was then retained as a clearly
labelled `official_pdf_text_extract` input, with its own content hash. This is
a source-access receipt—not a claim of a downloadable historical database.

## Why that boundary matters

| Candidate | Status | Reason |
| --- | --- | --- |
| `WTT settlement` | **collect forward-only** | CME publishes a WTI Midland (Argus) differential to its WTI Trade Month future. |
| `Midland spot − EIA RWTC` | **do not calculate** | Requires matched physical definitions, timestamps and a legitimate long Midland spot history. WTT alone is not that series. |
| `Brent − RWTC` replacement | **forbidden** | It measures export/global benchmark conditions, not the Midland-to-Cushing pipeline corridor. |
| WTT → “pipeline pumping stress” | **unproven** | A price differential can reflect quality, delivery month, liquidity, hedge flow and physical capacity; it does not measure terminal activity on its own. |

## Frozen next gate

The WTT stream becomes testable only after all of these conditions hold:

1. At least 90 valid daily bulletins are collected with a fixed, documented
   front-contract/roll selection rule.
2. CME contract convention, units, sign and publication-time treatment are
   preserved with each observation.
3. A source-authorized, reproducible Midland physical assessment or truly
   matched CME/Cushing price construction is available; a substitute benchmark
   is not acceptable.
4. The combined measure is first checked against a physical target available
   after the signal, such as subsequent official EIA Cushing stock change.
5. It remains a **market-context confirmation** outside the CFAM local activity
   score unless it independently passes that validation.

## Run

```powershell
python research/factors/091-cushing-motel-lights-index/subtracks/mcbi/collect_mcbi.py
```

For an archived CME bulletin already obtained through a legitimate source:

```powershell
python research/factors/091-cushing-motel-lights-index/subtracks/mcbi/collect_mcbi.py --pdf-file path/to/Section61.pdf
```

For a retained text extraction from the same official PDF (useful if CME blocks
automated binary downloads), use `--text-file`; the receipt is explicitly marked
`official_pdf_text_extract`, not as a copied PDF checksum.

The stdout is deliberately only a compact JSON status and parsed-row count.

## Primary source

- [CME Daily Bulletin — Section 61, Energy Futures Products](https://www.cmegroup.com/daily_bulletin/current/Section61_Energy_Futures_Products.pdf)
- [CME WTI-linked product context](https://www.cmegroup.com/media-room/press-releases/2023/5/23/open_interest_acrosswti-linkedfuturessurpasses500000asglobalsign.html)
