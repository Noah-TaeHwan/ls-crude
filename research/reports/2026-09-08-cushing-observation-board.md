# Cushing Observation Board — 실제 관측·개별 시각화·조합 게이트

**기준일:** 2026-09-08 KST
**목적:** 쿠싱이 바쁜지·저장/물류 상태가 긴장됐는지를 관찰할 수 있는 공개 지표를 한 화면의 연구 기록으로 정리한다. 이는 WTI 거래 신호·가격 예측·합성 점수가 아니다.

## 결론

지금은 **단일 Cushing Oil Stress Index를 만들지 않는다.** 실제 장기 표본으로 개별 검정까지 가능한 관측은 도시권 야간광과 외부 맥락 052W·086·090이며, 어느 것도 미래 28일 쿠싱 재고 상태와 유의한 관계를 보이지 않았다. 숙박세와 고정 도로구간 트럭은 필요한 원문이 아직 부족해 수치 그림을 만들지 않았다.

| 관측 | 실제로 측정하는 것 | 개별 검정 상태 | 조합 입력 |
| --- | --- | --- | --- |
| 091 도시권 야간광 | 쿠싱 중심부 5×5 픽셀의 월간 밝기 대 control | `r=+.053`, p=.607, n=96 | 제외 |
| 052W Household Panic Wiki | 전미 고정 Wikipedia 문서의 월간 관심도 | `r=+.142`, p=.157, n=101 | 문맥 전용 |
| 086 Harvest Combine Diesel Pulse | USDA 수확 진도 이례치 | `r=+.229`, p=.261, n=26 | 문맥 전용 |
| 090 Great Lakes Ice Constraint | NOAA 오대호 결빙 이례치 | `r=-.102`, p=.336, n=91 | 문맥 전용 |
| City 숙박세 | 도시 전체 월별 숙박 과세수입 | 장기 원문 부족 | 보류 |
| 근접 고정 도로구간 트럭 | 사전 고정 구간의 트럭 수치 | 실제 장기 표본 미확보 | 보류 |

모든 `r`은 **신호 이용가능일 뒤의** EIA 쿠싱 재고 28일 순변화와의 Pearson 상관이다. p값은 탐색적 기술치이며 OOS 인증이 아니다.

## 1. 091 — 도시권 야간광

![091 도시권 야간광과 미래 28일 쿠싱 재고 변화](../indexes/091-cushing-operations-nowcasting/20260908T030000Z/figures/091-urban-night-light.svg)

- 관측 범위: 월간 VIIRS 도시권 밝기. 개별 모텔, 객실 점유, 근무자 수는 판독하지 못한다.
- 이용가능 계약: 월말 뒤 +45일.
- 결과: 관계가 거의 없으며, 도시 불빛을 현장 운영 스트레스나 재고 선행 신호로 확대 해석하지 않는다.

## 2. 052W — Household Panic Wiki

![052W 관심도와 미래 28일 쿠싱 재고 변화](../indexes/091-cushing-operations-nowcasting/20260908T030000Z/figures/052w-household-panic.svg)

- 관측 범위: `Recession`, `Unemployment`, `Bankruptcy`, `Inflation`, `Gasoline`, `Fuel_tax`, `Food_insecurity` 문서의 공개 Wikipedia 관심도.
- 결과: 약한 양의 표본 상관은 있으나 유의하지 않고, 쿠싱 현장 활동을 측정하지 않는다.
- 역할: 전국 불안 관심의 월간 문맥 패널. 쿠싱 활동 입력으로 대체하지 않는다.

## 3. 086 — Harvest Combine Diesel Pulse

![086 수확 진도 이례치와 미래 28일 쿠싱 재고 변화](../indexes/091-cushing-operations-nowcasting/20260908T030000Z/figures/086-harvest-combine.svg)

- 관측 범위: USDA 선택주 옥수수·대두 수확 완료율의 평년 대비 이례치.
- 결과: 쿠싱 재고 선행 관계는 확인되지 않았다. 원래의 HO 변동성 맥락 가설과는 별개다.
- 계절: 9~11월.

## 4. 090 — Great Lakes Ice Constraint

![090 결빙 이례치와 미래 28일 쿠싱 재고 변화](../indexes/091-cushing-operations-nowcasting/20260908T030000Z/figures/090-great-lakes-ice.svg)

- 관측 범위: NOAA GLERL 전체 오대호 결빙 이례치. 실제 쇄빙선 운항·항로 봉쇄·연료 사용량은 아니다.
- 결과: 쿠싱 재고 선행 관계는 확인되지 않았다.
- 계절: 12~4월. 086의 9~11월과 실제 동시 관측이 **0건**이므로 두 신호의 평균·AND·가중합은 만들지 않는다.

## 아직 그림을 만들 수 없는 두 입력

### City 숙박세

공식 월별 표본은 2023년 5~7월 3개월뿐이고 연간 실제치가 일부 존재한다. 60개월 이상의 **월별 원문**, 세율 이력, 각 보고서의 게시일이 없으므로 시계열 그림·상관·점수화를 하지 않는다. 도시 전체 숙박 과세수입은 객실 점유율이나 석유 작업자 수가 아니다.

### 쿠싱 근접 고정 도로구간 트럭

ODOT의 AADT 네트워크 메타데이터는 확인했지만, 쿠싱 근접의 사전 고정 구간·장기 트럭 수치·관측/공개일을 실제 표본으로 확보하지 못했다. 따라서 임의 구간, 도시 전체 차량 수, 추정 유조차 수로 그림을 채우지 않는다.

## 동결된 재개 조건

1. City of Cushing 숙박세 원문을 60개월 이상 확보하고, 관측월·세율·게시일을 함께 기록한다.
2. 쿠싱 근접 사전 고정 도로구간의 장기 트럭 수치와 트럭 정의·관측일·공개일을 확보한다.
3. 두 입력을 각자 먼저 시각화하고, 계절성·공개지연을 고정한 독립 검정을 한다.
4. 두 독립 검정이 측정 적합성과 해석 가능한 관계를 보일 때에만 최대 2~3개 관측을 제한적으로 조합한다. 결측을 0·가격·합성 변수로 메우지 않는다.

## 재현·원본 경계

- 브리지 검정: `python research/notebooks/091-cushing-operations-nowcasting/run_context_bridge.py`
- 개별 그림 생성: `python research/notebooks/091-cushing-operations-nowcasting/render_observation_board_figures.py`
- 그림: `research/indexes/091-cushing-operations-nowcasting/20260908T030000Z/figures/`
- 원시 데이터 영수증: [ALT-20260908-01](../gathering/raw/ALT-20260908-01/20260908T022411Z/README.md)
- 이전 결합 게이트: [2026-09-08 Cushing combination gate](2026-09-08-cushing-observation-combination-gate.md)
- 상세 상관 표: [2026-09-08 Context Bridge test](2026-09-08-cushing-context-bridge-test.md)

원시 CSV·JSON과 재생성 패널은 gitignored raw/processed 경로에만 두며, 이 보고서와 SVG는 관측·검정의 요약물이다.
