# 사전 고정 기록 — DMR 재사용 기간 민감도 (후속 회고 분석)

- 고정 시각: 2026-09-11 22:29:32 KST (파일 mtime이 증거)
- 성격: **기존 2023 회고 결과를 보고 설계한 후속 민감도 분석**. 독립 사전등록·새 OOS 아님.
- 코드: research/src/ls_crude/experiment, fingerprint 79aff9062f62 (배치 G와 동일)
- 입력: traffic 98d5761d…, DMR 251aa9e6…, price ea70f934… (새 다운로드 없음)

## 정책 의미 (align_availability 기준)
| 정책 | config validity_days | 가용일(접수일) 당일 | 마지막 허용일 | 주말·휴일 |
|---|---:|---|---|---|
| A_62 | 62 | 포함(정확 일치) | 62일째 포함(tolerance ≤ 62d) | 가용일이 거래일이 아니면 그 날짜엔 사용 불가(시프트 없음) |
| B_31 | 31 | 포함 | 31일째 포함 | 동일 |
| C_0 | 0 | **당일만**(정확 일치, 재사용 없음) | 없음 | 동일 |

접수일은 접수일일 뿐 외부 공개일 확인이 아님. 가용일 이전 노출·역방향 채움·무제한 재사용 금지. 만료와 원래 결측은 구분(둘 다 채우지 않음).

## 진단 기준 (결과 확인 전 고정)
- 학습 가능: model_train_rows ≥ 100 **그리고** model_val_rows ≥ 50 **그리고** train·val 각각 두 클래스 존재.
- 미달 정책은 표본 점검까지만 하고 학습 SKIPPED. 기준을 낮추거나 기간을 바꾸지 않음.
- 모델 4종 고정: baseline_up_rate / market_only_logit / market_cai_equal_logit / market_cai_learned_logit.
- 학습 가중치는 CAI 단독 손실로 결정 후 시장정보와 결합(공동 최적화 아님).

## config 해시 (고정)
- experiments/cai/sens_dmr62.config.json sha256: 39348c3f1b323a8c70bb246e2889e211ac1e1508ce1e5d056768b6957a6f4245
- experiments/cai/sens_dmr31.config.json sha256: 90dd56a3e38ee456003a236670ee1c048844425a7d837c7dc1d074deda9e5bef
- experiments/cai/sens_dmr0.config.json sha256: db5ec4e0bfb8fb872a84e1f4053246136e6a6072f1534a5da910d7798ea2917e

## 판정 (진단 후·학습 전, 2026-09-11 22:30 KST)

- A_62: train 507 / val 245, 원관측 47/37, 두 클래스 존재 → **학습 진행**.
- B_31: train 476 / val 232, 원관측 47/36, 두 클래스 존재 → **학습 진행**.
- C_0(당일만): train 24 / val 12 → **기준 미달, 학습 SKIPPED**(진단 기록만 남김).
- 경과일: A 중앙 14·최대 56, B 중앙 14·최대 31, C 0.
