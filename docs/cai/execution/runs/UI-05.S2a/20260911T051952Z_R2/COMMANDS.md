# COMMANDS — UI-05.S2a R2 (20260911T051952Z_R2)

cwd는 별도 표시 없는 한 `/Users/noah/orca/ls-crude`,
`[WS]` 표시는 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a`,
`[WS-APP]` 표시는 그 아래 `app/`.
세션 창 2026-09-11 14:19–14:3x KST.
민감정보 없음. 재현 제한 없음.
`EXIT=$?`가 파이프 뒤에 있으면 tail/grep/head의 코드다.
판정은 TAP 카운트 기준이며, 핵심 검사는 파이프 없이 재실행해
순수 종료 코드를 확보했다(§R4).

## R0. 읽기 (Read/grep 도구)

- grep `data_origin === "DEMO"` 등 `[WS] app/app/lib/cai-view.ts`
- Read `[WS] app/app/lib/cai-view.ts` 370–479행(parseIndex), 565–728행
  (SENSITIVE_QUERY_KEYS·isSafePublicUrl·parseEvidence)
- tail `[WS] app/tests/cai-view.test.mjs` (파일 끝, 추가 위치 확인)

## R1. 작업공간 상태 확인

```
date -u +%Y%m%dT%H%M%SZ; git rev-parse HEAD; git branch --show-current; echo "---STATUS---"; git status --short; echo "---LOG-1---"; git log --oneline -1
```
- cwd `[WS]`, exit 0. 출력: `20260911T051952Z` / `cecf1cf` /
  `work/ui-05-s2a` / S2a 제출분 4경로(`M ci.yml` + 신규 3파일) /
  `cecf1cf 091 applied tracks first with weights`.
  외부 변경 없음, fetch·브랜치 전환 없음.

## R2. RED: R2 테스트 추가·실행 [WS]

- Edit `app/tests/cai-view.test.mjs`: R2-F3 7개 + R2-F2 7개(6 케이스 루프 + team_only 대조) 추가.

```
node --test tests/cai-view.test.mjs 2>&1 | grep -E "^not ok|    not ok|# (tests|pass|fail)" | head -35
```
- exit 0(grep 코드). 출력: F3 4건 + F2 6건 not ok,
  `# tests 51 # pass 41 # fail 10`.
  (RED는 1회 실행, 축약 출력은 tests-cai-view-red.txt에 보존. 전체 TAP 미저장.)

## R3. 최소 수정 [WS] (Edit 도구, cai-view.ts만)

1. DEMO 비공개를 score 검증 체인 밖 독립 블록으로 이동
   (score·previous_score 항상 null + DEMO_SCORE_UNPUBLISHED).
2. `isSafePublicUrl` 재작성: C0 제어문자·DEL·역슬래시 거부,
   `parsed.protocol` 항상 검사, https 절대/로컬 경로 구분 + origin 확인.
3. `isSensitiveParamName`·`hasSensitiveFragment` 추가
   (대소문자·구분자·percent 정규화, X-Amz-/X-Goog- 계열, malformed 차단).
4. `URL_BASE`/`URL_BASE_ORIGIN` 상수 추가.
- 서버·CI·타입·이름·schema_version 변경 없음.

## R4. GREEN + 회귀 + 타입 + 빌드 (순수 종료 코드)

```
node --test tests/cai-view.test.mjs 2>&1 | grep -E "^not ok|# (tests|pass|fail)" | head -15
```
- exit 0(grep 코드). 출력: `# tests 51 # pass 51 # fail 0`.

```
S=$(date -u +%Y%m%dT%H%M%SZ); node --test tests/cai-view.test.mjs > /tmp/s2a-r2-new.log 2>&1; A=$?; node --test tests/cushing-context.test.mjs > /tmp/s2a-r2-reg.log 2>&1; B=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E NEW_EXIT=$A REG_EXIT=$B"; grep -E "^# (tests|pass|fail)" /tmp/s2a-r2-new.log /tmp/s2a-r2-reg.log
```
- cwd `[WS-APP]`, 출력: `START=20260911T052154Z END=20260911T052155Z
  NEW_EXIT=0 REG_EXIT=0`, new 51/51, reg 24/24.

```
S=$(date -u +%Y%m%dT%H%M%SZ); npm run typecheck > /tmp/s2a-r2-tc.log 2>&1; A=$?; npm run build > /tmp/s2a-r2-build.log 2>&1; B=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E TC_EXIT=$A BUILD_EXIT=$B"; tail -2 /tmp/s2a-r2-build.log
```
- cwd `[WS-APP]`, 출력: `START=20260911T052155Z END=20260911T052207Z
  TC_EXIT=0 BUILD_EXIT=0`, `✓ built in 336ms`.

