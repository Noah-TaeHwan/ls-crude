# Public Ledger Count Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 표면의 후보 수를 연구 장부 정본 `001–051` · 통과 `0`에 맞추고, 손성찬 기준모형 인계 한 줄을 남긴다.

**Architecture:** 숫자를 새로 계산하지 않는다. `research/factors/README.md` 스코어보드와 `research/factors/` 숫자 폴더 51개가 정본이다. 앱 상수·카피·배포 테스트만 같은 두 숫자로 바꾼다. 판정 분포는 기존 48개 버킷에 049 HOLD, 050 MONITOR, 051 HOLD만 더한다. 에너지 체인(041→RBOB)은 홈 카운트에 넣지 않는다.

**Tech Stack:** React Router 8, TypeScript, Node test runner (`app/tests/deployment-cwd.test.mjs`).

**Spec:** `research/factors/README.md` (인벤토리 001–051, 통과 0). 분할·Yahoo·CSV 규칙은 `docs/research-design.md`.

## Global Constraints

- 가격은 Yahoo `CL=F`만. Investing.com 스크래핑 금지.
- 통과 조건: `|r| ≥ 0.10`이면서 IS·OOS 같은 부호. 현재 0개.
- 050 OOS `r=+0.113`은 IS `+0.018`이라 통과가 아니다. 홈 카운트에 넣지 않는다.
- 041→RBOB는 WTI 매트릭스를 대체하지 않는다.
- 새 팩터 카드·성과 숫자 창작 금지.
- `main` 직접 커밋 금지. 브랜치 `feat/public-ledger-count`. 커밋·푸시는 사용자 요청 시에만.
- Agency-Agents: 조사는 `explore`, 완료 검증은 `Reality Checker`. `Agents Orchestrator` 호출 금지. 쓰기는 메인 에이전트만.

## Agency-Agents 실전 슬롯

| 단계 | 역할 | 하는 일 | 쓰지 않는 이유 |
| --- | --- | --- | --- |
| Task 1 조사 | `explore` × 2 | 공개 48 위치 / 장부 51·통과 0 확정 | 다수 파일 읽기 전용 |
| Task 2–4 구현 | 메인 | 카피·테스트·인계 문장 | 같은 파일 동시 쓰기 금지, 단일 상수 변경 |
| Task 5 검증 | `Reality Checker` | 화면·테스트·장부가 51/0인지 재검증 | 서브에이전트 보고만으로 완료 판정 금지 → 메인이 테스트 출력도 확인 |

---

### Task 1: Sync and inventory

**Files:** none to modify. Evidence: `git pull --ff-only origin main` already at `5de704b`. Branch `feat/public-ledger-count`.

- [x] **Step 1: Fast-forward `main`**
- [x] **Step 2: Create `feat/public-ledger-count`**
- [x] **Step 3: Dispatch two `explore` agents** — 공개 48 전수, 장부 51 정본
- [x] **Step 4: Lock numbers** — `{ candidateCount: 51, passCount: 0 }`

정본 증거:

- `research/factors/README.md:4` `001–051`
- `research/factors/README.md:86` `현재 통과 수: 0개`
- `research/factors/` 숫자 폴더 51개
- 049 HOLD, 050 MEME/MONITOR, 051 HOLD → 통과 아님

건드리지 말 것 (역사 기록):

- `docs/superpowers/specs/2026-09-03-wti-volatility-evidence-brief.md`
- `docs/superpowers/plans/2026-09-03-wti-volatility-evidence-brief.md`
- `research/reports/2026-09-03-full-free-data-completeness-audit.md`
- `research/reports/2026-09-03-free-data-acquisition-ledger.md`

---

### Task 2: Failing public-count regression

**Files:**
- Modify: `app/tests/deployment-cwd.test.mjs:166`

**Interfaces:**
- Consumes: `/research` HTML
- Produces: assertion that the research page contains `51개` and `통과 0개`

- [x] **Step 1: Write the failing assertion**

Change:

