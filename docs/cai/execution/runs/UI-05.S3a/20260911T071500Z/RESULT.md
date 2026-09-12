# 실행 결과 — UI-05.S3a (현재 CAI 연구·검증 화면 분리)

```yaml
unit_id: UI-05.S3a
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
  - "[WS] app/app/components/cai/cai-research.tsx (신규)"
  - "[WS] app/app/routes/research.tsx (loader cai + 섹션 연결, 나머지 보존)"
  - "[WS] app/tests/cai-research.test.mjs (신규, SSR 7 + 통합 1)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
acceptance:
  UI-05.S3a-AC1: {status: PASS, evidence: "manifest 빈 상태에서 '채택 0·검토 0·보류 0', 옛 후보 자동 합산 없음 문구. 통합·SSR 검사."}
  UI-05.S3a-AC2: {status: PASS, evidence: "NOT_RUN은 표본 —·지표 —·미평가, CAI 영역 0% 없음(통합 검사)."}
  UI-05.S3a-AC3: {status: PASS, evidence: "'과거 검증 수치는 이 표에 재사용하지 않습니다' + 옛 ledger는 보관 기록으로만 유지."}
  UI-05.S3a-AC4: {status: PASS, evidence: "#intake·#method·#ledger anchor 유지, #method 직접 진입 시 details open(브라우저)."}
  UI-05.S3a-AC5: {status: PASS, evidence: "공개 근거 0건 + '비공개 원문은 공개 완료 근거로 쓰지 않습니다' + team_only는 팀 내부 자료, href 없음."}
commands:
  - {summary: "cai-research 8/8, 전체 134/134, typecheck/build exit 0, 브라우저 단계·anchor·overflow 확인. 전문 COMMANDS.md.", classification: PASS}
not_run:
  - "CI 원격 실행 — 결제/한도 차단 유지."
blockers:
  - "팀 공개 범위 승인 미확인"
scope_notes:
  - "슬라이더 실험실은 첫 release 범위대로 만들지 않음(가상 격리 대상 자체를 제거)."
next_unit: UI-05.S3b (과거 장부·결정 이력을 히스토리에 연결)
```

## 1. 구현 요약

- `CaiResearch({view})`: 현재 연구 상태(자료 연결·지수 산출·가중치 학습·독립 평가 분리),
  CAI 구성 데이터(채택·검토·보류, 빈 목록은 자동 합산 없음 명시), 정의·가중치(1/n 공개),
  모델 비교(4행, 지표 없으면 —·미평가), 실행 근거(run/표본/OOS/동결·검토 참조),
  근거(공개 링크/팀 내부), 추가 설명(기본 접힘).
- `/research`는 현재 CAI 섹션을 먼저 보여주고, 기존 intake·보관 기록·방법 anchor는 보존.
- loader에 `readCaiPublicView`(실패 시 emptyCaiView) 추가.

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| 신규 cai-research | 8/8 PASS (`tests-cai-research.log`) |
| 전체 CI 목록 | 134/134 PASS (`tests-full.log`) |
| typecheck / build | PASS / PASS |
| 브라우저(ego) | 단계 4종 상태, 채택 0/검토 0/보류 0, 모델 4행, anchor 3종, details 접힘, CAI 0% 없음, overflow 0 (`research.png`) |

## 3. 사람에게 보여줄 요약

**작업·상태:** UI-05.S3a / REVIEW(SELF_CHECK, SSR·통합·브라우저 확인).
**성과:** /research가 현재 CAI 근거·검증 상태를 먼저 보여주고, 옛 기록과 분리됨.
**남은 M1:** UI-05.S3b(과거 장부·결정 이력을 히스토리에 연결) 하나.
