# 실행 결과 — UI-05.S1b (구주소·anchor 호환 연결)

```yaml
unit_id: UI-05.S1b
parent_task_id: UI-05.S1
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
authorization_evidence:
  - "사용자 위임(2026-09-11): UI-05 로컬 구현·통합 승인 + URL_COMPAT 계약이 이 카드의 명세."
changed_files:
  - "[WS] app/app/lib/cai-legacy-routing.ts (신규, 순수 URL 결정)"
  - "[WS] app/app/routes/home.tsx (loader redirect + hash replace + 미지원 안내)"
  - "[WS] app/app/routes/research.tsx (sample/candidate redirect + hash replace)"
  - "[WS] app/app/routes/history.tsx (미지원 sample 안내만, 재이동 없음)"
  - "[WS] app/tests/cai-legacy-links.test.mjs (신규, 순수+통합 7)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
  - "[WS|범위기록] app/routes/empties.tsx·tankers.tsx·visibility.tsx·cushing-busy.tsx, tests/deployment-cwd.test.mjs"
acceptance:
  UI-05.S1b-AC1: {status: PASS, evidence: "9개 sample 전부 /·/research → 308 /history?sample=X#research-sample, follow 1회·최종 화면 일치(통합 테스트)."}
  UI-05.S1b-AC2: {status: PASS, evidence: "hash-only: 서버 무관 클라이언트 replace, 브라우저에서 /research#ledger→/history#ledger·back→about:blank(루프 없음), 클릭 back 정상."}
  UI-05.S1b-AC3: {status: PASS, evidence: "미지원 sample·빈 값·외부 URL·미지원 candidate는 redirect 없음/200, 안내 문구만, 새 원장 생성 없음."}
  UI-05.S1b-AC4: {status: PASS, evidence: "/history 직접 진입·sample·hash 조합 전부 200, 재이동 없음."}
  UI-05.S1b-AC5: {status: PASS, evidence: "candidate=018 현행 유지·원장 open·018 원문 링크 그대로, ID 재번호/삭제 없음."}
commands:
  - {summary: "순수 6 + 통합 1 = 7/7, 전체 125/125, typecheck/build exit 0. 전문 COMMANDS.md.", classification: PASS}
not_run:
  - "CI 원격 실행 — 결제/한도 차단 유지(로컬 검사와 분리)."
blockers:
  - "팀 공개 범위 승인 미확인"
scope_notes:
  - "URL_COMPAT 계약이 요구하는 /observations/* 복귀 링크와 empties redirect, /research redirect 기대값 갱신은 카드 목록 밖 보조 변경으로 판단·기록함(사유: 계약 표·구현 경계)."
  - "정적 public/research/ 디렉터리 때문에 /research가 /research/로 301 정규화됨 → 헬퍼가 끝 슬래시를 정규화. 발견·기록."
next_unit: UI-05.S2c (홈·세 메뉴 연결)
```

## 1. 구현 요약

- `cai-legacy-routing.ts`: 지원 sample을 `SAMPLE_LINKS`에서 파생(하드코딩 없음), root/research
  query 진입을 history로, hash-only를 history로, candidate는 현행 manifest ID 유지·옛 ID만
  history로, 미지원 값 안내. 외부 URL은 redirect 대상으로 쓰지 않고 다른 query는 보존한다.
- loader는 redirect를 무거운 조회 전에 처리(홈 WTI 미조회). history는 재이동하지 않는다.
- 클라이언트는 replace로 hash-only를 옮겨 뒤로가기 루프를 만들지 않는다.

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| 신규 legacy 테스트 | 7/7 PASS (`tests-cai-legacy-links.log`) |
| 전체 CI 목록 | 125/125 PASS (`tests-full.log`) |
| typecheck / build | PASS / PASS |
| 브라우저(ego) | /research#ledger→/history#ledger·back 루프 없음, /#research-sample→/history#research-sample, 사례 클릭 후 back 정상, /research#method 유지+접힘 열림, /research?sample=jeju 1회 이동 |

## 3. 사람에게 보여줄 요약

**작업·상태:** UI-05.S1b / REVIEW(SELF_CHECK, 통합·브라우저 확인).
**성과:** 구주소·anchor가 history로 보존 연결됨. 미지원 값은 지어내지 않음.
**다음:** UI-05.S2c(홈·세 메뉴 연결).
