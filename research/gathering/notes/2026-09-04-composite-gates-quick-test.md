# 2026-09-04 — 061·062 5분 Quick Test

## 요청

061 Refinery–Credit Stress Gate와 062 Industrial Credit–Inventory Stress Regime을 짧게 실제 검정한다.

## 실행 가능성 점검

두 카드 모두 060 CODC(HY OAS–WTI 괴리)가 공통 필수 입력이다. 이전 공식 FRED CSV 수집은 연결 재설정으로 2회 실패했다. 이번에는 공개 DBnomics 미러에서 `FRED/BAMLH0A0HYM2`를 수집하려 했으나 HTTP `404`였다.

| 카드 | 필수 입력 | 5분 실행 결과 |
| --- | --- | --- |
| 061 | 041 EIA 정유가동률 + 060 CODC | 060 HY OAS 원시시계열 부재 → 이진 게이트 자체를 계산할 수 없음 |
| 062 | 059 공개시점 산업재고속도 + 060 CODC | 059 실제 ISM/Census 이벤트 패널 및 060 HY OAS 모두 부재 → 계산 불가 |

## 결론

**실제 상관·표본·p값·성과는 0건이다.** 041의 기존 MPC 결과를 061의 부분 결과로, 059의 가설을 062의 프록시로 쓰지 않았다. 대체 신용 ETF·난수 데모·사후 선택 스프레드를 넣으면 ‘둘 다 test했다’는 말이 거짓이 된다.

## 최소 재개 입력

1. `BAMLH0A0HYM2`의 재현 가능한 원시 CSV 또는 FRED API 응답
2. 062용 ISM·Census의 실제 공개일 월간 패널
3. 그 뒤에만 사전 등록한 이진 게이트와 MPC/RBOB/XLE 비중첩 RV를 계산
