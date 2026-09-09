# 085 — Watermelon Reefer Squeeze Index (WRSI)

**상태**: ⏸️ **HOLD / quarterly proxy rejected; weekly core signal untested**
**가중치**: 0.0

> “When watermelons take the reefers, diesel gets crowded.”

## 가설

수박 가격을 보는 것이 아니다. 수박은 중량과 부피가 크고 여름에 집중 출하되는 신선 농산물이다. 예상보다 많은 수박이 출하되어 냉장 트럭이 부족해지면 실제 도로 운송과 냉장 물류의 병목이 생길 수 있다.

수박 출하 surprise → 냉장 트럭 부족과 운임 압력 → 디젤 물류 압력 → HO/ULSD 변동성

WTI 방향을 예측한다고 주장하지 않는다. 1차 타깃은 난방유 연속선물 HO=F의 향후 변동성이고 RBOB은 보조 타깃이다.

## 078과의 차이

078은 한국의 차종별 도로 통행과 항만 처리라는 넓은 산업 흐름이다. 085는 미국 USDA의 상품·출하지 단위 냉장차 병목을 본다. 원인은 일반 경기나 항만이 아니라 수박 출하가 reefer capacity를 선점하는가다.

## 사전 등록 사양

| 항목 | 동결 사양 |
| --- | --- |
| 본신호 | USDA AMS Weekly Truck Availability에서 watermelon 출하지의 shortage(4~5) 비중 52주 z-score |
| 확인 입력 | USDA AMS Quarterly Shipment Volumes에서 watermelon refrigerated shipment tonnage |
| 정보 가능일 | USDA 보고서 또는 API의 실제 release timestamp 다음 미국 영업일 |
| 1차 타깃 | 다음 5거래일 HO=F 연율화 실현변동성 |
| 2차 타깃 | 다음 5거래일 RBOB RB=F 연율화 실현변동성 |
| IS/OOS | 사양 동결 후 IS 2015–2023, OOS 2024+ 단 한 번 |

## 공개 XLS 분기 프록시 예비검정 — 2026-09-07

당시에는 주간 availability API 경로를 키 미확보로 사용하지 못했다(2026-09-08 공개 XLSX 후속은 아래 참조). 대신 공개 XLS의 수박 분기 refrigerated shipment tons를 별도 예비 프록시로만 검정했다. 이는 본신호를 대체하지 않는다.

- 표본: 2000Q1~2026Q1, 수박 행 993개를 분기 합산.
- 신호: 전년동기 대비 분기 톤수의 20분기 rolling z-score.
- 지연: 과거 최초 공개시점을 복원하지 못해 분기말 뒤 90일을 보수적으로 적용.
- 타깃: 다음 21거래일 HO=F 수익률 및 연율화 실현변동성.

| 분기 프록시 ↔ 이후 HO=F | IS | OOS | 판정 |
| --- | ---: | ---: | --- |
| 다음 21거래일 수익률 | +0.073 (n=80) | +0.465 (n=7) | IS가 약하고 OOS가 7분기뿐. 채택 불가 |
| 다음 21거래일 RV | -0.103 (n=80) | -0.214 (n=7) | 작고 불안정한 표본. 채택 불가 |

**판정**: 공개 분기 수박 물량 프록시는 HO 알파를 뒷받침하지 못했다. 그러나 주간 shortage 본신호와 측정 대상·빈도가 다르므로 085 전체는 HOLD로 둔다. 주간 패널·최초 공개시점·계절 통제를 확보한 후에만 본 검정을 할 수 있다.

## 데이터 경계

USDA는 모든 상품·출하지의 움직임을 완전하게 포착한 수치가 아니라고 명시한다. 수박 출하를 전국 디젤 수요 또는 WTI 방향으로 외삽하지 않는다. 트럭 부족은 날씨·수확량·운전자·국경 흐름의 영향도 받는다.

원시 XLS·가격·패널·재실행 코드는 gitignored research/gathering/raw/2026-09-07-watermelon-reefer/에 보관한다.

## 출처

- [USDA Agricultural Refrigerated Truck Quarterly datasets](https://www.ams.usda.gov/services/transportation-analysis/agricultural-refrigerated-truck-quarterly-datasets)
- [USDA Specialty Crops / My Market News](https://mymarketnews.ams.usda.gov/general-resources/Specialty-Crops)
- [USDA National Truck Rate Report](https://mymarketnews.ams.usda.gov/viewReport/2375)

## 2026-09-08 — 주간 본입력 수집 후속

[ALT-20260907-36 실제 수집·그림·대사](../../indexes/ALT-20260907-36/20260908T065043Z/README.md): USDA 공식 무료 주간 XLSX를 키 없이 확보했다. **repo empirical only:** 수박 단독 518행/409개 날짜, 혼합 작물 행은 제외했다. 소수값을 반올림하지 않은 관측표를 구성했으며 마지막 수박 Date는 2025-10-14다. 원본 전체 마지막 날짜 2026-03-31과 구분한다.

기존 분기 프록시 기각·가중치 0.0·HOLD를 유지한다. 소수 집계 방식과 최초 공개시점이 미확인이라 **52주 z-score와 새로운 HO/WTI 검정은 미실행**이다. 현 차단은 API 키가 아니라 자료의 정의·시점이며, 성찬님의 다음 검토는 같은 날짜·출하지 원보고서 대조다.
