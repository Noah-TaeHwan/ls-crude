# US HIMI Public Proxy v13 — 엔진·명칭 업데이트 감사

| 항목 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 공식 명칭 | **US HIMI Public Proxy** |
| 대상 | 사용자 제공 `HIMI057PublicProxyEngine` Production v13 |
| 결론 | 월간 FRED 처리는 개선됐지만 EIA 일별 복제가 남아, 정식 이벤트 기반 검정을 대체하지 않음 |

## v13에서 통과한 개선

- FRED `IPG333S`의 z-score를 월간 원자료에서 먼저 계산하고, 월말+45일 뒤 거래일로 정렬한다.
- 기본 OOS 경계는 2024-01-01이고, `Close` 열 계약도 맞췄다.
- WTI 전방 변동성은 원래 WTI 거래일 패널에서 계산한 뒤 신호일에 붙인다.

## 남은 문제

`EIA_Utilization`은 여전히 주간 원자료를 매 거래일로 forward-fill한 뒤 `calculate_rolling_zscore`(252 거래일)를 적용한다. 이 때문에 같은 주간 EIA 수치가 여러 일에 복제되고 새 공개 정보가 없는 날에도 z-score가 변화한다. 그 일별 factor를 겹치는 21일 전방 RV와 상관시키면 독립 표본 수가 과대해진다.

따라서 v13은 **월간 FRED 한 축의 개선**이지 완전한 native-frequency HIMI 엔진은 아니다. EIA도 주간 원자료에서 prior 52주 z-score를 먼저 계산하고, 새 월간 FRED 공개 이벤트마다 최신 이용 가능한 EIA z-score 한 개만 결합해야 한다.

## 정식 결과와 관계

US HIMI Public Proxy의 정식 이벤트 기반 결과는 유지한다: 동일가중 합성 IS `-0.177` (n=107), OOS `+0.465` (n=31). 부호 반전으로 상태는 HOLD, 가중치 0.0이다. v13의 데모·일별 출력은 이 결과를 뒤집는 근거가 아니다.
