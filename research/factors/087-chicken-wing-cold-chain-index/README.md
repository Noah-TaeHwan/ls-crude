# 087 — Chicken Wing Cold-Chain Index (CWCI)

**상태**: ❌ **REJECTED — 공개 주간 복합 신호가 HO 변동성과 무관**
**가중치**: 0.0

> “When wings freeze, diesel does not necessarily fly.”

## 가설

미국의 젊은 닭 도계량 증가와 냉동 기타 가금 재고 감소가 동시에 나타나면, 도계·냉동·창고·트럭 이동이 강해진 냉장물류 압력일 수 있다. 이 압력이 난방유/ULSD의 향후 단기 변동성으로 이어지는지를 묻는다.

도계 surprise + 냉동재고 감소 → cold-chain 운영 압력 → HO 변동성

## 고정 검정 사양 — 2026-09-07

| 항목 | 사양 |
| --- | --- |
| 도계 입력 | USDA AMS 주간 연방검사 Young Chickens 도계 head |
| 재고 입력 | USDA AMS Weekly Poultry & Egg Cold Storage의 Processed Other Poultry |
| 복합 신호 | 각각의 전주 변화율을 52주 z-score로 표준화한 뒤, 도계 z와 재고감소 z의 동일가중 평균 |
| 공개시점 | 도계 보고일 다음 미국 거래일. 재고는 보수적으로 재고 관측일보다 7일 뒤부터만 사용 |
| 1차 타깃 | Yahoo 연속선물 HO=F의 이후 5거래일 연율화 실현변동성 |
| 보조 타깃 | 같은 창의 HO 수익률 |
| 실제 적격 범위 | 2019–2023 IS, 2024–2025 OOS. 2015–2018의 주간 point-in-time 원문 연속성이 없어 표준 IS와 다름 |

## 결과

| 신호 → 이후 HO=F | IS 2019–2023 | OOS 2024–2025 | 판정 |
| --- | ---: | ---: | --- |
| 5일 실현변동성 | -0.063, n=185, p=.397 | -0.179, n=87, p=.097 | 가설 방향과 다르고 유의하지 않음 |
| 5일 수익률 | +0.094, n=185, p=.206 | +0.106, n=87, p=.327 | 작고 유의하지 않음 |

## 판정

**기각.** 두 구간 모두 의미 있는 양의 변동성 관계가 없다. OOS RV의 음수값은 사후적으로 반대 포지션을 채택할 근거가 아니며, 표준 2015–2023 IS를 충족하지 못하므로 거래 가중치는 0.0이다.

## 데이터 경계

- Processed Other Poultry는 닭날개만이 아니라 broiler, fryer, hen, 기타 냉동 닭·오리를 포함하는 선택 냉동센터 집계다.
- 도계·냉동재고는 실제 디젤 갤런, 냉장트럭 운행, 장거리 운송을 측정하지 않는다.
- 2015–2018 연간 요약본을 그 시점에 이용 가능한 주간 신호로 쓰면 look-ahead가 되므로 검정에서 제외했다.
- 원시 USDA 원문·가격·파생 패널·재실행 코드는 gitignored research/gathering/raw/2026-09-07-chicken-wing-cold-chain/에 보관한다.

## 출처

- [USDA AMS Chicken Market News Reports](https://www.ams.usda.gov/market-news/chicken-market-news-reports)
- [USDA ESMIS weekly poultry slaughter archive](https://esmis.nal.usda.gov/publication/misc-poultry-weekly-poultry-slaughtered-under-federal-inspection-thu)
- [USDA ESMIS weekly poultry cold-storage archive](https://esmis.nal.usda.gov/publication/weekly-poultry-egg-cold-storage-holdings-us)
- [검정 기록](../../reports/2026-09-07-chicken-wing-cold-chain-test.md)

