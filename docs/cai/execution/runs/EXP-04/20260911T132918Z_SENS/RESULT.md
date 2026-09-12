# 실행 결과 — DMR 재사용 기간 민감도 (EXP-04 후속, 2026-09-11)

```yaml
unit: EXP-04 follow-up (새 최상위 카드 아님)
status: DONE (C 정책은 기준 미달 SKIPPED)
run_folder: docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS/
model_runs: research/data/processed/091-cai-exp-sens/{20260911T132949Z(A_62), 20260911T132951Z(B_31)}
code: 79aff9062f62 (배치 G와 동일)
inputs: traffic 98d5761d…, DMR 251aa9e6…, price ea70f934… (신규 다운로드 0)
성격: 기존 2023 회고 결과를 보고 설계한 후속 민감도 분석 (독립 사전등록·OOS 아님)
```

## 1. 바꾼 것 (한 문장)

DMR `validity_days`만 62 → 31 → 0으로 바꿨다. 입력·성분 순서·타깃(다음 5거래일 상승)·
학습/검증 분할·시장정보·전처리·가중치 학습 방식·seed는 고정했다.

## 2. 정책 의미 (align_availability 기준, 코드 확인)

| 정책 | validity_days | 접수일 당일 | 마지막 허용일 | 주말·휴일 |
|---|---:|---|---|---|
| A_62 | 62 | 포함(정확 일치) | 62일째 포함 | 접수일이 거래일이 아니면 그 날짜엔 사용 불가(시프트 없음) |
| B_31 | 31 | 포함 | 31일째 포함 | 동일 |
| C_0 | 0 | **당일만** | 없음 | 동일 |

접수일=EPA 수신일이며 외부 공개일 확인이 아님. 가용일 이전 노출·역방향 채움 없음.

## 3. 표본·원관측 (학습 전 진단, 기준 사전 고정)

| 정책 | 학습 행 | 검증 행 | DMR 원관측(학습/검증) | 재사용(최대/중앙) | 경과일 중앙/최대 | 클래스 | 판정 |
|---|---:|---:|---|---|---|---|---|
| A_62 | 507 | 245 | 47 / 37 | 62일 창(원관측당 여러 행) | 14 / 56 | 양쪽 존재 | 학습 |
| B_31 | 476 | 232 | 47 / 36 | 31일 창 | 14 / 31 | 양쪽 존재 | 학습 |
| C_0 | 24 | 12 | 46 / 36 | 1회(당일) | 0 / 0 | 양쪽 존재 | **SKIPPED**(기준: train≥100·val≥50 미달) |

C는 기준 미달이라 학습하지 않았고, A/B 비교는 그대로 수행했다(기준을 낮추거나 기간을 바꾸지 않음).

## 4. 정책별 결과 (각 정책의 사용 표본)

**A_62** (n=245) — 배치 F run과 동일 수치 재현

| 모델 | acc | log_loss | Brier | w |
|---|---:|---:|---:|---|
| baseline_up_rate | 0.473469 | 0.694534 | 0.250693 | — |
| market_only_logit | 0.518367 | 0.697094 | 0.251872 | — |
| market_cai_equal_logit | 0.514286 | 0.702763 | 0.254552 | [0.5, 0.5] |
| market_cai_learned_logit | 0.489796 | 0.710886 | 0.258361 | [0.0, 1.0] |

**B_31** (n=232)

| 모델 | acc | log_loss | Brier | w |
|---|---:|---:|---:|---|
| baseline_up_rate | 0.474138 | 0.695452 | 0.251152 | — |
| market_only_logit | 0.547414 | 0.696162 | 0.251375 | — |
| market_cai_equal_logit | 0.543103 | 0.701660 | 0.253968 | [0.5, 0.5] |
| market_cai_learned_logit | 0.512931 | 0.711064 | 0.258373 | [≈0, 1.0] |

정책 표본 내 시장정보 대비 CAI 차이(log loss): A +0.005668(+equal)·+0.013792(+learned),
B +0.005497·+0.014901 — **두 정책 모두 CAI 추가가 확률오차를 악화**시켰다. 가중치는 A/B 동일하게 DMR 집중.

## 5. 공통 평가 날짜 비교 (232일 = A∩B, 저장 예측 재집계)

| 모델 | A acc / ll / Brier | B acc / ll / Brier | Δlog_loss(B−A) |
|---|---|---|---|
| baseline_up_rate | 0.474138 / 0.694505 / 0.250679 | 0.474138 / 0.695452 / 0.251152 | +0.000947 |
| market_only_logit | 0.530172 / 0.694888 / 0.250775 | 0.547414 / 0.696162 / 0.251375 | +0.001275 |
| market_cai_equal_logit | 0.530172 / 0.700636 / 0.253482 | 0.543103 / 0.701660 / 0.253968 | +0.001024 |
| market_cai_learned_logit | 0.500000 / 0.710125 / 0.257954 | 0.512931 / 0.711064 / 0.258373 | +0.000939 |

- 공통 날짜에서 사용된 DMR 값은 **완전히 동일**(232/232, value diffs 0). 차이는 전부
  **학습 표본 차이**(507→476, 31일 창에서 만료된 학습 행 제외)에서 발생.
- B는 정확도가 높지만 **주 지표(log loss)와 Brier는 소폭 악화** — 정확도만 골라 개선이라 하지 않음.
- 따라서 이 차이를 "재사용 기간의 순수한 인과효과"로 단정하지 않는다(값 변화 0, 표본 변화 있음).

## 6. 한계·다음 행동

- 한 해(2023) 회고, 접수일 기준(공개일 미확인), 표본 소규모, DMR 집중은 그대로.
- C(당일만)는 표본 부족으로 비교 불가 — 입수 빈도가 월 1회인 한 당일 정책은 이 설계에서 사용 불가.
- 이번 배치에서 설정을 더 늘리지 않는다. 다음 판단은 "잔여 812MB로 교통 2019 등 확대 시
  CAI 무이득 결론이 유지되는가"를 묻는 별도 결정.

## 7. 재실행

```bash
cd research
.venv/bin/python notebooks/091-cai-exp/dmr_reuse_sensitivity.py --out ../docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr62.config.json --base-dir data/processed/091-cai-exp-sens
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr31.config.json --base-dir data/processed/091-cai-exp-sens
# exit code 0/0 (CLI 종료), C는 기준 미달로 미실행
```
