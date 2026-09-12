#!/bin/bash
# DATA-03: AVC040 2023 12-month TMAS expansion + 2020-03 format probe.
# Reuses the earlier download manifest (dedup by URL); cumulative cap enforced by download.py.
set -u
cd /Users/noah/orca/ls-crude
OLD=research/gathering/raw/091-tmas/20260911T075705Z
M=research/gathering/raw/091-tmas/20260911T082500Z
BASE=https://www.fhwa.dot.gov/policyinformation/tables/tmasdata
DL=research/notebooks/091-tmas/download.py
{
echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkdir -p "$M/logs" "$M/zips" "$M/extracted"
for spec in \
  2023/jan_2023_ccs_data.zip 2023/feb_2023_ccs_data.zip 2023/apr_2023_ccs_data.zip \
  2023/may_2023_ccs_data.zip 2023/jun_2023_ccs_data.zip 2023/jul_2023_ccs_data.zip \
  2023/aug_2023_ccs_data.zip 2023/sep_2023_ccs_data.zip 2023/oct_2023_ccs_data.zip \
  2023/nov_2023_ccs_data.zip 2023/dec_2023_ccs_data.zip 2020/mar_2020_ccs_data.zip ; do
  echo "=== $spec $(date -u +%H:%M:%SZ)"
  python3 "$DL" "$BASE/$spec" --out "$M/zips" --manifest "$M/download_manifest.json" || echo "FAIL $spec"
done
echo "=== extract $(date -u +%H:%M:%SZ)"
for z in "$M"/zips/*.zip; do unzip -o -j "$z" "*OK_*" -d "$M/extracted" >/dev/null 2>&1 || true; done
unzip -o -j "$OLD/zips/mar_2023_ccs_data.zip" "*OK_*" -d "$M/extracted" >/dev/null 2>&1 || true
echo "DONE $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$M/DONE"
} >> "$M/logs/download.log" 2>&1
