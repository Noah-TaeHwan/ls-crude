import assert from "node:assert/strict";
import { describe, it, test } from "node:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import ts from "typescript";
import { emptyCaiView, parseCaiPublicView } from "../app/lib/cai-view.ts";

// Node는 .tsx를 직접 읽지 못하므로 기존 devDependency typescript로 변환한다.
const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..", "app");
const nodeModulesDir = resolve(here, "..", "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "cai-research-"));

/**
 * cai-research.tsx를 ESM으로 변환해 import한다.
 * @returns 변환된 모듈.
 */
function importResearch() {
  const fileName = "cai-research.tsx";
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
    .replace(/"react\/jsx-runtime"/g, JSON.stringify(join(nodeModulesDir, "react", "jsx-runtime.js")));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { CaiResearch } = await importResearch();

/** @param overrides snapshot 덮어쓰기. @returns 테스트용 공개 객체. */
function view(overrides = {}) {
  return parseCaiPublicView({
    schema_version: "cai.public.v1",
    index: {
      index_id: "cushing-activity-index",
      definition_version: "wk-2026-W37",
      weighting_method: "equal-weight",
      score: null,
      previous_score: null,
      as_of: null,
      observed_at: null,
      available_at: null,
      computed_at: null,
      retrieved_at: null,
      data_origin: "NO_DATA",
      freshness: null,
      run_id: null,
      constituent_count: 0,
      coverage: null,
      history: [],
    },
    forecast: { model_id: null, trained_run_id: null, generated_at: null, decision_cutoff: null, target_start: null, target_end: null, target_definition: null, publication_approved: false, probabilities: null, data_origin: "NO_DATA", freshness: null },
    validation: { status: "NOT_RUN", n: null, sample_start: null, sample_end: null, oos_exposure: "UNKNOWN", freeze_ref: null, review_ref: null, metrics: [] },
    constituents: [],
    evidence: [],
    warnings: [],
    ...overrides,
  });
}

/** @param v 공개 객체. @returns SSR HTML. */
function render(v) {
  return renderToStaticMarkup(createElement(CaiResearch, { view: v }));
}

describe("CaiResearch 빈 현재 상태", () => {
  it("채택 없음·옛 후보 자동 합산 없음·단계 분리", () => {
    const html = render(view());
    assert.match(html, /data-cai-research/);
    assert.match(html, /현재 CAI 연구·검증/);
    assert.match(html, /현재 채택한 성분이 없습니다/);
    assert.match(html, /자동으로 합산하지 않습니다/);
    assert.match(html, /채택 0/);
    assert.match(html, /검토 0/);
    assert.match(html, /보류 0/);
    for (const stage of ["자료 연결", "지수 산출", "가중치 학습", "독립 평가"]) assert.ok(html.includes(stage), stage);
    assert.match(html, /미연결/);
    assert.match(html, /산출 대기/);
    assert.match(html, /미실행/);
  });

  it("NOT_RUN은 —와 미평가, 0% 없음", () => {
    const html = render(view());
    assert.match(html, /data-model-comparison/);
    assert.match(html, /미평가/);
    assert.match(html, /—/);
    assert.ok(!/0\s*%/.test(html.replace(/[가-힣]/g, "")), "no zero percent");
    assert.match(html, /과거 검증 수치는 이 표에 재사용하지 않습니다/);
  });

  it("실행하지 않은 학습·OOS를 완료로 표시하지 않음", () => {
    const html = render(view());
    assert.match(html, /data-run-evidence/);
    assert.match(html, /미실행/);
    assert.ok(!html.includes("E4"));
  });

  it("공개 근거가 없으면 비공개 원문을 완료 근거로 쓰지 않는다고 표시", () => {
    const html = render(view());
    assert.match(html, /비공개 원문은 공개 완료 근거로 쓰지 않습니다/);
  });

  it("추가 설명은 기본 접힘", () => {
    const html = render(view());
    assert.match(html, /<details/);
    assert.ok(!/<details[^>]*\sopen/.test(html));
  });
});

describe("CaiResearch 성분·검증 fixture", () => {
  const fixture = view({
    index: {
      index_id: "cushing-activity-index",
      definition_version: "wk-2026-W37",
      weighting_method: "equal-weight",
      score: null,
      previous_score: null,
      as_of: "2026-09-11",
      observed_at: "2026-09-11T00:35:00+00:00",
      available_at: "2026-09-11T01:00:00+00:00",
      computed_at: null,
      retrieved_at: null,
      data_origin: "NO_DATA",
      freshness: null,
      run_id: null,
      constituent_count: 2,
      coverage: null,
      history: [],
    },
    validation: { status: "EXPLORATORY", n: 120, sample_start: "2015-01-01", sample_end: "2023-12-31", oos_exposure: "UNSEEN", freeze_ref: null, review_ref: null, metrics: [{ name: "brier", value: 0.24, benchmark: "constant", benchmark_value: 0.25 }] },
    constituents: [
      { candidate_id: "road-traffic", name: "도로 통행량", membership: "ADOPTED", observed_quantity: "주간 통행량", geography: "쿠싱 인근", frequency: "주간", status_note: "기준선", evidence_ids: ["e1"] },
      { candidate_id: "night-lights", name: "야간 조명", membership: "PARKED", observed_quantity: "야간 밝기", geography: "쿠싱 시", frequency: "월간", status_note: "권한 미확인", evidence_ids: [] },
    ],
    evidence: [
      { id: "e1", title: "공개 출처", url: "https://data.example.org/file", access: "public" },
      { id: "e2", title: "내부 문서", url: null, access: "team_only" },
    ],
  });

  it("채택·보류를 구분하고 정의·가중치·검증 요약을 표시", () => {
    const html = render(fixture);
    assert.match(html, /도로 통행량/);
    assert.match(html, /야간 조명/);
    assert.match(html, /채택 1/);
    assert.match(html, /보류 1/);
    assert.match(html, /검토 0/);
    assert.match(html, /동일 가중치/);
    assert.match(html, /1\/n/);
    assert.match(html, /wk-2026-W37/);
    assert.match(html, /탐색/);
    assert.match(html, /120/);
  });

  it("제공된 지표만 표시하고 private 링크는 팀 내부로 표시", () => {
    const html = render(fixture);
    assert.match(html, /brier/);
    assert.match(html, /0\.24/);
    assert.match(html, /공개 출처/);
    assert.match(html, /https:\/\/data\.example\.org\/file/);
    assert.match(html, /내부 문서/);
    assert.match(html, /팀 내부 자료/);
    assert.ok(!html.includes("internal.example.org"));
  });
});

// ---- built server integration ----

const appRoot = resolve(here, "..");
const repositoryRoot = resolve(appRoot, "..");
const serverEntrypoint = join(appRoot, "build/server/index.js");
const serveEntrypoint = join(appRoot, "node_modules/@react-router/serve/bin.cjs");

/**
 * 빈 로컬 포트를 찾는다.
 * @returns 사용 가능한 포트.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") resolve(address.port);
        else reject(new Error("no port"));
      });
    });
  });
}

/**
 * 서버가 응답할 때까지 반복한다.
 * @param url 주소.
 * @param child 서버 프로세스.
 * @param output 서버 출력.
 * @returns 첫 응답.
 */
async function waitForResponse(url, child, output) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`server exited\n${output.join("")}`);
    try {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      return await fetch(url, { signal: AbortSignal.timeout(remaining) });
    } catch {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(100, remaining)));
    }
  }
  throw new Error(`no response in 10s\n${output.join("")}`);
}

