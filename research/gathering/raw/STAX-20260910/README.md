# STAX probe 2026-09-10 — Cushing city sales-tax distributions (OTC)

Keyless official source: Oklahoma Tax Commission, Sales & Use Tax news releases.
Per-city Cushing rows come from the monthly STS PDFs only. STU (use tax),
lodging/hotel tax, county and statewide totals were read for identity checks
and are NOT frozen as city sales tax.

## Sources (retrieved 2026-09-10 UTC, keyless HTTPS)

- STS-Current.pdf = Sales Tax News Release **September 2026**
  (text layer). SHA-256
  `000c192d0818982bb9c49443920a61c464c1aa30f9a338e8f536d06dc2eefb97`
- STS-Past1.pdf = Sales Tax News Release **August 2026**
  (image-only scan, `Microsoft: Print To PDF`, no fonts per pdffonts).
  SHA-256 `b56fa4e6a5db006f97f876bdcf18cc5dcb0143c9032b131b4d58be92108b4a5f`
- newsroom-current.html = September 2026 Sales & Use Tax page
  (`/tax/newsroom/2021/current-sales-use.html`), statewide totals.
- newsroom-past.html = August 2026 Sales & Use Tax page
  (`/tax/newsroom/2021/past-sales-use.html`), statewide totals.

OTC keeps only Current + Past1 online (`STS-Past2.pdf` and later 404), so
older distribution months are missing and stay missing. No fill.

## Column semantics (printed header)

`City | Tax Rate | <release month> Revenue | Tax Rate | <same month prior year> Revenue`.
Periods below are distribution months. OTC notes the September 9, 2026
distribution primarily represents July business (large filers Jul 16–31 plus
Aug 1–15 estimates); August 10, 2026 primarily June business. The business-month
lag is documented, not relabeled: `period` stays the printed distribution month.

## Cushing rows (verbatim)

- STS-Current.txt (pdftotext): `CUSHING 0.04 $577,814.84 0.04 $582,044.72`
  → 2026-09 $577,814.84 ; 2025-09 $582,044.72
- August page OCR (`ocr-04.txt`, tesseract 5.5.3 `--psm 6` on 300 dpi render):
  `CUSHING 0.04 $573,695.50 0.04 $558,762.94`
  → 2026-08 $573,695.50 ; 2025-08 $558,762.94

## OCR trust checks (all passed)

1. Same-pipeline OCR of the September Cushing page reproduced the text-layer
   row character-for-character (`$577,814.84` / `$582,044.72`).
2. August OCR totals match the newsroom HTML: city sales `$217,934,853.18`
   vs `$217,934,853`; prior-year `$215,486,166.08` vs `$215,486,166`; county
   `$39,959,759.56` vs `$39,959,760`.
3. September text-layer totals match its newsroom page: `$223,728,674.31`
   vs `$223,728,674`; prior `$212,030,286.11` vs `$212,030,286`.

## Not this

Not use tax (STU-*.pdf untouched), not lodging/hotel tax (Bristow lodging
rate note ignored), not Payne County, not statewide totals, not busy, not WTI.
Rate 0.04 printed for Cushing in all four cells (no rate change).
