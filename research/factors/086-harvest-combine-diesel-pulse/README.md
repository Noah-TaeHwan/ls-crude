# 086 — Harvest Combine Diesel Pulse (HCDP)

**상태**: ⏸️ **HOLD — IS 변동성 관계는 있으나 OOS 재현 실패**
**가중치**: 0.0

> “When the combines run ahead of schedule, diesel gets jumpy.”

## 가설

미국 옥수수·대두 수확은 대형 콤바인, 곡물 운반, 건조·저장, 철도·트럭 물류를 동반한다. 수확 진도가 평년보다 빠르거나 느린 주간은 농업 디젤 수요와 물류 압력이 평상시와 다를 수 있으므로, 원유 방향이 아니라 난방유/ULSD 시장의 단기 변동성 레짐을 설명할 수 있다는 가설이다.

수확 진도 surprise → 농업·물류 디젤 운영 압력 → HO 변동성

이는 전국 디젤 수요나 원유 가격 방향을 직접 측정하는 신호가 아니다.

## 고정 검정 사양 — 2026-09-07

| 항목 | 사양 |
| --- | --- |
| 입력 | USDA NASS 주간 Crop Progress의 선택주 합산 옥수수·대두 **수확 완료율** |
| 신호 | (옥수수 현재−5년 평균 + 대두 현재−5년 평균) / 2, 단위: %p |
| 정보 가능일 | USDA 보고서가 보통 장 마감 뒤 공개되므로 다음 미국 거래일 |
| 1차 타깃 | Yahoo 연속선물 HO=F의 이후 5거래일 연율화 실현변동성 |
| 보조 타깃 | 같은 창의 HO 수익률 |
| IS / OOS | 2015–2023 / 2024–2025. 사양을 바꿔 재시도하지 않음 |

## 결과

| 신호 → 이후 HO=F | IS | OOS | 판정 |
| --- | ---: | ---: | --- |
| 5일 실현변동성 | **+0.301**, n=85, p=.005 | +0.181, n=13, p=.553 | IS만 관측. OOS 재현 실패 |
| 5일 수익률 | -0.072, n=85, p=.513 | +0.373, n=13, p=.210 | 부호·유의성 모두 불안정 |
| 상위−하위 사분위 RV | +12.46%p | +2.88%p | 작은 OOS 표본으로 채택 불가 |

## 판정

IS의 변동성 상관은 흥미롭지만, **OOS에서 통계적으로 재현되지 않았고 표본도 13개**다. 따라서 알파·거래 신호·가중치가 아니다. 수확철 운영 스트레스를 표현하는 밈/모니터 후보로만 보존한다.

향후 보완은 새 임계값 탐색이 아니라, USDA의 실제 역사 release timestamp·개정 빈티지와 EIA distillate supplied 같은 직접 수요 대조군을 확보한 뒤의 새 사전등록 검정이어야 한다.

## 데이터 경계

- USDA의 선택주 합산 수확률은 실제 경유 판매량·트럭 주행·저장/건조 연료를 측정하지 않는다.
- HO=F는 연속선물이라 롤·현재 빈티지 한계를 갖는다.
- 수확 진행은 날씨·수확량·작부면적·곡물 가격과 함께 움직일 수 있다. 이 결과를 원인 증명으로 해석하지 않는다.
- 원시 USDA 텍스트·Yahoo 가격·파생 패널·재실행 코드는 gitignored research/gathering/raw/2026-09-07-harvest-combine/에 보관한다.

## 출처

- [USDA NASS Crop Progress and Condition](https://data.nass.usda.gov/Surveys/Guide_to_NASS_Surveys/Crop_Progress_and_Condition/index.php)
- [USDA ESMIS Crop Progress archive](https://esmis.nal.usda.gov/publication/crop-progress)
- [검정 기록](../../reports/2026-09-07-harvest-combine-diesel-pulse-test.md)

