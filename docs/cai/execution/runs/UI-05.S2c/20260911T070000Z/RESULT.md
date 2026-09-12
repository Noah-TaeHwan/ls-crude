# 실행 결과 — UI-05.S2c (홈과 세 메뉴를 새 CAI 구조로 연결)

```yaml
unit_id: UI-05.S2c
parent_task_id: UI-05.S2
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
authorization_evidence:
  - "사용자 위임(2026-09-11): UI-05 로컬 구현·통합 승인."
changed_files:
  - "[WS] app/app/routes/home.tsx (CAI 계기판·방향·WTI + 헤더/메타)"
  - "[WS] app/app/components/desk-chrome.tsx (세 메뉴, 캡션 제거)"
  - "[WS] app/tests/cai-home.test.mjs (신규 SSR 통합 검사)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
  - "[WS|범위기록] tests/deployment-cwd.test.mjs 홈 기대값, tests/cai-history.test.mjs 홈 1줄"
acceptance:
  UI-05.S2c-AC1: {status: PASS, evidence: "홈에 계기판(—, no needle)·방향(pending)·WTI(93.03)만, data-up/예시 숫자 없음."}
  UI-05.S2c-AC2: {status: PASS, evidence: "홈 사례 링크 → /history#research-sample, 9 사례 동작(cai-history·legacy 테스트)."}
  UI-05.S2c-AC3: {status: PASS, evidence: "CAI는 독립 adapter(빈 상태/실패 시 emptyCaiView catch)로 WTI 영역과 분리, 홈에서 WTI 93.03 유지."}
  UI-05.S2c-AC4: {status: PASS, evidence: "nav 대시보드·연구·검증·히스토리, ALTERNATIVE DATA RESEARCH 캡션 제거. build·skip link 유지."}
  UI-05.S2c-AC5: {status: PASS, evidence: "forecast pending 문구, 50% 기본값·예시 확률 없음."}
commands:
  - {summary: "cai-home 1/1, 전체 126/126, typecheck/build exit 0. 브라우저 3메뉴·390px overflow 0. 전문 COMMANDS.md.", classification: PASS}
not_run:
  - "CI 원격 실행 — 결제/한도 차단 유지."
  - "CAI 실패 주입 검사 — readCaiPublicView는 실패 시 빈 상태 어댑터(빈 CAI+WTI 동시 렌더로 기본 경로 확인)."
blockers:
  - "팀 공개 범위 승인 미확인"
scope_notes:
  - "deployment-cwd·cai-history의 홈 기대값은 S2c 카드(홈 전환)가 의도한 변경이라 갱신(카드 밖 보조 변경, 사유 기록)."
  - "P2 관찰: CaiGauge의 모듈 h2와 홈 h1이 같은 문구로 중복 표시됨(시각적 중복). S2b 동결 컴포넌트라 이번 범위에서 수정하지 않음."
next_unit: UI-05.S3a (현재 연구·검증 화면)
```

## 1. 구현 요약

- 홈 loader: CAI 공개 adapter(`readCaiPublicView`, 실패 시 `emptyCaiView`)와 WTI 일봉·시장
  스냅샷만 읽는다. 비CAI 네트워크 읽기(intake/ledger/visibility/tankers/weather)와
  ResearchSample 호출은 홈에서 제거(원본 파일은 삭제하지 않음, history에서 동작).
- 홈 화면: h1 "쿠싱 액티비티 인덱스" → 계기판(산출 대기 —) → CAI란?(접힘) → 방향(미실행) →
  WTI 가격 흐름 → history/research 안내 한 줄.
- 헤더: 작은 LS CRUDE + 대시보드·연구·검증·히스토리. 브랜드 캡션(LS 설명 블록) 제거.
- meta title/description을 제품명 기준으로 교체.

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| 신규 cai-home | 1/1 PASS |
| 전체 CI 목록 | 126/126 PASS |
| typecheck / build | PASS / PASS |
| 브라우저(ego) | 홈 3메뉴 클릭 이동, gauge —/no needle, forecast pending, WTI 93.03, details 접힘, 390px overflow 0 (`home-390.png`) |

## 3. 사람에게 보여줄 요약

**작업·상태:** UI-05.S2c / REVIEW(SELF_CHECK, SSR 통합·브라우저 확인).
**성과:** 홈이 CAI 계기판·방향·WTI 중심으로 전환, 세 메뉴 연결, 사례는 history.
**남은 M1:** S3a(연구·검증 화면) → S3b(과거 장부·결정 이력).
