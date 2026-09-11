import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";

import { deltaLogLossVsMarket, parseExperimentSummary } from "../app/lib/experiment-summary.ts";

/** 앱 패키지 루트. */
const appRoot = path.resolve(import.meta.dirname, "..");
/** 배포 환경의 작업 디렉터리를 재현할 저장소 루트. */
const repositoryRoot = path.resolve(appRoot, "..");
/** 테스트가 직접 읽는 회고 실험 요약 정본. */
const realSummary = JSON.parse(
  readFileSync(path.join(appRoot, "app/data/cai-experiment-summary.json"), "utf8"),
);
/** 빌드된 React Router 서버 진입점. */
const serverEntrypoint = path.join(appRoot, "build/server/index.js");
/** React Router 운영 서버 실행 파일. */
const serveEntrypoint = path.join(appRoot, "node_modules/@react-router/serve/bin.cjs");

test("real summary parses and keeps the two experiments separate", () => {
  const summary = parseExperimentSummary(realSummary);
  assert.ok(summary, "v1 summary parses");
  assert.deepEqual(
    summary.experiments.map((experiment) => experiment.id),
    ["pilot_traffic", "pilot_traffic_dmr"],
  );
  assert.equal(summary.experiments[0].models[0].train_rows, 905);
  assert.equal(summary.experiments[1].models[0].train_rows, 507);
  assert.equal(summary.sensitivity.common_232.n, 232);
  assert.equal(summary.sensitivity.C_0.status, "skipped");
  const delta = deltaLogLossVsMarket(summary.experiments[1], "market_cai_learned");
  assert.ok(delta !== null && delta > 0, `learned CAI worse than market (delta ${delta})`);
});

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
        else reject(new Error("Could not determine the test port"));
      });
    });
  });
}

/**
 * 서버가 응답할 때까지 제한 시간 안에서 요청을 반복한다.
 * @param url 확인할 주소.
 * @param child 서버 프로세스.
 * @param output 실패 메시지에 붙일 서버 출력.
 * @returns 서버가 반환한 첫 응답.
 */
async function waitForResponse(url, child, output) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`server exited before responding\n${output.join("")}`);
    }
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
  throw new Error(`server did not respond within 10 seconds\n${output.join("")}`);
}

/**
 * 자식 프로세스가 제한 시간 안에 끝나는지 기다린다.
 * @param child 확인할 프로세스.
 * @param timeoutMs 기다릴 최대 시간.
 * @returns 제한 시간 안에 종료됐는지 여부.
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
 * @param child 종료할 프로세스.
 * @returns 종료가 끝난 뒤 완료되는 Promise.
 */
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  if (await waitForExit(child, 1_000)) return;
  child.kill("SIGKILL");
  if (!(await waitForExit(child, 1_000))) {
    throw new Error(`server process ${child.pid ?? "unknown"} did not exit after SIGKILL`);
  }
}

/**
 * 태그와 주석을 지운 표시 텍스트를 돌려준다.
 * @param html 서버 HTML.
 * @returns 스크립트 앞부분의 텍스트.
 */
function visibleText(html) {
  return html.split("<script")[0].replace(/<[^>]*>/g, "");
}

