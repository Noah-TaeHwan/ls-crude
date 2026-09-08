# 쿠싱 최신 활동 흔적 — AI 접수 1회차

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-08 / 오태환 담당, Codex 작성 |
| 후보 ID / 카드 경로 | [도로 공지 ALT-20260908-02](../../candidates/ALT-20260908-02.md), [작업 공지 ALT-20260908-03](../../candidates/ALT-20260908-03.md) |
| 상태 | 두 후보 E1 / BLOCKED / NOT_RUN / PARK |
| 연결 출처 | [REGISTRY](../sources/REGISTRY.md)의 ODOT Cushing Road Restrictions, South Bow Keystone Public Notices |

## 활동과 WTI 가설

[AI 워크플로우](../../../docs/ai-research-intake-workflow.md)를 실제 실행했다. 최대 3개 중 독립적인 2개만 조사했다. 최신 관측 접근성 확인이 목적이며 예측력·상관·OOS·인덱스·대시보드 구현은 범위 밖이다.

- 도로: 쿠싱 시설 접근 여건이 달라지는지 알고 싶고 공식 통행 제한 공지를 관측한다. 일반 도로 보수·날씨도 원인이므로 원유 업무량이나 트럭 수로 부를 수 없다.
- 파이프라인: 쿠싱 연결망의 예정 작업·운영 제약 공지를 관측한다. 공지 증가가 실제 작업 증가 대신 회사의 공시 방식 변경일 수 있다.
- WTI 연결은 각각 현장 접근과 원유 운송 제약이라는 가설이다. 이번에 관련성이나 선행성을 검정하지 않았다.

기존 원장 48행과 관련 카드·팩터·노트를 검색했다. [091](../../factors/091-cushing-motel-lights-index/README.md)은 ODOT 교통량을 후속 입력으로 제안했다. 이번 도로 규제 공지는 교통량과 다른 관측이지만 관련 이력을 연결했다. 파이프라인 공지는 091의 정비·운영 가설과 연결된다. 기존 후보의 검정·판정은 변경하지 않았다. 새로운 발견 2개라는 의미가 아니라 기존 지역 운영 질문의 구체적인 접근 조사 2건이다.

## 확인한 것 / 확인하지 못한 것

### 01 — 쿠싱 도로 공사·통제 공지판

