# 홈 DEFCON 예시 게이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 반원 하나를 피자/DEFCON **예시** 바늘로 바꾸고, WTI 변동성 숫자는 게이지가 아니라 가격 칸 텍스트로 둔다.

**Architecture:** `sampleDefconScore()`가 시장 백분위를 받아도 항상 `58`을 돌려준다. `WatchGauge`는 제목·뱃지·구간 라벨만 props로 받는다. `home.tsx`는 스냅샷 RV를 `score`에 넣지 않는다. `gauge.ts` 기하학은 그대로다.

**Tech Stack:** React Router 7, TypeScript, 기존 `WatchGauge` SVG, Node `node:test` (앱에 이미 `tests/*.mjs`가 `../app/lib/*.ts`를 import함).

**Spec:** `docs/superpowers/specs/2026-09-04-home-pizza-hero-sample-design.md`

## Global Constraints

- 반원 속도계는 홈에 **하나**. 새 차트 라이브러리 없음.
- 바늘은 `SAMPLE_DEFCON_SCORE = 58`, 표기 `DEFCON 3`. `rv5ReferencePercentile`을 바늘에 연결하면 실패.
- `PASS_COUNT = 0`. 예시를 켠다고 올리지 않음.
- 로더는 오늘처럼 `readWtiMarketSnapshot()`만. 샘플 필드 추가 금지.
- `npm run dev`로 포트를 늘리지 않음. 확인은 localhost:5173.
- 커밋은 노아가 요청할 때만.

## File map

| File | Role |
|------|------|
| Create `app/app/lib/defcon-sample.ts` | 예시 상수와 `sampleDefconScore` |
| Create `app/tests/defcon-sample.test.mjs` | 바늘이 시장 백분위를 무시하는지, 홈이 RV를 WatchGauge에 안 넘기는지 |
| Modify `app/app/components/watch-gauge.tsx` | 제목·예시 뱃지·구간·설명 props. `rv5` 제거 |
| Modify `app/app/routes/home.tsx` | 예시 게이지 + RV 텍스트를 가격 칸으로 이동 |

---

### Task 1: 예시 점수 모듈

**Files:**
- Create: `app/app/lib/defcon-sample.ts`
- Test: `app/tests/defcon-sample.test.mjs`

**Interfaces:**
- Consumes: 없음
- Produces: `SAMPLE_DEFCON_SCORE: 58`, `SAMPLE_DEFCON_BAND: "DEFCON 3"`, `SAMPLE_DEFCON_TITLE: "원유 DEFCON"`, `SAMPLE_DEFCON_EXPLAINER`, `SAMPLE_DEFCON_DETAIL`, `sampleDefconScore(marketPercentile?: number | null): number`

- [ ] **Step 1: Write the failing test**

`app/tests/defcon-sample.test.mjs`는 `sampleDefconScore(73) === 58`, 홈 소스가 `sampleDefconScore`를 쓰고 `<WatchGauge` 다음에 `rv5ReferencePercentile`을 넣지 않는지, `PASS_COUNT = 0`인지 검사한다.

- [ ] **Step 2:** `cd app && node --test tests/defcon-sample.test.mjs` — 모듈 없으면 FAIL.

- [ ] **Step 3:** `defcon-sample.ts`에 상수와 `sampleDefconScore`를 둔다. 시장 백분위 인자는 무시하고 항상 58.

- [ ] **Step 4:** 점수 테스트 PASS. 홈 소스 테스트는 Task 3까지 FAIL일 수 있다.

---

### Task 2: WatchGauge props

**Files:**
- Modify: `app/app/components/watch-gauge.tsx`

**Produces:** `WatchGauge({ score, title, bandLabel, scoreCaption, explainer, detail, isExample, ariaLabel })`

- [ ] `rv5`와 하드코드 `WTI 변동성`·5일 RV 설명을 제거한다.
- [ ] `isExample`이면 오른쪽 위 `예시` 뱃지.
- [ ] 구간 텍스트는 `bandLabel` (58을 `volatilityBand`로 «고조» 만들지 않음).
- [ ] SVG 호·바늘 기하학은 기존 `gauge.ts` 그대로.

---

### Task 3: 홈 연결

**Files:**
- Modify: `app/app/routes/home.tsx`

- [ ] `score={sampleDefconScore(snapshot?.volatility.rv5ReferencePercentile)}` 등 SAMPLE_* props.
- [ ] `MarketFact` 4칸을 가격 섹션으로 이동. 반원 추가 금지.
- [ ] `cd app && node --test tests/defcon-sample.test.mjs` PASS.
- [ ] `cd app && npm run typecheck` PASS.

---

### Task 4: 5173 확인

- [ ] `http://localhost:5173/` 반원 하나, `원유 DEFCON`, `예시`, `DEFCON 3`, `58`.
- [ ] 오른쪽 종가. 장부 52 · 통과 0. 서버 추가 기동 없음.
