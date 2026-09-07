# ALT-20260907-23 Wikipedia Cushing, Oklahoma pageviews

run `run-20260907T063658Z` · `research/gathering/raw/ALT-20260907-23/20260907T063658Z/cushing.json` sha256 `d78aee63e56687a45bafdf247b8e1f87560c4faee0de949d574dd528a7a49ab4`

- D+1 정렬. 당시 적재 시각 영수증 없음 → NOT_PROVEN as-of-safe. 후보 점수 산정 금지에 가깝고 탐색만.
- placebo: Pizza 문서. 보조: Strategic Petroleum Reserve 문서.

            name    n  pearson  spearman  signal_mean  target_mean
 cushing_d_vs_f1 2135 0.200757 -0.016102    -0.031850     0.000663
cushing_d_vs_rv5 2135 0.033196 -0.006728    -0.031850    37.628044
   pizza_d_vs_f1 2135 0.034285  0.047577    -0.095082     0.000663
     spr_d_vs_f1 2135 0.042383 -0.015497     0.102576     0.000663

## 강건성
- |d| 최대 26222, 날짜 2020-04-21 (WTI 음가 전후).
- 1–99% 윈저 후 f1 r=+0.026, Spearman -0.016. Pearson 채택 금지.