1. [ODOT Drive Oklahoma](https://oklahoma.gov/odot/travel/traffic/drive-oklahoma.html)는 교통·도로 상태 도구를 안내한다. [Maps and Data](https://oklahoma.gov/odot/about-us/contact-us/geospatial-data-management/maps-and-data.html)는 Open Data Portal과 다운로드/API 정보로 연결한다. 특정 최신 사건 feed의 확보·허용을 뜻하지 않는다.
2. [SH-33 역사 공지](https://oklahoma.gov/odot/travel/traffic/traffic-advisories/2022/sh-33-narrows-at-harmony-rd--in-cushing-for-pavement-project.html)는 2022-01-28 발행/수정 표시와 차선 축소 계획을 담는다. 현재 공사 진행 증거로 사용하지 않았다.
3. [ODOT 규제 PDF](https://www.oklahoma.gov/content/dam/ok/en/odot/about-us/laws-rules/size-and-weight-permits/size-weight-restrictions/restriction-list.pdf)를 메인 AI가 직접 GET했다. 아래 표는 저장한 원본 영수증이 아니라 일회성 접근·메모리 파싱 기록이다.

| 확인 항목 | 실제 결과 |
| --- | --- |
| 접근 시각 | 2026-09-08T02:14:31.751593+00:00 |
| 응답 | HTTP 200; 511928 bytes |
| 서버 Last-Modified | 2026-09-04T21:05:00Z; 최초 공개일·현장 관측일로 해석하지 않음 |
| 범위 / 중단 조건 | 공식 PDF 1회, timeout 25초, 최대 2MB; 초과 시 중단, 응답은 메모리에만 |
| 확인 위치 | PDF 46쪽 CUSHING / PAYNE / OK-33 / WIDTH RESTRICTION |
| 해당 행 | 날짜 06.25.25, OK-18~Harmony Rd. 양방향 폭 제한; 표기 `10 WIDE`, 이 메모에서 단위 환산 안 함 |
| 시점 의미 | 오래된 규제가 현재 게시 파일에 남아 있음. 최근 신규 활동이나 실제 현장 통행 상태 확인 아님 |
| 미검사 | 전체 행 수·결측·중복·규제 해제 반영·도로와 원유시설 접근 관계·좌표계 |
| 보존 | 로컬 파일 미보존; raw 경로·파일 hash 없음; 팀 재현 미검증 |

재열람 절차: 위 PDF URL을 Python `urllib.request.urlopen(url, timeout=25)`로 열고 `read(2_000_001)` 뒤 2MB 상한을 검사한다. 받은 bytes를 `subprocess.run(['pdftotext','-layout','-','-'], input=b, capture_output=True, check=True)`에 넘겨 `CUSHING` 포함 페이지를 확인한다. 원본을 저장하는 명령은 아니다. 첫 시도는 `pypdf` 미설치로 import에서 중단되어 GET을 실행하지 않았고, 설치 없이 기존 `pdftotext`로 성공했다.

Agency 조사자의 `https://oktraffic.org/` 직접 GET은 403, 웹 도구는 JS shell만 보였다. 메인 AI는 해당 403을 재실행하지 않았으며 조사자 접근 결과로만 보존한다. 차단을 우회하거나 숨겨진 feed를 추측하지 않았다.

[주정부 copyright 정책](https://oklahoma.gov/about/copyright-and-protection-acts.html)은 데이터별 포괄 사용 허가로 확인되지 않았다. 공개 PDF 열람은 성공했지만 팀의 반복 수집·보존·재배포 조건은 미확인이다. 그래서 COLLECTED가 아니라 BLOCKED/PARK다. 이는 기술적으로 다운로드 불가능하다는 판정이 아니다.

### 02 — 쿠싱 연결 파이프라인 작업 공지판

메인 AI가 2026-09-08 UTC에 [Keystone 시스템 안내](https://www.southbow.com/keystone-pipeline-system/), [약관](https://www.southbow.com/legal-terms-of-use/), [공개 사건 대응](https://www.southbow.com/incident-response/)을 웹 도구로 재열람했다.

- 시스템 안내에 Cushing 저장 터미널이 포함되고, 고객 포털은 기존 고객 로그인·shipper 신청으로 안내된다. 포털 로그인·신청은 실행하지 않았다.
- 고객 포털이 모든 정비 데이터를 제공한다고 확인한 것은 아니다. 무료 공개 정비 API·완전한 이력의 존재도 미확인이다.
- 약관은 개인 비상업 단일 사본과 복제·배포 서면 허가 조건을 둔다. 팀의 자동 수집·보존·웹 활용 허가를 확인하지 못해 원문·PDF 파일은 저장하지 않았다.
- 공개 사건 페이지나 shipment 제출 달력을 실제 쿠싱 정비량·물동량으로 대체하지 않는다. 연결망 타지역 사건과 쿠싱 현지 사건은 다르다.
- 행 수·기간·결측·중복·최초 공개시각·수정 빈티지·발표주기 모두 운영공지 데이터셋 기준 미확인이다. 원본 파일·raw hash 없음.

## 판정과 다음 행동

| 후보 | 판정 | 다음 행동 하나 / 제안 담당·날짜 |
| --- | --- | --- |
| 01 도로 | PARK — 공개 규제 표본 확인; 활동량 미측정·사용 조건 미확인 | ODOT 규제 PDF의 반복 취득·보존·재배포 조건 확인 / 오태환 / 2026-09-15 |
| 02 파이프라인 | PARK — 공개 소개 확인; 운영공지 표본·팀 이용 조건 미충족 | South Bow 공개 운영공지 제공·팀 연구 이용 조건 문의안을 검토 / 오태환 / 2026-09-15 |

공식 기관에 메시지·신청을 보내지 않았다. 접근 차단·권리 미확인은 가설이 거짓이라는 증거가 아니다. 현 단계에서 즉시 시각화 투입할 KEEP 후보는 없다. 다음 조사에서는 일상 흔적의 재미뿐 아니라 **구체적인 측정값과 실제 데이터 이용 경로**를 함께 확인해야 한다.

## Agency-Agents 협업과 검증

- `road_data` / Trend Researcher: 도로 공식 출처·과거 사례·현재 PDF 접근 조사, 저장소 무수정.
- `operations_data` / Trend Researcher: 파이프라인 공식 연결·고객 접근·약관 조사, 저장소 무수정.
- 메인 Codex: 현재 규약·중복 확인, 공식 근거 재열람, PDF 직접 GET·메모리 파싱, 카드·원장·출처·노트 작성.
- 독립 AI 검토: `intake_review` / Reality Checker가 카드·CSV 일치·기존48행 보존·상태·증거 경계를 검사했다. PDF 일시 취득과 파일 미보존의 표현 혼동 1건을 지적했고 카드에 실제 취득시각을 넣어 수정했다. 사람 검토·재현은 미실행.
- 가격 데이터·회귀·ML·OOS·지도 계산·앱 변경: 미실행. 전체 시도는 접근 조사이며 NOT_RUN을 유지한다.

검증: 원장 구조 50행 통과, 신규 문서 상대 링크 통과, 연구 pytest 35개·앱 테스트 4개 통과, 타입체크·빌드 통과. CSV 저장 시 발생한 CRLF 변경은 기존 LF로 복구하여 원장 diff를 신규 2행으로 제한했다. 이 검사는 연구 예측력이나 웹 배포 검증이 아니다.