## R5. R1→R2 diff 생성 (검증된 산출물 대조)

```
rm -rf /tmp/s2a-r1-handoff && mkdir -p /tmp/s2a-r1-handoff && unzip -q /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T050138Z_R1/HANDOFF.zip -d /tmp/s2a-r1-handoff && diff -u /tmp/s2a-r1-handoff/app/app/lib/cai-view.ts app/app/lib/cai-view.ts > /tmp/s2a-r1-to-r2-cai-view.diff; echo "DIFF_EXIT=$?"; diff -u /tmp/s2a-r1-handoff/app/tests/cai-view.test.mjs app/tests/cai-view.test.mjs > /tmp/s2a-r1-to-r2-tests.diff; echo "DIFF2_EXIT=$?"; wc -l /tmp/s2a-r1-to-r2-cai-view.diff /tmp/s2a-r1-to-r2-tests.diff
```
- cwd `[WS]`, 출력: `DIFF_EXIT=1`(차이 있음 = 정상), `DIFF2_EXIT=1`,
  `127 cai-view`, `126 tests` (R1 ZIP 원문과 R2 현재본 대조).

## R6. 증거 저장·원장

```
mkdir -p /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T051952Z_R2 && cd /Users/noah/orca/ls-crude-worktrees/ui-05-s2a && git diff -- .github/workflows/ci.yml > /Users/noah/orca/ls-crude/docs/cai/execution/runs/UI-05.S2a/20260911T051952Z_R2/ci.diff && cp /tmp/s2a-r2-new.log .../tests-cai-view.log && cp /tmp/s2a-r2-reg.log .../tests-cushing-context.log && cp /tmp/s2a-r1-to-r2-cai-view.diff .../cai-view.r1-to-r2.diff && cp /tmp/s2a-r1-to-r2-tests.diff .../cai-view.test.r1-to-r2.diff && echo COPIED && ls .../20260911T051952Z_R2/
```
- cwd `[WS]`, exit 0. 출력: `COPIED` + 파일 5개
  (cai-view.r1-to-r2.diff, cai-view.test.r1-to-r2.diff, ci.diff,
  tests-cai-view.log, tests-cushing-context.log).

- Edit `docs/cai/tasks.json` ×2: S2a DOING(R2 착수) → REVIEW(R2 완료, evidence 3건).
- Edit `docs/cai/TASKS.md` ×2: DOING 카운트 반영 → REVIEW 4 파생 반영.
- Write run 폴더: `tests-cai-view-red.txt`, `RESULT.md`, 본 `COMMANDS.md`.
- Write 도구: 위 Edit/Write는 shell 종료 코드 없음.

## R7. 검증 스크립트 (원장 정합)

```
python3 -c "<<원장 검증: 14 ID·상태값·카운트 주석 일치>>"
```
- 실제 실행 코드(전문):

```python
import json, re
from collections import Counter
d = json.load(open('docs/cai/tasks.json'))
ids = [u['id'] for u in d['units']]
c = Counter(u['status'] for u in d['units'])
assert len(ids) == 14 and len(set(ids)) == 14, ids
assert all(u['status'] in {'TODO','READY','DOING','REVIEW','DONE','BLOCKED'} for u in d['units'])
assert sum(c.values()) == 14
md = open('docs/cai/TASKS.md').read()
m = re.search(r'total=(\d+) REVIEW=(\d+) DONE=(\d+) DOING=(\d+) TODO=(\d+)', md)
assert m, 'counts comment missing'
assert (int(m.group(1)),int(m.group(2)),int(m.group(3)),int(m.group(4)),int(m.group(5))) == (14, c.get('REVIEW',0), c.get('DONE',0), c.get('DOING',0), c.get('TODO',0)), (m.groups(), dict(c))
print('LEDGER_OK', dict(c))
```
- cwd 원본, 출력 `LEDGER_OK {'REVIEW': 4, 'DONE': 1, 'TODO': 9}`,
  `EXIT=0`.

## R8. 패키징

- `zip -q -r` 2회(작업공간 원문 3 + 원본 run/원장 문서) + `unzip -l` + `shasum -a 256`.
- 최종 명령·파일 수·SHA-256은 마지막 답변의 포장 기록에 남긴다.
