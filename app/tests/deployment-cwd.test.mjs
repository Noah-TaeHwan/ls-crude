import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import path from "node:path";

import { isWtiMarketSnapshot } from "../app/lib/types.ts";
import { parseResearchLedger } from "../app/lib/research-ledger.ts";

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
  const livePercentile = Math.round(marketSnapshot.volatility.rv5ReferencePercentile);
  assert.ok(livePercentile >= 0 && livePercentile <= 100);
  assert.equal(marketSnapshot.bars.at(-1).date, marketSnapshot.asOf);
  assert.ok(marketSnapshot.freshnessPolicy.maxCheckAgeHours > 0);
  assert.ok(marketSnapshot.freshnessPolicy.maxBarAgeDays > 0);
  const port = await findFreePort();
  const output = [];
  const child = spawn(process.execPath, ["--import", path.join(appRoot,"tests/fixtures/ssr-yahoo.mjs"), serveEntrypoint, serverEntrypoint], {
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
    const text = body.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(text, /아직 채택할 신호가 없습니다/);
    assert.doesNotMatch(text,/RESEARCH INTAKE|THE SIGNAL HUNT|WHAT REMAINS OPEN/);
    assert.match(body, /href="\/research"[^>]*>리서치/);
    assert.match(text, /5일 실현변동성 백분위/);
    assert.match(text, /후보 비교선은 아직 없습니다/);
    assert.ok(text.includes(String(livePercentile)), "RV5 percentile must come from the actual snapshot");
    assert.match(text, /WTI 원유 가격/);
    for (const label of ["5년", "3년", "1년", "6개월", "3개월", "1개월", "1주일"]) assert.ok(text.includes(label));
    assert.doesNotMatch(body, /id="intraday-chart"|class="price-sparkline/);
    assert.ok((body.match(/id="wti-daily-chart"/g) ?? []).length <= 1);
    assert.doesNotMatch(body, /원유 DEFCON|DEFCON 3/);
    const expectedCheckedAt = new Date(Date.parse(marketSnapshot.checkedAt) + 9 * 60 * 60 * 1_000)
      .toISOString().slice(0, 16).replace("T", " ");
    assert.ok(text.includes(expectedCheckedAt), "SSR timestamp is explicitly KST");
    assert.doesNotMatch(body, /<form\b/i, "public home must not expose news CRUD forms");

    assert.ok(body.indexOf('id="market"') < body.indexOf('id="observations"'), "observation follows the single daily chart");
    assert.doesNotMatch(body, /id="visibility-observation"/, "default home shows observations only after case selection");
    const visibility = await fetch(`${baseUrl}/observations/visibility`);
    assert.equal(visibility.status, 200);
    const visibilityBody = await visibility.text();
    assert.match(visibilityBody, /KGLS · 시정 관측/);
    assert.match(visibilityBody, /항로 앞이 잘 보일까/);
    assert.match(visibilityBody, /ALT-20260908-16/);
    assert.doesNotMatch(visibilityBody, /id="wti-daily-chart"/);
    assert.doesNotMatch(visibilityBody, /<details[^>]* open/, "observations table starts collapsed");
    const visibilityPost = await fetch(`${baseUrl}/observations/visibility`, { method: "POST", body: new URLSearchParams() });
    assert.equal(visibilityPost.status, 405);


    assert.doesNotMatch(body, /id="tanker-observation"/);
    assert.doesNotMatch(body, /02 \/ FIELD NOTES/);
    assert.doesNotMatch(body, /id="intake"/);
    assert.match(body, /href="\/#research-sample"/);
    const sample = body.slice(body.indexOf('id="research-sample"'), body.indexOf("</main>"));
    for (const label of ["과거 연구 샘플", "자동 갱신 아님", "WTI 관계 검정 미실행", "2025-10-14", "332", "소수값", "원단위 표"]) assert.ok(sample.includes(label));
    assert.match(sample, /<svg id="watermelon-research-plot"/);
    assert.doesNotMatch(sample, /<img/);
    assert.match(sample, /href="\/research\/watermelon-20260908.png"/);
    assert.match(body, /id="wti-price-axis"/);
    assert.match(body,/92\.00/,"SSR test price must come from the explicit fixture");
    assert.match(body, /data-price-tick=/);

    const tankers = await fetch(`${baseUrl}/observations/tankers`);
    assert.equal(tankers.status, 200);
    const tankerBody = await tankers.text();
    assert.match(tankerBody, /MPA · 월간 입항/);
    assert.match(tankerBody, /탱커는 얼마나 드나들까/);
    assert.match(tankerBody, /ALT-20260907-26/);
    assert.match(tankerBody, /Singapore Open Data Licence/);
    assert.doesNotMatch(tankerBody, /id="wti-daily-chart"/);
    assert.doesNotMatch(tankerBody, /<details[^>]* open/);
    const tankerPost = await fetch(`${baseUrl}/observations/tankers`, { method: "POST", body: new URLSearchParams() });
    assert.equal(tankerPost.status, 405);

    const research = await fetch(`${baseUrl}/research`);
    assert.equal(research.status, 200);
    const researchBody = await research.text();
    const researchText = researchBody.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(researchBody, /id="research-sample"/);
    assert.doesNotMatch(researchBody, /id="(?:watermelon-research-plot|jeju-generation-plot|degree-days-level-plot|empties-plot|visibility-observation|tanker-observation|wti-daily-chart)"/);
    assert.match(researchBody, /href="\/#research-sample"/);
    assert.match(researchBody,/작업 상태로 살펴보기/);
    assert.match(researchBody,/원본 확보/);
    assert.match(researchBody,/차단·실패/);
    for (const route of ["/", "/research"]) {
      const jejuResponse = await fetch(`${baseUrl}${route}?sample=jeju`);
      const jejuBody = await jejuResponse.text();
      assert.equal(jejuResponse.status,200);
      assert.match(jejuBody, /id="jeju-generation-plot"/);
      assert.match(jejuBody, /id="jeju-share-plot"/);
      assert.doesNotMatch(jejuBody, /id="watermelon-research-plot"/);
      for (const value of ["2024-03-31","6164.278","3997.953","39.34","바이오중유","자동 갱신 아님"]) assert.ok(jejuBody.includes(value));
    }
    for (const route of ["/", "/research"]) {
      const response=await fetch(`${baseUrl}${route}?sample=degree-days`);
      assert.equal(response.status,200);
      const html=await response.text();
      for (const value of ["degree-days-level-plot","degree-days-yoy-plot","2023-12","192","20","65°F","자동 갱신 아님"]) assert.ok(html.includes(value),value);
      assert.doesNotMatch(html,/id="jeju-generation-plot"|id="watermelon-research-plot"/);
    }
    for (const route of ["/", "/research"]) {
      const response=await fetch(`${baseUrl}${route}?sample=petroleum-rail`);
      assert.equal(response.status,200);
      const html=await response.text();
      for (const value of ["petroleum-rail-plot","2026-09-02","5712","3351","carloads","자동 갱신 아님","Petroleum Products"]) assert.ok(html.includes(value),value);
      assert.doesNotMatch(html,/id="jeju-generation-plot"|id="watermelon-research-plot"|id="degree-days-level-plot"|id="empties-plot"/);
    }
    assert.doesNotMatch(body,/id="empties-plot"/,"default home keeps frozen LA sample behind its case button");
    assert.doesNotMatch(body,/id="petroleum-rail-plot"/,"default home keeps frozen rail sample behind its case button");
    for (const route of ["/", "/research"]) {
      const response=await fetch(`${baseUrl}${route}?sample=empties`);
      const html=await response.text();
      assert.equal(response.status,200);
      assert.ok(html.indexOf('id="research-sample"')<html.indexOf('id="empties-plot"'));
      assert.equal((html.match(/id="empties-plot"/g)||[]).length,1);
      for(const value of ["LA항 · 빈 컨테이너","자동 갱신 아님","계산 분모","제공기관 수출 합계","75.73"]) assert.ok(html.includes(value),value);
    }
    const legacyEmpties=await fetch(`${baseUrl}/observations/empties`,{redirect:"manual"});
    assert.equal(legacyEmpties.status,308);
    assert.equal(legacyEmpties.headers.get("location"),"/?sample=empties#research-sample");
    for (const route of ["/", "/research"]) for(const [kind,id,unit] of [["visibility","visibility-observation","SM"],["tankers","tanker-observation","75 GT"]]) {
      const response=await fetch(`${baseUrl}${route}?sample=${kind}`);
      const html=await response.text();assert.equal(response.status,200);
      assert.match(html,new RegExp(`id="${id}"`));
      assert.ok(html.indexOf('id="research-sample"')<html.indexOf(`id="${id}"`));
      assert.ok(html.includes("갱신 관측"));assert.ok(html.includes(unit));
      assert.doesNotMatch(html,/id="watermelon-research-plot"|id="empties-plot"|id="petroleum-rail-plot"/);
    }
    const unknownSample = await fetch(`${baseUrl}/research?sample=unknown`);
    assert.doesNotMatch(await unknownSample.text(), /id="watermelon-research-plot"/);
    for(const kind of ["watermelon","jeju","degree-days","empties","visibility","tankers","petroleum-rail"]) {
      const redirect=await fetch(`${baseUrl}/research?sample=${kind}`,{redirect:"manual"});
      assert.equal(redirect.status,308);assert.equal(redirect.headers.get("location"),`/?sample=${kind}#research-sample`);
    }
    assert.match(researchText, /개별 관측/);
    const inventory = parseResearchLedger(await readFile(path.join(repositoryRoot, "research/factors/README.md"), "utf8"));
    assert.ok(researchText.includes(`전체 ${inventory.records.length}개`));
    assert.ok(researchText.includes(`기준 통과 ${inventory.passCount}개`));
    assert.match(researchText, /검정 요약과 근거/);
    assert.match(researchBody, /001-pentagon-ubereats\/README.md/);
    assert.doesNotMatch(researchBody, /<details[^>]* open/, "details start collapsed");
    const linked = await fetch(`${baseUrl}/research?candidate=018`);
    const linkedBody=await linked.text();
    assert.match(linkedBody, /018-refinery-thermal-flare\/README.md/);
    assert.match(linkedBody, /<details id="ledger" open/);

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

test("serves research image bytes from the production start directory", async () => {
  // react-router-serve의 정적 파일 루트는 app cwd 기준이다. 위 테스트는 SSR 자료 탐색의 다른 cwd를 검사한다.
  const port = await findFreePort();
  const output = [];
  const child = spawn(process.execPath, [serveEntrypoint, serverEntrypoint], {
    cwd: appRoot,
    env: { NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  try {
    for (const [name,source] of [["watermelon","ALT-20260907-36/20260908T065043Z"],["jeju","ALT-20260908-20/20260908T073402Z"]]) {
      const response = await waitForResponse(`http://127.0.0.1:${port}/research/${name}-20260908.png`, child, output);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /image\/png/);
      const quality = JSON.parse(await readFile(path.join(repositoryRoot, `research/indexes/${source}/quality.json`), "utf8"));
      assert.equal(createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex"), quality.output_sha256[`research/indexes/${source}/observation.png`]);
    }
    const svg=await fetch(`http://127.0.0.1:${port}/research/degree-days-v2.svg`);
    assert.equal(svg.status,200);
    assert.match(svg.headers.get("content-type"),/image\/svg/);
    const source="research/indexes/ALT-20260907-45/20260908T120546Z/v2/degree-days-monthly-v2.svg";
    assert.equal(createHash("sha256").update(Buffer.from(await svg.arrayBuffer())).digest("hex"),createHash("sha256").update(await readFile(path.join(repositoryRoot,source))).digest("hex"));
    const rail=await fetch(`http://127.0.0.1:${port}/research/petroleum-rail-20260909.svg`);
    assert.equal(rail.status,200);
    assert.match(rail.headers.get("content-type"),/image\/svg/);
    const railSource="research/indexes/ALT-20260907-43/20260909T003038Z/observation.svg";
    assert.equal(createHash("sha256").update(Buffer.from(await rail.arrayBuffer())).digest("hex"),createHash("sha256").update(await readFile(path.join(repositoryRoot,railSource))).digest("hex"));
    const la=await fetch(`http://127.0.0.1:${port}/research/la-empties-v2.svg`);
    assert.equal(la.status,200);assert.match(la.headers.get("content-type"),/image\/svg/);
    const laReceipt=JSON.parse(await readFile(path.join(repositoryRoot,"research/indexes/ALT-20260907-02/20260909T003314Z/v2/receipt.json"),"utf8"));
    assert.equal(createHash("sha256").update(Buffer.from(await la.arrayBuffer())).digest("hex"),laReceipt.outputs["observation-v2.svg"]);
  } finally {
    await stop(child);
  }
});
