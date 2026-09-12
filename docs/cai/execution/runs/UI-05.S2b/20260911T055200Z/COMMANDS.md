# COMMANDS — UI-05.S2b (20260911T055200Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.
`[WS]`는 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a`.
세션 창 2026-09-11 14:4x–14:5x KST.

## 1. 사전 확인

- `node --version` → v22.23.2. `.ts`는 직접 import되나 `.tsx`는 Unknown file extension으로 실패.
- `react-dom/server`·`typescript` import 가능 확인.
- 카드·참고 문서: cards/UI-05.S2b.md, references/cai_v4.html, references/WEBSITE_PLAN.md §05,
  app/app/lib/cai-view.ts, app/app/components/watch-gauge.tsx, app/app/lib/gauge.ts.

## 2. RED

```
node --test tests/cai-components.test.mjs
```
- exit 1. cai-gauge.tsx 부재(ERR_MODULE_NOT_FOUND) — 컴포넌트·테스트가 없어 1/1 실패.

## 3. 구현 후 GREEN

```
node --test tests/cai-components.test.mjs
```
- exit 0. `# tests 12 # pass 12 # fail 0` (tests-cai-components.log).

```
npm run typecheck
npm run build
```
- 각각 exit 0. `✓ built in 433ms`.

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs
```
- exit 0. `# tests 116 # pass 116 # fail 0` (tests-full.log, CI와 같은 목록).
- 위 2건은 최종 리비전(바늘 라벨 위치 수정 후) 재실행 결과를 run 폴더에 보존.

## 4. 바늘 라벨 수정 (브라우저 검수 중 발견)

- 1280px 스크린샷에서 바늘이 `/ 100` 라벨을 가림 → `cai-gauge.tsx`에서 라벨을
  수치 오른쪽(x=cx+70, y=cy−64)으로 이동. 단위·테스트 재실행 exit 0.

## 5. 브라우저 검수 (ego)

- SSR 정적 미리보기 생성:

```
node /tmp/cai-preview/gen.mjs
```
- 기능: 테스트 픽스처로 CaiGauge·CaiForecast·CaiAbout을 SSR 렌더하고
  build/client/assets/root-*.css를 인라인해 `component-preview.html` 생성.
- ego heredoc으로 file:///private/tmp/cai-preview/index.html 열고
  CDP `Emulation.setDeviceMetricsOverride`로 360/390/691/1280 확인:

```
ego-browser nodejs <<'EOF'
const task = await taskSpace("CAI S2b component check");
... (viewport 4종 evaluate + Enter/Space 토글 + 스크린샷)
EOF
```

- 결과: 전 폭 overflow false(scrollWidth=innerWidth), 클리핑 0,
  빈 블록 바늘 0·— true, details 기본 closed(2개), Enter 열기/닫기·Space 열기,
  forecast 상태 published/pending.
- 스크린샷: width-360.png, width-1280.png(수정 후). 미리보기 원본:
  component-preview.html, component-preview.gen.mjs.

## 6. CI 등록

```
git diff -- .github/workflows/ci.yml > docs/cai/execution/runs/UI-05.S2b/20260911T055200Z/ci.diff
```
- Test step 목록 끝에 `tests/cai-components.test.mjs` 1건 추가(중복 없음).

## 7. 파일 목록

```
git status --short
wc -l app/app/components/cai/*.tsx app/tests/cai-components.test.mjs
```
- 출력은 files.txt. 신규 4파일 + ci.yml 수정 1건.
