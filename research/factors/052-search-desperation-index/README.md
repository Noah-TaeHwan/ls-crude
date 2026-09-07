# 052 — Search Desperation Index (SDI)

**상태**: ⏸️ **HOLD — 실제 장기 Google Trends 원본 CSV 미제공, 수치 미검정**  
**가설**: 미국 소비자의 에너지·생활비 절약 검색이 급등하면 원유 가격 방향이 아니라 이후 WTI·RBOB 변동성 레짐과 약하게 연결될 수 있다.  
**가중치**: `0.0`

## 고정 입력

Google Trends UI에서 **한 번의 통합 요청**으로 받은 미국 주간 CSV만 허용한다. 키워드는 아래 다섯 개로 고정한다.

1. `how to live without a car`
2. `cheapest heating methods`
3. `gas prices near me`
4. `public transit routes`
5. `space heater efficiency`

CSV는 `Date`와 다섯 검색열을 포함하고, 최소 2014-01-01부터 있어야 한다. 2015년 초 52주 롤링 기준창을 확보하기 위해서다. UI 조회일·국가(US)·기간·열 이름·파일 해시를 함께 보관하고, 원본은 gitignored `gathering/raw/`에만 둔다.

## 검정 사양

- 각 검색열을 52주 롤링 z-score로 변환한다.
- PCA와 SDI 표준화 평균·표준편차는 **IS 2015–2023에서만** fit하고 OOS에는 transform만 한다.
- 주간 Google 값은 기간 종료 뒤 최소 7일 후 이용 가능하다고 보수적으로 가정한다. 실제 역사 공개 빈티지는 복원되지 않아 이 가정은 완전한 as-of 증명이 아니다.
- 타깃은 Yahoo `CL=F`와 `RB=F`의 다음 5·20거래일 실현변동성 `sqrt(sum(next returns²))`이다.
- 5일 타깃은 주 1회 공개 시점 관측으로 평가한다. 20일 타깃은 4주 간격 비중첩 표본 또는 HAC/블록 부트스트랩으로 겹침을 보정한다.
- IS의 **유일한 선택 타깃**은 WTI 20일 변동성이다. 임계값 후보 `1.00, 1.25, 1.50, 1.75, 2.00` 중 하나를 IS에서만 고르고, RBOB·5일 결과는 확인용으로 분리한다. 고스트레스 관측 수와 p값을 함께 보고한다.
- 기준을 동결한 뒤 OOS 2024+는 한 번만 연다.

## 현재 판정

사용자가 제공한 V3 스크립트는 합성 fallback 제거, 7일 지연, IS 전용 PCA라는 점은 올바른 방향이다. 다만 Google Trends 장기 CSV가 저장소에 없으므로 실행 결과를 만들지 않았다. 또한 ‘주간 리샘플링만으로 20일 미래 변동성의 겹침이 제거된다’는 주장은 맞지 않아, 위 비중첩/HAC 규칙으로 수정해 기록한다.

공개 UI의 현재 다운로드는 과거 당시의 검색값 빈티지를 보장하지 않고 재추출 오차가 있을 수 있다. 따라서 실제 수치가 나오더라도 단일 시점의 탐색 결과로만 보고하며, 원유 가격 방향·거래 알파로 주장하지 않는다.

## 데이터·재현

- Google Trends 공개 UI: 장기 연구 API·재배포·역사 빈티지 안정성은 미확인.
- Yahoo Finance `CL=F`, `RB=F`: 원본 OHLCV는 gitignored.
- 원본 CSV가 제공될 때까지 052는 수집 명세만 가진 HOLD 카드다.

## 052W — Household Panic Wiki (Google Trends 대체 후보)

Google Trends 원본을 억지로 재추출하지 않는 별도 공개 대체재다. 고정 문서는 `Recession`, `Unemployment`, `Bankruptcy`, `Inflation`, `Gasoline`, `Fuel_tax`, `Food_insecurity`이며, 각 문서 90일 z-score의 동일가중 평균을 사용한다.

Wikipedia는 실제 검색·구매·절약 행동이 아니므로 원 052와 동일시하지 않는다. D+1 정렬 뒤 월 1회 관측으로 WTI/RBOB 다음 20거래일 변동성을 주 타깃으로 시험한다. 임계값은 IS에서만 고정하며 현재 **미검정**이다.
