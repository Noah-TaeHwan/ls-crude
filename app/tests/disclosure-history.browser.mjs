// 실행: 앱을 5188 포트에서 시작한 뒤 ego-browser nodejs < tests/disclosure-history.browser.mjs
// 실패 후 재개: CAI_REVIEW_SPACE=<출력된 ID>로 같은 TaskSpace를 사용한다.
const assert = (await import("node:assert/strict")).default;
const task = await taskSpace(process.env.CAI_REVIEW_SPACE ? Number(process.env.CAI_REVIEW_SPACE) : "CAI disclosure history regression");
console.log({ spaceId: task.spaceId });
const page = task.page("p1");
const base = process.env.CAI_TEST_URL || "http://127.0.0.1:5188";
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

for (const [path, detail, other] of [["/research", "#workflow-candidates", "/"], ["/", "#market > details", "/research"]]) {
  await page.goto(`${base}${path}`);
  console.log(await page.snapshot());
  await page.click(`loc=css:${detail} > summary`);
  await page.evaluate((selector) => document.querySelector(selector).scrollIntoView(), detail);
  const before = await page.evaluate(() => scrollY);
  assert.ok(before > 100, "먼저 본문 아래로 이동해야 한다");
  await page.click(`loc=css:nav[aria-label="주요 화면"] a[href="${other}"]`);
  await page.waitForFunction((expected) => location.pathname.replace(/\/$/, "") === expected.replace(/\/$/, ""), other);
  await page.evaluate(() => history.back());
  await page.waitForFunction(({ selector, y }) => document.querySelector(selector)?.open && Math.abs(scrollY - y) < 2,
    { selector: detail, y: before }, { timeout: 5000 });
  console.log({ path, restored: await page.evaluate((selector) => ({ open: document.querySelector(selector).open, scrollY }), detail) });
  await page.evaluate(() => history.forward());
  await page.waitForFunction((expected) => location.pathname.replace(/\/$/, "") === expected.replace(/\/$/, ""), other);
  await page.click(`loc=css:nav[aria-label="주요 화면"] a[href="${path}"]`);
  await page.waitForFunction((selector) => document.querySelector(selector)?.open === false && scrollY === 0, detail);
}

await page.goto(`${base}/research#workflow-candidates`);
await page.waitForFunction(() => document.getElementById("workflow-candidates")?.open);
console.log(await page.snapshot());
await page.click("loc=css:#workflow-candidates > summary");
await page.focus('loc=css:a[href="#workflow-candidates"]');
await page.press('loc=css:a[href="#workflow-candidates"]', "Enter");
assert.equal(await page.evaluate(() => document.getElementById("workflow-candidates").open), true);

await page.goto(`${base}/history?candidate=001#ledger`);
await page.waitForFunction(() => document.getElementById("ledger")?.open);
console.log(await page.snapshot());
await page.focus('loc=css:a[href="/history#research-sample"]');
await page.press('loc=css:a[href="/history#research-sample"]', "Enter");
await page.waitForFunction(() => location.hash === "#research-sample" && !location.search);
await page.evaluate(() => history.back());
await page.waitForFunction(() => location.search.includes("candidate=001") && document.getElementById("past")?.open && document.getElementById("ledger")?.open);
console.log("PASS: 뒤로가기 복원, 앞으로가기, 메뉴 초기화, hash 재열기, query 이동 후 복원");
await task.finish({ keep: [] });
