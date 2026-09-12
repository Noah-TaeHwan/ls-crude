# COMMANDS — UI-05.S2a R1 (20260911T050138Z_R1)

cwd는 별도 표시 없는 한 `/Users/noah/orca/ls-crude`,
`[WS]` 표시는 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a`,
`[WS-APP]` 표시는 그 아래 `app/`.
세션 창 2026-09-11 12:56–12:5x KST. 개별 시각은 스탬프된 명령만 표기.
민감정보 없음. 재현 제한 없음.
`EXIT=$?`가 파이프 뒤에 있으면 tail/grep/head의 코드다.
판정은 TAP 카운트 기준이며, 핵심 검사는 파이프 없이 재실행해
순수 종료 코드를 확보했다(§R6).

## R0. 읽기 (Read 도구)

- Read `[WS] app/app/lib/cai-view.server.ts` (11행 전체, 무변경 확인)
- Read `docs/cai/tasks.json`은 python 확인으로 대체(아래 R1). 전체 파일은
  REP-01·S2a 단위에서 읽음. R1에서 필요한 S2a 행만 아래 명령으로 확인.

## R1. 위치·작업공간 상태 (원본 + WS)

```
date -u +%Y%m%dT%H%M%SZ; git rev-parse HEAD; git branch --show-current; git ls-remote origin HEAD
```
- exit 0. 출력: `20260911T050138Z` / `b981ceb` / `main` / `cecf1cf HEAD`.
  fetch/pull 없음.

```
git ls-remote origin HEAD; git ls-remote origin main
```
- exit 0. 출력: `cecf1cf HEAD` / `cecf1cf refs/heads/main`.
  원격 변동 없음(세션 중 재확인).

```
date -u +%Y%m%dT%H%M%SZ; git rev-parse HEAD; git branch --show-current; echo "---STATUS---"; git status --short; echo "---LOG-1---"; git log --oneline -1
```
- cwd `[WS]`, exit 0. 출력: run_id 시각 / `cecf1cf` /
  `work/ui-05-s2a` / 변경 4경로(S2a 제출분만) / `cecf1cf ...` .
  외부 변경 없음. fetch·새 worktree·브랜치 전환 없음.

```
grep -n "cai-view" .github/workflows/ci.yml; echo "---AGENTS-tail---"; tail -5 AGENTS.md
```
- cwd `[WS]`, exit 0. 출력: ci 51행 테스트 항목 1건(중복 없음),
  AGENTS 꼬리 5행(동시 실행 규칙).

```
python3 -c "
import json
d = json.load(open('docs/cai/tasks.json'))
for u in d['units']:
    if u['id'] == 'UI-05.S2a':
        print(json.dumps(u, ensure_ascii=False, indent=1))
"
```
- exit 0. 출력: S2a 행 REVIEW 상태 확인(편집 전 정확한 원문 확보용).

## R2. 원장 R1 착수 반영 (원본, Edit/Write 도구)

- Edit `docs/cai/tasks.json`: S2a `evidence`+`next_action`+`review_note`+`status`
  → DOING(R1 착수). 같은 파일 1건씩 순차 적용.
- Write `docs/cai/TASKS.md` 전체 (R1 착수 카운트 REVIEW 3·DOING 1).
- Edit `docs/cai/TASKS.md`: 존재하지 않는 `UI-05.S3c` 행이 잘못 들어간 것을
  발견 즉시 제거 (14행 복원. 작업 추가 아님).
- Edit `docs/cai/tasks.json`: S2a DOING→REVIEW + R1 evidence (아래 §R7 후).
- Edit `docs/cai/TASKS.md` 2건: 카운트 REVIEW 4 + S2a 행 REVIEW·R1 증거.

## R3. 실패 테스트 추가·실행 [WS]

- Edit `app/tests/cai-view.test.mjs`: R1-F1 3개·F2 7개·F3 2개·F4 3개 추가.

```
node --test tests/cai-view.test.mjs 2>&1 | grep -E "^not ok|^ok|# (tests|pass|fail)" | head -50
```
- exit 0(grep 코드). 출력: 기존 6 suites ok, R1 4 suites not ok,
  `# tests 37 # pass 26 # fail 11`.

