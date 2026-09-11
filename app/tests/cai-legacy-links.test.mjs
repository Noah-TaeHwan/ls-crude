import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";
import { SAMPLE_LINKS } from "../app/lib/research-charts.ts";
import {
  SUPPORTED_SAMPLES,
  legacyCandidateRedirect,
  legacyHashRedirect,
  legacySampleRedirect,
  unsupportedSampleNotice,
} from "../app/lib/cai-legacy-routing.ts";

/** @param query query 문자열. @returns URLSearchParams. */
const params = (query) => new URLSearchParams(query);
/** URL_COMPAT 표의 9개 지원 sample. */
const KINDS = ["visibility", "tankers", "empties", "watermelon", "jeju", "degree-days", "petroleum-rail", "helix", "cushing-busy"];

test("supported samples derive from the live SAMPLE_LINKS without omission", () => {
  assert.deepEqual([...SUPPORTED_SAMPLES].sort(), [...KINDS].sort());
  assert.equal(SUPPORTED_SAMPLES.length, new Set(SUPPORTED_SAMPLES).size);
  const fromLinks = new Set(
    Object.values(SAMPLE_LINKS).map((href) => new URL(href, "https://ls-crude.local").searchParams.get("sample")),
  );
  for (const kind of fromLinks) assert.ok(kind && SUPPORTED_SAMPLES.includes(kind), `SAMPLE_LINKS kind ${kind}`);
});

test("root and research sample entries move to the exact history URL in one hop", () => {
  for (const kind of KINDS) {
    assert.equal(legacySampleRedirect("/", params(`sample=${kind}`)), `/history?sample=${kind}#research-sample`);
    assert.equal(legacySampleRedirect("/research", params(`sample=${kind}`)), `/history?sample=${kind}#research-sample`);
  }
  // 기타 query는 보존하고, 지원 sample은 candidate와 함께 가도 history로 먼저 이동한다.
  assert.equal(
    legacySampleRedirect("/research", params("sample=jeju&candidate=080")),
    "/history?sample=jeju&candidate=080#research-sample",
  );
  // URL encoding은 URLSearchParams가 해석한다.
  assert.equal(legacySampleRedirect("/", params("sample=%6Aeju")), "/history?sample=jeju#research-sample");
  // 정적 research/ 디렉터리가 만드는 끝 슬래시도 같은 규칙으로 처리한다.
  assert.equal(legacySampleRedirect("/research/", params("sample=jeju")), "/history?sample=jeju#research-sample");
});

test("unsupported, empty and non-entry paths never redirect", () => {
  assert.equal(legacySampleRedirect("/", params("sample=unknown")), null);
  assert.equal(legacySampleRedirect("/research", params("sample=unknown")), null);
  assert.equal(legacySampleRedirect("/", params("sample=")), null);
  assert.equal(legacySampleRedirect("/", params("")), null);
  assert.equal(legacySampleRedirect("/history", params("sample=jeju")), null);
  assert.equal(legacySampleRedirect("/observations/tankers", params("sample=jeju")), null);
  // 외부 URL을 redirect 대상으로 쓰지 않는다.
  assert.equal(legacySampleRedirect("/research", params("sample=https://evil.example/x")), null);
});

test("hash-only legacy anchors move by client replace rules and never loop", () => {
  assert.equal(legacyHashRedirect("/", "#research-sample"), "/history#research-sample");
  assert.equal(legacyHashRedirect("/research", "#ledger"), "/history#ledger");
  assert.equal(legacyHashRedirect("/research", "#history"), "/history#history");
  assert.equal(legacyHashRedirect("/research", "#method"), null);
  assert.equal(legacyHashRedirect("/research", "#intake"), null);
  assert.equal(legacyHashRedirect("/history", "#ledger"), null);
  assert.equal(legacyHashRedirect("/", "#market"), null);
  assert.equal(legacyHashRedirect("/", ""), null);
  assert.equal(legacyHashRedirect("/research/", "#ledger"), "/history#ledger");
});

