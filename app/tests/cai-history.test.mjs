import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";
import { legacyHashRedirect, legacySampleRedirect } from "../app/lib/cai-legacy-routing.ts";

/** 앱 패키지 루트 경로. */
const appRoot = path.resolve(import.meta.dirname, "..");
/** 배포 환경의 작업 디렉터리를 재현할 저장소 루트 경로. */
const repositoryRoot = path.resolve(appRoot, "..");
/** 빌드된 React Router 서버 진입점. */
const serverEntrypoint = path.join(appRoot, "build/server/index.js");
/** React Router 운영 서버 실행 파일. */
const serveEntrypoint = path.join(appRoot, "node_modules/@react-router/serve/bin.cjs");

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

/** 사례별 표시 마커. 실제 컴포넌트가 그리는 표면만 검사한다. */
const SAMPLE_MARKERS = [
  ["cushing-busy", /아직 판단할 수 없습니다/],
  ["helix", /id="helix-index-plot"/],
  ["watermelon", /id="watermelon-research-plot"/],
  ["jeju", /id="jeju-generation-plot"/],
  ["degree-days", /id="degree-days-level-plot"/],
  ["empties", /id="empties-plot"/],
  ["petroleum-rail", /id="petroleum-rail-plot"/],
  ["visibility", /id="visibility-observation"/],
  ["tankers", /id="tanker-observation"/],
];

test("serves the read-only history route with every supported sample", async () => {
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
    const history = await waitForResponse(`${base}/history`, child, output);
    assert.equal(history.status, 200, output.join(""));
    const body = await history.text();
    const text = body.split("<script")[0].replace(/<[^>]*>/g, "");
    // /history 직접 진입도 통합 연구 기록을 그린다.
    assert.match(text, /쿠싱의 활동에서 유가의 단서 찾기/);
    assert.match(text, /연구·검증 기록 더 보기/);
    assert.match(body, /id="research-sample"/);
    assert.match(body, /id="ledger"/);
    assert.match(body, /data-decision-timeline/);
    assert.match(body, /aria-label="연구 사례 선택"/);
    assert.match(text, /과거 연구 샘플 · 자동 갱신 아님/);
    // 기본 진입은 가짜 데이터가 아니라 실제 수박 샘플을 그린다.
    assert.match(body, /id="watermelon-research-plot"/);
    const optionLabels = [...body.matchAll(/>([^<]+)<\/button>/g)].map((match) => match[1].trim());
    for (const label of [
      "보드 · 쿠싱 현장 바쁨",
      "고정 · HLX · 오일서비스",
      "고정 · 수박 · 냉장트럭",
      "고정 · 제주 · LNG와 유류",
      "고정 · 미국 · 냉난방도일",
      "고정 · LA항 · 빈 컨테이너",
      "고정 · 미국 · 석유 철도",
      "갱신 · 갤버스턴 시정",
      "갱신 · 싱가포르 탱커 입항",
    ]) {
      assert.ok(optionLabels.includes(label), `option ${label}`);
    }
    assert.ok(optionLabels.length >= 9);

    for (const [kind, marker] of SAMPLE_MARKERS) {
      const response = await waitForResponse(`${base}/history?sample=${kind}`, child, output);
      assert.equal(response.status, 200, `${kind}: ${output.join("")}`);
      const sampleBody = await response.text();
      assert.match(sampleBody, marker, `sample ${kind}`);
      assert.doesNotMatch(sampleBody, /해당 후보 정본을 확인하지 못했습니다/, `no fake notice ${kind}`);
    }

    // 알 수 없는 sample은 지어내지 않고 기본 사례로 남는다.
    const unknown = await waitForResponse(`${base}/history?sample=unknown`, child, output);
    assert.equal(unknown.status, 200);
    const unknownBody = await unknown.text();
    assert.match(unknownBody, /id="watermelon-research-plot"/);
    assert.doesNotMatch(unknownBody, /해당 후보 정본을 확인하지 못했습니다/);

    // 쓰기 기능을 새로 제공하지 않는다.
    const historyPost = await fetch(`${base}/history`, { method: "POST", body: new URLSearchParams() });
    assert.equal(historyPost.status, 405);

    // 대시보드는 WTI를 유지하고, 사례·보관 기록은 연구 기록이 맡는다.
    const home = await waitForResponse(`${base}/`, child, output);
    assert.equal(home.status, 200);
    const homeBody = await home.text();
    assert.match(homeBody, /id="wti-daily-chart"/);
    assert.match(homeBody, /href="\/research"/);
    assert.doesNotMatch(homeBody, /id="research-sample"/);
  } finally {
    await stop(child);
  }
});

test("history route does not import WTI readers and its loader is separate", async () => {
  const source = await readFile(path.join(appRoot, "app/routes/history.tsx"), "utf8");
  assert.doesNotMatch(source, /wti-daily\.server|market-snapshot\.server|readWtiDaily/);
  const routes = await readFile(path.join(appRoot, "app/routes.ts"), "utf8");
  assert.match(routes, /route\("history", "routes\/history\.tsx"\)/);
});

