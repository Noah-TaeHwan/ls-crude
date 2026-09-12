# COMMANDS — UI-05.S3a (20260911T071500Z)

cwd는 별도 표시가 없으면 `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app`.

## 1. RED

```
node --test tests/cai-research.test.mjs
```
- exit 1. cai-research.tsx 부재로 실패(1/1) → 컴포넌트 작성 후 일부 문구/함정 수정:
  모델 표 NOT_RUN 상태를 "미평가"로, 통합 `0%` 검사를 CAI 섹션으로 한정, `test` import 누락 수정.

## 2. GREEN·회귀

```
npm run typecheck && npm run build
node --test tests/cai-research.test.mjs
```
- 각각 exit 0. cai-research 8/8 (tests-cai-research.log).

```
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs tests/visibility.test.mjs tests/tanker-arrivals.test.mjs tests/wti-chart-axis.test.mjs tests/research-charts.test.mjs tests/empties.test.mjs tests/cushing-context.test.mjs tests/cai-view.test.mjs tests/cai-components.test.mjs tests/cai-history.test.mjs tests/cai-legacy-links.test.mjs tests/cai-home.test.mjs tests/cai-research.test.mjs
```
- exit 0. 134/134 (tests-full.log).

## 3. 브라우저 (ego, 빌드 서버 cwd=app PORT=5599)

- `/research/` → data-cai-research, 단계 [미연결·산출 대기·미실행·미실행], counts 0/0/0,
  모델 4행, run-evidence, anchor(intake·method·ledger), details 5개 전부 접힘,
  CAI 섹션 0% 없음, overflow 없음.
- `/research/#method` → method details open=true.
- 스크린샷 research.png.

## 4. 증거

- ci.diff(테스트 1건), files.txt(변경 목록), tests-*.log, research.png.