test("serves compact experiment results on home and the full section on research", async () => {
  const port = await findFreePort();
  const output = [];
  const child = spawn(
    process.execPath,
    ["--import", path.join(appRoot, "tests/fixtures/ssr-yahoo.mjs"), serveEntrypoint, serverEntrypoint],
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

    // 홈: 메뉴는 그대로 두 개, 회고 실험은 한 줄 카드와 연구 링크만.
    const home = await waitForResponse(`${base}/`, child, output);
    assert.equal(home.status, 200, output.join(""));
    const homeBody = await home.text();
    const homeText = visibleText(homeBody);
    const nav = homeBody.match(/<nav aria-label="주요 화면"[\s\S]*?<\/nav>/);
    assert.ok(nav, "main nav rendered");
    assert.equal((nav[0].match(/<a /g) ?? []).length, 2, "menu has exactly two items");
    assert.doesNotMatch(homeBody, /href="\/history"/, "no third menu destination");
    assert.match(homeBody, /id="wti-daily-chart"/, "WTI focal chart preserved");
    assert.match(homeBody, /data-cai-gauge="compact"/, "CAI focal layout preserved");
    assert.match(homeBody, /data-experiment-results="compact"/);
    assert.match(
      homeText,
      /교통·시설 유량을 활용한 2023년 회고 평가에서, 이번 비교의 예측 개선을 확인하지 못했습니다\./,
    );
    assert.match(homeText, /평가 기간 2023-01-03–2023-12-21/);
    assert.match(homeText, /확률오차 개선 없음/);
    assert.match(homeBody, /href="\/research#experiments"/);

    // 연구 기록: #experiments가 기존 anchor를 깨지 않고 전체 모드를 그린다.
    const research = await waitForResponse(`${base}/research`, child, output);
    assert.equal(research.status, 200, output.join(""));
    const researchBody = await research.text();
    const researchText = visibleText(researchBody);
    for (const anchor of ["current", "past", "method", "research-sample", "ledger", "experiments"]) {
      assert.match(researchBody, new RegExp(`id="${anchor}"`), `anchor #${anchor}`);
    }
    assert.doesNotMatch(researchBody, /<details[^>]*\sopen/, "details still start collapsed");
    assert.match(researchBody, /data-experiment-results="full"/);
    assert.match(researchText, /2023년 회고 실험 결과/);

    // 실험 두 건은 별도 블록이고 각자의 학습 행을 그대로 보여준다.
    const trafficStart = researchBody.indexOf('data-experiment="pilot_traffic"');
    const dmrStart = researchBody.indexOf('data-experiment="pilot_traffic_dmr"');
    assert.ok(trafficStart > 0 && dmrStart > trafficStart, "two separate experiment blocks");
    const dmrEnd = researchBody.indexOf("data-sensitivity=", dmrStart);
    assert.ok(dmrEnd > dmrStart, "sensitivity follows the experiments");
    const trafficBlock = visibleText(researchBody.slice(trafficStart, dmrStart));
    const dmrBlock = visibleText(researchBody.slice(dmrStart, dmrEnd));
    assert.match(trafficBlock, /교통 단독 파일럿/);
    assert.match(trafficBlock, /905/);
    assert.match(trafficBlock, /0\.6970/, "traffic market log loss to 4 decimals");
    assert.match(dmrBlock, /교통\+DMR 파일럿/);
    assert.match(dmrBlock, /507/);
    assert.match(dmrBlock, /0\.7109/, "dmr learned CAI log loss to 4 decimals");
    assert.match(researchBody, /data-delta-vs-market/);

    // 민감도: A/B 블록, common_232 n, C_0 건너뜀.
    assert.match(researchBody, /data-sensitivity="A_62"/);
    assert.match(researchBody, /data-sensitivity="B_31"/);
    assert.match(researchBody, /data-sensitivity="C_0"/);
    assert.match(researchBody, /data-common-232/);
    assert.match(researchText, /common_232/);
    assert.match(researchText, /n=232/);
    assert.match(researchText, /표본 미달로 학습 안 함/);
    assert.match(researchText, /24/);
    assert.match(researchText, /12/);
    assert.match(researchText, /SELF_CHECK/);
    assert.match(researchText, /독립 재현 대기/);
    assert.match(researchBody, /data-review-status/);
    assert.match(researchBody, /data-limitations/);

    // 파일 경로는 화면 어디에도 나오지 않는다.
    assert.doesNotMatch(researchBody, /\/Users\//, "no absolute paths in research HTML");
    assert.doesNotMatch(homeBody, /\/Users\//, "no absolute paths in home HTML");
  } finally {
    await stop(child);
  }
});
