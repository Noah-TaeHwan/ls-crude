# DATA-01 — 기존 자료의 CAI 편입 가능성 판정표 작성

기존 원장 연결: **DATA-01**. catalog 등록은 착수/완료 승인이 아니다.

## 목표와 경계
기존 자료의 CAI 편입 가능성 판정표 작성를 한 변경 단위로 수행한다. 다른 카드의 작업을 함께 끝내려고 범위를 늘리지 않는다.

## 선행조건
- 카드 선행: BOOT-01
- 승인/조건: 기존 자료 읽기만; 신규 수집·학습·OOS 재열람 금지

## 먼저 읽을 파일
- `research/INTAKE.md`
- `research/candidates/ledger.csv`
- `research/programs/cushing-busy/PROGRAM.md`
- `research/factors/091-cushing-motel-lights-index/workflow.md`
- `docs/testing-protocol.md`
- 기획서 절: 06, 09

## 쓰기 허용 파일
- 앱/연구/배포 파일 변경 없음. 실제 결과 기록만 허용.
- 실행 결과는 `docs/cai/execution/runs/<unit_id>/<run_id>/RESULT.md`에 새로 남길 수 있다. 기존 원장의 상태 변경은 원장 권한·스키마를 확인한 경우만.
- 신규 경로가 이미 있으면 내용을 읽어 확장/재사용한다. 목록 밖 파일 변경 필요 시 범위 변경을 요청한다.

## 입력·출력 / 실행 결정
판정표 필드: candidate_id, measured_quantity, geography, frequency, actual_file/receipt, history_start/end, availability_evidence, rights_evidence, missingness, proposed_role, known_oos_exposure, decision, missing_evidence. 학습/구성 성분 채택을 완료시키는 카드가 아니다.

## 실행 순서
1. 기존 원장과 수집 영수증에서 쿠싱 관련 후보의 실제 ID/파일 경로를 찾는다.
2. 필요한 원본/manifest 메타를 읽어 실제 측정값·단위·지역·주기·역사 범위를 확인한다. 보고 행 수와 유량을 혼동하지 않는다.
3. 무료 접근/이용 권한/공개시각/결측/OOS 노출이 확인된 근거인지, 기존 문서의 주장인지 구분한다.
4. 활동 구성 후보/관심/시장·기상 통제/구조자료/보류를 분리한다. 이미 기각된 후보는 이유를 연결한다.
5. 확보 후보들의 공통 기간을 실제 근거가 있을 때만 계산한다. WTI 결과를 새로 열어 후보를 선택하지 않는다.
6. 판정표와 부족한 근거를 RESULT에 남긴다. 새 원장이나 원본을 생성하지 않는다.

## 수용 조건
| ID | Given / When | Then / 확인 방법 |
|---|---|---|
| DATA-01-AC1 | 버거 주문량 미확보 | 식당 라벨을 주문 수로 바꾸지 않음 |
| DATA-01-AC2 | 월간/연간 자료 | 주간으로 복제하거나 개수를 부풀리지 않음 |
| DATA-01-AC3 | 문서만 존재 | 원자료 검증 완료와 구분 |
| DATA-01-AC4 | OOS 노출 미확인 | UNKNOWN; UNSEEN으로 임의 설정 금지 |

## 필수 회귀·인계
현행 package.json/CI에서 해당 영역의 명령을 직접 확인한다. 코드 변경은 관련 테스트와 typecheck/build, UI 변경은 승인된 브라우저 검수를 추가한다. 기존 실패·새 실패·도구 차단을 구분한다. 문서/읽기 작업은 관련 경로·숫자·인용·미실행 상태를 대사한다.
수용 조건별 PASS/FAIL/NOT_RUN, 실제 명령/cwd/exit, 변경 diff, 남은 승인/의존성, 다음 카드 하나를 RESULT에 적는다. 실행자는 REVIEW에서 멈춘다.

## 중단 조건
승인 부재, 필수 입력/소스 미접근, 허용 범위 밖 변경, 연구 규칙·공개 정책 충돌은 BLOCKED. 확인된 구현 결함은 REVISION. 모든 결과를 얻기 위해 로그/스크린샷/값을 만들어 채우지 않는다.
