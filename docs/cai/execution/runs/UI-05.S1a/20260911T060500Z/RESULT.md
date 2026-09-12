# 실행 결과 — UI-05.S1a (히스토리 라우트·기존 사례 열기)

```yaml
unit_id: UI-05.S1a
parent_task_id: UI-05.S1
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
authorization_evidence:
  - "사용자 위임(2026-09-11 오케스트레이터 인수 프롬프트): UI-05 로컬 구현·통합 승인."
changed_files:
  - "[WS] app/app/routes/history.tsx (신규, 97행)"
  - "[WS] app/app/routes.ts (history 등록 1행)"
  - "[WS] app/tests/cai-history.test.mjs (신규, 189행)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
  - "[ORIG] docs/cai/execution/runs/UI-05.S1a/20260911T060500Z/ (본 결과·로그·스크린샷)"
acceptance:
  UI-05.S1a-AC1: {status: PASS, evidence: "브라우저 직접 진입: h1·사례 9개·기본 수박 샘플·WTI 미포함. 테스트: /history 200·research-sample·옵션 9개."}
  UI-05.S1a-AC2: {status: PASS, evidence: "지원 sample 9종 전부 200 + 사례 마커 일치, unknown은 기본 수박, 가짜 안내 없음(tests-cai-history.log)."}
  UI-05.S1a-AC3: {status: PASS, evidence: "홈 200·wti-daily-chart·research-sample 유지, history 전용 h1 미노출."}
  UI-05.S1a-AC4: {status: PASS, evidence: "CI Test 목록에 tests/cai-history.test.mjs 등록(ci.diff)."}
  UI-05.S1a-AC5: {status: PASS, evidence: "history.tsx가 WTI readers를 import하지 않음(소스 검사), 홈 WTI 규칙 변경 없음. 실패 주입 검사는 아님."}
commands:
  - {summary: "RED(라우트·파일 부재 2/2 실패) → GREEN 2/2 → 전체 118/118, typecheck/build exit 0. 전문 COMMANDS.md.", classification: PASS}
not_run:
  - "실패 주입으로 홈 WTI 규칙을 바꾸는지 확인하는 별도 검사는 하지 않음(소스 분리로 대체)."
  - "CI 원격 실행 — 결제/한도 차단 유지(로컬 검사와 분리)."
blockers:
  - "팀 공개 범위 승인 미확인"
next_unit: UI-05.S1b (구주소·anchor 호환)
```

## 1. 구현 요약

- `/history` 라우트 추가(`routes.ts` 1행). loader는 `readVisibility`·`readTankerArrivals`·
  `readCushingWeather`·`readResearchIntake`만 읽고 WTI 일봉·시장 스냅샷은 읽지 않는다.
- 화면은 홈의 `ResearchSample`을 데이터 정의 변경 없이 그대로 재사용한다. 기본 진입은
  실제 수박 샘플이며, `?sample=`으로 9개 사례(보드·고정 6·갱신 2)를 연다. `#research-sample`
  앵커가 유지된다. action은 읽기 전용 405(쓰기 기능 없음).
- 홈 라우트·기존 sample 동작은 변경하지 않았다(사례 탐색 중복 제공은 의도된 M1 중간 상태).

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| RED | 라우트·테스트 대상 부재로 2/2 실패 |
| GREEN (history) | 2/2 PASS, exit 0 (`tests-cai-history.log`) |
| 전체 CI 목록 | 118/118 PASS, exit 0 (`tests-full.log`) |
| typecheck / build | PASS / PASS (exit 0) |
| 브라우저(ego) 직접 진입 | `/history` 200, 사례 9개, 제주 전환 → URL `?sample=jeju#research-sample`, 차트 교체 |

브라우저 검수는 빌드 서버(cwd=app) + ssr-yahoo fixture로 수행. 스크린샷은 history-route.png.

## 3. 14개 작업 상태별 개수 (S1a·S2b 마감 반영)

- DONE 4 (REP-01·UI-05.S2a·UI-05.S2b·UI-05.S1a) · REVIEW 3 (BOOT-01·DATA-01·OPS-01) ·
  TODO 7 · DOING/BLOCKED/READY 0. 합계 14.

## 4. 사람에게 보여줄 요약

**작업·상태:** UI-05.S1a / REVIEW(SELF_CHECK, 통합 테스트·브라우저 확인).
**성과:** 로컬에서 `/history`로 확보 사례 9종을 열 수 있게 됨. 홈 기존 동작·WTI 유지.
**다음:** UI-05.S1b(구주소·anchor 호환) → S2c(홈·세 메뉴 연결) → S3a → S3b.
