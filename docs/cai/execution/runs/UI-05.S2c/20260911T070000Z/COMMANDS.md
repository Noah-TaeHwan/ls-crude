# COMMANDS — UI-05.S2c (20260911T070000Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.

## 1. 구현

- Write `app/app/routes/home.tsx` (CAI 조합), Edit `app/app/components/desk-chrome.tsx` (세 메뉴).
- [범위기록] Edit `tests/deployment-cwd.test.mjs`(홈 기대값), `tests/cai-history.test.mjs`(홈 1줄).
- Write `tests/cai-home.test.mjs` (SSR 통합).

## 2. 검사

```
npm run typecheck && npm run build
```
- 각각 exit 0.

```
node --test tests/cai-home.test.mjs
```
- exit 0. 1/1 (tests-cai-home.log).

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs tests/cai-history.test.mjs tests/cai-legacy-links.test.mjs tests/cai-home.test.mjs
```
- exit 0. 126/126 (tests-full.log). 중간에 cai-history 홈 기대 1건이 S2c 의도와 충돌해 갱신 후 재실행.

## 3. 브라우저 (ego, 빌드 서버 cwd=app PORT=5599)

- 홈: title/h1·메뉴3·gauge data-cai-score="—"(needle 0)·forecast pending·#wti-daily-chart 93.03·
  details 2개 접힘·홈에 사례 탐색 없음·history 링크 존재·예시 숫자 없음.
- nav 히스토리 클릭 → /history(사례 9), 연구·검증 클릭 → /research.
- 390px overflow false, 스크린샷 home-390.png.

## 4. 증거

- ci.diff(테스트 1건), files.txt(변경 목록). home-390.png.
