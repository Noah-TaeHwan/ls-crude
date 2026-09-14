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
    assert.doesNotMatch(body, /ALTERNATIVE DATA RESEARCH/);
    const text = body.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(text, /쿠싱 액티비티 인덱스/);
    assert.match(text, /산출 대기/);
    assert.match(text, /아직 예측하지 않습니다/);
    assert.doesNotMatch(text,/RESEARCH INTAKE|THE SIGNAL HUNT|WHAT REMAINS OPEN/);
    assert.match(body, /href="\/research"[^>]*>연구 기록</);
    assert.doesNotMatch(body, /href="\/history"[^>]*>히스토리/);
    assert.match(text, /5일 실현변동성 백분위/);
    assert.match(text, /후보 데이터와의 비교는 연구 기록에서/);
    assert.ok(text.includes(String(livePercentile)), "RV5 percentile must come from the actual snapshot");
    assert.match(text, /WTI 원유 가격/);
    for (const label of ["5년", "3년", "1년", "6개월", "3개월", "1개월", "1주일"]) assert.ok(text.includes(label));
    assert.doesNotMatch(body, /id="intraday-chart"|class="price-sparkline/);
    assert.ok((body.match(/id="wti-daily-chart"/g) ?? []).length <= 1);
    assert.doesNotMatch(body, /원유 DEFCON|DEFCON 3/);
    const expectedCheckedAt = new Date(Date.parse(marketSnapshot.checkedAt) + 9 * 60 * 60 * 1_000)
      .toISOString().slice(0, 16).replace("T", " ");
    assert.ok(text.includes(expectedCheckedAt), "SSR timestamp is explicitly KST");
    const dateForm = body.match(/<form\b(?=[^>]*data-cai-date-form)[\s\S]*?<\/form>/i);
    assert.ok(dateForm, "read-only date query form is present");
    assert.match(dateForm[0], /method="get"/);
    assert.doesNotMatch(body.replace(dateForm[0], ""), /<form\b/i, "no news CRUD forms beyond the date query");
    assert.doesNotMatch(body, /data-local-status=/, "production home hides the developer monitor");
    const researchPage = await fetch(`${baseUrl}/research`);
    const researchHtml = await researchPage.text();
    assert.equal(researchPage.status, 200);
    assert.doesNotMatch(researchHtml, /data-local-status=|개발 작업 현황/, "production research hides the developer monitor");
    assert.equal((await fetch(`${baseUrl}/api/local-status`)).status, 404);
    const teamGuide = await fetch(`${baseUrl}/cai-team-workflow.md`);
    assert.equal(teamGuide.status, 200);
    assert.match(await teamGuide.text(), /33개 전부 수집 가능한 것으로 확인된 것은 아닙니다/);

    assert.ok(body.indexOf("data-cai-score") < body.indexOf('id="market"'), "CAI dashboard precedes the WTI market section");
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
    assert.match(body, /href="\/research"/);
    assert.doesNotMatch(body, /id="research-sample"/, "home no longer embeds the sample explorer");
    assert.doesNotMatch(body, /aria-label="연구 사례 선택"/);
    assert.match(body, /data-cai-score="43.1"/);
    assert.match(body, /data-forecast-state="pending"/);
    assert.doesNotMatch(body, /data-up="/, "empty CAI home must not carry example probabilities");
    assert.doesNotMatch(body, /<details[^>]*\sopen/, "CAI란 and volatility fold start collapsed");
    const helixHome = await fetch(`${baseUrl}/?sample=helix`);
    assert.equal(helixHome.status, 200);
    const helixBody = await helixHome.text();
    const helixText = helixBody.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(helixBody, /id="helix-index-plot"/);
    assert.match(helixText, /성찬님의 095 Oil–Helix/);
    assert.match(helixBody, /095-oil-helix-dislocation\/20260909T095HLXZ\/README.md/);
    assert.doesNotMatch(helixText, /해당 후보 정본을 확인하지 못했습니다/);
    const jejuHome = await fetch(`${baseUrl}/?sample=jeju`);
    assert.equal(jejuHome.status, 200);
    assert.match(await jejuHome.text(), /id="jeju-generation-plot"/);
    const emptiesHome = await fetch(`${baseUrl}/?sample=empties`);
    assert.equal(emptiesHome.status, 200);
    assert.match(await emptiesHome.text(), /id="empties-plot"/);
    assert.match(body, /id="wti-price-axis"/);
    assert.match(body,/<p id="daily-latest-price"[^>]*>93\.03/,"SSR must preserve the canonical daily row, not the ambiguous tail");
    assert.match(body,/확인 가능한 일봉/);
    assert.match(body,/일봉 귀속이 불명확해 제외/);
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

    const cushing = await fetch(`${baseUrl}/observations/cushing-busy`);
    assert.equal(cushing.status, 200);
    const cushingBody = await cushing.text();
    const cushingText = cushingBody.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(cushingText, /쿠싱 현장은 지금 바쁜가/);
    assert.match(cushingText, /아직 판단할 수 없습니다/);
    assert.match(cushingText, /보드 정리 시각/);
    assert.match(cushingText, /KST/);
    assert.match(cushingText, /고정 기록/);
    assert.doesNotMatch(cushingText, /2026-09-09T03:25:00Z/);
    assert.doesNotMatch(cushingText, /화면을 연 시각/);
    assert.match(cushingText, /관측 대상 식당 6곳/);
    assert.match(cushingText, /관측 기록 아직 없음/);
    assert.match(cushingText, /인허가 상태 확인 기록/);
    assert.match(cushingText, /관측별 기록과 출처 펼치기/);
    assert.match(cushingText, /수치·기준 주는 아래 원문 기록에서 확인하세요/);
    assert.match(cushingBody, /날짜가 있는 문맥/);
    assert.match(cushingText, /쿠싱 상업원유 재고/);
    assert.match(cushingText, /쿠싱 상업원유 월간 재고/);
    assert.match(cushingText, /19,515/);
    assert.match(cushingBody, /cushing-working-storage-plot/);
    assert.match(cushingText, /쿠싱 허브 탱크 작업 저장 용량/);
    assert.match(cushingText, /78,410/);
    assert.match(cushingText, /재고가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /보고는 2024-03 이후 중단/);
    assert.match(cushingText, /이스트 메인 연간 교통량/);
    assert.match(cushingText, /쿠싱 시 주거 건축허가/);
    assert.match(cushingText, /페이네 카운티 분기 총커버 고용/);
    assert.match(cushingText, /35,001명/);
    assert.match(cushingText, /35,418명/);
    assert.match(cushingText, /쿠싱 고등학교 연간 재적/);
    assert.match(cushingText, /529명/);
    assert.match(cushingText, /2023-24 학년도는 결측/);
    assert.match(cushingText, /KUSH 월간 운영 관심/);
    assert.match(cushingText, /제목 관심이며 현장 인원이 아닙니다/);
    assert.match(cushingText, /쿠싱 시 연간 인구/);
    assert.match(cushingText, /8,444/);
    assert.match(cushingText, /빈티지/);
    assert.match(cushingBody, /cushing-enrollment-plot/);
    assert.match(cushingBody, /cushing-kush-plot/);
    assert.match(cushingBody, /cushing-population-plot/);
    assert.match(cushingBody, /cushing-county-housing-plot/);
    assert.match(cushingText, /페이네 카운티 연간 주택 호수/);
    assert.match(cushingText, /37,437/);
    assert.match(cushingText, /허가 건수가 아니/);
    assert.match(cushingText, /빈티지 단절/);
    assert.match(cushingBody, /cushing-pep-plot/);
    assert.match(cushingText, /Payne County 연간 Census PEP 인구/);
    assert.match(cushingText, /주택 호수가 아니/);
    assert.ok(cushingText.includes("84,199"), "latest pep year 2024 must read 84199 in visible text");
    assert.match(cushingBody, /cushing-bea-income-plot/);
    assert.match(cushingText, /Payne County 연간 BEA CAINC1 개인소득/);
    assert.match(cushingText, /쿠싱 시 소득이 아니/);
    assert.ok(cushingText.includes("4,121,797"), "latest income year 2024 must read 4121797 in visible text");
    assert.match(cushingBody, /cushing-irs-soi-plot/);
    assert.match(cushingText, /ZIP 74023 연간 IRS SOI 신고 건수/);
    assert.match(cushingText, /Payne County BEA 개인소득이 아니/);
    assert.ok(cushingText.includes("2022 · 4,190건"), "latest soi year 2022 must read 4190 in visible text");
    assert.match(cushingBody, /cushing-voc-plot/);
    assert.match(cushingText, /쿠싱 시 터미널 연간 VOC/);
    assert.match(cushingText, /1,206\.389/);
    assert.match(cushingBody, /cushing-tri-plot/);
    assert.match(cushingText, /쿠싱 시 TRI 현장 배출/);
    assert.match(cushingBody, /cushing-phmsa-plot/);
    assert.match(cushingText, /쿠싱 시 PHMSA 위험액체 사고 연간 건수/);
    assert.match(cushingText, /처리량이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /사상자 0/);
    assert.ok(cushingText.includes("141"));
    assert.match(cushingBody, /cushing-fra-plot/);
    assert.match(cushingText, /쿠싱 시 FRA 철도건널목 사고 연간 건수/);
    assert.match(cushingText, /처리량이 아니고 PHMSA가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /1983년 이후는 공개 행이 없어 비워 두었습니다/);
    assert.match(cushingBody, /cushing-nhtsa-plot/);
    assert.match(cushingText, /쿠싱 시 신고 상용차 사고 연간 건수/);
    assert.match(cushingText, /FARS 사망자가 아니고 전체 사고가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /행이 없는 해는 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2025 · 8건"), "latest nhtsa year 2025 must read 8 in visible text");
    assert.match(cushingBody, /cushing-osha-plot/);
    assert.match(cushingText, /쿠싱 시 ZIP 74023 OSHA 점검 연간 건수/);
    assert.match(cushingText, /고용이 아니고 벌금이 아니며 바쁨이 아닙니다/);
    assert.ok(cushingText.includes("2026 · 2건"), "latest osha year 2026 must read 2 in visible text");
    assert.match(cushingBody, /cushing-echo-plot/);
    assert.match(cushingText, /쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수/);
    assert.match(cushingText, /TRI·VOC가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /날짜가 없는 15곳은 그리지 않았고/);
    assert.match(cushingText, /행이 없는 해는 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026 · 4건"), "latest echo year 2026 must read 4 in visible text");
    assert.match(cushingBody, /cushing-echo-cwa-plot/);
    assert.match(cushingText, /쿠싱 시 EPA ECHO 수질\(NPDES\) 시설 최근 점검 연간 건수/);
    assert.match(cushingText, /대기 FCE가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /날짜가 없는 14곳은 그리지 않았고/);
    assert.ok(cushingText.includes("2026 · 1건"), "latest echo cwa year 2026 must read 1 in visible text");
    assert.match(cushingBody, /cushing-echo-dmr-plot/);
    assert.match(cushingText, /쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수/);
    assert.match(cushingText, /점검 횟수가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /MGD와 gal\/d를 한 축에 더하지 않았고/);
    assert.match(cushingText, /NODI 무방류는 0 유량으로 바꾸지 않았으며 행이 없는 달은 그리지 않았습니다/);
    assert.ok(cushingText.includes("2026-07 · 12건"), "latest dmr month 2026-07 must read 12 in visible text");
    assert.match(cushingBody, /cushing-rcra-plot/);
    assert.match(cushingText, /쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수/);
    assert.match(cushingText, /TRI 파운드가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /날짜가 없는 34곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다/);
    assert.match(cushingBody, /cushing-sdwis-plot/);
    assert.match(cushingText, /쿠싱 시 상수도 SDWIS 위반 연간 건수/);
    assert.match(cushingText, /쿠싱 시 상수도\(PWS OK2006061\) SDWIS 위반 연간 건수/);
    assert.match(cushingText, /CWA 점검이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /시작일이 없는 해는 0으로 채우지 않았습니다/);
    assert.match(cushingText, /2017년 21건은 VOC 모니터링 행이 같은 시작일을 공유합니다/);
    assert.ok(cushingText.includes("2024 · 2건"), "latest sdwis year 2024 must read 2 in visible text");
    assert.match(cushingBody, /cushing-aqs-plot/);
    assert.match(cushingText, /Payne County Stillwater 모니터 연간 PM2.5/);
    assert.match(cushingText, /쿠싱 시 대기가 아니고 VOC가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /2004년 이후는 모니터가 없어 0으로 채우지 않았습니다/);
    assert.match(cushingBody, /cushing-nbi-plot/);
    assert.match(cushingText, /Payne County FHWA NBI 교량 점검 연간 건수/);
    assert.match(cushingText, /Cushing 시 단독이 아니고/);
    assert.match(cushingText, /AADT·바쁨이 아닙니다/);
    assert.match(cushingText, /행이 없는 해는 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2024 · 74건"), "latest nbi year 2024 must read 74 in visible text");
    assert.match(cushingBody, /cushing-lodes-plot/);
    assert.match(cushingText, /페이네 카운티 연간 LODES 직장 일자리/);
    assert.match(cushingText, /쿠싱 시가 아니고 QCEW가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /결측 연도는 0으로 채우지 않았습니다/);
    assert.match(cushingText, /다른 공시 표이므로 섞지 않았습니다/);
    assert.ok(cushingText.includes("2023 · 35,589"), "latest lodes year 2023 must read 35589 in visible text");
    assert.match(cushingBody, /cushing-laus-plot/);
    assert.match(cushingText, /페이네 카운티 월간 실업률/);
    assert.match(cushingText, /QCEW 고용이 아니/);
    assert.match(cushingText, /2025-10은 BLS 미공개로 비워 두었습니다/);
    assert.ok(cushingText.includes("4.5"), "latest disclosed LAUS month 2026-07 must read 4.5 in visible text");
    assert.match(cushingBody, /cushing-laus-employed-plot/);
    assert.match(cushingText, /페이네 카운티 월간 취업자 수/);
    assert.match(cushingText, /실업률 차트와 다르고/);
    // LAUE 2026-07 = 38543 renders locale-formatted; scope the numeric guard to visible text.
    assert.ok(cushingText.includes("38,543"), "latest disclosed LAUE month 2026-07 must read 38543 in visible text");
    assert.match(cushingBody, /cushing-laus-labor-force-plot/);
    assert.match(cushingText, /페이네 카운티 월간 경제활동인구/);
    assert.match(cushingText, /취업자 수 차트와 다르고/);
    // LAUF 2026-07 = 40352 renders locale-formatted; scope the numeric guard to visible text.
    assert.ok(cushingText.includes("40,352"), "latest disclosed LAUF month 2026-07 must read 40352 in visible text");
    assert.match(cushingBody, /cushing-precip-plot/);
    assert.match(cushingText, /쿠싱 시 월간 강수량/);
    assert.match(cushingText, /공항 기온이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /부분월은 비워 두었습니다/);
    assert.ok(cushingText.includes("9.031"), "latest disclosed PRCP month 2021-10 must read 9.031 in visible text");
    assert.match(cushingBody, /cushing-storm-plot/);
    assert.match(cushingText, /Payne County NOAA 폭풍 사건 월간 건수/);
    assert.match(cushingText, /강수·기온이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /쿠싱 시 전용이 아니며 행이 없는 달은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026-05 · 3건"), "latest storm month 2026-05 must read 3 in visible text");
    assert.match(cushingBody, /cushing-fema-plot/);
    assert.match(cushingText, /Payne County FEMA 재난선포 연간 건수/);
    assert.match(cushingText, /폭풍 건수가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /쿠싱 시 전용이 아니며 행이 없는 해는 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2025 · 3건"), "latest fema year 2025 must read 3 in visible text");
    assert.match(cushingBody, /cushing-nfip-plot/);
    assert.match(cushingText, /Payne County NFIP 홍수보험 청구 연간 건수/);
    assert.match(cushingText, /재난선포·폭풍 건수가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /청구가 없는 해는 0으로 채우지 않았습니다/);
    assert.match(cushingText, /시 이름은 원문이 비공개입니다/);
    assert.ok(cushingText.includes("2021 · 1건"), "latest nfip year 2021 must read 1 in visible text");
    assert.match(cushingBody, /cushing-nfip-policies-plot/);
    assert.match(cushingText, /Payne County NFIP 유효 증권 월별 건수/);
    assert.match(cushingText, /청구 건수가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /행이 없는 기간은 0으로 채우지 않았습니다/);
    assert.match(cushingText, /쿠싱 시 전용이 아니며 시 이름은 원문이 비공개입니다/);
    assert.ok(cushingText.includes("2026-10 · 1건"), "latest nfpp month 2026-10 must read 1 in visible text");
    assert.match(cushingBody, /cushing-usgs-plot/);
    assert.match(cushingText, /Cimarron River near Ripley/);
    assert.match(cushingText, /07161450/);
    assert.match(cushingText, /Payne County 게이지/);
    assert.match(cushingText, /12\.8km/);
    assert.match(cushingText, /쿠싱 시내 게이지가 아니/);
    assert.match(cushingText, /결측일을 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026-09-09 · 78.4cfs"), "latest usgs day 2026-09-09 must read 78.4 in visible text");
    assert.match(cushingBody, /cushing-usgs-gw-plot/);
    assert.match(cushingText, /Payne County USGS 우물 일평균 지하수위/);
    assert.match(cushingText, /지표 아래 피트/);
    assert.match(cushingText, /쿠싱 시 우물이 아니/);
    assert.match(cushingText, /유량\(07161450\)이 아니/);
    assert.match(cushingText, /2018-10-22 이후는 관측이 없어 0으로 채우지 않았습니다/);
    assert.match(cushingText, /360339096450201/);
    assert.match(cushingText, /8\.7/);
    assert.match(cushingText, /값이 클수록 수면이 깊습니다/);
    assert.ok(cushingText.includes("2018-10-22 · 7.49"), "latest gw day 2018-10-22 must read 7.49 in visible text");
    assert.match(cushingBody, /cushing-sales-tax-plot/);
    assert.match(cushingText, /쿠싱 시 OTC 월간 판매세 분배액/);
    assert.match(cushingText, /호텔세가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /공개된 4개월만 그렸습니다/);
    assert.ok(cushingText.includes("577814"), "latest STAX month 2026-09 must read 577814.84 in visible text");
    assert.match(cushingBody, /cushing-kcuh-plot/);
    assert.match(cushingText, /쿠싱 공항 일별 기온/);
    assert.match(cushingText, /교란변수/);
    assert.match(cushingText, /공시제한/);
    assert.match(cushingBody, /cushing-mesonet-plot/);
    assert.match(cushingText, /Mesonet OILT 일최고기온/);
    assert.match(cushingText, /24\.3 km/);
    assert.match(cushingText, /KCUH 공항 기온이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("103.8"), "latest mesonet day 2026-09-08 must read 103.8 in visible text");
    assert.match(cushingBody, /cushing-mesonet-rain-plot/);
    assert.match(cushingText, /Mesonet OILT 일강수량/);
    assert.match(cushingText, /GHCN 월강수·KCUH 공항이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았고, 관측된 건조 0\.00은 그대로 둡니다/);
    assert.ok(cushingText.includes("2026-09-08 · 0인치"), "latest disclosed rain day 2026-09-08 must read observed dry 0 in visible text");
    assert.match(cushingBody, /cushing-mesonet-soil-plot/);
    assert.match(cushingBody, /cushing-mesonet-plot/);
    assert.match(cushingBody, /cushing-mesonet-rain-plot/);
    assert.doesNotMatch(cushingBody, /cushing-mesonet-moisture-plot/);
    assert.match(cushingText, /Mesonet OILT 일토양온도/);
    assert.match(cushingText, /10cm 잔디 밑 지온/);
    assert.match(cushingText, /공기 최고기온·강수가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.match(cushingText, /토양수분이 아니/);
    assert.ok(cushingText.includes("2026-09-08 · 84.51"), "latest disclosed soil day 2026-09-08 must read 84.51 in visible text");
    assert.match(cushingBody, /cushing-mesonet-humidity-plot/);
    assert.match(cushingText, /Mesonet OILT 일평균 상대습도/);
    assert.match(cushingText, /공기 최고기온·강수·지온이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026-09-08 · 51.19%"), "latest disclosed humidity day 2026-09-08 must read 51.19 in visible text");
    assert.match(cushingBody, /cushing-mesonet-wind-plot/);
    assert.match(cushingText, /Mesonet OILT 일평균 풍속/);
    assert.match(cushingText, /공기 최고기온·강수·지온·습도가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026-09-08 · 6.68mph"), "latest disclosed wind day 2026-09-08 must read 6.68 in visible text");
    assert.match(cushingBody, /cushing-mesonet-pressure-plot/);
    assert.match(cushingText, /Mesonet OILT 일평균 정지기압/);
    assert.match(cushingText, /공기 최고기온·강수·지온·습도·풍속이 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2026-09-08 · 29.1"), "latest disclosed pressure day 2026-09-08 must read 29.1 in visible text");
    assert.match(cushingBody, /cushing-wqp-plot/);
    assert.match(cushingText, /Iowa Tribe Sand1 하천 pH 시료/);
    assert.match(cushingText, /Payne County/);
    assert.match(cushingText, /IOWATROK_WQX-SND1/);
    assert.match(cushingText, /16\.71 km/);
    assert.match(cushingText, /제출 그대로/);
    assert.match(cushingText, /Cimarron 방류/);
    assert.match(cushingText, /지하수위가 아니고 바쁨이 아닙니다/);
    assert.match(cushingText, /결측일은 0으로 채우지 않았습니다/);
    assert.ok(cushingText.includes("2021-09-17 · 8.41pH"), "latest wqp sample 2021-09-17 must read 8.41 in visible text");
    assert.match(cushingBody, /cushing-drought-plot/);
    assert.match(cushingText, /페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율/);
    assert.match(cushingText, /쿠싱 시가 아니고 Mesonet 강수가 아니며 바쁨이 아닙니다/);
    assert.match(cushingText, /결측 주는 0으로 채우지 않았습니다/);
    assert.match(cushingText, /2026-09-01\s*·\s*D0 이상 100%/);
    assert.match(cushingText, /쿠싱 시·탱크팜 인원이 아닙니다/);
    assert.match(cushingText, /날짜 있는 산업 소식/);
    assert.match(cushingText, /South Bow, Bridger to Develop New Oil Pipeline From Wyoming to Cushing/);
    assert.match(cushingText, /기사 수는 활동량이 아닙니다/);
    assert.match(cushingText, /인허가 상태 사건/);
    assert.match(cushingText, /쿠싱 공항 날씨/);
    assert.doesNotMatch(cushingText, /현장 바쁨 점수/);
    assert.match(cushingBody, /PROGRAM\.md/);
    assert.match(cushingBody, /Boomarang Diner/);
    assert.doesNotMatch(cushingText, /관측 충실도 \/ 100/);
    assert.doesNotMatch(cushingText, /현장 바쁨 \/ 100/);
    assert.doesNotMatch(cushingBody, /text-5xl/);
    // 3.799/3.790은 사람이 읽는 수치에만 적용한다. 4269일 차트의 SVG 경로 좌표(x≈3.7994, y≈63.79)에는 같은 숫자열이 불가피하게 들어간다.
    assert.doesNotMatch(cushingText, /3\.799/);
    assert.doesNotMatch(cushingText, /3\.790/);
    assert.doesNotMatch(cushingBody, /현재S0%|현재 S0%/);
    const cushingPost = await fetch(`${baseUrl}/observations/cushing-busy`, { method: "POST", body: new URLSearchParams() });
    assert.equal(cushingPost.status, 405);
    for (const route of ["/", "/research"]) {
      const homeCushing = await fetch(`${baseUrl}${route}?sample=cushing-busy`);
      const homeCushingBody = await homeCushing.text();
      assert.equal(homeCushing.status, 200);
      const homeCushingText = homeCushingBody.split("<script")[0].replace(/<[^>]*>/g, "");
      assert.match(homeCushingText, /아직 판단할 수 없습니다/);
      assert.match(homeCushingText, /보드 정리 시각/);
      assert.match(homeCushingBody, /href="\/observations\/cushing-busy"/);
      assert.doesNotMatch(homeCushingText, /관측 충실도 \/ 100/);
      assert.doesNotMatch(homeCushingText, /현장 바쁨 \/ 100/);
    }

    const research = await fetch(`${baseUrl}/research`);
    assert.equal(research.status, 200);
    const researchBody = await research.text();
    const researchText = researchBody.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.match(researchBody, /id="research-sample"/);
    // 기본 통합 화면은 고정 사례 하나만 그린다.
    assert.match(researchBody, /id="watermelon-research-plot"/);
    assert.doesNotMatch(researchBody, /id="(?:jeju-generation-plot|degree-days-level-plot|empties-plot|visibility-observation|tanker-observation|wti-daily-chart|helix-index-plot)"/);
    assert.match(researchBody, /href="\/history#research-sample"/);
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
      const paths = [...html.split("<script")[0].matchAll(/<path[^>]*vector-effect="non-scaling-stroke"[^>]* d="([^"]*)"/g)].map(match => match[1]);
      assert.deepEqual(paths.map(d => (d.match(/[ML]/g) ?? []).length), [108,108,96,96], "null prior-year months must not become plotted observations");
      assert.ok(paths.every(d => d.trim().startsWith("M") && !/NaN|Infinity/.test(d)), "each observed run starts without bridging missing months");
    }
    for (const route of ["/", "/research"]) {
      const response=await fetch(`${baseUrl}${route}?sample=petroleum-rail`);
      assert.equal(response.status,200);
      const html=await response.text();
      for (const value of ["petroleum-rail-plot","2026-09-02","5712","3351","carloads","자동 갱신 아님","Petroleum Products"]) assert.ok(html.includes(value),value);
      assert.doesNotMatch(html,/id="jeju-generation-plot"|id="watermelon-research-plot"|id="degree-days-level-plot"|id="empties-plot"/);
      const patterns = [...html.split("<script")[0].matchAll(/<path[^>]*vector-effect="non-scaling-stroke"[^>]*stroke-dasharray="([^"]*)"/g)].map(match => match[1]);
      assert.equal(new Set(patterns).size, 4, "all four rail series must remain distinguishable without color");
    }
    assert.doesNotMatch(body,/id="empties-plot"/,"default home keeps frozen LA sample behind its case button");
    assert.doesNotMatch(body,/id="petroleum-rail-plot"/,"default home keeps frozen rail sample behind its case button");
    assert.doesNotMatch(body,/id="helix-index-plot"/,"default home keeps frozen HLX sample behind its case button");
    for (const route of ["/", "/research"]) {
      const response=await fetch(`${baseUrl}${route}?sample=helix`);
      assert.equal(response.status,200);
      const html=await response.text();
      for (const value of ["helix-index-plot","HLX · 오일서비스","2016-09-09","2026-09-01","10.60","90.22","-37.63","트레이딩 미개방","HOS","2481"]) assert.ok(html.includes(value),value);
      assert.doesNotMatch(html,/id="watermelon-research-plot"|id="empties-plot"|id="petroleum-rail-plot"/);
      const patterns = [...html.split("<script")[0].matchAll(/<path[^>]*vector-effect="non-scaling-stroke"[^>]*stroke-dasharray="([^"]*)"/g)].map(match => match[1]);
      assert.equal(new Set(patterns).size, 2, "HLX and WTI series must remain distinguishable without color");
    }
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
    assert.equal(legacyEmpties.headers.get("location"),"/history?sample=empties#research-sample");
    for (const route of ["/", "/research"]) for(const [kind,id,unit] of [["visibility","visibility-observation","SM"],["tankers","tanker-observation","75 GT"]]) {
      const response=await fetch(`${baseUrl}${route}?sample=${kind}`);
      const html=await response.text();assert.equal(response.status,200);
      assert.match(html,new RegExp(`id="${id}"`));
      assert.ok(html.indexOf('id="research-sample"')<html.indexOf(`id="${id}"`));
      assert.ok(html.includes("갱신 관측"));assert.ok(html.includes(unit));
      assert.doesNotMatch(html,/id="watermelon-research-plot"|id="empties-plot"|id="petroleum-rail-plot"/);
    }
    const unknownSample = await fetch(`${baseUrl}/research?sample=unknown`);
    const unknownSampleBody = await unknownSample.text();
    assert.match(unknownSampleBody, /지원하지 않는 사례 값입니다/);
    assert.match(unknownSampleBody, /id="watermelon-research-plot"/, "unknown sample falls back to the real default sample");
    for(const kind of ["watermelon","jeju","degree-days","empties","visibility","tankers","petroleum-rail","helix"]) {
      const redirect=await fetch(`${baseUrl}/research?sample=${kind}`,{redirect:"manual"});
      assert.equal(redirect.status,308);assert.equal(redirect.headers.get("location"),`/history?sample=${kind}#research-sample`);
    }
    assert.match(researchText, /개별 관측/);
    assert.match(researchBody, /id="current"/);
    assert.match(researchBody, /id="past"/);
    assert.match(researchBody, /id="ledger"/);
    assert.match(researchBody, /href="\/history#ledger"/);
    assert.doesNotMatch(researchBody, /<details id="ledger"[^>]*open/, "ledger starts collapsed without a candidate query");
    assert.doesNotMatch(researchBody, /<details[^>]* open/, "details start collapsed");
    const inventory = parseResearchLedger(await readFile(path.join(repositoryRoot, "research/factors/README.md"), "utf8"));
    const historyLedger = await fetch(`${baseUrl}/history`);
    const historyLedgerBody = await historyLedger.text();
    const historyLedgerText = historyLedgerBody.split("<script")[0].replace(/<[^>]*>/g, "");
    assert.ok(historyLedgerText.includes(`전체 ${inventory.records.length}개`));
    assert.ok(historyLedgerText.includes(`기준 통과 ${inventory.passCount}개`));
    assert.match(historyLedgerBody, /검정 요약과 근거/);
    assert.match(historyLedgerBody, /001-pentagon-ubereats\/README.md/);
    assert.match(historyLedgerBody, /data-decision-timeline/);
    const linked = await fetch(`${baseUrl}/research?candidate=018`, { redirect: "manual" });
    assert.equal(linked.status, 308);
    assert.equal(linked.headers.get("location"), "/history?candidate=018#ledger");
    const linkedFollowed = await fetch(`${baseUrl}/research?candidate=018`);
    const linkedBody = await linkedFollowed.text();
    assert.ok(linkedFollowed.url.endsWith("/history?candidate=018"), linkedFollowed.url);
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
