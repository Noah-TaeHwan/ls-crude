# 후보 기록 — Houston/Galveston Port Visibility Signal

## 1. 후보와 가설

| field | value |
| --- | --- |
| candidate_id | ALT-20260908-01 |
| name | Houston/Galveston Port Visibility Signal |
| thesis | 휴스턴/갤버스턴 권역 항만 주변 기상(시정) 악화는 유조선 통항 제한을 유발해 쿠싱 재고 및 물류 차질로 이어질 수 있다. |
| activity | 휴스턴/갤버스턴 (KHOU, KGLS) 공항 기상관측소의 시정(Visibility) 변화 |
| sensitive_context | 운영/물류 차질 |
| analogy_limit | 안개/시정 악화가 곧바로 통항 제한을 의미하지 않으며, 공항과 실제 수로의 국지적 기상이 다를 수 있음 |
| falsification | 시정이 매우 낮음에도 USCG 항만 제한 조치가 없거나, 상관관계가 나타나지 않으면 기각 |
| legacy_ref | 없음 |
| search_scope | AWC METAR API를 통한 KHOU, KGLS 최근 2시간 관측 샘플 수집 |

## 2. 출처와 접근

| field | value |
| --- | --- |
| source_urls | https://aviationweather.gov/api/data/metar |
| source_registry | 미등록 |
| access_method | AWC METAR JSON API (Public API) |
| availability | available |
| license_tos_ethics | 공공 기상 데이터, 상업적 이용 및 재배포 제한 없음 |
| terms_evidence | weather.gov 표준 공공 도메인 제공 확인 |
| access_checked_at | 2026-09-08T02:13:48Z |

## 3. 수집과 원본

| field | value |
| --- | --- |
| collection_status | COLLECTING |
| raw_path | research/gathering/raw/ALT-20260908-01/20260908T021320Z/README.md |
| blocker | 없음 |
| collection_command | python urllib.request로 KHOU, KGLS 샘플 JSON 획득 |
| retrieved_at | 2026-09-08T02:13:48Z |
| raw_sha256 | (raw_path 내 영수증 참조) |
| coverage | KHOU, KGLS 2시간 관측 샘플 (전체 기간 아님) |
| observed_at | 최신 METAR 관측 시각 |
| available_at | METAR 공개 직후 |
| vintage_revision | N/A |
| raw_handoff | AWC API 반복 호출 스크립트 작성 필요 |

## 4. 지수 구성

| field | value |
| --- | --- |
| construction | 미정 |
| unit | 미정 |
| frequency | 시간 단위 / 분 단위 갱신 |
| geography | Houston/Galveston Area |
| aggregation | 시간 단위 시정 최소값/평균 |
| missing_outliers | 미정 |
| index_record | 미생성 |
| derived_path | 미생성 |
| script_path | 미작성 |

## 5. 검정과 결과

| field | value |
| --- | --- |
| target | Yahoo CL=F |
| tests_planned | 미실행 — 역사적 시계열 샘플링 후 USCG 통항 제한 공지와 대조 선행 |
| split_plan | 2015-01-01~2023-12-31 내부 시간 분할 미정 |
| oos_exposure | UNKNOWN |
| frozen_at | 미동결 |
| test_status | NOT_RUN |
| results | 미실행 |
| result_path | 미생성 |
| evidence_level | E1 |

## 6. 판정과 인계

| field | value |
| --- | --- |
| decision | KEEP |
| decision_reason | 샘플 데이터 확보 성공, 쿠싱 관측판에 USCG 통항 대조군으로 사용 가능 |
| next_action | 과거 METAR 시계열 대량 확보 및 USCG VTS 항만 통항 제한 공지 기록과 교차 검증 |
| owner | 오태환 |
| next_review_date | 2026-09-15 |
| reviewer | 손성찬 |
| reviewed_at | 미검토 |
| review_result | 미검토 |
| reopen_condition | 미정 |

## 변경 이력

| 시각(시간대 포함) | 작성자 | 이전 → 이후 상태/판정 | 바뀐 근거·범위·후속 행동 |
| --- | --- | --- | --- |
| 2026-09-08T02:13:48Z | 오태환 | 생성 → COLLECTING / KEEP | 샘플 수집 확인 및 USCG 검증 계획 등록 |
