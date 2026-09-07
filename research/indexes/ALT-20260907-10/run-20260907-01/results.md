# 실행 영수증 — ALT-20260907-10 / run-20260907-01

- run_utc: 2026-09-07T07:01:05Z · 실행자: SPECIALIZED division · owner 손성찬 / reviewer 오태환
- command: `research/notebooks/ALT-20260907-10/run_is_frozen.py` · workdir: `/Users/noah/orca/workspaces/ls-crude/petrel` · git: `2fc1c43` dirty=True
- env: /tmp/altvenv/bin/python (pandas 3.0.5 / numpy 2.5.3 / matplotlib 3.11.1)
- variant note: 카드 미지정 FutOnly-vs-Combined → FutOnly 사용(원시 067651행 전부 FutOnly), 분모는 동일행 Open_Interest_All.
- provenance: 구 ID ALT-20260907-01에서 현 ID로 이관 — 원시 입력은 해시 확인으로 바이트 동일.
  같은 run 폴더의 test_table.csv/fig_*.png/receipt.json은 별도 스크립트(run_is.py)의 산출물이며 본 영수증과 무관.

## 입력 (로컬 전용, 네트워크 없음)

| 파일 | SHA-256 |
| --- | --- |
| fut_disagg_txt_2015.zip | `36aacb4389831a89996ba5366c91eedeaa32a55abca8265325bc52d74b06ca34` |
| fut_disagg_txt_2016.zip | `50f52674fd924d24c794b921c29342be7d35cbe0a241ac823925ccf43ca1a6d2` |
| fut_disagg_txt_2017.zip | `6fc467b989df527a4fbea4ba07185e8951f35cb72563f156488904a37c100e43` |
| fut_disagg_txt_2018.zip | `df4bf7d72e8984d6ea04087f793c9f2bf3503ea8c2149f4b01eedeef4fbe40a8` |
| fut_disagg_txt_2019.zip | `942a438bcc6f66e65aaf594a1a1fdb8c1505fe4a0feece77a1fd97270317e753` |
| fut_disagg_txt_2020.zip | `0aa03c0fd6360f56b6897b6eaff30e8dba774c826bf93cac61598312e19bd1cd` |
| fut_disagg_txt_2021.zip | `12d5d49a8963367fd3439050e3e20e6a5338757dfa083432795c5556827ff8ae` |
| fut_disagg_txt_2022.zip | `74205d75d4d7b75a9f4159ef2e6abed53eeb4771a74e5a4bf78bc0451410ab7f` |
| fut_disagg_txt_2023.zip | `9fe75dba0256819d476bb0d01f9e8e5ac6ec2c4390f609a7e3259e85796b79ce` |
| clf-daily-2015-2026.csv | `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171` |

WTI 로컬 파일의 범위 외 행은 읽기만 하고 미사용: pre-2015 0행, post-2023 672행 무시.
COT 시장명 변경(CRUDE OIL LIGHT SWEET → WTI-PHYSICAL, 동일 코드 067651, 시점 불명)을 관측 — 코드 기준으로만 병합.
보고 요일: 화요일이 원칙이나 월요일 보고 1건 포함(휴장 주) — 금요일+3일 규칙 동일 적용.

## 커버리지/결측/제외

| 항목 | n |
| --- | --- |
| COT WTI 행(2015~2023) | 469 |
| 지수+결정일 IS 행 | 443 |
| 결정-타깃 쌍(제외 전) | 443 |
| 제외: 가격 비양수/결측 창 (2020-04-20 −37.63 포함) | 2 |
| 제외: 타깃 종료일 2023-12-31 초과 | 1 |
| 최종 쌍(제외 후) | 440 |

## 결과 (IS-only, 추론 미검증 — 겹치는 윈도우이므로 독립표본 p값 주장 없음)

- 주검정 lag0: n=440, Pearson r=-0.1254, Spearman rho=-0.2301
- placebo 신호 +26주: n=414, r=-0.1543
- split-half: 전반 n=220 r=-0.3928(neg) / 후반 n=220 r=0.0142(pos)
- 전체 lag표: lag_table.csv (k=-4..+4주, lag별 n 포함)
- 동결 규칙 대조: **PARK** (|r|≥0.10 且 전후반기 동부호 且 |placebo|<|r|/2)
- 그림: plot_series.png (지수-RV 시계열, 분리 패널) · plot_lag.png (사전등록 lag 곡선)

## 주장 범위 / 한계

- 주장 가능: 위 표본의 탐색적 기술 상관(E3-exploratory 수준, 동료 검토 전).
- 주장 불가: 방향 알파, 인과, OOS 일반화, 유의성. vintage: CFTC 히스토리 확정치이나 개정 이력 미확인 — as-of-safe NOT_PROVEN 병기.
- oos_exposure: UNKNOWN — 2024+ 결과 미열람, 분석 상한 2023-12-31 고정.
- 재현: `run_is_frozen.py --check` (summary/lag_table 대조, run 시각·git 필드 제외).
