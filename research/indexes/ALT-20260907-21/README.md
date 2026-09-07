# ALT-20260907-21 Singapore MPA bunker sales

run `run-20260907T063658Z` · `research/gathering/raw/ALT-20260907-21/20260907T063658Z/bunker_sales.csv` sha256 `327ac857875077e1166949e4f841ecc99336e2fca1c41dfd61a759eb3638b18a`

- 월별 전 유종 합(톤). `available_at` = 월말+45일 (정확한 공표 달력 미복원, NOT_PROVEN as-of-safe).
- 월간이라 일별 f1 상관의 독립 n은 월 관측 수에 가깝다.

           name   n   pearson  spearman  signal_mean  target_mean
 bunker_d_vs_f1 108  0.091768  0.127460     7.480741    -0.000910
bunker_d_vs_rv5 108 -0.160901 -0.076510     7.480741    38.556192
 bunker_d_vs_f5 108  0.168494  0.112759     7.480741    -0.001447
