# Raw probe notes — FHWA NBI 2026-09-10 (091-NBI-Z)

## Source (keyless, no login)
- `https://www.fhwa.dot.gov/bridge/nbi/2024/OK24.txt` — HTTP 200,
  `content-length: 10243899`, `content-type: text/plain`.
  Saved here as `OK24.txt` (gitignored).
- Record layout: `https://www.fhwa.dot.gov/bridge/nbi/format.cfm`
  (445 chars; Item 1 state 1-3, Item 8 structure 4-18, Item 3 county 30-32,
  Item 4 place 33-37, Items 58-62 ratings 259-263, Item 90 inspection MMYY
  287-290, Item 91 frequency 291-292).
- No interactive maps scraped. No login. No statewide relabel.

## Probe results
- 22,917 Oklahoma rows, all 445 chars, all record type `1`.
- County `119` (Payne): 384 rows, 384 unique structure numbers.
- Place codes in Payne: `00000` × 336, `02300` × 42 (Stillwater),
  `02710` × 4, `00615` × 1, `00950` × 1. **No `18850` (Cushing) rows
  statewide** → freeze labeled Payne County per task rule.
- `CUSHING` in location text: 2 rows (`311900000000000`,
  `311910000000000`, `3E of CUSHING`), kept inside county set.
- Inspection MMYY: zero empty; 0923 × 123 / 0723 × 121 / 0124 × 74 /
  0223 × 27 / 0322 × 11 / 0522 × 10 / 0323 × 7 / 0622 × 5 / 0623 × 3 /
  1123 × 2 / 0422 × 1.
- Lat sample `36032834` / lon `097092651` (Payne County area, as filed).
- Frozen: `research/indexes/091-cushing-operations-nowcasting/20260910T091NBIZ/`.