```js
assert.match(researchBody, /48개/);
assert.match(researchBody, /통과 0개/);
```

to:

```js
assert.match(researchBody, /51개/);
assert.match(researchBody, /통과 0개/);
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `cd app && node --test tests/deployment-cwd.test.mjs`

Expected: FAIL on `/51개/` because the page still says 48.

---

### Task 3: Align public copy and verdict distribution

**Files:**
- Modify: `app/app/routes/home.tsx` (`CANDIDATE_COUNT`)
- Modify: `app/app/routes/research.tsx` (상수, meta, JSDoc, 본문, `VERDICT_COUNTS`)
- Modify: `README.md` (표 + `/research` 문장)
- Modify: `app/README.md` (입구 문장)

**Interfaces:**
- Consumes: Task 1 `{51, 0}`
- Produces: `/` and `/research` render `51개 후보 · 통과 0개`; `VERDICT_COUNTS` 합 = 51

판정 분포 (기존 48 버킷 + 049/050/051만 가산):

```ts
const VERDICT_COUNTS = [
  ["기각", 17],
  ["보류", 15], // +049 HOLD, +051 HOLD
  ["미검증", 7],
  ["보관", 6],
  ["분석 제외", 2],
  ["관측만", 3], // +050 MONITOR
  ["별도 전략", 1],
] as const;
```

007은 스코어보드에 r이 있어도 적격 집계가 없어 **미검증** 유지. 041→RBOB는 이 표에 넣지 않는다.

`research.tsx`의 하드코딩 `"전체 48개"`와 meta description은 `CANDIDATE_COUNT`를 쓰게 바꿔 재이탈을 막는다.

- [ ] **Step 1: Update route constants and copy**
- [ ] **Step 2: Update README surfaces**
- [ ] **Step 3: Re-run `cd app && node --test tests/deployment-cwd.test.mjs`**

Expected: PASS. `/research` HTML contains `51개` and `통과 0개`.

- [ ] **Step 4: Typecheck**

Run: `cd app && npm run typecheck`

Expected: exit 0.

---

### Task 4: Freeze hunt + Liam handoff line

**Files:**
- Modify: `research/notebooks/pizza-hunt.md` (상태 한 줄)
- Modify: `docs/local-backtest.md` (손성찬 인계 절)

금지: 피자 표에 가짜 행을 채우지 않는다. RF/walk-forward 코드를 이 브랜치에서 작성하지 않는다.

pizza-hunt 상태 문장:

```md
상태: **자리만**. 확정 후보는 없다. 2026-09-04 기준 공개 장부는 001–051 · 통과 0이며, 새 피자 행은 기준모형을 동결하기 전에는 열지 않는다.
```

local-backtest 인계:

```md
## 손성찬 인계 (2026-09-04)

대안 데이터 Oil Pizza 가중치는 전부 `0.0`이다. 공개 장부는 후보 51 · 통과 0.
기준모형은 `research/src/ls_crude/models`와 `backtest`에서 정통 입력(Yahoo `CL=F` 가격, RSI, 실현변동성)만 사용한다.
웹에 Sharpe·MDD·적중률을 넣지 않는다. 인샘플에서 규칙을 잠그고 아웃샘플은 한 번만 연다.
이슈 #2(규칙+RF 기준모형), #4(walk-forward)가 이 작업이다.
```

- [ ] **Step 1: Edit pizza-hunt status**
- [ ] **Step 2: Append Liam handoff to local-backtest.md**

---

### Task 5: Independent Reality Checker

**Files:** none to own. Read-only.

- [ ] **Step 1: Dispatch `Reality Checker`** with file list, forbidden claims, required evidence (HTML or test output, factors README line)
- [ ] **Step 2: Main agent re-runs the test and confirms 51/0 on the same evidence surface**

완료 기준: `/research`와 README가 장부 `001–051`·통과 0과 같고, 050·041 RBOB를 통과로 세지 않으며, 역사 문서 4개를 소급 수정하지 않았다.
