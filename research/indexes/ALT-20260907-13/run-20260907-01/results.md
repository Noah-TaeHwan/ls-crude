# 실행 영수증 — ALT-20260907-13 / run-20260907-01 (IS-PARTIAL)

- run_utc: 2026-09-07T07:04:32Z · 실행자: SPECIALIZED division · owner 오태환 / reviewer 손성찬
- command: `research/notebooks/ALT-20260907-13/run_is_frozen.py` · workdir: `/Users/noah/orca/workspaces/ls-crude/petrel` · git: `2fc1c43` dirty=True
- env: /tmp/altvenv/bin/python (pandas 3.0.5 / numpy 2.5.3 / matplotlib 3.11.1)
- 범위 고지: **IS-PARTIAL 2019-01-01~2023-12-31** — 2015~2018 원천 부재(카드 §3). 전체-IS 주장 금지, OOS 검증 주장 금지.
- provenance: 구 ID ALT-20260907-04에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 |
| --- | --- |
| chokepoint6_2019_2023_p00.json | `fe53e55825322c4ea79e76a2892e1e7a579d15fecc0375d314667c77dda4042a` |
| chokepoint6_2019_2023_p01.json | `7b55e5bcddf4275b336aa74a1d0f84ea22513f7780fbc8b6d2e6b15870950be0` |
| clf-daily-2015-2026.csv | `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171` |

일별 유조선 1826행, 달력 공백 0일, asfreq 후 결측 0.
WTI pre-2019 1004행·post-2023 672행은 읽기만 하고 미사용.
추정치는 AIS 기반 추정치이며 실측 통관이 아님(카드 §1 한계).

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| 지수+결정일 IS-partial 행 | 1630 |
| 결정-타깃 쌍(제외 전) | 1630 |
| 제외: 가격 비양수/결측 창 | 11 |
| 제외: 타깃 종료일 2023-12-31 초과 | 8 |
| 최종 쌍(제외 후) | 1611 |

일별 복제를 독립 표본으로 세지 않음.

## 결과 (IS-partial only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n=1611, Pearson r=-0.0230, Spearman rho=0.0792
- placebo 신호 +130거래일(~26주): n=1481, r=-0.0874
- split-half: 전반 n=805 r=-0.1591(neg) / 후반 n=806 r=0.2728(pos)
- 전체 lag표: lag_table.csv (k=-4..+4주 ≈ k*5거래일 시프트, lag별 n 포함)
- 동결 규칙 대조: **PARK** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 부분구간의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 전체-IS 일반화, 방향 알파, 인과, OOS 검증, 유의성. vintage: 수집 시점 빈티지, 소급 개정 가능 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
