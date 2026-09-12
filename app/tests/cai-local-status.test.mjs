import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { LOCAL_STATUS_SCHEMA, localStatusGuard } from "../app/lib/local-status.ts";

// Node는 .tsx를 직접 읽지 못하므로 기존 devDependency인 typescript로
// 트랜스파일한 뒤 /tmp에서 import한다. 새 의존성은 추가하지 않는다.
const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..", "app");
const nodeModulesDir = resolve(here, "..", "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "cai-local-status-"));

/**
 * local-status.tsx를 ESM으로 변환해 import한다.
 * `~` 별칭과 react 내부 모듈을 절대 경로로 바꾼다.
 * @returns 변환된 모듈.
 */
function importLocalStatus() {
  const fileName = "local-status.tsx";
  const source = readFileSync(join(appDir, "components", "cai", fileName), "utf8");
  const output = ts
    .transpileModule(source, {
      fileName,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: false,
      },
    })
    .outputText.replace(/"(~\/lib\/[a-z0-9-]+)(?:\.ts)?"/g, (_, spec) =>
      JSON.stringify(join(appDir, "lib", `${spec.slice("~/lib/".length)}.ts`)),
    )
    .replace(/"react\/jsx-runtime"/g, JSON.stringify(join(nodeModulesDir, "react", "jsx-runtime.js")))
    .replace(/"react"/g, JSON.stringify(join(nodeModulesDir, "react", "index.js")));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { LocalStatus, LocalStatusView } = await importLocalStatus();

/**
 * 테스트 전용 실행 항목.
 * @param overrides 덮어쓸 값.
 * @returns 실행 항목.
 */
function run(overrides = {}) {
  return {
    id: "20260912T013423Z",
    base: "091-cai-exp-2019",
    started_utc: "2026-09-12T01:34:23Z",
    finished_utc: "2026-09-12T01:34:23Z",
    models: { done: 6, blocked: 0, failed: 0, pending: 0, running: 0 },
    train_rows: 753,
    cached: false,
    ...overrides,
  };
}

/**
 * 테스트 전용 로컬 상태. 모든 값은 픽스처이며 운영 데이터가 아니다.
 * @param overrides 덮어쓸 값.
 * @returns 로컬 상태.
 */
function status(overrides = {}) {
  return {
    schema: LOCAL_STATUS_SCHEMA,
    kind: "local_work_status",
    generated_at_utc: "2026-09-12T01:36:05Z",
    source: "로컬 파일(manifest·run_state·inputs)",
    current: {
      task: "TMAS 2019 교통자료 보강 → 파일럿 재실행 → 대시보드 반영",
      owner: "태환",
      stage: "완료 (모델 학습·요약 생성 완료, 화면 확인 단계)",
      started_at: "2026-09-12T01:28:00Z",
      last_activity_at: "2026-09-12T01:36:00Z",
      throughput: "2019 12개월 335,158,128B 추가 · 학습 6/6 모델 done (train 753)",
      blocker: null,
      result: "run 20260912T013423Z · eval 245행(기존과 동일) · CAI 추가 이득 없음 유지",
      screen_reflected: "표시 요약 파일 갱신됨 — 화면 확인 단계",
      seongchan: { last_report: "2026-09-11 주말 결과 2건 수신", status: "미확인 — 새 보고 없음" },
    },
    downloads: [
      { label: "TMAS 20260912", files: 12, bytes: 335158128, latest_activity_utc: "2026-09-12T01:31:14Z", complete: null },
    ],
    runs: [run()],
    inputs: [
      { name: "traffic_avc040_daily_2019plus.csv", bytes: 32687, modified_utc: "2026-09-12T01:33:40Z" },
    ],
    seongchan: { last_report: "2026-09-11 주말 결과 2건 수신", status: "미확인 — 새 보고 없음" },
    notes: ["진행률 분모가 없으면 백분율을 만들지 않습니다.", "캐시 재사용과 실제 재학습을 구분합니다."],
    ...overrides,
  };
}

/** @param props 뷰 props. @returns SSR HTML. */
function render(props) {
  return renderToStaticMarkup(createElement(LocalStatusView, props));
}

describe("localStatusGuard", () => {
  it("프로덕션은 404로 차단", () => {
    const blocked = localStatusGuard("production");
    assert.ok(blocked instanceof Response, "returns a Response");
    assert.equal(blocked.status, 404);
  });

  it("개발·미지정 환경은 허용", () => {
    assert.equal(localStatusGuard("development"), null);
    assert.equal(localStatusGuard("test"), null);
    assert.equal(localStatusGuard(undefined), null);
  });
});

describe("LocalStatusView 상태 표시", () => {
  it("실행 중(종료 기록 없음)은 실행 상태 확인 필요로 남김", () => {
    const html = render({
      mode: "full",
      data: status({
        runs: [run({ finished_utc: null, models: { done: 5, blocked: 0, failed: 0, pending: 0, running: 1 } })],
      }),
      checkedAt: "2026-09-12T01:37:00Z",
      failed: false,
      loaded: true,
    });
    assert.match(html, /실행 상태 확인 필요/);
    assert.ok(!html.includes("%"), "no percent in running state");
  });

  it("완료 상태는 마지막 작업과 처리량을 그대로 보여주고 백분율을 만들지 않음", () => {
    const html = render({
      mode: "full",
      data: status(),
      checkedAt: "2026-09-12T01:37:00Z",
      failed: false,
      loaded: true,
    });
    assert.match(html, /TMAS 2019 교통자료 보강/);
    assert.match(html, /완료 \(모델 학습·요약 생성 완료, 화면 확인 단계\)/);
    assert.match(html, /753/);
    assert.match(html, /재학습/);
    assert.match(html, /10:36 KST/, "last activity in KST");
    assert.match(html, /10:37:00 KST/, "browser check time in KST");
    assert.match(html, /상태 확인/);
    assert.doesNotMatch(html, /실행 상태 확인 필요/);
    assert.ok(!html.includes("%"), "no percent in done state");
  });

  it("차단 사유가 있으면 그 문장을 표시", () => {
    const html = render({
      mode: "full",
      data: status({
        current: {
          ...status().current,
          blocker: "2019 파일 대기 — 다운로드 재시도 필요",
          stage: "대기 (차단)",
        },
      }),
      checkedAt: "2026-09-12T01:37:00Z",
      failed: false,
      loaded: true,
    });
    assert.match(html, /차단 사유/);
    assert.match(html, /2019 파일 대기 — 다운로드 재시도 필요/);
    assert.ok(!html.includes("%"), "no percent in blocked state");
  });

  it("데이터가 없으면 실행 기록 없음으로 표시", () => {
    const html = render({ mode: "full", data: null, checkedAt: null, failed: false, loaded: true });
    assert.match(html, /실행 기록 없음/);
    assert.doesNotMatch(html, /실행 상태 확인 필요/);
    assert.ok(!html.includes("%"), "no percent in missing state");
  });

  it("fetch 실패는 상태 확인 실패로 표시하고 기록을 지어내지 않음", () => {
    const html = render({ mode: "full", data: null, checkedAt: null, failed: true, loaded: true });
    assert.match(html, /상태 확인 실패/);
    assert.doesNotMatch(html, /실행 상태 확인 필요/);
  });

  it("compact는 한 줄과 연구 기록 링크만 두고 표를 두지 않음", () => {
    const html = render({ mode: "compact", data: status(), checkedAt: null, failed: false, loaded: true });
    assert.match(html, /로컬 작업 현황: 완료 \(모델 학습·요약 생성 완료, 화면 확인 단계\) · 마지막 활동 10:36 KST/);
    assert.match(html, /href="\/research#local-status"/);
    assert.ok(!html.includes("<table"), "no table in compact strip");
  });

  it("SSR 기본 wrapper는 확인 중 상태로 시작하고 절대 경로를 노출하지 않음", () => {
    const html = renderToStaticMarkup(createElement(LocalStatus, { mode: "full" }));
    assert.match(html, /상태 확인 중/);
  });

  it("어떤 상태에서도 /Users/ 절대 경로가 없다", () => {
    const samples = [
      render({ mode: "full", data: status(), checkedAt: "2026-09-12T01:37:00Z", failed: false, loaded: true }),
      render({ mode: "full", data: null, checkedAt: null, failed: true, loaded: true }),
      render({ mode: "full", data: null, checkedAt: null, failed: false, loaded: true }),
      render({ mode: "compact", data: status(), checkedAt: null, failed: false, loaded: true }),
    ];
    for (const html of samples) assert.doesNotMatch(html, /\/Users\//);
  });
});
