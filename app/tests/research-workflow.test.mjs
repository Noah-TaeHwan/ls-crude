import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { MemoryRouter } from "react-router";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..", "app");
const nodeModulesDir = resolve(here, "..", "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "research-workflow-"));
const jsonPath = join(appDir, "data", "research-workflow.json");
const RESOLVED = {
  react: import.meta.resolve("react"),
  "react-router": import.meta.resolve("react-router"),
};

writeFileSync(
  join(compiledDir, "experiment-results-stub.mjs"),
  `import { jsx } from ${JSON.stringify(join(nodeModulesDir, "react", "jsx-runtime.js"))};
export function ExperimentResults({ mode, summary }) {
  return jsx("div", { "data-experiment-results": mode, "data-experiment-stub": summary ? "yes" : "no", children: "experiment-stub" });
}
`,
);

/**
 * research-workflow.tsx를 ESM으로 변환해 import한다.
 * @returns 변환된 모듈.
 */
function importWorkflow() {
  const fileName = "research-workflow.tsx";
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
    .outputText.replace(
      /from "(\.\.\/)+data\/research-workflow\.json"/,
      `from ${JSON.stringify(pathToFileURL(jsonPath).href)} with { type: "json" }`,
    )
    .replace(/"(~\/lib\/[a-z0-9-]+)(?:\.ts)?"/g, (_, spec) =>
      JSON.stringify(join(appDir, "lib", `${spec.slice("~/lib/".length)}.ts`)),
    )
    .replace(/"(~\/components\/cai\/experiment-results)"/g, JSON.stringify(join(compiledDir, "experiment-results-stub.mjs")))
    .replace(/"react\/jsx-runtime"/g, JSON.stringify(join(nodeModulesDir, "react", "jsx-runtime.js")))
    .replace(/"(react|react-router)"/g, (_, spec) => JSON.stringify(RESOLVED[spec]));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { ResearchWorkflow, parseResearchWorkflow, countByCategory, CATEGORY_ORDER, WORKFLOW_STEP_NAMES } = await importWorkflow();

/**
 * 테스트용 아이디어 한 행.
 * @param index 번호.
 * @returns 아이디어.
 */
function idea(index) {
  return {
    id: `idea-${index}`,
    title: `자료 폴더 ${index}`,
    path: `research/gathering/raw/${index}`,
    url: `https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering/raw/${index}`,
  };
}

/**
 * 테스트용 후보 한 행.
 * @param index 번호.
 * @param category 분류.
 * @param role 역할.
 * @returns 후보.
 */
function candidate(index, category, role = "활동") {
  return {
    id: `cand-${index}`,
    name: `후보 ${index}`,
    role,
    category,
    summary: `${category} 요약 ${index}`,
    period: "2015-2023",
    nextAction: `다음 ${index}`,
    sourceUrls: [`https://example.test/${index}`],
  };
}

/** 분류를 고르게 채운 33개 후보. */
const CATEGORY_CYCLE = ["used", "used", ...Array(8).fill("context"), ...Array(6).fill("forward"), ...Array(5).fill("sample"), ...Array(11).fill("route"), "hold"];

/**
 * 테스트용 워크플로 스냅샷.
 * @param overrides 덮어쓰기.
 * @returns 스냅샷.
 */
function workflow(overrides = {}) {
  return {
    schema: "research-workflow/v1",
    snapshotDate: "2026-09-12",
    sourceRef: "https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering",
    sourceSha256: "abc123",
    ideas: Array.from({ length: 106 }, (_, index) => idea(index + 1)),
    candidates: CATEGORY_CYCLE.map((category, index) => candidate(index + 1, category, index % 2 === 0 ? "활동" : "통제")),
    ...overrides,
  };
}

/**
 * 테스트용 실험 요약. 지표는 픽스처이며 운영 결과가 아니다.
 * @param overrides 덮어쓰기.
 * @returns 요약.
 */
function summary(overrides = {}) {
  const models = [
    { id: "market", label: "시장정보만", status: "done", train_rows: 905, accuracy: 0.5, log_loss: 0.69, brier: 0.25, weights: null },
    { id: "cai_equal", label: "CAI 동일가중 단독", status: "done", train_rows: 905, accuracy: 0.47, log_loss: 0.7, brier: 0.25, weights: [1] },
    { id: "market_cai_equal", label: "시장정보+동일가중 CAI", status: "done", train_rows: 905, accuracy: 0.51, log_loss: 0.7, brier: 0.25, weights: [1] },
    { id: "market_cai_learned", label: "시장정보+학습가중 CAI", status: "done", train_rows: 905, accuracy: 0.49, log_loss: 0.71, brier: 0.26, weights: [0, 1] },
  ];
  return {
    schema: "cai-retrospective-experiment-summary/v1",
    kind: "retrospective_experiment_summary",
    disclosure: "회고 평가 요약입니다.",
    review_status: { self_check: true, independent_reproduction: "pending" },
    experiments: [
      {
        id: "pilot_traffic",
        label: "교통 단독 파일럿",
        run_id: "t",
        mode: "RETROSPECTIVE_RESEARCH",
        eval: { n: 245, start: "2023-01-03", end: "2023-12-21" },
        components: ["TMAS AVC040 일별"],
        models,
        delta_log_loss_vs_market: { market_cai_equal: 0.01, market_cai_learned: 0.02 },
      },
      {
        id: "pilot_traffic_dmr",
        label: "교통+DMR 파일럿",
        run_id: "d",
        mode: "RETROSPECTIVE_RESEARCH",
        eval: { n: 245, start: "2023-01-03", end: "2023-12-21" },
        components: ["TMAS AVC040 일별", "DMR South STP MGD(월별)"],
        models,
        delta_log_loss_vs_market: { market_cai_equal: 0.01, market_cai_learned: 0.02 },
      },
    ],
    sensitivity: { preregistration_kind: "x", changed: "y" },
    limitations: ["한계"],
    ...overrides,
  };
}

/**
 * 워크플로를 SSR한다.
 * @param props 컴포넌트 props.
 * @returns HTML.
 */
function render(props) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(ResearchWorkflow, { workflow: null, experiments: null, ...props })),
  );
}

