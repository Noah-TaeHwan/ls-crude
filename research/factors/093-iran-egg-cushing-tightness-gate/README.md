# 093 — Iran Egg Stress × Cushing Tightness Gate

**상태: HOLD — 계란 원자료는 미확보. 실제 공개 food-CPI 대체 검정은 미통과, 거래 가중치 0.0.**

> “이란의 달걀이 비싸고 쿠싱이 타이트하면, 시장은 평소보다 더 예민한가?”

## 질문을 올바르게 고정하기

이란의 계란 가격은 WTI 원유 수요나 쿠싱의 실제 작업량을 직접 측정하지
않는다. 계란 가격 급등은 현지 식품 인플레이션, 사료·수입비, 환율, 보조금과
국내 구매력 압력의 복합 결과다. 따라서 단독 가격 방향 신호로 쓰지 않는다.

검정할 가설은 아래의 **동시 조건부 위험 레짐** 하나다.

```text
Iran egg-price inflation shock
AND Iranian FX / purchasing-power stress
AND Cushing is physically/financially tight
→ next WTI 5d / 20d realized volatility or upper-tail return is elevated?
```

쿠싱 조건은 저재고 또는 검증된 WTI M1–M2 prompt tightness여야 한다. 이란
국내 스트레스가 존재하더라도, 미국 delivery-point 조건이 느슨하면 점수를
만들지 않는다.

## 현재 확인된 자료와 경계

| 블록 | 현재 후보 | 상태 | 제한 |
| --- | --- | --- |
| 이란 계란 | [Iran Open Data의 SCI 월별 도시 식품가격 분석](https://iranopendata.org/en/article/340-Iran_food_inflation_oil_chicken_eggs/) | **부분가능** | 2017년 이후 지수 분석이 확인됐지만, 원 SCI 계란 시계열의 재현 가능한 CSV·최초 공표일은 아직 확보하지 않았다. 지수는 소매 리알 가격이 아니다. |
| 이란 FX | 공식/재현 가능한 월·주 단위 환율 시계열 | **PARK** | 계란 자체와 환율을 분리하지 않으면 같은 국내 인플레를 두 번 세는 오류가 생긴다. 라이선스·빈티지 확인 전 수집하지 않는다. |
| 쿠싱 재고 | [EIA 주간 Cushing commercial crude stocks](https://www.eia.gov/dnav/pet/pet_stoc_wstk_a_epc0_sax_mbbl_w.htm) | **가능** | 주간 발표 시각 뒤에만 사용한다. 전국 재고나 WTI 가격으로 대체하지 않는다. |
| prompt tightness | [091-X2 WMCSI](../091-cushing-motel-lights-index/subtracks/wmcsi/README.md) | **PARK** | 검증된 M1/M2 일별 롤링 결제 패널이 아직 없다. `CL=F` 단독으로 만들지 않는다. |
| 타깃 | Yahoo Finance `CL=F` 다음 5·20 거래일 수익률/실현변동성 | **후속** | 2015–2023에서 사전규칙을 고정하고, 2024+는 한 번만 OOS로 사용한다. |

### 2026-09-08 실제 food-CPI 대체 검정

[실제 원문 영수증·정렬 패널·시각화·결과](../../indexes/ALT-20260908-93/20260908T144631Z/README.md)를
남겼다. Iran Economic Data가 연결한 SCI `food_beverage_cpi` 141개월과 EIA
Cushing 1,169주를 수집해 WTI 인샘플 97개월을 정렬했다. `food_beverage_cpi`는
**계란 가격이 아니다**.

- Food CPI YoY와 이후 21거래일 WTI RV의 Pearson `r=-0.0219`.
- Food shock와 Cushing 저재고가 동시인 9개월의 평균 RV는 `0.3177`, 나머지
  88개월의 `0.3912`보다 낮았다.
- 따라서 현재 가능한 넓은 food-CPI 프록시는 가설을 지지하지 않는다. 계란
  원시계열·공표일·FX를 확보하기 전에는 OOS나 추가 튜닝을 하지 않는다.

## 왜 단순 상관은 금지인가

1. 이란 식품가격과 WTI는 제재·전쟁·리알 약세 같은 같은 사건에 동시 반응할
   가능성이 높다.
2. 계란가격은 월간이고 쿠싱 재고는 주간이므로 일별로 선형 보간하지 않는다.
3. 이란 내 계란 가격상승은 조류질병·사료가격·보조금 개편 같은 원유와 무관한
   국내 충격일 수 있다.
4. 쿠싱 재고와 calendar spread는 이미 알려진 시장 데이터다. 이란 블록이 그
   위에 정보량을 더하는지 조건부 검정으로만 판단한다.

## 사전 고정 검정 계획

- **신호 공개시점:** SCI 공표일, 환율 관측의 실제 공개시점, EIA WPSR 공개시점
  중 가장 늦은 시점 뒤의 다음 WTI 거래일부터만 행동 가능하다.
- **이란 shock:** 계란 월간 YoY 또는 12개월 z-score가 상위 20%인지. 두 정의는
  인샘플 시작 전에 하나로 동결한다.
- **쿠싱 tightness:** 같은 주 EIA 재고가 계절조정 역사 하위 20%인지. WMCSI가
  재개되면 사전 지정한 양(+) z-score만 보조 확인으로 쓴다.
- **타깃:** 다음 5일과 20일의 WTI 실현변동성 및 상방 95% tail event. 가격 방향을
  사후 선택하지 않는다.
- **비교군:** (a) 계란 shock만, (b) 쿠싱 tightness만, (c) 둘 다 없는 달. 조건부
  효과가 두 단독 블록보다 반복적으로 커야 다음 단계로 간다.
- **판정:** 표본 수, 효과크기, 신뢰구간, IS/OOS 부호를 모두 보고한다. 양의 결과가
  나와도 이란 정치·수출 의도나 미래 원유 공급을 추론하지 않는다.

## 재개 조건

1. SCI 또는 허용된 재배포 경로에서 월별 계란 지수 원문과 공표일을 확보한다.
2. 독립 FX 계열의 라이선스·빈티지·공개시점을 확인한다.
3. 091-X2의 M1/M2 패널을 확보하거나, 재고만 쓰는 축소 사양을 명시적으로
   동결한다.
4. 그 뒤에만 실제 인샘플·아웃샘플 검정을 한다.

현재 카드는 아이디어와 데이터 경계를 보존하는 용도이며, 알파·인과성·거래
적합성을 주장하지 않는다.
