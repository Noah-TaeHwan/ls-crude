# ALT-20260907-19 Baker Hughes US oil rotary rigs

run `run-20260907T063658Z` · 원본 `research/gathering/raw/ALT-20260907-19/20260907T063658Z/bh_48162dfc.xlsx` sha256 `2f5fc094dea42aed7a184b24706c56ca756de075e7e14c8818058b12aa5322c0`

## 사전 정의
- 시트 `US Oil & Gas Split`, 열 Oil. Excel serial date.
- 공개: 관측 주 금요일 발표 가정, `available_at` = 날짜+3일(월요일) 이후 첫 CL 거래일. 당시 빈티지 미복원 → `NOT_PROVEN as-of-safe`.
- placebo/보조: 같은 시트의 Gas 리그 주간 변화.
- IS 2015-01-01~2023-12-31.

            name   n   pearson  spearman  signal_mean  target_mean
  oilrig_d_vs_f1 469 -0.120275 -0.056252    -2.134328     0.002191
 oilrig_d_vs_rv5 469 -0.413987 -0.186371    -2.134328    38.248802
oilrig_lvl_vs_f1 470 -0.107868 -0.090744   593.559574     0.002079
  gasrig_d_vs_f1 469 -0.016431 -0.059907    -0.469083     0.002191

## 강건성
- 2020 제외 f1: n=417 r=-0.018 rho=-0.053 (소멸).
- WTI r1이 다음 리그 변화를 선행: n=468 r=+0.201.
- rv5 r=-0.414는 2020에 민감 (ex2020 -0.220). 알파로 읽지 않음.