describe("parseResearchWorkflow", () => {
  it("담당 제안과 착수는 별개이며 중복 후보와 잘못된 작업 metadata를 거부한다", () => {
    const data = JSON.parse(readFileSync(jsonPath, "utf8"));
    const parsed = parseResearchWorkflow(data);
    assert.ok(parsed);
    assert.deepEqual(parsed.candidates.filter((row) => row.work?.owner === "seongchan").map((row) => row.id), ["CAAI / 091-O", "091-A", "091-F / 091-STAX"]);
    assert.ok(parsed.candidates.filter((row) => row.work?.owner === "seongchan").every((row) => row.work.assignment === "proposed" && row.work.status === "planned"));
    assert.equal(parsed.candidates.filter((row) => row.work?.status === "done").length, 2);
    assert.equal(parsed.candidates.filter((row) => row.work?.status === "in_progress").length, 0);
    const candidate = data.candidates.find((row) => row.work.owner === "seongchan");
    candidate.work.status = "in_progress";
    assert.equal(parseResearchWorkflow(data), null);
    candidate.work.assignment = "confirmed";
    assert.ok(parseResearchWorkflow(data));
    candidate.work.owner = "unknown";
    assert.equal(parseResearchWorkflow(data), null);
    candidate.work.owner = "seongchan";
    candidate.work.assignment = ["proposed"];
    assert.equal(parseResearchWorkflow(data), null);
    candidate.work.assignment = "confirmed";
    candidate.work.status = ["planned"];
    assert.equal(parseResearchWorkflow(data), null);
    const duplicate = workflow(); duplicate.candidates.push(duplicate.candidates[0]);
    assert.equal(parseResearchWorkflow(duplicate), null);
  });
  it("유효한 스냅샷을 통과하고 분류 건수를 센다", () => {
    const parsed = parseResearchWorkflow(workflow());
    assert.ok(parsed);
    assert.equal(parsed.ideas.length, 106);
    assert.equal(parsed.candidates.length, 33);
    assert.deepEqual(countByCategory(parsed.candidates), {
      used: 2,
      context: 8,
      forward: 6,
      sample: 5,
      route: 11,
      hold: 1,
    });
  });

  it("허용되지 않은 category는 버린다", () => {
    assert.equal(parseResearchWorkflow(workflow({ candidates: [candidate(1, "other")] })), null);
  });

  it("배열이 없으면 null", () => {
    assert.equal(parseResearchWorkflow({ schema: "x" }), null);
    assert.equal(parseResearchWorkflow(null), null);
  });
});

