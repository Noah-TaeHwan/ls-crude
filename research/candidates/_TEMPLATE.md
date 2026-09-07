# 후보 기록 — TEMPLATE (실제 후보 아님)

실제 아이디어를 등록할 때만 ALT-YYYYMMDD-NN.md로 복사합니다. 미확인/미실행을 사실처럼 채우지 않습니다. CSV는 이 카드의 요약이며 같은 변경에서 함께 갱신합니다. 표의 field 이름은 유지하고 값에 줄바꿈·파이프 문자를 쓰지 않습니다. 긴 설명·복수 출처는 아래 본문에 적습니다.

## 1. 후보와 가설

| field | value |
| --- | --- |
| candidate_id | ALT-YYYYMMDD-NN |
| name | 미정 |
| thesis | 어떤 활동이 왜 WTI와 관계가 있을 수 있는가 — 미정 |
| activity | 실제 측정할 활동 — 미정 |
| sensitive_context | 지정학/공급/수요/운영 중 연결 맥락 — 미정 |
| analogy_limit | 피자 패턴과 닮은 점 및 측정하지 못하는 것 — 미정 |
| falsification | 어떤 관찰이면 가설을 버릴 것인가 — 미정 |
| legacy_ref | 없음 또는 기존 factors/노트의 저장소 상대 경로 |
| search_scope | 미실행 — 사이트/DB·검색어·검색일·언어·요구 기간·포함/제외·중복 제거 기록 |

## 2. 출처와 접근

| field | value |
| --- | --- |
| source_urls | 미확인 — 아래에 제공자 원문 URL을 모두 기록 |
| source_registry | 미등록 — 등록 후 출처 이름/상세 경로 |
| access_method | 미확인 — API/공식 파일/수동/허용된 수집 방식 |
| availability | unavailable |
| license_tos_ethics | 미확인 — 저장/분석/재배포 허용 범위 및 익명 집계 여부 |
| terms_evidence | 미확인 — 약관/허가 URL, 확인일, 확인자, 해당 문구 요약 |
| access_checked_at | 미확인 — 시간대 포함 확인시각 |

출처별로 URL·접근법·약관 근거·발표주기·시점·빈티지를 적습니다. public은 수집·재배포 허가를 뜻하지 않습니다. scrape는 필요한 접근 방식의 분류이며 허가가 아닙니다. Investing.com은 CSV만 사용합니다. 자격증명·개인/예약/결제 원문을 적지 않습니다.

## 3. 수집과 원본

| field | value |
| --- | --- |
| collection_status | NOT_STARTED |
| raw_path | 미수집 |
| blocker | 접근 확인 전. 없으면 없음 |
| collection_command | 미실행 — 실제 명령 또는 수동 다운로드 단계 |
| retrieved_at | 미수집 — UTC 또는 KST 오프셋 포함 |
| raw_sha256 | 미수집 |
| coverage | 미확인 — 실제 시작/끝, 행 수, 결측, 중복, 지역 |
| observed_at | 미확인 — 측정 대상 시각/기간과 시간대 |
| available_at | 미확인 — 공개·이용 가능 시각 및 지연 근거 |
| vintage_revision | 미확인 — 개정 이력과 당시 이용 가능 빈티지 |
| raw_handoff | 미확인 — 동료의 적법한 재취득/접근 경로 |

수집 실패도 시각·명령·오류·재시도 횟수를 적습니다. 받은 원본은 새 수집시각 폴더에 보존하고 정제본으로 덮어쓰지 않습니다.

## 4. 지수 구성

| field | value |
| --- | --- |
| construction | 미정 — 활동을 수치로 바꾸는 산식과 가중치 |
| unit | 미정 — 건/척/톤/비율/표준점수 등 |
| frequency | 미정 — 원천 및 지수 발표 주기 |
| geography | 미정 — 범위/포함·제외/고정 바스켓 |
| aggregation | 미정 — 시간/지역 집계, 분모, 기준기간 |
| missing_outliers | 미정 — 결측·실제 0·이상치·정규화·워밍업 |
| index_record | 미생성 — research/indexes/<candidate_id>/README.md |
| derived_path | 미생성 — research/data/processed/<candidate_id>/<run>/ |
| script_path | 미작성 — research/notebooks/<candidate_id>/의 실제 코드 |

## 5. 검정과 결과

| field | value |
| --- | --- |
| target | Yahoo CL=F — 수익률/미래 변동성, 공식·주기·horizon 미정 |
| tests_planned | 미정 — corr/lag/event/placebo별 계획 또는 미실행 사유 |
| split_plan | 선택 2015-01-01~2023-12-31 내부 시간 분할 미정; 2024+ 노출 감사 선행 |
| oos_exposure | UNKNOWN — UNSEEN/SEEN/UNKNOWN 및 누가 언제 후보/변형/목표의 어느 구간을 봤는가 |
| frozen_at | 미동결 — 산식·타깃·lag·검정군·코드/입력 hash 동결시각 |
| test_status | NOT_RUN |
| results | 미실행 — 유효 N/효과/불확실성/전체 시도와 한계 |
| result_path | 미생성 — 실행 결과/표/그림을 연결한 실제 보고서 경로 |
| evidence_level | E0 |

테스트별 예정/실행/미실행·기간·N·타깃·lag·결과·근거 파일을 본문 표로 확장합니다. 시점 안전성·표본 부족으로 검정하지 못했다면 관계 없음으로 쓰지 않습니다. 기존 OOS 열람은 새 ID나 재동결로 취소되지 않습니다.

## 6. 판정과 인계

| field | value |
| --- | --- |
| decision | PARK |
| decision_reason | 조사 대기 — 접근·측정 적합성 미확인 |
| next_action | 실제 다음 행동 1개로 교체 |
| owner | 오태환 또는 손성찬 중 실제 담당자 1명으로 교체 |
| next_review_date | YYYY-MM-DD |
| reviewer | 미배정 — 작성자 외 팀원 |
| reviewed_at | 미검토 |
| review_result | 미검토 — 재현 명령/검토 범위/문제/수정 후 결과 |
| reopen_condition | 미정 — 필요한 자료/허가/정의/미열람 구간 |

KEEP은 후속 연구 대상으로 유지, KILL은 이 가설/자료 조합 종료, PARK는 추가 조건 대기입니다. 원본을 삭제하거나 파일을 상태 폴더로 옮기지 않습니다.

## 변경 이력

| 시각(시간대 포함) | 작성자 | 이전 → 이후 상태/판정 | 바뀐 근거·범위·후속 행동 |
| --- | --- | --- | --- |
