# 091-LODEZ — Payne County LODES annual workplace jobs, 2002..2023 (2026-09-10)

**What this is:** a frozen **annual time series** of Census LEHD LODES
workplace employment for **Payne County, Oklahoma (FIPS 40119)**: per year,
the sum of `C000` (total jobs) over workplace census blocks (`w_geocode`
starting `40119`) in the keyless `S000`/`JT00` WAC file. Community employment
structure only. Stillwater and OSU dominate this county; nothing here describes
Cushing city activity and nothing here is a busy signal.

**What this is not:** a Cushing-city series, a 0–100 score, a WTI overlay, a
QCEW copy, or a filled series. Missing years stay missing (none in this
window). The WAC files carry block geocodes only and no place code, so no
Cushing-city attribution comes from the same files and none is attempted.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T23:40:03Z |
| Source | `https://lehd.ces.census.gov/data/lodes/LODES8/ok/wac/ok_wac_S000_JT00_{year}.csv.gz` (no key, User-Agent `ls-crude-observations/1.0`) |
| Segment / type / column | `S000` all jobs / `JT00` all jobs / `C000` total jobs by workplace block |
| Range | 2002..2023, 22 annual rows, no gaps |
| Trailing probe | 2024 → HTTP 404, stop, no invented points |
| Raw | 22 CSV.GZ under `research/gathering/raw/091-lodes-annual/` (gitignored) |
| Disclosed jobs sum | **713340** (see `receipt.json`) |
| Last year (2023) | **35589** jobs over 701 blocks |
| 2022 cross-note | WAC `C000` sum 33401 vs 091-I OD workplace sum 32543 — different filed tables, both kept as published |
| Block dip | 2011 shows 591 blocks (neighbors 730 / 650); disclosed as published, not smoothed |

The reader is `app/app/lib/cushing-lodes.ts`; it fails closed on
swapped years, filled zeros, last-value copies, a Cushing-city relabel, or a
QCEW total copy.
