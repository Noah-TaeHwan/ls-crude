# 085 Watermelon Reefer Squeeze — 공개 분기 프록시 검정

**실행일**: 2026-09-07  
**판정**: **분기 프록시 미채택; 주간 본신호 HOLD**

## 목적

수박 출하 급증이 미국 냉장 트럭 병목을 만들고 난방유/ULSD 성격의 선물 변동성에 연결되는지를 탐색했다. 본 검정은 주간 트럭 부족도 대신 공개 XLS의 분기 수박 적재량을 사용한 예비 프록시다.

## 입력과 정보시점

- 공식 원본: USDA AMS Quarterly Shipment Volumes by Origin and Commodity XLS.
- 수박 행 993개를 분기별로 합산했다.
- 범위: 2000Q1~2026Q1, 105개 분기.
- 신호: 수박 분기 톤수의 YoY를 20분기 rolling z-score로 표준화했다.
- 최초 과거 release timestamp는 제공되지 않아, 관측 분기말 뒤 90일을 보수적 정보가능일로 사용했다.
- 가격: Yahoo 연속선물 HO=F. 그 다음 21거래일 수익률과 연율화 RV를 계산했다.
- IS/OOS: 정보가능일 기준 2015–2023 / 2024+.

## 결과

| 타깃 | IS Pearson r (n) | OOS Pearson r (n) | 판정 |
| --- | ---: | ---: | --- |
| HO=F 다음 21거래일 수익률 | +0.073 (80) | +0.465 (7) | OOS가 7분기뿐이고 IS가 약하다. 채택 불가 |
| HO=F 다음 21거래일 RV | -0.103 (80) | -0.214 (7) | 낮은 표본과 불안정한 관계. 채택 불가 |

## 결론

분기 수박 적재량 프록시로는 유의미한 HO 알파를 주장할 수 없다. 양의 OOS 수익률 값은 7분기에서만 나타난 발견값이며 채택하지 않는다.

주간 watermelon truck availability shortage 비중은 다른 입력이다. 그 데이터는 USDA My Market News의 무료 API 키, 장기 원시 응답과 실제 release timestamp를 확보한 뒤 별도 사전 고정 검정으로 다뤄야 한다. 공개 XLS의 현재 빈티지와 90일 지연은 그 본신호의 대체물이 아니다.

원시 XLS, 가격, 패널, 재현 코드는 gitignored research/gathering/raw/2026-09-07-watermelon-reefer/에 있다.
