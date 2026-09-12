# 실행 결과 — UI-05.S2b (CAI 계기판·예측·설명 컴포넌트)

```yaml
unit_id: UI-05.S2b
parent_task_id: UI-05.S2
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: work/ui-05-s2a
head_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a
authorization_evidence:
  - "사용자 위임(2026-09-11 오케스트레이터 인수 프롬프트): UI-05 로컬 구현·통합 승인."
changed_files:
  - "[WS] app/app/components/cai/cai-gauge.tsx (신규)"
  - "[WS] app/app/components/cai/cai-forecast.tsx (신규)"
  - "[WS] app/app/components/cai/cai-about.tsx (신규)"
  - "[WS] app/tests/cai-components.test.mjs (신규)"
  - "[WS] .github/workflows/ci.yml (테스트 1건 등록)"
  - "[ORIG] docs/cai/execution/runs/UI-05.S2b/20260911T055200Z/ (본 결과·로그·미리보기·스크린샷)"
acceptance:
  UI-05.S2b-AC1: {status: PASS, evidence: "단위: needle 부재·—·aria-valuenow 부재, 등급 표현 없음. 브라우저: 빈 블록 바늘 0·— 표시."}
  UI-05.S2b-AC2: {status: PASS, evidence: "0/50/100 각도(90-gaugeAngle)·aria·수치 일치 12/12, 0에도 바늘."}
  UI-05.S2b-AC3: {status: PASS, evidence: "미승인·DEMO·빈 상태는 pending, 64.2/35.8 미표시."}
  UI-05.S2b-AC4: {status: PASS, evidence: "details 기본 closed(단위+브라우저), 구성·검증·근거는 summary 뒤."}
  UI-05.S2b-AC5: {status: PASS, evidence: "360/390/691/1280 scrollWidth=innerWidth, 클리핑 0(SSR 정적 미리보기)."}
commands:
  - {summary: "RED(컴포넌트 부재) → 12/12 GREEN, 전체 CI 목록 116/116, typecheck/build PASS. 전문은 COMMANDS.md.", classification: PASS}
not_run:
  - "실제 라우트 통합 화면 — S2c 범위. 브라우저 검수는 SSR 정적 미리보기(file://)로 수행."
  - "CI 원격 실행 — 결제/한도 차단 유지(로컬 검사와 분리)."
blockers:
  - "S2c 연결 전까지 앱 화면에서 직접 노출되지 않음"
  - "팀 연구·공개 승인 미확인"
next_unit: UI-05.S1a (히스토리 라우트)
```

## 1. 구현 요약

- `CaiGauge({index})`: 반원 0–100 눈금, `gaugeAngle`로 바늘 각도(수식 `90−gaugeAngle`),
  결측 —·바늘 숨김, 실제 0은 바늘 0. 상태 라벨(데모·미게시/산출 대기/갱신 지연/갱신 오류)과
  기준일·가중치·구성 수·전기 대비 변화 표시. 활동 등급·공포/탐욕 표현 없음.
- `CaiForecast({forecast,validation})`: `displayedProbabilities` 통과 시에만 확률 게시.
  상승 1자리 반올림, 하락·보합은 100에서 뺌. 날짜(YYYY년 M월 D일)·ISO 주차(Wn)·모델/학습 run·
  대상 정의 표시. 미승인·DEMO·빈 상태는 pending 문구만, 예시 확률 보충 없음.
- `CaiAbout({view})`: 기본 접힘 `<details>`. 정의→관측 영역(constituents)→비중→현재 검증 상태→
  근거(공개 URL만 href, team_only는 팀 전용 표기, 내부 주소 비노출).
- 테스트: Node가 .tsx를 직접 못 읽으므로 기존 devDependency `typescript`로 트랜스파일 후
  `react-dom/server`로 SSR 렌더. 새 패키지 없음.

## 2. 검사 결과

| 검사 | 결과 |
|---|---|
| RED (컴포넌트 부재) | import 실패 1/1 |
| GREEN 컴포넌트 | 12/12 PASS, exit 0 |
| 전체 CI 테스트 목록 | 116/116 PASS, exit 0 |
| typecheck / build | PASS exit 0 / PASS exit 0 |
| 브라우저(ego) 360/390/691/1280 | overflow 0, 클리핑 0, 빈 상태 바늘 0, details 기본 closed, Enter/Space 토글 |

브라우저 검수는 `component-preview.html`(SSR 정적 미리보기, built CSS 인라인)을 ego로 연 것이다.
앱 라우트 통합 화면 검수는 S2c에서 수행한다.

## 3. 14개 작업 상태별 개수 (갱신 후)

- DONE 2 (REP-01·UI-05.S2a) · REVIEW 4 (BOOT-01·DATA-01·OPS-01·UI-05.S2b) ·
  TODO 8 · DOING/BLOCKED/READY 0. 합계 14.

## 4. 사람에게 보여줄 요약

**작업·상태:** UI-05.S2b / REVIEW(SELF_CHECK).
**성과:** CAI 계기판·방향·설명 컴포넌트 3종 로컬 구현, 테스트 12개·전체 116개 통과,
4개 화면 폭 브라우저 확인.
**다음:** 검토 후 UI-05.S1a(히스토리 라우트) → S1b → S2c 순서.
