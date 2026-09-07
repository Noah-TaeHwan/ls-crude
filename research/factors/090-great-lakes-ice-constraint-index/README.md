# 090 — Great Lakes Ice Constraint Index (GLICI)

**상태**: ⏸️ **HOLD — 물류 레짐 모니터 후보, 검증된 HO 알파는 아님**  
**가중치**: 0.0

> “When the lakes freeze, the Midwest holds its breath.”

## 가설

오대호 결빙이 평년보다 강하면 항만·갑문·해상 벌크 운항의 물류 제약이 커질 수 있다. 이 제약은 중서부 난방유/ULSD의 물리적 유통 레짐과 이후 HO 변동성에 연결될 가능성이 있다.

평년 대비 오대호 결빙 이례치 → 해상 물류 제약 → 중서부 diesel/HO 위험 레짐

## 왜 Icebreaker가 아닌 Ice Constraint인가

무료 NOAA 입력은 결빙률이지 쇄빙선의 실제 출동, 연료 사용, 항로 지연 또는 화물량이 아니다. 따라서 카드명은 실제 측정 대상에 맞춰 Great Lakes Ice Constraint Index로 고정한다. 쇄빙선 활동은 후속 확인 레그가 생길 때만 추가한다.

## 고정 검정 사양 — 2026-09-07

| 항목 | 사양 |
| --- | --- |
| 입력 | NOAA GLERL 일별 Great Lakes 전체 및 Lake Erie 결빙률 |
| 고정 평년 | 2008–2014 일별 월-일 평균·표준편차. 2015년 이후 신호에는 이후 데이터가 섞이지 않음 |
| 신호 | 전체 결빙 평년 대비 z-score, Lake Erie 평년 대비 z-score, 7일 결빙 변화 |
| 공개시점 | 표시 관측일 다음 달력일부터만 사용 |
| 표본 | 결빙 영향이 있는 12–4월만. 금요일 신호 → 이후 5개 거래일 HO=F 수익률·연율화 RV로 비중첩 검정 |
| 구간 | IS 2015–2023, OOS 2024+ |

## 핵심 결과 — 비중첩 표본

| 신호 → 다음 5일 HO=F | IS 2015–2023 | OOS 2024+ | 판정 |
| --- | ---: | ---: | --- |
| 전체 결빙 90일 z → RV | -0.103, n=194, p=.154 | -0.228, n=59, p=.083 | 방향은 같으나 유의성 미달 |
| 전체 결빙 평년 이례치 → RV | +0.019, n=196, p=.794 | +0.287, n=59, p=.028 | OOS 단독; 채택 금지 |
| Lake Erie 평년 이례치 → 수익률 | +0.120, n=196, p=.094 | -0.030, n=59, p=.822 | 부호 불안정 |
| 7일 결빙 변화 → RV | -0.027, n=196, p=.708 | -0.038, n=59, p=.775 | 관계 없음 |

## 판정

**HOLD.** 결빙 수준과 이후 HO 변동성 사이의 약한 음의 관계는 양 구간에서 보이지만 통계적으로 충분하지 않다. 평년 이례치의 OOS 양의 값은 IS에서 재현되지 않아 사후 채택할 수 없다.

따라서 090은 겨울 물류·위험 맥락을 설명하는 밈/모니터로 보존한다. 현 시점에서 오일 가격 또는 HO 방향을 예측하는 신호로 쓰지 않는다.

## 다음에만 재개할 검정

1. U.S. Coast Guard icebreaking operation day 또는 항로 개방·폐쇄 기록.
2. St. Lawrence Seaway/Great Lakes lock delay·대기·화물량의 point-in-time 공개 패널.
3. 전국 HO가 아니라 중서부 ULSD 현물 스프레드·Great Lakes 벌크 운임·곡물 basis 같은 더 직접적인 타깃.

## 출처

- [NOAA GLERL Great Lakes ice cover](https://www.glerl.noaa.gov/data/ice/index.html)
- [NOAA GLERL daily ice concentration ERDDAP](https://apps.glerl.noaa.gov/erddap/info/glerlIce/index.html)
- [검정 기록](../../reports/2026-09-07-great-lakes-ice-constraint-test.md)
