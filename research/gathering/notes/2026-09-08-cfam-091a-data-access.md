# CFAM 091-A — 숙박세·트럭 자료 접근 기록

**수집 단계**: E1 접근·실제 표본 확인. 이 기록은 가격·재고 상관 검정이나 복합지수 실행이 아니다.

## 1. City of Cushing Hotel/Motel Tax

- 공식 [2025-11-17 City Manager Agenda](https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf)의 Hotel/Motel Tax 표에서 FY 2022/23, 2023/24, 2024/25의 월별 비교 행을 확인했다. 겹치는 비교표를 합치면 **서로 다른 36개월**의 월별 세액 경로가 확인된다.
- 공식 [도시 의제 아카이브](https://www.cityofcushing.com/node/14/agenda)는 2017년부터 연도별 회의·첨부 PDF로 연결된다. 따라서 60개월을 만들 수 있는 **후보 경로**는 생겼지만, 과거 PDF에서 전월·세금월·게시시각을 실제 추출·검수하기 전에는 60개월 확보로 선언하지 않는다.
- [호텔세 조례](https://ecode360.com/48283511)는 과세 기반을 호텔 객실 대여의 총수입으로 설명한다. 이 입력은 도시 단위 숙박 과세수입이며 객실점유율, 방문 목적, 석유 노동자 수를 관측하지 않는다.

## 2. ODOT AADT / truck fields

- 공식 [ODOT Traffic Engineering](https://oklahoma.gov/odot/programs-and-projects/projects/traffic-engineering.html)은 AADT 교통량 자료를 안내한다.
- 공개 [ODOT AADT Network 레이어](https://services6.arcgis.com/RBtoEUQ2lmN0K3GY/arcgis/rest/services/AADT_Network/FeatureServer/layers)는 `ROUTE_ID`, 구간 측정값, `AADT_YEAR`, `AADT`, `PREVIOUS_AADT`, `PERCENT_SU`, `PERCENT_COMBO` 필드를 공개한다.
- 2026-09-08에 쿠싱 인근 반경 조회로 실제 행을 확인했다. 한 **후보** 도로 행은 2023 AADT 9,300, 단일 트럭 10%, 복합 트럭 7%였다. 후보 선택은 아직 동결하지 않았다.
- 이 서비스의 최종 편집일은 2024-08-28이며 현재/직전 값 위주다. 이는 장기 고정구간 트럭 시계열, 연속 계측소 원시자료, 당시 공개 빈티지를 뜻하지 않는다.
- ODOT의 [Permanent Traffic Count Program](https://oklahoma.gov/content/dam/ok/en/odot/programs-and-projects/programs/office-of-research-and-implementation/research/FINAL%20FFY%202026%20SPR%20Work%20Plan.pdf)은 영구 AVC·레이더 지점에서 15분·시간 단위 자료를 수집한다고 설명한다. 그러나 쿠싱 인근 대상 관측소와 공개 장기 파일은 이 기록에서 확인하지 못했다.

## 판정

091-A는 **PARK / E1** 유지다. 숙박세 쪽은 60개월 원문 복원 작업으로, 트럭 쪽은 사전 고정 세그먼트와 장기 관측소 파일 탐색으로 다음 단계를 나눠 진행한다. 둘 중 하나라도 결측이면 조합·점수화·가격 검정으로 넘어가지 않는다.
