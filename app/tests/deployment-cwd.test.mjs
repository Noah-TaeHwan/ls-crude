import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";

import { isWtiMarketSnapshot } from "../app/lib/types.ts";

/** 앱 패키지 루트 경로. */
const appRoot = path.resolve(import.meta.dirname, "..");
/** 배포 환경의 다른 작업 디렉터리를 재현할 저장소 루트 경로. */
const repositoryRoot = path.resolve(appRoot, "..");
/** 빌드된 React Router 서버 진입점. */
const serverEntrypoint = path.join(appRoot, "build/server/index.js");
/** React Router 운영 서버 실행 파일. */
const serveEntrypoint = path.join(
  appRoot,
  "node_modules/@react-router/serve/bin.cjs",
);
/** 공개 WTI 관측 스냅샷 경로. */
const marketSnapshotPath = path.join(appRoot, "public/wti-market-snapshot.json");

/**
 * 테스트 서버에 사용할 빈 로컬 포트를 찾는다.
 * @returns 사용 가능한 포트 번호.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
        } else {
          reject(new Error("Could not determine the test port"));
        }
      });
    });
  });
}

/**
 * 자식 프로세스가 제한 시간 안에 끝나는지 기다린다.
 * @param {import("node:child_process").ChildProcess} child 확인할 프로세스.
 * @param {number} timeoutMs 기다릴 최대 시간.
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
 * 테스트 서버를 종료하고 필요하면 강제 종료한다.
 * @param {import("node:child_process").ChildProcess} child 종료할 프로세스.
 * @returns 서버 종료가 끝난 뒤 완료되는 Promise.
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
 * 서버가 응답할 때까지 전체 제한 시간 안에서 요청을 반복한다.
 * @param {string} url 확인할 주소.
 * @param {import("node:child_process").ChildProcess} child 서버 프로세스.
 * @param {string[]} output 실패 메시지에 붙일 서버 출력.
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

test("rejects malformed WTI market snapshots without throwing", async () => {
  const valid = JSON.parse(await readFile(marketSnapshotPath, "utf8"));
  assert.equal(isWtiMarketSnapshot(valid), true);

  const nullBar = structuredClone(valid);
  nullBar.bars = [null];
  assert.equal(isWtiMarketSnapshot(nullBar), false);

  const outOfRange = structuredClone(valid);
  outOfRange.volatility.rv5ReferencePercentile = 150;
  assert.equal(isWtiMarketSnapshot(outOfRange), false);

  const missingProvenance = structuredClone(valid);
  delete missingProvenance.provenance;
  assert.equal(isWtiMarketSnapshot(missingProvenance), false);
});

test("serves the public evidence brief routes from the repository root", async () => {
  const marketSnapshot = JSON.parse(await readFile(marketSnapshotPath, "utf8"));
  const score = Math.round(marketSnapshot.volatility.rv5ReferencePercentile);
  const band = score < 25 ? "안정" : score < 50 ? "보통" : score < 75 ? "고조" : "급변";
  assert.ok(score >= 0 && score <= 100);
  assert.equal(marketSnapshot.bars.at(-1).date, marketSnapshot.asOf);
  assert.ok(marketSnapshot.freshnessPolicy.maxCheckAgeHours > 0);
  assert.ok(marketSnapshot.freshnessPolicy.maxBarAgeDays > 0);
  const port = await findFreePort();
  const output = [];
  const child = spawn(process.execPath, [serveEntrypoint, serverEntrypoint], {
    cwd: repositoryRoot,
    env: { NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));

  try {
    const baseUrl = `http://127.0.0.1:${port}`;
    const response = await waitForResponse(`${baseUrl}/`, child, output);
    assert.equal(response.status, 200, output.join(""));
    const body = await response.text();
    assert.match(body, /data-source="Yahoo Finance"/);
    assert.ok(
      body.includes(`WTI 5거래일 실현변동성 백분위 ${score}, ${band}`),
      "gauge must render the checked-in market snapshot percentile and matching band",
    );
    const checkedAtKst = new Date(
      Date.parse(marketSnapshot.checkedAt) + 9 * 60 * 60 * 1_000,
    );
    const expectedCheckedAt = `${checkedAtKst.toISOString().slice(0, 16).replace("T", " ")} KST`;
    assert.ok(
      body.includes(expectedCheckedAt),
      "server and browser must share one deterministic KST timestamp",
    );
    assert.match(body, /방향이 아니라 움직임의 크기입니다/);
    assert.doesNotMatch(body, /<form\b/i, "public home must not expose news CRUD forms");

    const research = await fetch(`${baseUrl}/research`);
    assert.equal(research.status, 200);
    const researchBody = await research.text();
    assert.match(researchBody, /52개/);
    assert.match(researchBody, /통과 0개/);

    const legacyGet = await fetch(`${baseUrl}/backtest`, { redirect: "manual" });
    assert.equal(legacyGet.status, 308);
    assert.equal(legacyGet.headers.get("location"), "/research");

    const legacyPost = await fetch(`${baseUrl}/backtest`, {
      method: "POST",
      body: new URLSearchParams(),
      redirect: "manual",
    });
    assert.equal(legacyPost.status, 400);
    const legacyPostBody = await legacyPost.text();
    assert.match(legacyPostBody, /백테스트를 실행할 수 없습니다/);
    assert.match(legacyPostBody, /<h1[^>]*>백테스트는 로컬에서 진행합니다\.<\/h1>/);
  } finally {
    await stop(child);
  }
});
