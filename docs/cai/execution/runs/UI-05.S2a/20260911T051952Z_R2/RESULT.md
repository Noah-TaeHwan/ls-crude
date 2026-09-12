# 실행 결과 — UI-05.S2a R2 (REVISION 보완)

```yaml
unit_id: UI-05.S2a
revision: R2
parent_task_id: UI-05.S2
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
working_tree_diff_evidence: 작업공간 diff = ci.yml 1행 + 신규 3파일(R2 내용 반영). 원본 tracked 무변경.
pre_existing_changes:
  - "작업공간 상태 확인: HEAD cecf1cf, branch work/ui-05-s2a, S2a 제출분 4경로만. 외부 변경 없음."
  - "fetch/pull/새 worktree/브랜치 전환 없음. R1 산출물 보존."
authorization_evidence:
  - "사용자 승인: R2 F2·F3 일관 수정(cai-view.ts+테스트만). 서버·타입·이름·schema_version·CI 항목 불변."
changed_files:
  - "[WS] app/app/lib/cai-view.ts (F2·F3 최소 수정)"
  - "[WS] app/tests/cai-view.test.mjs (R2 테스트 14개 추가, 총 51개)"
  - "[WS] app/app/lib/cai-view.server.ts (변경 없음, 재검사용 포함)"
  - "[WS] .github/workflows/ci.yml (S2a 추가분 유지, 중복 없음)"
  - "[ORIG] docs/cai/tasks.json (S2a DOING→REVIEW·R2 기록)"
  - "[ORIG] docs/cai/TASKS.md (카운트 파생 반영)"
  - "[ORIG] runs/UI-05.S2a/20260911T051952Z_R2/ (본 파일·COMMANDS·로그·diff·HANDOFF.zip)"
acceptance:
  UI-05.S2a-AC1: {status: PASS, evidence: "51개 assertion 전부 통과(기존 37 + R2 14)"}
  UI-05.S2a-AC2: {status: PASS, evidence: "R2-F2 6건 + 기존 벡터 통과"}
  UI-05.S2a-AC3: {status: PASS, evidence: "기존 벡터·forecast 유지 대조 통과"}
  UI-05.S2a-AC4: {status: PASS, evidence: "reader·목업 검사 유지 통과, 서버 무변경"}
  UI-05.S2a-AC5: {status: PASS, evidence: "R1-F1·F4 회귀 없음 + R2-F3 통과"}
commands:
  - {summary: "전문은 COMMANDS.md. RED 10건 재현 후 수정, 51/51 통과.", classification: PASS}
not_run:
  - "브라우저 검수 — 화면 없음, 범위 밖"
  - "OOS·WTI·모델평가·연구 수집 — 범위 밖"
  - "원격 CI 실행 — 결제/한도 차단 유지"
blockers:
  - "팀 승인(방향·역할·공개범위) 미확인"
  - "CI·Vercel 차단 — 기존 상태 유지"
  - "tasks.json 원격 미반영(로컬 수동 원장)"
next_unit: UI-05.S2b (미승인, 자동 실행 안 함)
```

## 1. F2·F3 원인과 수정

**F3 원인**: DEMO의 previous_score 비공개 처리가 현재 score 검증의
`else if (data_origin === "DEMO")` 분기 안에만 있었다. score가 null·삭제·101·NaN이면
그 분기에 도달하지 않아 이전값 40이 남았다.
**수정**: DEMO 분기에서 비공개 처리를 제거하고, score 검증 체인 **뒤**에
`if (out.data_origin === "DEMO")` 독립 블록을 두어 score·previous_score를
항상 null로 만들고 경고를 남긴다. history 비움은 R1에서 이미 독립 처리였다.

**F2 원인**: `isSafePublicUrl`이 ① 원문 scheme 정규식이 맞을 때만 protocol을 검사해
제어문자(TAB/LF)로 위장한 `javascript:`와 역슬래시 scheme-relative가 통과했고,
② 민감 키 검사가 정확 일치라 `X-Amz-Signature`/`X-Goog-Signature`가 통과했으며,
③ fragment를 전혀 검사하지 않아 `#access_token=`이 통과했다.
**수정**: ① 원문에 C0 제어문자·DEL·역슬래시가 있으면 파싱 전에 거부.
② 파싱 뒤 `parsed.protocol !== "https:"`를 **항상** 검사하고,
  https 절대 URL 또는 기준 origin을 벗어나지 않는 `/` 로컬 경로만 허용.
③ `isSensitiveParamName`: 소문자·구분자 제거·percent 디코딩 정규화,
  X-Amz-/X-Goog- 계열 서명·인증 키 차단, malformed 인코딩은 보수 차단.
④ `hasSensitiveFragment`: `#key=value`의 key를 같은 규칙으로 검사.
- 민감 부분만 잘라 새 URL을 만들지 않고 링크를 비공개(제외)한다.
- 이 형식 검사는 이용·재배포 권한이나 모든 비밀정보를 검증하지 않는다(주석 명시).

## 2. 테스트 결과

| 검사 | 결과 |
|---|---|
| RED (수정 전) | 51개 중 10개 실패 — F3 4 + F2 6 (`tests-cai-view-red.txt`) |
| GREEN (수정 후) | 51/51 PASS, exit 0 (`tests-cai-view.log`) |
| 기존 회귀 (cushing-context) | 24/24 PASS, exit 0 |
| typecheck | PASS, exit 0 |
| build | PASS, exit 0 (336ms) |
| 기존 테스트 삭제·약화 | 없음. F1·F4 회귀 없음 |

정상 대조 검증: DEMO 0·50·100 비공개, DEMO에서 forecast 확률 유지,
OBSERVED 이전값·history 중간 null 보존, team_only 비공개 유지,
정상 로컬 링크·EIA query 링크 유지(기존 테스트).

## 3. 변경 파일과 미확인

- 수정: `cai-view.ts`(두 규칙만), `cai-view.test.mjs`(+14).
- R1→R2 코드 diff: `cai-view.r1-to-r2.diff`, `cai-view.test.r1-to-r2.diff`.
- 불변: 타입·함수명·schema_version·서버 리더·CI 항목.
- 미확인: 팀 승인, CI·Vercel 차단(기존), 원장 원격 미반영.

## 4. 14개 작업 상태별 개수

- REVIEW 4 (BOOT-01·DATA-01·OPS-01·UI-05.S2a R2) · DONE 1 (REP-01) ·
  TODO 9 · DOING/BLOCKED/READY 0. 합계 14. R2 별도 작업 추가 없음.

## 5. 사람에게 보여줄 요약

**작업·상태:** UI-05.S2a R2 / REVIEW(SELF_CHECK).
**수정:** F3 DEMO 비공개를 score 검증과 독립, F2 URL 구조·인증정보 일관 검사.
**검사:** RED 10 → GREEN 51/51, 회귀·typecheck·build PASS.
**원장:** REVIEW 4·DONE 1·TODO 9. S2b 미시작.
**다음 작업 하나:** UI-05.S2b (승인 시). 자동 실행 안 함.
