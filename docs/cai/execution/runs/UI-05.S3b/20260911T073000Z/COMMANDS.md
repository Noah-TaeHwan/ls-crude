# COMMANDS — UI-05.S3b (20260911T073000Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.

## 1. 구현

- Write `app/app/components/cai/history-ledger.tsx` (원장 추출 + DecisionTimeline + CFAM 이력).
- Edit `app/app/routes/history.tsx`, `app/app/routes/research.tsx`.
- Write `tests/cai-history-ledger.test.mjs`.
- [범위기록] Edit `tests/deployment-cwd.test.mjs`·`tests/cai-research.test.mjs`·`tests/cai-legacy-links.test.mjs`
  — 원장이 history로 옮겨진 구조에 맞춘 기대값(카드 step 3).

## 2. GREEN·회귀

```
npm run typecheck && npm run build
node --test tests/cai-history-ledger.test.mjs
```
- 각각 exit 0. 7/7 (tests-cai-history-ledger.log). 중간 수정: MemoryRouter 컨텍스트,
  bare import 해석, 미확인 배지 기준으로 assertion 좁힘.

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs tests/cai-history.test.mjs tests/cai-legacy-links.test.mjs tests/cai-home.test.mjs tests/cai-research.test.mjs tests/cai-history-ledger.test.mjs
```
- exit 0. 141/141 (tests-full.log). deployment의 history 원장 텍스트 검사는 스트리밍 SSR
  텍스트 노드 분리 때문에 태그 제거 텍스트로 보정.

## 3. 브라우저 (ego, 빌드 서버 cwd=app PORT=5599)

- `/history`: 타임라인 배지 [승인,승인,미확인,미완결,미완결,진단], CFAM 블록, 원장 기본 접힘,
  검색창·카드 6·더 보기 존재.
- 원장 펼침 후 `018` 검색 → "전체 97개 중 검색 결과 1개", candidate-018 1건.
- `/history?candidate=018` 직접 진입 open+018, 새로고침 후 동일.
- 빈 검색 결과 empty-state, 뒤로가기 정상(이전 상태 복원), 390px overflow 0.
- 스크린샷 history-ledger.png.

## 4. 증거

- ci.diff(테스트 1건), files.txt(변경 목록·행수), tests-*.log, history-ledger.png.