/**
 * 자식 프로세스 종료를 기다린다.
 * @param child 프로세스.
 * @param timeoutMs 제한 시간.
 * @returns 제한 시간 안에 끝났는지.
 */
async function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    const timeout = setTimeout(() => {
      child.removeListener("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

/**
 * 테스트 서버를 종료한다.
 * @param child 프로세스.
 * @returns 종료 완료 Promise.
 */
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  if (await waitForExit(child, 1_000)) return;
  child.kill("SIGKILL");
  if (!(await waitForExit(child, 1_000))) throw new Error("server did not exit");
}

test("serves /research with the CAI current view and preserved legacy anchors", async () => {
  const port = await findFreePort();
  const output = [];
  const child = spawn(
    process.execPath,
    ["--import", join(appRoot, "tests/fixtures/ssr-yahoo.mjs"), serveEntrypoint, serverEntrypoint],
    {
      cwd: repositoryRoot,
      env: { NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  try {
    const base = `http://127.0.0.1:${port}`;
    const response = await waitForResponse(`${base}/research`, child, output);
    assert.equal(response.status, 200, output.join(""));
    const body = await response.text();
    const text = body.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(body, /data-cai-research/);
    assert.match(body, /data-research-workflow/);
    assert.match(text, /쿠싱의 활동에서 유가의 단서 찾기/);
    assert.match(text, /연구·검증 기록 더 보기/);
    assert.match(text, /현재 CAI 연구·검증/);
    assert.equal((body.match(/data-idea="/g) ?? []).length, 106, "renders 106 idea folders");
    assert.equal((body.match(/data-candidate="/g) ?? []).length, 33, "renders 33 candidates once");
    assert.match(body, /id="workflow-candidates"/);
    assert.match(text, /traffic_avc040_daily_2019plus/);
    assert.match(text, /dmr_ok0026701_001_mgd/);
    assert.match(text, /실험용 CAI v0.1 연결/);
    assert.match(text, /43.1 \/ 100/);
    assert.match(text, /현재 값이 아닙니다/);
    assert.match(body, /data-model-comparison/);
    assert.match(text, /미평가/);
    const caiSection = body.slice(body.indexOf("data-cai-research"), body.indexOf('id="intake"'));
    assert.ok(!caiSection.includes("0%"), "no zero-percent metrics in the CAI section");
    // 통합 연구 기록: 여섯 단계와 이전 조사가 한 페이지에 있다.
    assert.match(body, /id="current"/);
    assert.match(body, /id="past"/);
    assert.match(body, /id="intake"/);
    assert.match(body, /id="method"/);
    assert.match(body, /id="research-sample"/);
    assert.match(body, /id="ledger"/);
    assert.match(body, /data-decision-timeline/);
    assert.match(body, /href="\/history#ledger"/);
    assert.doesNotMatch(body, /<details[^>]*\sopen/, "details start collapsed");
    assert.doesNotMatch(body, /id="wti-daily-chart"/);
  } finally {
    await stop(child);
  }
});
