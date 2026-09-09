# 실행 영수증 — ALT-20260907-12 / run-20260907-01

- run_utc: 2026-09-07T07:03:44Z · 실행자: SPECIALIZED division · owner 오태환 / reviewer 손성찬
- command: `research/notebooks/ALT-20260907-12/run_is_frozen.py` · workdir: `/Users/noah/orca/workspaces/ls-crude/petrel` · git: `2fc1c43` dirty=True
- env: /tmp/altvenv/bin/python (pandas 3.0.5 / numpy 2.5.3 / matplotlib 3.11.1)
- variant note: 없음 — 카드 구성(MoM → z12, 월말+75d)을 그대로 따름. 월 1관측, 일별 복제 없음.
- provenance: 구 ID ALT-20260907-03에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 | 비고 |
| --- | --- | --- |
| TSIFRGHT.csv | `f23deae007bc684560d50745fb06278e7ea7ac80fbe807d2b1e3a30aaed91858` | 318개월(2000~), IS 밖 210개월 무시, 결측 0 |
| clf-daily-2015-2026.csv | `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171` | pre-2015 0행·post-2023 672행 무시 |

원천: FRED 경유 BTS 화물운송지수 월간. BTS 직접 xlsx 403은 수집 시점에 FRED로 해소됨(카드 §3).
워밍업 고지: z12 후행창은 과거 관측만 사용하므로 파일 내 2015년 이전 이력도
번인으로 사용(미래 누수 없음) — 평가 쌍은 전부 IS 결정일.
범위 외 관측의 결정일은 경계 거래일로 클램프하지 않고 NaT로 버림(경계 오염 방지).

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| 지수+결정일 IS 행 | 108 |
| 결정-타깃 쌍(제외 전) | 108 |
| 제외: 가격 비양수/결측 창 | 1 |
| 제외: 타깃 종료일 2023-12-31 초과 | 1 |
| 최종 쌍(제외 후) | 106 |

## 결과 (IS-only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n=106, Pearson r=-0.0394, Spearman rho=0.0145
- placebo 신호 +12개월: n=94, r=-0.1096
- split-half: 전반 n=53 r=-0.1176(neg) / 후반 n=53 r=0.0077(pos)
- 전체 lag표: lag_table.csv (k=-3..+3월, lag별 n 포함)
- 동결 규칙 대조: **PARK** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 표본의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 방향 알파, 인과, OOS 일반화, 유의성. vintage: FRED 현재 빈티지, 과거 개정 미복원 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
