# COMMANDS — UI-05.S1a (20260911T060500Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.

## 1. RED

```
node --test tests/cai-history.test.mjs
```
- exit 1. 2/2 실패: `/history` 404 응답 상태와 history.tsx 부재.
  (관측 출력: `not ok 1 ... AssertionError`, `not ok 2 ...`)

## 2. 구현

- Write `app/app/routes/history.tsx`(97행), Edit `app/app/routes.ts` 1행,
  Write `app/tests/cai-history.test.mjs`(189행).

## 3. GREEN·회귀

```
npm run typecheck
npm run build
node --test tests/cai-history.test.mjs
```
- 각각 exit 0. history 2/2, `✓ built in 1.11s`.

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs tests/cai-history.test.mjs
```
- exit 0. `# tests 118 # pass 118 # fail 0` (tests-full.log, CI와 같은 목록).

## 4. 브라우저 직접 진입·사례 전환 (ego)

```
HOST=127.0.0.1 PORT=5599 node --import <app>/tests/fixtures/ssr-yahoo.mjs <app>/node_modules/@react-router/serve/bin.cjs <app>/build/server/index.js
```
- cwd는 app(정적 자산 서빙). repo 루트 cwd로 띄우면 클라이언트 JS가 404여서
  하이드레이션이 안 되고 클릭이 동작하지 않았다(원인 기록).

```
ego-browser nodejs <<'EOF'
- goto http://127.0.0.1:5599/history
- evaluate: h1·사례 버튼 9개·기본 선택 수박·#research-sample 확인
- "고정 · 제주 · LNG와 유류" 클릭 → waitForFunction(sample=jeju) → #jeju-generation-plot
EOF
```
- 결과: `/history` h1 "확보한 자료를 사례별로 열어봅니다.", 버튼 9개,
  기본 "고정 · 수박 · 냉장트럭", 클릭 후 URL `/history?sample=jeju#research-sample`,
  jeju 차트 표시·수박 차트 제거. 스크린샷 history-route.png.

## 5. CI 등록·증거

```
git diff -- .github/workflows/ci.yml > docs/cai/execution/runs/UI-05.S1a/20260911T060500Z/ci.diff
```
- Test 목록 끝에 `tests/cai-history.test.mjs` 1건 추가.
- logs: tests-cai-history.log, tests-full.log. files.txt: 변경 목록·행수(97/189).
