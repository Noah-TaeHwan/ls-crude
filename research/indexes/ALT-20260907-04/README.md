# ALT-20260907-04 — 산식 제안과 접근 영수증

[후보 카드](../../candidates/ALT-20260907-04.md) · [공동 탐색](../../gathering/notes/2026-09-07-activity-proxy-hunt.md). **E1 / PARK / 검정 NOT_RUN**. 자료·가용시점 조건이 충족되기 전에는 숫자를 만들지 않는다.

## 구성 명세

- **활동/WTI 가설**: 가설: 호르무즈 수송량/공급경로 차질의 공개 활동 흔적
- **산식**: A_m=월평균 탱커 통과 척수; I_m=100×ln(A_m/A_(m-12)). 비양수/결측월은 별도 표시하고 로그 지수 제외.
- **단위**: tankers/day; 100×ln 전년동월비
- **지역**: IMF chokepoint6; 고정 해역 집계
- **집계**: UTC 일별 n_tanker를 모든 날이 있는 달에만 평균. 선박 식별자 미수집. capacity_tanker를 원유량으로 대체하지 않음.
- **결측**: 미관측은 0으로 채우지 않음. 역방향 보간·전체기간 표준화 금지. 이상값은 보존·표시하고 원인 검토; 미실행.
- **관측/공개**: 공식 FAQ와 기존 노트: 주간 화요일09:00 ET; 날짜는UTC. 실제 각 배포시각·지연은 따로 필요. 팀채팅2–9일 숫자를 고정 지연으로 사용 금지.
- **빈티지**: 공식 FAQ는 원천·방법·커버리지 개정 가능성을 명시. 현재 API 재구성값으로2019 당시 관측 가능성을 주장하지 않음.
- **기간**: 2015–2020 내부 학습 / 2021–2023 내부 검증, 실제 공통 구간만. 목표 양끝 split 밖이면 purge. 주 검정 각 구간 24쌍 미만이면 표본 부족 표시; 미래 2024+ 미사용.
- **WTI**: 계획: Yahoo CL=F 완료 일봉의 월말 Close P_m; r_(m+1)=P_(m+1)/P_m-1. 비양수/누락 가격 창 제외; 보조 달러 변화 D_(m+1)=P_(m+1)-P_m.
- **검정/강건성**: 계획: corr(I_m,r_(m+k)), k=-1/0/1/2월; k>0 활동 선행. 12개월 과거 시프트 placebo, 공개 지연 +1개월 및 2020 영향 제외 민감도. 사건 연구는 사전 사건 목록 없음으로 NOT_RUN.

## 접근 증거

메타데이터·문서·차단 응답만 보존했다. HEAD의 payload는 HTTP 헤더 기록이며 데이터 본문이 아니다. [기계 판독 영수증](access-receipt.json)의 SHA-256은 이 응답 파일만 인증한다.

| UTC | 방법 / HTTP | URL | 로컬 원본 포인터 |
| --- | --- | --- | --- |
| 2026-09-07T06:17:05.085651+00:00 | GET / 200 | [요청](https://portwatch.imf.org/pages/faqs) | `research/gathering/raw/ALT-20260907-04/20260907T061705Z/portwatch_faq.body` |
| 2026-09-07T06:19:13.261584+00:00 | GET / 200 | [요청](https://services9.arcgis.com/weJ1QsnbMYJlCHdG/ArcGIS/rest/services/Daily_Chokepoints_Data/FeatureServer/0?f=pjson) | `research/gathering/raw/ALT-20260907-04/20260907T061913Z/portwatch_metadata.body` |
| 2026-09-07T06:20:23.331100+00:00 | GET / 200 | [요청](https://services9.arcgis.com/weJ1QsnbMYJlCHdG/ArcGIS/rest/services/Daily_Chokepoints_Data/FeatureServer/0/query?where=portid%3D%27chokepoint6%27+AND+date+%3C%3D+date+%272023-12-31%27&outStatistics=%5B%7B%22statisticType%22%3A+%22min%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22min_date%22%7D%2C+%7B%22statisticType%22%3A+%22max%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22max_date%22%7D%2C+%7B%22statisticType%22%3A+%22count%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22n_dates%22%7D%5D&f=json&returnGeometry=false) | `research/gathering/raw/ALT-20260907-04/20260907T062023Z/portwatch_coverage.body` |

## 판단과 재개

과거 발표 빈티지/권리 범위 및 n_tanker 시계열 정제·정렬 미구축; 키가 필요한 차단은 아님.

오태환이 IMF 이용 범위와 배포/빈티지 근거를 확인하고2019–2023 집계 획득 — 오태환, 2026-09-08 (담당 제안, 수락 미확인).

추가 반증 계획: non-tanker 통과 집계와 비민감 비교 해협을 고정하여 공통 AIS 관측 단절을 점검. AIS 결측을 통과 0으로 바꾸지 않음. 모두 NOT_RUN.

2019 시작에 전년동월 warmup을 적용하면 학습 구간 신호가 최대 12개월이어서 24쌍 기준을 충족하지 못한다. 키/망 차단이 아니라 권리·빈티지·짧은 학습 표본 조건이 남는다.
