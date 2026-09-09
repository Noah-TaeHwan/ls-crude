# 093 — Iran Food Stress Proxy × Cushing Tightness: 1차 실행

**판정: FOOD-PROXY FAIL / 계란 가설은 계속 HOLD.**

## 실제 수집

| 입력 | 원문 | 확보 범위 | 이번 사용 |
| --- | --- | --- | --- |
| Iran food CPI | [Iran Economic Data가 연결한 SCI 월별 CPI CSV](https://www.iraneconomicdata.com/inflation) | 141개월, 2011-04~2022-12 | `food_beverage_cpi` YoY. **계란 가격이 아님.** |
| Cushing stocks | [EIA 주간 Cushing crude stocks XLS](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL) | 1,169주 | 52주 z-score ≤ -1을 저재고 조건으로 사용 |
| WTI | 프로젝트의 `research/data/clf-daily-2015-2026.csv` | 2015-01~2023-12 인샘플 | 신호 이용 가능일 이후 21거래일 실현변동성 |

원문 파일은 `research/gathering/raw/ALT-20260908-93/20260908T144631Z/`에
수집·SHA-256 영수증과 함께 보관한다. 원문은 재배포하지 않는다.

## 고정한 탐색 사양

- SCI 월별 값은 월말 뒤 **45일**에 이용 가능하다고 보수적으로 가정했다. 실제
  역사 공표시각은 아직 복원하지 못했다.
- EIA 재고는 주 종료 뒤 5일에 이용 가능하다고 가정했다.
- Iran food YoY shock은 과거값만 쓰는 expanding 80분위 이상으로 정의했다.
- 쿠싱 tightness는 52주 재고 z-score `≤ -1.0`이다.
- 2020년 4월의 음수 `CL=F` 가격을 포함하는 21일 horizon은 로그수익률 정의가
  불가능하므로 통째로 제외했다.

## 결과 — 인샘플만

| 관계 / 그룹 | n | 다음 21거래일 WTI RV 평균 | 결과 |
| --- | ---: | ---: | --- |
| Food CPI YoY × 이후 RV21 Pearson r | 97 | — | **-0.0219** |
| Food shock × Cushing tightness 아님 | 88 | 0.3912 | 기준 |
| Food shock × Cushing tightness 동시 | 9 | 0.3177 | 기준보다 낮음 |

이번 가능한 공개 **식품 CPI 프록시**에서는 예상한 변동성 확대가 나오지 않았다.
표본도 9개월뿐이고 OOS가 없으므로 유의성·알파·반대 인과성을 주장하지 않는다.

## 남은 계란 가설의 재개 조건

1. 2017년 이후 SCI **월별 계란 가격/지수 원문 전체**와 당시 공표일을 확보한다.
2. 독립 이란 FX 시계열의 라이선스·빈티지·공개시점을 고정한다.
3. 계란 shock만, 쿠싱만, 결합 gate를 2015–2023에서 사전 명세로 다시 검정한다.
4. 그 뒤 2024+ OOS를 한 번만 연다.

생성물: [정렬 패널](food_proxy_cushing_wti_is.csv),
[결과 영수증](summary.json), [시각화](food_proxy_cushing_gate.svg).
