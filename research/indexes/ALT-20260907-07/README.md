# ALT-20260907-07 — 산식 제안과 접근 영수증

[후보 카드](../../candidates/ALT-20260907-07.md) · [공동 탐색](../../gathering/notes/2026-09-07-activity-proxy-hunt.md). **E1 / PARK / 검정 NOT_RUN**. 자료·가용시점 조건이 충족되기 전에는 숫자를 만들지 않는다.

## 구성 명세

- **활동/WTI 가설**: 가설: 위협/사건 보도의변화가공급위험과수요위축서사를동시에반영할수있다는가설
- **산식**: I_m=ln(1+GPR_m)-ln(1+GPR_(m-1)); 결측·음수 제외. 원 지수 및 차분 동시 표시. Investing.com 뉴스 CSV를 대체하지 않는 외부 집계 대조군.
- **단위**: 원저자 index points; log1p 차분
- **지역**: 원저자 Recent GPR 고정 신문 바스켓
- **집계**: Recent GPR만 고정. historical 3개 신문 버전과 접합 금지. 빈티지별 최초 사용가능 값으로 월별 패널을 구성.
- **결측**: 미관측은 0으로 채우지 않음. 역방향 보간·전체기간 표준화 금지. 이상값은 보존·표시하고 원인 검토; 미실행.
- **관측/공개**: 제공자안내:월초/일별매주월요일갱신,연방휴일다음영업일.빈티지명은업데이트일을담지만날짜만으로시각/cutoff를보장안함.
- **빈티지**: 제공자는최신예비치및과거누락/중복기사수정가능성을명시.older vintages/log제공.이run은historicalpanel조인/상충/결측검사미실행.
- **기간**: 2015–2020 내부 학습 / 2021–2023 내부 검증, 실제 공통 구간만. 목표 양끝 split 밖이면 purge. 주 검정 각 구간 24쌍 미만이면 표본 부족 표시; 미래 2024+ 미사용.
- **WTI**: 계획: Yahoo CL=F 완료 일봉의 월말 Close P_m; r_(m+1)=P_(m+1)/P_m-1. 비양수/누락 가격 창 제외; 보조 달러 변화 D_(m+1)=P_(m+1)-P_m.
- **검정/강건성**: 계획: corr(I_m,r_(m+k)), k=-1/0/1/2월; k>0 활동 선행. 12개월 과거 시프트 placebo, 공개 지연 +1개월 및 2020 영향 제외 민감도. 사건 연구는 사전 사건 목록 없음으로 NOT_RUN.

## 접근 증거

메타데이터·문서·차단 응답만 보존했다. HEAD의 payload는 HTTP 헤더 기록이며 데이터 본문이 아니다. [기계 판독 영수증](access-receipt.json)의 SHA-256은 이 응답 파일만 인증한다.

| UTC | 방법 / HTTP | URL | 로컬 원본 포인터 |
| --- | --- | --- | --- |
| 2026-09-07T06:17:05.083693+00:00 | GET / 200 | [요청](https://www.matteoiacoviello.com/gpr.htm) | `research/gathering/raw/ALT-20260907-07/20260907T061705Z/gpr_page.body` |
| 2026-09-07T06:19:13.261917+00:00 | HEAD / 200 | [요청](https://www.matteoiacoviello.com/gpr_files/data_gpr_export.xls) | `research/gathering/raw/ALT-20260907-07/20260907T061913Z/gpr_xls_head.body` |
| 2026-09-07T06:20:23.330605+00:00 | GET / 200 | [요청](https://api.github.com/repos/iacoviel/iacoviel.github.io/contents/gpr_archive_files) | `research/gathering/raw/ALT-20260907-07/20260907T062023Z/gpr_vintages.body` |

## 판단과 재개

권리/역사부재가아니라빈티지별available_at패널과재현검정미구축.새activity-index후보보다공개서사대조군역할우선.

오태환이vintage파일별발행일·내부관측일을매핑하고2015–2023중복/변경조정후WTI검정 — 오태환, 2026-09-08 (담당 제안, 수락 미확인).

추가 반증 계획: 12개월 과거 시프트 대조, 제공자 원지수 대비 log1p 변화 및 공개 지연 +1개월. GPRT/GPRA 확장은 새 변형으로 먼저 기록. 뉴스 서사 벤치마크이며 신규 물리 지수로 세지 않음. 모두 NOT_RUN.
