import assert from "node:assert/strict";
import { describe, it, test } from "node:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { MemoryRouter } from "react-router";
import { renderToStaticMarkup } from "react-dom/server";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import ts from "typescript";

// Node는 .tsx를 직접 읽지 못하므로 기존 devDependency typescript로 변환한다.
const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..", "app");
const nodeModulesDir = resolve(here, "..", "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "cai-history-ledger-"));
/** 변환 모듈이 쓸 bare 의존성의 실제 해석 경로. */
const RESOLVED = {
  react: import.meta.resolve("react"),
  "react-router": import.meta.resolve("react-router"),
  "lucide-react": import.meta.resolve("lucide-react"),
};

/**
 * history-ledger.tsx를 ESM으로 변환해 import한다.
 * @returns 변환된 모듈.
 */
function importLedger() {
  const fileName = "history-ledger.tsx";
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
    .replace(/"(react|react-router|lucide-react)"/g, (_, spec) => JSON.stringify(RESOLVED[spec]));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { DecisionTimeline, HistoryLedger } = await importLedger();

/**
 * @param index 레코드 번호. @returns 테스트용 연구 기록.
 */
function record(index) {
  const id = String(index).padStart(3, "0");
  return {
    id,
    name: `기록 ${id}`,
    role: "테스트",
    conclusion: `${id} 결론`,
    status: "HOLD",
    inSample: "0.12",
    outSample: "—",
    sourceHref: `https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/${id}-test/README.md`,
    group: "보류",
  };
}

/**
 * Router 컨텍스트와 함께 SSR 렌더한다.
 * @param element 렌더할 엘리먼트.
 * @returns SSR HTML.
 */
function renderWithRouter(element) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

/** @param props 렌더 입력. @returns SSR HTML. */
function renderLedger(props) {
  return renderWithRouter(
    createElement(HistoryLedger, { records: [], passCount: null, error: null, initialQuery: "", ...props }),
  );
}

describe("HistoryLedger", () => {
  it("옛 연구 ID를 재번호 없이 그대로 표시하고 검색·필터 도구를 제공", () => {
    const html = renderLedger({ records: [record(1), record(18)], passCount: 3 });
    assert.match(html, /id="ledger"/);
    assert.match(html, /id="ledger-search"/);
    assert.match(html, /candidate-001/);
    assert.match(html, /candidate-018/);
    assert.match(html, /001- test|001 \/ 테스트/);
    assert.match(html, /018 \/ 테스트/);
    assert.match(html, /https:\/\/github\.com\/Noah-TaeHwan\/ls-crude\/blob\/main\/research\/factors\/018-test\/README\.md/);
    assert.match(html, /전체 2개 중 검색 결과 2개/);
    assert.match(html, /보류/);
  });

  it("표시 제한과 전체 검색을 구분하고 더 보기를 제공", () => {
    const records = Array.from({ length: 8 }, (_, i) => record(i + 1));
    const html = renderLedger({ records, passCount: 1 });
    assert.match(html, /현재 6개 표시/);
    assert.match(html, /더 보기 \(2개 남음\)/);
    assert.equal((html.match(/candidate-card/g) ?? []).length, 6);
  });

  it("초기 검색어가 있으면 해당 ID를 검색한 상태로 연다", () => {
    const records = [record(1), record(18)];
    const html = renderLedger({ records, passCount: 1, initialQuery: "018" });
    assert.match(html, /<details id="ledger" open/);
    assert.match(html, /전체 2개 중 검색 결과 1개 · 현재 1개 표시/);
    assert.match(html, /candidate-018/);
    assert.ok(!html.includes("candidate-001</h3>") && !/candidate-card[^>]*id="candidate-001"/.test(html));
  });

  it("오류 상태는 빈 장부로 지어내지 않고 원문 확인을 안내", () => {
    const html = renderLedger({ error: "연구 장부를 표시하지 못했습니다." });
    assert.match(html, /연구 장부 확인이 필요합니다/);
    assert.match(html, /정본 장부 열기/);
    assert.ok(!html.includes("candidate-card"));
  });
});

describe("DecisionTimeline", () => {
  it("실제 상태 구분을 표시하고 성찬 미확인을 승인으로 바꾸지 않음", () => {
    const html = renderWithRouter(createElement(DecisionTimeline, {}));
    assert.match(html, /data-decision-timeline/);
    assert.match(html, /성찬/);
    assert.match(html, /data-decision-status="미확인"/);
    assert.match(html, /data-decision-status="승인"/);
    assert.match(html, /data-decision-status="미완결"/);
    assert.match(html, /DATA-01/);
    assert.match(html, /OPS-01/);
    assert.match(html, /e89e215/);
    // 미확인 항목이 승인 배지로 렌더되지 않는다.
    const unknown = html.slice(html.indexOf('data-decision-status="미확인"'), html.indexOf("</li>", html.indexOf('data-decision-status="미확인"')));
    assert.ok(!/>승인<\/span>/.test(unknown), "unknown entry must not carry the approved badge");
    assert.match(unknown, />미확인<\/span>/);
  });

  it("CFAM을 별도 탐색 이력으로 표시하고 자동 승격을 금지", () => {
    const html = renderWithRouter(createElement(DecisionTimeline, {}));
    assert.match(html, /data-cfam-history/);
    assert.match(html, /CFAM/);
    assert.match(html, /자동 승격하지 않습니다/);
    assert.match(html, /고정 비중/);
    assert.match(html, /예약 비중/);
    assert.match(html, /실제 적용 비중/);
    assert.match(html, /href="\/observations\/cushing-busy"/);
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

test("serves the ledger and decision timeline on history, not research", async () => {
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
    const history = await waitForResponse(`${base}/history`, child, output);
    assert.equal(history.status, 200, output.join(""));
    const historyBody = await history.text();
    assert.match(historyBody, /id="ledger"/);
    assert.match(historyBody, /id="ledger-search"/);
    assert.match(historyBody, /data-decision-timeline/);
    assert.match(historyBody, /data-cfam-history/);
    assert.match(historyBody, /검정 요약과 근거/);
    assert.match(historyBody, /001-pentagon-ubereats\/README\.md/);
    assert.doesNotMatch(historyBody, /<details id="ledger"[^>]*open/, "ledger starts collapsed without a candidate query");
    assert.doesNotMatch(historyBody, /<details[^>]*\sopen/, "history details start collapsed");

    // 알려진 후보 ID는 history 원장을 열고 ID를 보존한다.
    const candidate = await waitForResponse(`${base}/history?candidate=018`, child, output);
    assert.equal(candidate.status, 200);
    const candidateBody = await candidate.text();
    assert.match(candidateBody, /<details id="ledger" open/);
    assert.match(candidateBody, /018-refinery-thermal-flare\/README\.md/);
    assert.match(candidateBody, /candidate-018/);

    // research도 같은 통합 연구 기록을 그린다. 원장은 접힌 채 시작한다.
    const research = await fetch(`${base}/research`, { redirect: "manual" });
    assert.equal(research.status, 200);
    const researchBody = await research.text();
    assert.match(researchBody, /id="ledger"/);
    assert.doesNotMatch(researchBody, /<details id="ledger"[^>]*open/);
    assert.match(researchBody, /href="\/history#ledger"/);
    assert.match(researchBody, /id="research-sample"/);
    assert.match(researchBody, /id="intake"/);
    assert.match(researchBody, /id="method"/);

    // 알려진 후보는 research에서 history로 1회 이동한다.
    const moved = await fetch(`${base}/research?candidate=018`, { redirect: "manual" });
    assert.equal(moved.status, 308);
    assert.equal(moved.headers.get("location"), "/history?candidate=018#ledger");
    const movedFollowed = await fetch(`${base}/research?candidate=018`);
    assert.equal(movedFollowed.status, 200);
    assert.ok(movedFollowed.url.endsWith("/history?candidate=018"), movedFollowed.url);

    // 모르는 후보는 지어내지 않고 research에 남아 안내한다.
    const unknown = await fetch(`${base}/research?candidate=zzz-unknown`, { redirect: "manual" });
    assert.equal(unknown.status, 200);
    assert.match(await unknown.text(), /찾지 못했습니다/);
  } finally {
    await stop(child);
  }
});
