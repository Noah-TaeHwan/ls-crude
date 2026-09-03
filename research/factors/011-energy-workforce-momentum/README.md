# 011 — Energy Workforce Momentum Index

**상태**: ⏸️ **HOLD — 공개 고용 단일 프록시는 실제 반증했지만, 원안 4성분은 미복제**
**목적**: WTI `CL=F`의 방향성보다 석유·가스 공급 램프업과 공급 제약의 **중기 레짐**을 관찰한다.
**변동성 기준 (2026-09-03)**: 핵심 4성분은 미검증. BLS 단일 월간 프록시는 이후 21거래일 WTI 실현변동성으로 실제 시험했다.

## 가설

석유·가스 현장의 채용, 장비 사용, 작업허가, 인력 이동이 늘면 생산·서비스 역량이 수주~수개월 뒤 확대될 수 있다. 반대로 노동력 부족·채용 위축은 공급 반응을 제한할 수 있다.

이는 가격 신호가 아니라 **공급 능력의 변화**를 측정하려는 후보이다. “생산 데이터를 몇 주 선행한다”는 것은 아직 검증하지 않은 가설이며 성과 주장으로 쓰지 않는다.

## 제안 점수 (사전등록 초안)

```text
Energy Workforce Momentum = 0–100

Ghost Rig Hiring Signal                 30%
Equipment Rental vs. Headcount Ratio    25%
Cross-Border Permit Velocity             25%
Internal Mobility Ratio                  20%
```

| 점수 | 해석 (검증 전) |
| --- | --- |
| > 70 | 노동 모멘텀 강함. 공급 램프업 가설을 점검 |
| 40–70 | 중립·안정. 변화율을 관찰 |
| < 40 | 노동 스트레스 또는 위축. 공급 제약 가설을 점검 |

이 구간과 가중치는 인샘플 검증 전에 고정한다. 검증 없이 Oil Pizza 가중치에 넣지 않는다.

## 구성요소별 현실성

| 구성 | 의도 | 공개 대안 | 현재 판정 |
| --- | --- | --- | --- |
| Ghost Rig Hiring (30%) | 비활성 리그의 재가동·승무원 채용 | 지역별 리그 수 + 공개·허가된 채용 집계 | 보류: 직무 공고의 역사·라이선스 확인 필요 |
| Rental / Headcount (25%) | 고용보다 장비 수요가 빠른 capex 압력 | 장비대여사 공시·실적발표의 가동률/매출과 고용 통계 | 보류: 분기 빈도·정의 불일치 |
| Permit Velocity (25%) | 국경 간 작업인력 유입 | 국가별 공식 허가·비자 통계 | 보류: 산업·직종별 시계열과 발표시점 미확인 |
| Internal Mobility (20%) | 승진 대 외부채용으로 본 조직 자신감 | 없음 | **제외**: 기업 내부 HR 데이터가 필요 |

## 데이터 원칙

- LinkedIn·구인사이트는 **스크래핑하지 않는다**. 재사용이 허용된 API 또는 라이선스가 명확한 집계 데이터만 검토한다.
- 리그는 선박 AIS로 대체하지 않는다. 고정식·육상 리그의 상태와 AIS는 같은 관측 대상이 아니다.
- 미국은 BLS의 `NAICS 211`(oil and gas extraction) 및 관련 서비스 업종 공개 고용통계, 캐나다는 Statistics Canada의 mining/quarrying/oil and gas 통계를 출발점으로 검토한다.
- UAE·카자흐스탄 등은 공식·재현 가능한 산업별 허가 시계열이 확보되기 전에는 글로벌 합산에 넣지 않는다.

## v0: 공개 자료만 쓸 때

```python
# 발표일 이후 값만 사용. 수치는 예시가 아닌 설계도다.
us_labor = zscore(bls_naics_211_employment_change, 12)
ca_labor = zscore(statcan_oil_gas_support_employment_change, 12)

# 아래 구성요소는 데이터 적격성 확인 전 0으로 채우지 않는다.
eligible_components = [us_labor, ca_labor]
workforce_v0 = mean(eligible_components)

target = future_20d_or_60d_wti_realized_volatility  # Yahoo CL=F
```

v0은 완성된 0–100 지수가 아니다. 역사·라이선스·발표지연이 검증된 구성요소가 최소 2개 이상일 때에만 정규화 점수를 만든다.

## 검증 설계

1. 인샘플 `2015-01-01`~`2023-12-31`에서만 구성요소를 선택한다.
2. 각 통계를 **발표일**로 시프트하고, 실제 기준일로 같은 기간 WTI를 예측하지 않는다.
3. 미래 생산량·리그수·WTI 실현변동성 중 사전등록한 하나의 타깃만 사용한다.
4. 2024년 이후 아웃샘플은 후보·가중치를 확정한 뒤 한 번만 연다.

## 현재 결론

BLS `NAICS 211` 고용의 전월 변화(36개월 z-score)를 관측월 +40일 뒤에만 이용 가능하다고 보수적으로 맞춘 실제 시험은 IS `r=-0.223`, n=108 / OOS `r=-0.047`, n=31이었다. IS는 가설 방향과 반대고 OOS에서 관계가 사라졌다.

**HOLD.** 노동시장은 매력적인 공급 반응 레짐 후보이지만, 원안의 ‘실시간 4성분’은 공개 데이터만으로 복제되지 않는다. 특히 내부 이동·로펌형 비공개 리드·무허가 구인사이트 수집은 제외한다. 수집·재실행 명세는 [COLLECTION.md](COLLECTION.md)에 있다.

## 참고 출처

- [U.S. BLS — Oil and Gas Extraction (NAICS 211)](https://www.bls.gov/iag/Tgs/iag211.htm) — 월별 고용·임금·근로시간 등 공개 통계.
- [U.S. BLS — Oil and Gas Workforce public data](https://www.bls.gov/opub/mlr/2025/article/describing-the-us-oil-and-gas-extraction-workforce-with-public-data.htm) — 추출·시추·지원 업종의 구분과 고용 변동성.
- [Statistics Canada — job vacancies and payroll employment](https://www150.statcan.gc.ca/n1/daily-quotidien/260827/dq260827b-eng.htm) — 산업별 공석·고용 자료의 공개 예시.
