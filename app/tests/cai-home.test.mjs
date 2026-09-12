import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";

/** 앱 패키지 루트 경로. */
const appRoot = path.resolve(import.meta.dirname, "..");
/** 저장소 루트 경로. */
const repositoryRoot = path.resolve(appRoot, "..");
const serverEntrypoint = path.join(appRoot, "build/server/index.js");
const serveEntrypoint = path.join(appRoot, "node_modules/@react-router/serve/bin.cjs");

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

test("serves the CAI-first home with empty states and preserved WTI", async () => {
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
    const home = await waitForResponse(`${base}/`, child, output);
    assert.equal(home.status, 200, output.join(""));
    const body = await home.text();
    const text = body.split("<script")[0].replace(/<[^>]*>/g, "");

    // AC1: 계기판·예측·WTI가 첫 화면에 있고, 미연결 값은 지어내지 않는다.
    assert.match(body, /<h1[^>]*>쿠싱 액티비티 인덱스<\/h1>/);
    assert.match(text, /쿠싱 액티비티 인덱스/);
    assert.match(body, /role="meter"/);
    assert.match(body, /data-cai-score="none"/);
    assert.match(body, /산출 대기/);
    assert.doesNotMatch(body, /data-needle/, "empty gauge has no needle");
    assert.doesNotMatch(body, /aria-valuenow/, "empty gauge has no value");
    // 빈 상태는 compact이고 큰 반원 SVG를 그리지 않는다.
    assert.match(body, /data-cai-gauge="compact"/);
    assert.doesNotMatch(body, /volatility-gauge/, "empty gauge does not dominate the screen");
    assert.match(body, /data-forecast-state="pending"/);
    assert.match(text, /아직 예측하지 않습니다/);
    assert.doesNotMatch(body, /data-up="/, "no example probabilities");
    assert.doesNotMatch(text, /64\.2|35\.8/, "no example probability numbers");
    assert.match(body, /id="wti-daily-chart"/);
    assert.match(body, /id="daily-latest-price"/);
    assert.match(text, /WTI 원유 가격/);

    // AC4: 헤더는 작은 LS CRUDE와 정확히 두 메뉴. 설명 문구·캡션 없음.
    assert.match(body, /href="\/"[^>]*>대시보드/);
    assert.match(body, /href="\/research"[^>]*>연구 기록</);
    assert.doesNotMatch(body, /href="\/history"[^>]*>히스토리/);
    const nav = body.match(/<nav aria-label="주요 화면"[\s\S]*?<\/nav>/);
    assert.ok(nav, "main nav rendered");
    assert.equal((nav[0].match(/<a /g) ?? []).length, 2, "menu has exactly two items");
    assert.doesNotMatch(body, /ALTERNATIVE DATA RESEARCH/);
    assert.match(body, /data-source="Yahoo Finance"/);

    // 기존 연구 데스크 히어로·사례 탐색은 홈에서 빠지고 연구 기록이 맡는다.
    assert.doesNotMatch(text, /아직 채택할 신호가 없습니다/);
    assert.doesNotMatch(body, /id="research-sample"/);
    assert.doesNotMatch(body, /aria-label="연구 사례 선택"/);
    assert.match(body, /href="\/research#research-sample"/);
    assert.doesNotMatch(body, /href="\/history/, "dashboard does not link to the legacy history URL");

    // CAI란?과 변동성 설명은 기본 접힘.
    assert.match(body, /<details/);
    assert.match(text, /CAI란\?/);
    assert.doesNotMatch(body, /<details[^>]*\sopen/);

    // AC2: 홈의 history 링크가 실제 사례를 연다.
    const helix = await waitForResponse(`${base}/history?sample=helix`, child, output);
    assert.equal(helix.status, 200);
    assert.match(await helix.text(), /id="helix-index-plot"/);

    // AC5(보조): 미연결 forecast 기본값 50%가 없다.
    assert.doesNotMatch(text, /50\s*%/);
  } finally {
    await stop(child);
  }
});
