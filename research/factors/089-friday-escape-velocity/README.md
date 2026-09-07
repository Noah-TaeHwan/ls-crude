# 089 — Friday Escape Velocity (FEV)

**상태**: ⏸️ **HOLD — 무료 월간 항공 프록시는 Friday 효과를 관측하지 못하며 IS/OOS가 불일치**  
**가중치**: 0.0

> “The airport sees the escape after the market has already left.”

## 가설

금요일·주말·휴가철 직전의 항공 탈출 수요가 비정상적으로 늘면 제트연료 수요와 휘발유 레저수요 기대가 바뀌고, HO 또는 RBOB의 단기 변동성에 영향을 줄 수 있다.

Friday/weekend escape surprise → jet fuel·leisure demand pressure → HO/RBOB regime

## 무료 데이터 검정의 한계

BTS T-100은 월간 여객·항공화물·출발편 집계다. 무료 장기 패널에서 금요일 탑승객 또는 주말 화물만 분리한 값은 확보하지 못했다. 따라서 이 검정은 Friday 효과 자체가 아니라 월간 escape-demand 프록시의 반증이다.

## 고정 검정 사양 — 2026-09-07

| 항목 | 사양 |
| --- | --- |
| 입력 | BTS T-100 월간 passengers, freight pounds, departures |
| 신호 | 각 12개월 YoY 및 세 지표 동가중 Escape Composite |
| 공개시점 | 월말 + 3개월 보수 지연 |
| 타깃 | Yahoo HO=F, RB=F 이후 21거래일 수익률과 연율화 RV |
| 표본 | IS 2015–2023, OOS 2024+ |

## 결과

| 신호 → 이후 21일 | IS HO RV | OOS HO RV | IS RBOB RV | OOS RBOB RV |
| --- | ---: | ---: | ---: | ---: |
| 여객 YoY | +0.057, n=105, p=.565 | -0.476, n=27, p=.012 | +0.007, p=.942 | -0.245, p=.218 |
| 항공화물 YoY | -0.222, p=.023 | -0.526, p=.005 | -0.176, p=.073 | -0.215, p=.282 |
| 출발편 YoY | +0.131, p=.182 | -0.486, p=.010 | +0.045, p=.646 | -0.279, p=.159 |
| Escape Composite | +0.061, p=.535 | -0.567, p=.002 | +0.007, p=.947 | -0.273, p=.168 |

## 판정

**HOLD.** OOS HO 변동성 값은 강하지만 IS에 같은 관계가 없다. 특히 여객·출발편·복합지수의 부호가 바뀌었고, 2024+ 표본은 27개월이다. 항공 정상화·사후 선택 위험을 분리할 수 없으므로 알파로 등록하지 않는다.

## 데이터 경계

- 월간 T-100은 Friday·주말 승객, 휴가 목적, 연료 구매량을 직접 측정하지 않는다.
- T-100은 개정되며 월간 관측치가 수개월 뒤 공개된다.
- 원시 응답·파생 패널·재실행 스크립트는 gitignored research/gathering/raw/2026-09-07-friday-escape-velocity/에 보관한다.

## 출처

- [BTS T-100 database](https://www.transtats.bts.gov/DatabaseInfo.asp?QO_VQ=EEE)
- [BTS T-100 release information](https://www.transtats.bts.gov/releaseinfo.asp)
- [검정 기록](../../reports/2026-09-07-friday-escape-velocity-test.md)