test("candidate routing keeps current manifest IDs and sends only known old IDs to history", () => {
  const current = ["001", "009", "018"];
  const old = ["ALT-20260907-36", "ALT-20260909-02"];
  assert.equal(legacyCandidateRedirect("018", current, old), null);
  assert.equal(legacyCandidateRedirect("ALT-20260907-36", current, old), "/history?candidate=ALT-20260907-36#ledger");
  assert.equal(legacyCandidateRedirect("zzz", current, old), null);
  assert.equal(legacyCandidateRedirect(null, current, old), null);
  assert.equal(legacyCandidateRedirect("", current, old), null);
});

test("unsupported sample notice exists only for unknown values", () => {
  for (const kind of KINDS) assert.equal(unsupportedSampleNotice(kind), null);
  assert.equal(unsupportedSampleNotice(null), null);
  assert.equal(unsupportedSampleNotice(""), null);
  const notice = unsupportedSampleNotice("unknown");
  assert.ok(notice && notice.includes("지원하지 않는"));
});

// ---- built server integration ----

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

test("serves URL_COMPAT redirects from the built server without loops", async () => {
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
    await waitForResponse(`${base}/history`, child, output);

    for (const kind of KINDS) {
      const fromResearch = await fetch(`${base}/research?sample=${kind}`, { redirect: "manual" });
      assert.equal(fromResearch.status, 308, `research ${kind}`);
      assert.equal(fromResearch.headers.get("location"), `/history?sample=${kind}#research-sample`, `research ${kind}`);
      const fromRoot = await fetch(`${base}/?sample=${kind}`, { redirect: "manual" });
      assert.equal(fromRoot.status, 308, `root ${kind}`);
      assert.equal(fromRoot.headers.get("location"), `/history?sample=${kind}#research-sample`, `root ${kind}`);
      const direct = await fetch(`${base}/history?sample=${kind}`, { redirect: "manual" });
      assert.equal(direct.status, 200, `history ${kind}`);
    }

    // 한 번만 이동하고 최종 화면이 일치한다.
    const followed = await fetch(`${base}/research?sample=jeju`);
    assert.equal(followed.status, 200);
    assert.ok(followed.url.endsWith("/history?sample=jeju"), followed.url);
    assert.match(await followed.text(), /id="jeju-generation-plot"/);

    // 기타 query 보존 + 미지원/빈 값은 redirect 없음.
    const mixed = await fetch(`${base}/research?sample=jeju&candidate=080`, { redirect: "manual" });
    assert.equal(mixed.headers.get("location"), "/history?sample=jeju&candidate=080#research-sample");
    for (const [label, url] of [
      ["unknown-sample-research", `${base}/research?sample=unknown`],
      ["unknown-sample-root", `${base}/?sample=unknown`],
      ["empty-sample", `${base}/research?sample=`],
      ["blank-sample", `${base}/research?sample=%20`],
      ["external-sample", `${base}/research?sample=https://evil.example/x`],
    ]) {
      const response = await fetch(url, { redirect: "manual" });
      assert.equal(response.status, 200, label);
    }

    // candidate: 현행 manifest ID는 research 유지, 알려진 옛 ID는 history, 그 외는 빈 검색.
    // 보관 기록이 history로 옮겨져(S3b) 현행 ID도 history 원장으로 1회 이동한다.
    const current = await fetch(`${base}/research?candidate=018`, { redirect: "manual" });
    assert.equal(current.status, 308);
    assert.equal(current.headers.get("location"), "/history?candidate=018#ledger");
    const old = await fetch(`${base}/research?candidate=ALT-20260907-36`, { redirect: "manual" });
    assert.equal(old.status, 308);
    assert.equal(old.headers.get("location"), "/history?candidate=ALT-20260907-36#ledger");
    const oldFollowed = await fetch(`${base}/research?candidate=ALT-20260907-36`);
    assert.equal(oldFollowed.status, 200);
    assert.ok(oldFollowed.url.endsWith("/history?candidate=ALT-20260907-36"), oldFollowed.url);
    for (const value of ["unknown-candidate", ""]) {
      const response = await fetch(`${base}/research?candidate=${value}`, { redirect: "manual" });
      assert.equal(response.status, 200, `candidate ${value}`);
    }

    // history 직접 진입은 재이동하지 않는다.
    for (const url of [`${base}/history`, `${base}/history?sample=watermelon#research-sample`, `${base}/history#research-sample`]) {
      const response = await fetch(url, { redirect: "manual" });
      assert.equal(response.status, 200, url);
    }
  } finally {
    await stop(child);
  }
});
