# 실행 결과 — UI-05.S3b (과거 장부·결정 이력을 히스토리에 연결)

```yaml
unit_id: UI-05.S3b
parent_task_id: UI-05.S3
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
authorization_evidence:
  - "사용자 위임(2026-09-11): UI-05 로컬 구현·통합 승인."
changed_files:
  - "[WS] app/app/components/cai/history-ledger.tsx (신규: 원장 검색 + 결정 타임라인 + CFAM 이력)"
  - "[WS] app/app/routes/history.tsx (원장·타임라인 연결)"
  - "[WS] app/app/routes/research.tsx (원장 중복 제거, candidate→history 연결)"
  - "[WS] app/tests/cai-history-ledger.test.mjs (신규, SSR 6 + 통합 1)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
  - "[WS|범위기록] tests/deployment-cwd·cai-research·cai-legacy-links의 원장 위치 기대값 갱신"
acceptance:
  UI-05.S3b-AC1: {status: PASS, evidence: "ID 그대로(candidate-001/018)·원문 링크 보존, 검색 018 → 1건. data 정본은 research/factors 하나."}
  UI-05.S3b-AC2: {status: PASS, evidence: "타임라인 배지 승인/미확인/미완결/진단 실제값. 성찬 항목은 미확인 배지(승인 아님) — SSR 검사."}
  UI-05.S3b-AC3: {status: PASS, evidence: "CFAM 별도 이력 블록: 고정·예약·실제 적용 비중 구분, '자동 승격하지 않습니다', 보드 원문 링크."}
  UI-05.S3b-AC4: {status: PASS, evidence: "검색은 전체 97개 기준·표시 6개와 구분, 더 보기·조건 초기화·빈 결과 상태(브라우저)."}
  UI-05.S3b-AC5: {status: PASS, evidence: "research에서 원장 제거(id=ledger 없음)+history로 링크, 정본 복제 없음. 테스트로 양쪽 확인."}
commands:
  - {summary: "cai-history-ledger 7/7, 전체 141/141, typecheck/build exit 0, 브라우저 검색·직접진입·새로고침·뒤로가기·빈 결과 확인. 전문 COMMANDS.md.", classification: PASS}
not_run:
  - "CI 원격 실행 — 결제/한도 차단 유지."
  - "원문(GitHub) 저장소 공개 범위 — private 여부 미확인, 화면은 요약·메타데이터를 자체 제공."
blockers:
  - "팀 공개 범위 승인 미확인"
scope_notes:
  - "S3b 계약(card step 3)에 따라 원장 검색을 history로 옮기며, 기존 테스트 3곳의 위치 기대값을 갱신(카드 밖 보조 변경, 사유 기록)."
  - "legacyCandidateRedirect 헬퍼는 옛 ID 계약 그대로 유지(route에서 계속 사용), 현행 ID는 route에서 추가로 history 이동."
next_unit: UI-06 (승인된 실제 run 연결, 자료·게시 승인 대기)
```

## 1. 구현 요약

- `history-ledger.tsx`: research의 원장 블록을 재사용 컴포넌트로 추출(검색·필터·더 보기·ID
  앵커·판정 기준 링크), `DecisionTimeline`(실제 날짜·상태·이유·근거 6건)과 CFAM 별도 이력
  (고정/예약/실제 적용 비중 구분, 학습 CAI 자동 승격 금지) 추가.
- history: 사례 탐색 → 결정 타임라인 → 보관 기록 순. `?candidate=`는 원장을 열고 ID를 검색.
- research: 원장 중복 제거(안내 링크만), 알려진 candidate는 `/history?candidate=<id>#ledger`로
  1회 이동, 모르는 값은 안내 문구만.

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| 신규 cai-history-ledger | 7/7 PASS (`tests-cai-history-ledger.log`) |
| 전체 CI 목록 | 141/141 PASS (`tests-full.log`) |
| typecheck / build | PASS / PASS |
| 브라우저(ego) | 타임라인 6·CFAM, 원장 기본 접힘→열기, 018 검색 1건, 직접 진입·새로고침 open 유지, 빈 결과 상태, 뒤로가기 정상, 390px overflow 0 (`history-ledger.png`) |

## 3. M1 완료 상태

- 홈(대시보드)=CAI 계기판·방향·WTI, 연구·검증=현재 CAI+후보+방법, 히스토리=사례+결정+원장.
- 기존 사례·구주소·anchor·뒤로가기 보존(URL_COMPAT), CAI란? 기본 접힘, 미연결 시 산출 대기·예측 미실행.
- UI-05 7개 카드(S1a·S1b·S2a·S2b·S2c·S3a·S3b) 전부 DONE. UI-06·QA-02·REL-01은 M1 범위 밖.

## 4. 사람에게 보여줄 요약

**작업·상태:** UI-05.S3b / REVIEW(SELF_CHECK, SSR·통합·브라우저 확인). **M1 달성.**
**남은 것:** UI-06(승인된 실제 run 연결 — 자료·게시 승인 대기), QA-02(통합 검수), REL-01(배포)는
각자의 승인·전제조건 필요.
