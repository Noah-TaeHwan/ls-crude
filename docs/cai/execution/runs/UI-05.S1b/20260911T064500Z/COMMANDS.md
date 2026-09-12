# COMMANDS — UI-05.S1b (20260911T064500Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.

## 1. RED

```
node --test tests/cai-legacy-links.test.mjs
```
- exit 1. `cai-legacy-routing.ts` 부재(ERR_MODULE_NOT_FOUND).

## 2. 구현·수정

- Write `app/app/lib/cai-legacy-routing.ts`, `app/tests/cai-legacy-links.test.mjs`.
- Edit `app/app/routes/home.tsx`·`research.tsx`·`history.tsx`.
- [범위기록] Edit `app/routes/empties.tsx` redirect, `tankers.tsx`·`visibility.tsx`·`cushing-busy.tsx`
  복귀 링크, `tests/deployment-cwd.test.mjs` 기대값 2곳 — URL_COMPAT 표·구현 경계가 요구.

## 3. GREEN·회귀

```
npm run typecheck && npm run build
node --test tests/cai-legacy-links.test.mjs
```
- 각각 exit 0. legacy 7/7 (`✓ built`).

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs tests/cai-history.test.mjs tests/cai-legacy-links.test.mjs
```
- exit 0. `# tests 125 # pass 125 # fail 0` (tests-full.log).

## 4. 브라우저 (ego, 빌드 서버 cwd=app PORT=5599)

- `/research#ledger` → 클라이언트 replace `/history#ledger`; CDP back → about:blank(루프 없음).
- `/#research-sample` → `/history#research-sample`.
- `/history`에서 제주 클릭 → `/history?sample=jeju#research-sample`; back → `/history#research-sample`.
- `/research#method` → 이동 없음, method details open=true.
- `/research?sample=jeju` → 1회 이동 후 `/history?sample=jeju#research-sample`, jeju 차트.
- 발견: 정적 `public/research/` 때문에 `/research`가 `/research/`로 301 → 헬퍼에 끝 슬래시 정규화 추가.
  스크린샷 history-hash.png.

## 5. 증거

- ci.diff(테스트 1건 추가), files.txt(변경 목록·행수), tests-*.log.
