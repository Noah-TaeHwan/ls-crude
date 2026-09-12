# 실행 결과 — UI-05.S2a R1 (REVISION 보완)

```yaml
unit_id: UI-05.S2a
revision: R1
parent_task_id: UI-05.S2
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
working_tree_diff_evidence: 작업공간 diff = ci.yml 1행 + 신규 3파일(내용은 R1 수정 포함). 원본 tracked 무변경.
pre_existing_changes:
  - "작업공간 상태 확인: HEAD cecf1cf, branch work/ui-05-s2a, 변경 4경로만. 외부 변경 없음."
  - "fetch/pull/새 worktree/브랜치 전환 없음."
authorization_evidence:
  - "사용자 승인: R1 F1–F4 보완(cai-view.ts+테스트만). 서버·CI·타입·이름·schema_version 변경 금지."
changed_files:
  - "[WS] app/app/lib/cai-view.ts (R1 수정)"
  - "[WS] app/tests/cai-view.test.mjs (테스트 15개 추가)"
  - "[WS] app/app/lib/cai-view.server.ts (변경 없음, 재실행용 포함)"
  - "[WS] .github/workflows/ci.yml (S2a 추가분 유지, 중복 추가 없음)"
  - "[ORIG] docs/cai/tasks.json (S2a DOING→REVIEW·R1 기록)"
  - "[ORIG] docs/cai/TASKS.md (카운트 파생 반영)"
  - "[ORIG] runs/UI-05.S2a/20260911T050138Z_R1/ (본 파일·COMMANDS·ci.diff·tests 로그·HANDOFF.zip)"
acceptance:
  UI-05.S2a-AC1: {status: PASS, evidence: "37개 assertion 전부 통과(기존 22 + R1 15)"}
  UI-05.S2a-AC2: {status: PASS, evidence: "R1-F2 5건 + 기존 벡터 통과"}
  UI-05.S2a-AC3: {status: PASS, evidence: "기존 벡터 유지 통과"}
  UI-05.S2a-AC4: {status: PASS, evidence: "reader·목업 검사 유지 통과, 서버 무변경"}
  UI-05.S2a-AC5: {status: PASS, evidence: "R1-F1·F4 5건 통과"}
commands:
  - {summary: "전문은 COMMANDS.md. 실패 11건 재현 후 수정, 전량 통과.", classification: PASS}
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

## 1. F1–F4 재현 → 수정 → 검사

| 항목 | 재현(수정 전) | 수정 | 검사(수정 후) |
|---|---|---|---|
| F1 달력 날짜 | 2건 실패 (02-30 통과) | ISO 구성요소 직접 검증(윤년·월일·시분초·offset 범위). epoch 비교 유지 | 2건 통과 + 윤일 대조 통과 |
| F2 URL 경계 | 5건 실패 (통과) | URL 구조 검사: 비-https scheme·scheme-relative·userinfo·민감 query 차단, team_only url null. 경고에 원문 없음 | 5건 통과 + 정상 2건 유지 |
| F3 DEMO 이전값 | 1건 실패 (잔류) | DEMO previous null + history 비움. origin 유지 | 1건 통과 + OBSERVED 대조 통과 |
| F4 공백·표본순서 | 3건 실패 (통과) | 필수 문자열 trim 판정. sample_start≤end를 독립 조건에 추가 | 3건 통과 |

## 2. 기존/추가 테스트·회귀·typecheck·build

| 검사 | 결과 |
|---|---|
| 새 전체 37개 (기존 22 + R1 15) | 37/37 PASS, exit 0 |
| 기존 회귀 cushing-context 24개 | 24/24 PASS, exit 0 |
| typecheck | PASS, exit 0 |
| build | PASS, exit 0 (525ms) |
| 기존 테스트 삭제·약화 | 없음 |

## 3. 변경 파일과 남은 제한

- 수정: `cai-view.ts`(검증 로직만), `cai-view.test.mjs`(테스트 15개 추가).
- 불변: 타입·함수명·schema_version, 서버 리더, CI 항목(중복 없음).
- 금지 준수: 원본 앱·연구·과거 결과·킷·의존성 무변경. 커밋·배포 없음.

## 4. 14개 작업 상태별 개수

- REVIEW 4 (BOOT-01·DATA-01·OPS-01·UI-05.S2a) · DONE 1 (REP-01) ·
  TODO 9 · DOING/BLOCKED/READY 0. 합계 14 일치. R1 별도 작업 추가 없음.

## 5. 사람에게 보여줄 요약

**작업·상태:** UI-05.S2a R1 / REVIEW(SELF_CHECK).
**수정:** F1–F4 최소 수정, 11 실패 재현 후 37/37 통과.
**검사:** 회귀·typecheck·build PASS. 기존 테스트 무삭제.
**원장:** REVIEW 4·DONE 1·TODO 9. S2b 미시작.
**다음 작업 하나:** UI-05.S2b (승인 시). 자동 실행 안 함.