// ---- 승인된 2메뉴·통합 연구 기록·redirect loop 검증 ----

/**
 * 빌드된 서버를 띄워 테스트 본문을 실행한다.
 * @param body 서버 주소와 서버 출력을 받는 테스트 함수.
 * @returns 완료 Promise.
 */
async function withServer(body) {
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
    await waitForResponse(`http://127.0.0.1:${port}/history`, child, output);
    await body(`http://127.0.0.1:${port}`, output);
  } finally {
    await stop(child);
  }
}

test("메뉴는 두 목적지를 유지하고 대시보드는 회고 지수를 표시한다", async () => {
  await withServer(async (base, output) => {
    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200, output.join(""));
    const body = await home.text();
    const nav = body.match(/<nav aria-label="주요 화면"[\s\S]*?<\/nav>/);
    assert.ok(nav, "main nav rendered");
    const links = [...nav[0].matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [href, label.trim()]);
    assert.deepEqual(links, [["/", "대시보드"], ["/research", "연구 기록"]], "exactly the two approved destinations");
    assert.doesNotMatch(body, /href="\/history"/, "no third menu destination");

    // 실측 입력의 회고 지수를 표시하되 예측 확률은 미게시 상태다.
    assert.match(body, /data-cai-gauge="full"/);
    assert.match(body, /현재 값이 아닙니다/);
    assert.match(body, /data-cai-score="43.1"/);
    assert.match(body, /data-forecast-state="pending"/);
    assert.match(body, /data-needle/);
    assert.doesNotMatch(body, /data-up="/);
  });
});

test("research와 history 모두 통합 연구 기록을 그리고 history 직접 진입은 redirect하지 않는다", async () => {
  await withServer(async (base) => {
    for (const route of ["/research", "/history"]) {
      const response = await fetch(`${base}${route}`, { redirect: "manual" });
      assert.equal(response.status, 200, `${route} direct render`);
      assert.equal(response.headers.get("location"), null, `${route} stays put`);
      const body = await response.text();
      assert.match(body, /쿠싱의 활동에서 유가의 단서 찾기/, `${route} workflow title`);
      assert.match(body, /연구·검증 기록 더 보기/, `${route} archive section`);
      assert.match(body, /id="current"/);
      assert.match(body, /id="past"/);
      assert.match(body, /id="research-sample"/);
      assert.match(body, /id="ledger"/);
      assert.match(body, /id="ledger-search"/);
      assert.match(body, /data-decision-timeline/);
      assert.doesNotMatch(body, /<details[^>]*\sopen/, `${route} details start collapsed`);
    }
  });
});

test("sample/candidate query와 #ledger·#history 규칙이 보존되고 research↔history 사이에 loop가 없다", async () => {
  await withServer(async (base) => {
    // /research sample → 정확히 한 번 308, query 보존, history에서 종료.
    for (const kind of ["jeju", "helix"]) {
      const first = await fetch(`${base}/research?sample=${kind}`, { redirect: "manual" });
      assert.equal(first.status, 308);
      assert.equal(first.headers.get("location"), `/history?sample=${kind}#research-sample`);
      const final = await fetch(`${base}/research?sample=${kind}`);
      assert.equal(final.status, 200);
      assert.ok(final.url.endsWith(`/history?sample=${kind}`), final.url);
      const direct = await fetch(`${base}/history?sample=${kind}`, { redirect: "manual" });
      assert.equal(direct.status, 200, "history is terminal for sample query");
      assert.equal(direct.headers.get("location"), null, "no bounce back to research");
    }
    // 기타 query 보존.
    const mixed = await fetch(`${base}/research?sample=jeju&candidate=080`, { redirect: "manual" });
    assert.equal(mixed.headers.get("location"), "/history?sample=jeju&candidate=080#research-sample");
    // candidate query는 history 원장을 열고 다시 이동하지 않는다.
    const candidate = await fetch(`${base}/history?candidate=018`, { redirect: "manual" });
    assert.equal(candidate.status, 200);
    assert.equal(candidate.headers.get("location"), null);
    const candidateBody = await candidate.text();
    assert.match(candidateBody, /<details id="past" open/);
    assert.match(candidateBody, /<details id="ledger" open/);
    assert.match(candidateBody, /018-refinery-thermal-flare\/README\.md/);
    const sampleOpen = await fetch(`${base}/history?sample=jeju`, { redirect: "manual" });
    assert.equal(sampleOpen.status, 200);
    const sampleOpenBody = await sampleOpen.text();
    assert.match(sampleOpenBody, /<details id="past" open/);
    assert.match(sampleOpenBody, /id="jeju-generation-plot"/);
    // hash 규칙: research → history 한 번, history에서는 종료.
    assert.equal(legacyHashRedirect("/research", "#ledger"), "/history#ledger");
    assert.equal(legacyHashRedirect("/history", "#ledger"), null);
    assert.equal(legacyHashRedirect("/research", "#history"), "/history#history");
    assert.equal(legacyHashRedirect("/history", "#history"), null);
    assert.equal(legacySampleRedirect("/history", new URLSearchParams("sample=jeju")), null);
  });
});
