# BOOT-01 — 현재 작업 환경과 다음 실행 단위 확인

기존 원장 연결: **CHK-01**. catalog 등록은 착수/완료 승인이 아니다.

## 목표와 경계
현재 작업 환경과 다음 실행 단위 확인를 한 변경 단위로 수행한다. 다른 카드의 작업을 함께 끝내려고 범위를 늘리지 않는다.

## 선행조건
- 카드 선행: 없음
- 승인/조건: 문서 설치·읽기 점검 승인; 앱 수정 없음

## 먼저 읽을 파일
- `AGENTS.md`
- `README.md`
- `docs/cai/tasks.json`
- `app/package.json`
- `.github/workflows/ci.yml`
- 기획서 절: 13

## 쓰기 허용 파일
- 앱/연구/배포 파일 변경 없음. 실제 결과 기록만 허용.
- 실행 결과는 `docs/cai/execution/runs/<unit_id>/<run_id>/RESULT.md`에 새로 남길 수 있다. 기존 원장의 상태 변경은 원장 권한·스키마를 확인한 경우만.
- 신규 경로가 이미 있으면 내용을 읽어 확장/재사용한다. 목록 밖 파일 변경 필요 시 범위 변경을 요청한다.

## 입력·출력 / 실행 결정
출력: 환경 확인표(read/write/shell/browser/remote), 기준 HEAD·dirty, 적용 문서/승인, 다음 카드 하나. BOOT 완료는 OPS 전체/팀 합의/구현 완료가 아니다.

## 실행 순서
1. 사용 가능한 연결과 작업 디렉터리를 실제로 조회한다. repo가 여러 개면 origin/이름을 대조한다.
2. 로컬 shell이 있으면 pwd, git rev-parse --show-toplevel, git status --short, git branch --show-current, git rev-parse HEAD를 각각 실행한다. 원격 읽기만 되면 로컬 결과는 NOT_RUN이다.
3. 루트/하위 AGENTS, 현행 기획·tasks.json·승인 기록의 실제 존재와 역할을 확인한다. 누락은 누락이라고 적는다.
4. 최근 변경 파일을 v0.5 대상과 대조한다. 다른 사람이 바꾼 파일은 건드리지 않는다. 현재 remote HEAD는 실제 조회 성공 시에만 기록한다.
5. 테스트 스크립트·lockfile·runtime·브라우저·GitHub/Vercel 권한을 확인한다. 키 값/개인정보는 읽어 출력하지 않는다.
6. 현재 작업/차단과 추천 카드 하나를 적고 멈춘다. 운영 SHA를 모르는 것은 모든 로컬 UI 작업의 차단과 같지 않다.

## 수용 조건
| ID | Given / When | Then / 확인 방법 |
|---|---|---|
| BOOT-01-AC1 | 작업 폴더 확인 | repo/origin 또는 실제 연결 근거, HEAD와 dirty 분리 |
| BOOT-01-AC2 | 읽기 전용 연결 | 설치/셸/브라우저 검사는 NOT_RUN |
| BOOT-01-AC3 | 이전 SHA와 다름 | 변경 범위 대조; 옛 상태를 현재라고 쓰지 않음 |
| BOOT-01-AC4 | 기존 작업 원장 없음 | 새 DONE 원장을 만들지 않고 부재 보고 |
| BOOT-01-AC5 | 팀 승인 불명 | 미확인 표시, 승인 필요한 코드 변경 안 함 |

## 필수 회귀·인계
현행 package.json/CI에서 해당 영역의 명령을 직접 확인한다. 코드 변경은 관련 테스트와 typecheck/build, UI 변경은 승인된 브라우저 검수를 추가한다. 기존 실패·새 실패·도구 차단을 구분한다. 문서/읽기 작업은 관련 경로·숫자·인용·미실행 상태를 대사한다.
수용 조건별 PASS/FAIL/NOT_RUN, 실제 명령/cwd/exit, 변경 diff, 남은 승인/의존성, 다음 카드 하나를 RESULT에 적는다. 실행자는 REVIEW에서 멈춘다.

## 중단 조건
승인 부재, 필수 입력/소스 미접근, 허용 범위 밖 변경, 연구 규칙·공개 정책 충돌은 BLOCKED. 확인된 구현 결함은 REVISION. 모든 결과를 얻기 위해 로그/스크린샷/값을 만들어 채우지 않는다.