describe("ResearchWorkflow 렌더", () => {
  it("6개의 구분된 카드에 제목·현재 결과·다음 행동과 연결된 목차를 제공한다", () => {
    const data = parseResearchWorkflow(JSON.parse(readFileSync(jsonPath, "utf8")));
    const html = render({ workflow: data, experiments: summary() });
    assert.equal((html.match(/class="workflow-card"/g) ?? []).length, 6);
    assert.equal((html.match(/현재 확인된 결과/g) ?? []).length, 6);
    for (let step = 1; step <= 6; step++) {
      assert.ok(html.includes(`aria-labelledby="workflow-heading-${step}"`));
      assert.ok(html.includes(`id="workflow-heading-${step}"`));
      assert.ok(html.includes(`href="#workflow-stage-${step}"`));
      assert.ok(html.includes(WORKFLOW_STEP_NAMES[step - 1]));
    }
    assert.match(html, /성찬 · 제안/);
    assert.match(html, /자료 분류와 실제 작업 상태는 별개/);
    assert.match(html, /TEAM_START_HERE\.md/);
  });
  it("106개 자료 폴더와 33개 후보를 실제 배열로 그리고 분류한다", () => {
    const data = workflow();
    const html = render({ workflow: data, experiments: summary() });
    assert.match(html, /data-research-workflow/);
    assert.match(html, /쿠싱의 활동에서 유가의 단서 찾기/);
    assert.match(html, /자료 폴더 106개/);
    assert.match(html, /33개 항목/);
    assert.doesNotMatch(html, /정리 단위 33개로 줄였/);
    assert.equal((html.match(/data-idea="/g) ?? []).length, 106);
    assert.equal((html.match(/data-candidate="/g) ?? []).length, 33);
    const counts = countByCategory(data.candidates);
    for (const category of CATEGORY_ORDER) {
      assert.equal(
        (html.match(new RegExp(`data-candidate-category="${category}"`, "g")) ?? []).length,
        counts[category],
        category,
      );
    }
    assert.match(html, /실험에 사용/);
    assert.match(html, /배경 자료/);
    assert.match(html, /앞으로 기록/);
    assert.match(html, /표본만 확보/);
    assert.match(html, /경로만 확인/);
    assert.match(html, /보류·기각/);
    assert.match(html, /활동/);
    assert.match(html, /통제/);
    assert.match(html, /수집 상태 보기/);
    assert.doesNotMatch(html, /짧은 다음 행동/);
    assert.doesNotMatch(html, /다음 후보/);
    assert.equal((html.match(/id="workflow-candidates"/g) ?? []).length, 1, "one shared candidate table");
    assert.match(html, /href="#workflow-candidates"/);
    assert.match(html, /xl:grid-cols-6/);
    assert.match(html, /전체 아이디어 보기/);
    assert.match(html, /쿠싱 후보 보기/);
    assert.match(html, /수집 상태 보기/);
    assert.match(html, /실험 입력 보기/);
    assert.match(html, /비교 방법 보기/);
    assert.match(html, /실험 결과 자세히 보기/);
    assert.doesNotMatch(html, /목록·근거 보기/);
  });

  it("두 파일럿과 미완료 공유를 구분한다", () => {
    const html = render({ workflow: workflow(), experiments: summary() });
    assert.match(html, /data-workflow-pilot="pilot_traffic"/);
    assert.match(html, /data-workflow-pilot="pilot_traffic_dmr"/);
    assert.match(html, /교통 단독 파일럿/);
    assert.match(html, /교통\+DMR 파일럿/);
    assert.match(html, /교통 단독과 교통\+유량 두 조합을/);
    assert.match(html, /2023년의 같은 245일을 기준으로 비교했습니다/);
    const stageFacts = [...html.matchAll(/<span class="workflow-fact">([^<]+)<\/span>/g)].map((match) => match[1]);
    assert.doesNotMatch(stageFacts.join(" "), /파일럿 완료|정리 완료|진행 중/);
    assert.match(html, /독립 재현은 아직 확인되지 않았습니다/);
    assert.match(html, /CAI를 추가해도 확률오차가 줄지 않았습니다/);
    assert.match(html, /성찬님의 독립 재현은 아직 확인되지 않았습니다/);
    assert.match(html, /공식 CAI와 미래 예측은 성분·산식·검증을 마친 뒤 연결합니다/);
    assert.match(html, /data-experiment-results="full"/);
    assert.doesNotMatch(html, /공식 현재 CAI를 게시했습니다/);
  });

  it("기본 상세는 접히고 긴 표가 본문을 열지 않는다", () => {
    const html = render({ workflow: workflow(), experiments: summary() });
    assert.doesNotMatch(html, /<details[^>]*\sopen/);
    assert.match(html, /id="workflow-candidates"/);
    assert.match(html, /id="workflow-experiments"/);
    assert.doesNotMatch(html, /data-workflow-current|현재 위치/);
    assert.match(html, /id="workflow-stage-3"/);
  });

  it("요약이 없으면 가짜 완료를 만들지 않는다", () => {
    const html = render({ workflow: workflow(), experiments: null });
    assert.match(html, /data-workflow-missing="experiments"/);
    assert.doesNotMatch(html, /파일럿 완료/);
    assert.doesNotMatch(html, /CAI 추가 효과는 확인하지 못했습니다/);
    assert.match(html, /실험 입력 요약을 불러오지 못했습니다/);
    assert.match(html, /모델 비교 결과를 불러오지 못했습니다/);
    assert.doesNotMatch(html, /data-experiment-results="full"/);
  });

  it("워크플로 JSON이 없으면 106·33을 지어내지 않는다", () => {
    const html = render({ workflow: null, experiments: null });
    assert.match(html, /data-workflow-missing="ideas"/);
    assert.match(html, /자료 목록을 불러오지 못했습니다/);
    assert.doesNotMatch(html, /자료 폴더 106개/);
    assert.doesNotMatch(html, /33개 항목/);
    assert.doesNotMatch(html, /정리 단위 33개/);
    assert.equal(html.match(/data-idea="/g), null);
    assert.equal(html.match(/data-candidate="/g), null);
  });
});


  it("실험 목록이 비면 완료를 표시하지 않는다", () => {
    const html = render({ workflow: workflow(), experiments: summary({ experiments: [] }) });
    assert.doesNotMatch(html, /파일럿 완료/);
    assert.doesNotMatch(html, /회고 결과 공유/);
    assert.match(html, /모델 비교 결과를 불러오지 못했습니다/);
  });

describe("정본 research-workflow.json", () => {
  it("대표 실험의 실제 지표와 추가 비교를 표시하고 새 결과에서 결론을 갱신한다", () => {
    const experiments = JSON.parse(readFileSync(join(appDir, "data", "cai-experiment-summary.json"), "utf8"));
    const html = render({ workflow: workflow(), experiments });
    const block = experiments.sample_expansion;
    const byId = Object.fromEntries(block.models.map((row) => [row.id, row]));
    assert.match(html, /data-representative-comparison/);
    assert.match(html, new RegExp(`학습 ${block.after_train_rows}행과 평가 ${block.eval.n}행`));
    for (const id of ["baseline", "market", "market_cai_equal", "market_cai_learned"]) {
      assert.ok(html.includes(`data-representative-model="${id}"`));
      assert.ok(html.includes(byId[id].after.log_loss.toFixed(6)));
    }
    assert.ok(html.includes((byId.market_cai_equal.after.log_loss - byId.market.after.log_loss).toFixed(6)));
    assert.match(html, /cai-research-brief\.html/);
    assert.match(html, /원유 트럭만 센 값이 아닙니다/);
    assert.match(html, /독립 시행 수가 아닙니다/);
    byId.market_cai_equal.after.log_loss = byId.market.after.log_loss - 0.01;
    const improved = render({ workflow: workflow(), experiments });
    assert.match(improved, /확률오차가 줄어든 비교가 있습니다/);
    assert.doesNotMatch(improved, /이번 조합에서는 CAI를 추가해도 확률오차가 줄지 않았습니다/);
  });

  it("정본 배열 길이로 106·33과 분류를 그린다", () => {
    assert.equal(existsSync(jsonPath), true, "research-workflow.json must exist");
    const parsed = parseResearchWorkflow(JSON.parse(readFileSync(jsonPath, "utf8")));
    assert.ok(parsed, "canonical JSON parses");
    assert.equal(parsed.ideas.length, 106);
    assert.equal(parsed.candidates.length, 33);
    assert.deepEqual(countByCategory(parsed.candidates), {
      used: 2,
      context: 8,
      forward: 6,
      sample: 5,
      route: 11,
      hold: 1,
    });
    const html = render({ workflow: parsed, experiments: summary() });
    assert.equal((html.match(/data-idea="/g) ?? []).length, 106);
    assert.equal((html.match(/data-candidate="/g) ?? []).length, 33);
    const counts = countByCategory(parsed.candidates);
    for (const category of CATEGORY_ORDER) {
      assert.equal(
        (html.match(new RegExp(`data-candidate-category="${category}"`, "g")) ?? []).length,
        counts[category],
      );
    }
    assert.ok(html.includes(parsed.ideas[0].title), parsed.ideas[0].title);
    assert.ok(html.includes(parsed.candidates[0].name), parsed.candidates[0].name);
    const rows095 = parsed.ideas.filter((idea) => idea.id === "095");
    assert.equal(rows095.length, 2);
    assert.notEqual(rows095[0].path, rows095[1].path);
    assert.match(html, /095-energy-executive-public-visibility/);
    assert.match(html, /095-oil-helix-dislocation/);
    const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
    assert.doesNotMatch(header, new RegExp(parsed.sourceRef));
    assert.match(html, new RegExp(parsed.sourceRef));
  });

  it("단계 제목·입력 설명·재현 상태를 결과 중심으로 표시한다", () => {
    const html = render({ workflow: workflow(), experiments: summary() });
    assert.match(html, /id="workflow-heading-4" class="workflow-card-title"/);
    assert.match(html, /교통량과 하수처리장 신고 유량을 실험에 쓸 수 있도록 정리했습니다/);
    assert.match(html, /2019년분/);
    assert.match(html, /접수일/);
    assert.match(html, /실제 공개일/);
    assert.doesNotMatch(html, /2019년 이후 보강분/);
    const stage4 = html.slice(html.indexOf('id="workflow-stage-4"'), html.indexOf('id="workflow-stage-5"'));
    const stage4Result = stage4.match(/<p class="mt-2 max-w-3xl text-base leading-7">([^<]+)<\/p>/);
    assert.ok(stage4Result);
    assert.doesNotMatch(stage4Result[1], /traffic_avc040_daily_2019plus/);
    assert.doesNotMatch(stage4Result[1], /dmr_ok0026701_001_mgd/);
    assert.doesNotMatch(stage4Result[1], /available_at/);
    assert.match(stage4, /traffic_avc040_daily_2019plus/);
    const recorded = render({
      workflow: workflow(),
      experiments: summary({ review_status: { self_check: true, independent_reproduction: "recorded" } }),
    });
    assert.match(recorded, /독립 재현 상태는 recorded/);
    assert.doesNotMatch(recorded, /독립 재현 대기/);
    assert.doesNotMatch(recorded, /성찬님의 독립 재현은 아직 확인되지 않았습니다/);
    const expanded = render({
      workflow: workflow(),
      experiments: summary({
        sample_expansion: { after_train_rows: 753, before_train_rows: 507, eval: { n: 245, start: "2023-01-03", end: "2023-12-21" } },
      }),
    });
    assert.match(expanded, /507→753/);
  });
});
