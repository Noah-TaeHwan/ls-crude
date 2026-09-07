# 실행 영수증 — ALT-20260907-11 / run-20260907-01

- run_utc: 2026-09-07T07:02:09Z · 실행자: SPECIALIZED division · owner 오태환 / reviewer 손성찬
- command: `research/notebooks/ALT-20260907-11/run_is_frozen.py` · workdir: `/Users/noah/orca/workspaces/ls-crude/petrel` · git: `2fc1c43` dirty=True
- env: /tmp/altvenv/bin/python (pandas 3.0.5 / numpy 2.5.3 / matplotlib 3.11.1 / xlrd 2.0.2)
- variant note: 없음 — 카드 구성(dist4 4주평균 → z52, +5d)을 그대로 따름.
- provenance: 구 ID ALT-20260907-02에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 | 비고 |
| --- | --- | --- |
| WDIUPUS2w.xls | `7416fa33da5d3dd40a68cf4a3009d9a7f41032ac9d323ef1f8dd70bfe24ff623` | Data 1 시트 1856주 (1991~2026), IS 밖 1386주 무시, 결측 0 |
| clf-daily-2015-2026.csv | `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171` | pre-2015 0행·post-2023 672행 무시 |

원시 주기는 금요일 week-ending 확인. 039 휘발유 기각은 기저율로만 사용.
워밍업 고지: z52 후행창은 과거 관측만 사용하므로 파일 내 2015년 이전 이력도
번인으로 사용(미래 누수 없음) — 평가 쌍은 전부 IS 결정일.
범위 외 관측의 결정일은 경계 거래일로 클램프하지 않고 NaT로 버림(경계 오염 방지).

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| 지수+결정일 IS 행 | 469 |
| 결정-타깃 쌍(제외 전) | 469 |
| 제외: 가격 비양수/결측 창 | 1 |
| 제외: 타깃 종료일 2023-12-31 초과 | 1 |
| 최종 쌍(제외 후) | 467 |

## 결과 (IS-only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n=467, Pearson r=-0.1623, Spearman rho=-0.1200
- placebo 신호 +26주: n=441, r=-0.0113
- split-half: 전반 n=233 r=-0.1896(neg) / 후반 n=234 r=-0.1413(neg)
- 전체 lag표: lag_table.csv (k=-4..+4주, lag별 n 포함)
- 동결 규칙 대조: **KEEP-candidate** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 표본의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 방향 알파, 인과, OOS 일반화, 유의성. vintage: EIA DNAV 현재 빈티지, 과거 개정 미복원 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