```
node --test tests/cai-view.test.mjs 2>&1 | grep -E "    (ok|not ok)" | head -45
```
- exit 0(grep 코드). 출력: 실패 11건이 F1 2·F2 5·F3 1·F4 3과 일치,
  대조 4건(윤일·URL 2·OBSERVED) 통과, 기존 22건 전부 통과.

## R4. 최소 수정 [WS] (Edit 도구, cai-view.ts만)

1. `asNonEmptyString` trim 판정.
2. `parseIsoInstant`를 ISO 구성요소 직접 검증으로 교체
   (`ISO_PATTERN`+`isLeapYear`+`daysInMonth` 추가, epoch 비교 유지).
3. DEMO 분기에 previous_score null 처리 추가.
4. `parseHistory` 호출 뒤 DEMO history 비움 추가.
5. `SENSITIVE_QUERY_KEYS`+`isSafePublicUrl` 추가.
6. `parseEvidence` 루트 교체 (부적격 제외·team_only null·경고 무원문).
7. `hasEvidence`에 `sample_start <= sample_end` 추가.
- 서버·CI·타입·함수명·schema_version 변경 없음.

## R5. 수정 후 검사 [WS-APP]

```
node --test tests/cai-view.test.mjs 2>&1 | grep -E "^not ok|# (tests|pass|fail)" | head -20
```
- exit 0(grep 코드). 출력: `# tests 37 # pass 37 # fail 0`.

## R6. 회귀·타입·빌드 (순수 종료 코드) [WS-APP]

```
S=$(date -u +%Y%m%dT%H%M%SZ); node --test tests/cushing-context.test.mjs > /tmp/s2a-r1-reg.log 2>&1; A=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E EXIT=$A"; grep -E "^# (tests|pass|fail)" /tmp/s2a-r1-reg.log
```
- 출력: `START=20260911T050419Z END=20260911T050420Z EXIT=0`,
  `tests 24/pass 24/fail 0`.

```
S=$(date -u +%Y%m%dT%H%M%SZ); npm run typecheck > /tmp/s2a-r1-tc.log 2>&1; A=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E EXIT=$A"; tail -3 /tmp/s2a-r1-tc.log
```
- 출력: `START=20260911T050419Z END=20260911T050429Z EXIT=0`.

```
S=$(date -u +%Y%m%dT%H%M%SZ); npm run build > /tmp/s2a-r1-build.log 2>&1; A=$?; node --test tests/cai-view.test.mjs > /tmp/s2a-r1-new.log 2>&1; B=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E BUILD_EXIT=$A NEW_EXIT=$B"; grep -E "^# (tests|pass|fail)" /tmp/s2a-r1-new.log; tail -2 /tmp/s2a-r1-build.log
```
- 출력: `START=20260911T050436Z END=20260911T050439Z BUILD_EXIT=0 NEW_EXIT=0`,
  `tests 37/pass 37/fail 0`, `built in 525ms`.

## R7. diff 검토·증거 저장

```
git status --short; echo "---STAT---"; git diff --stat
```
- cwd `[WS]`, exit 0. 출력: `M ci.yml` + 신규 3파일. 허용 범위 일치.

```
mkdir -p /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1 && git diff -- .github/workflows/ci.yml > /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1/ci.diff; echo "DIFF_EXIT=$?"; cp /tmp/s2a-r1-new.log /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1/tests-cai-view.log && echo "LOG_OK"; wc -l /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1/ci.diff /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1/tests-cai-view.log
```
- cwd `[WS]`, exit 0. 출력: `DIFF_EXIT=0`, `LOG_OK`,
  `10 ci.diff`, `302 tests-cai-view.log`.

## R8. 결과 기록 (Write 도구, 원본)

- Write `runs/UI-05.S2a/20260911T050138Z_R1/RESULT.md`
- Write 본 파일 (`COMMANDS.md`)
