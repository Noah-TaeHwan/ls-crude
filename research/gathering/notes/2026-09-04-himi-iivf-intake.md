# 059 HIMI-IIVF — ISM–Inventory Velocity Factor 등록

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 상태 | HOLD — 코드 감사·공개 소스 검증만, 가격 결합·IS/OOS 미실행 |
| 이름 | HIMI-IIVF (HIMI ISM–Inventory Velocity Factor) |

## 확인한 공식 사실

- ISM Manufacturing PMI 보고서는 다음 달 첫 영업일 10:00 ET에 공개된다. 월말+2일 상수보다 실제 캘린더가 우선이다.
- Census Manufacturing and Trade Inventories and Sales는 기준월 종료 약 6주 뒤 공개된다. 따라서 `inv_lag_days=15`는 point-in-time 안전하지 않다.
- `AMTMIS`의 실제 정의·제조업 전용 여부·FRED 현행값의 수정 빈티지는 수집 전에 다시 확인한다.

## 데이터 경계

공개 ISM 구성요소와 Census/FRED의 재고/판매 집계만 쓴다. 기업 주문서·공급업체 위치·개별 재고·고객 데이터를 수집하지 않는다. 원시 응답과 계산 패널은 수집 시 gitignored `gathering/raw/2026-09-04-himi-iivf/`에만 보관한다.

## 실행 전 수정

1. 실제 ISM 발표일을 이벤트 날짜로 사용한다.
2. 재고/판매 데이터는 실제 Census 공개일 또는 기준월 말+45일 뒤에만 사용한다.
3. 월간 공개 이벤트 한 행으로만 미래 RV를 평가한다.
4. ISM 구성요소의 무료 역사·라이선스·current-revised 한계를 먼저 기록한다.

이 조건이 충족되기 전에는 v22의 난수 demo, 일별 forward-fill, HAC t 또는 OOS R²를 보고하지 않는다.
