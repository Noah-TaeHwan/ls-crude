# 088 — Borderline Diesel Index (BDI)

**상태**: ⏸️ **HOLD — 무료 월간 국경 트럭 프록시는 재현 가능한 신호가 아님**  
**가중치**: 0.0

> “The border moves trucks; it does not yet move diesel futures first.”

## 가설

미국-멕시코 및 미국-캐나다 국경의 트럭 통과량이 비정상적으로 변하면 북미 실물 물류와 ULSD 수요·재고 긴장도가 바뀌고, 이후 난방유 HO=F 수익률 또는 변동성에 반영될 수 있다.

국경 트럭 흐름 surprise → 북미 육상 물류 압력 → ULSD/HO 레짐

## 검정 사양 — 2026-09-07

| 항목 | 사양 |
| --- | --- |
| 입력 | BTS Border Crossing/Entry Data의 모든 항구 미국 입국 트럭 crossing count |
| 신호 | 캐나다·멕시코·합계의 12개월 YoY, 그리고 YoY의 36개월 z-score. Mexico−Canada YoY 차이도 사전 병렬 점검 |
| 공개시점 | 월말 + 6개월. BTS의 검증·공개 지연을 보수적으로 반영 |
| 타깃 | Yahoo HO=F 이후 21거래일 로그수익률과 연율화 실현변동성 |
| 표본 | IS 2015–2023, OOS 2024+ |

## 결과

| 신호 → 다음 21일 HO=F | IS 2015–2023 | OOS 2024+ | 판정 |
| --- | ---: | ---: | --- |
| 총 트럭 YoY → 수익률 | -0.136, n=108, p=.160 | -0.282, n=27, p=.155 | 비유의 |
| 총 트럭 YoY → RV | +0.066, n=108, p=.500 | -0.275, n=27, p=.165 | 부호 반전 |
| 캐나다 트럭 YoY → RV | +0.087, n=108, p=.368 | -0.384, n=27, p=.048 | OOS 단독값; IS 재현 실패 |
| 멕시코−캐나다 YoY → RV | -0.096, n=108, p=.323 | +0.355, n=27, p=.069 | 방향 불안정 |

## 멕시코 정제마진 레그

PEMEX가 공개하는 월간 원유 처리량은 정제마진이 아니다. 무료 장기·월간·공개시점이 확인된 멕시코 정제마진 시계열을 확보하지 못했으므로, 처리량을 마진으로 바꾸거나 억지 확인 레그로 사용하지 않았다.

## 판정

**HOLD.** OOS에서 캐나다 트럭량과 HO 변동성의 음의 관계가 한 번 보였으나, IS에서 같은 방향·관계가 없다. 여러 병렬 신호 중 하나를 사후 채택할 수 없으며, 이 무료 월간 버전에는 거래 신호가 없다.

## 데이터 경계

- 이 데이터는 미국 **입국** truck crossings이며 고유 차량·화물중량·디젤 구매량이 아니다.
- 월간·지연 공개라 단기 공급 충격의 선행 지표가 되기 어렵다.
- 원시 응답·파생 패널·재실행 스크립트는 gitignored research/gathering/raw/2026-09-07-borderline-diesel/에 보관한다.

## 출처

- [BTS Border Crossing/Entry Data](https://www.bts.gov/explore-topics-and-geography/geography/border-crossingentry-data)
- [PEMEX 월간 원유 처리량](https://ebdi.pemex.com/bdi/bdiController.do?action=cuadro&cvecua=DAPRCCREF)
- [검정 기록](../../reports/2026-09-07-borderline-diesel-test.md)
