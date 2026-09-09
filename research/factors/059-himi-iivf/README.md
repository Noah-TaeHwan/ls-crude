# 059 — HIMI-IIVF: ISM–Inventory Velocity Factor

**상태**: ⏸️ **HOLD — 인과 가설·무료 후보는 있으나, 실제 공개시점 안전 패널·IS/OOS는 미실행**  
**밈**: *“Orders sprint, inventory stalls: the factory breathes before the barrel hears it.”*  
**가중치**: `0.0`

## 가설

제조업 신규 주문이 공급업체 납기보다 강하고, 재고/판매 비율이 낮아지면 산업 공급망의 수요 압력이 높아질 수 있다. 059는 WTI 방향을 직접 단정하지 않고, 이후 원유·RBOB·정유 체인 변동성의 **산업 수요 레짐 후보**를 찾는다.

```text
ISM new-orders − supplier-deliveries
  + inverse inventories-to-sales ratio
  → industrial momentum / inventory velocity
  → future energy-chain volatility candidate
```

## 공개 입력과 시간 규칙

| 입력 | 역할 | 실제 이용 가능 시점 |
| --- | --- | --- |
| ISM Manufacturing New Orders − Supplier Deliveries | 주문·병목 압력 | ISM 제조업 보고서의 **다음 달 첫 영업일 10:00 ET** 실제 발표 뒤 |
| Census/FRED `AMTMIS` 후보 | 재고/판매의 역방향 속도 | MTIS는 기준월 종료 **약 6주 뒤** 공개. 실제 Census 발표일 또는 최소 월말+45일 뒤 |

`AMTMIS`는 전체 기업 재고/판매 비율일 수 있어 제조업 전용이라고 부르지 않는다. 제조업 전용 M3 ratio로 바꾸려면 동일한 역사·공개일·라이선스를 다시 고정해야 한다.

## 제공 v22 코드 감사

| 점검 | 판정 | 이유 |
| --- | --- | --- |
| ISM lag `+2일` | 수정 필요 | 첫 영업일 10:00 ET의 실제 캘린더를 사용해야 한다. |
| inventory lag `+15일` | **실행 금지** | Census MTIS는 약 6주 지연이므로 미래 정보 누출이다. |
| 월간 z-score | 방향 적절 | 원자료 빈도에서 직전 월만 사용하는 방식은 유지한다. |
| 일별 forward-fill 평가 | 수정 필요 | 월간 신호를 일별로 복제해 겹치는 미래 RV와 상관시키지 않는다. 새 월간 공개 이벤트 한 행만 평가한다. |
| HAC/R² | 보조적 | 이벤트 표본·실제 공개시점이 먼저다. 일별 복제 표본의 HAC t·R²로 알파를 주장하지 않는다. |

## 사전 고정 검정

1. 각 월의 실제 ISM·Census 공개일을 확보한다. 없으면 보수적 지연 규칙을 적용하고 빈티지 한계를 표시한다.
2. 두 성분은 각각 직전 36개 월 관측치만 이용한 z-score로 만든다.
3. Census 공개 이벤트마다 최신 이용 가능한 ISM z-score를 결합한다. 동일가중 합성의 한 행만 생성한다.
4. 해당 공개일보다 엄격히 뒤의 다음 21거래일 WTI·RBOB·정유 체인 RV를 계산한다.
5. 사양은 2015–2023에서 고정하고, 2024+를 한 번만 OOS로 연다.

## 현재 결론

IIVF는 기존 US HIMI보다 **더 직접적인 산업 수요·재고 속도 가설**이다. 그러나 ISM은 널리 알려진 거시 자료이고, 재고 입력의 실제 지연이 길다. 무료 current-revised 시계열과 역사 release vintage를 확보해 위 규칙으로 실행하기 전까지는 관계·알파·거래 규칙을 주장하지 않는다.

수집·코드 감사: [059 등록 노트](../../gathering/notes/2026-09-04-himi-iivf-intake.md).
