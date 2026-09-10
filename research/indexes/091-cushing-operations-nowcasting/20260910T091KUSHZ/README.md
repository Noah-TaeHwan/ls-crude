# 091-KUSH-Z — KUSH monthly operational-attention series, 2008-02..2026-06 (2026-09-10)

**What this is:** a frozen **monthly time series** of KUSH Radio 1600 AM
local operational *attention*. Each point counts public post titles that
contain `Cushing` and one fixed operational word (for example `pipeline`,
`truck`, `fuel`, `power outage`, or `construction`). **Zero is an observed
count of matching titles that month, not a missing month.** Zeros stay.

**What this is not:** a busy score, a worker/truck/footfall count, a WTI
overlay, or refinery activity. A rise can reflect reporting practice, an
outage, local politics, or a headline cycle. Never relabel as busy.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-08T05:15:51Z (source snapshot; frozen here 2026-09-10) |
| Source | `https://www.1600kush.com/wp-json/wp/v2/posts` public metadata, titles only |
| Source run | `research/indexes/091-cushing-operations-nowcasting/20260908T091PZ/` |
| Source receipt | `research/gathering/raw/ALT-20260908-17/20260908T170000Z/README.md` |
| Range | 2008-02-01 through 2026-06-01, 221 months, no gaps |
| Months | **221** · article sum **101** · max monthly **3** · zero months **144** |
| Raw titles | stay outside Git (aggregate month/count only) |

The reader is `app/app/lib/cushing-kush.ts`; it fails closed on swapped
dates, dropped zero months, extra months after 2026-06, edited counts, or a
busy-score relabel.
