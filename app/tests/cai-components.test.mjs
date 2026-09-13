import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { emptyCaiView, gaugeAngle, parseCaiPublicView } from "../app/lib/cai-view.ts";

// Node는 .tsx를 직접 읽지 못하므로 기존 devDependency인 typescript로
// 트랜스파일한 뒤 /tmp에서 import한다. 새 의존성은 추가하지 않는다.
const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..", "app");
const nodeModulesDir = resolve(here, "..", "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "cai-components-"));

/**
 * cai 컴포넌트 .tsx를 ESM으로 변환해 import한다.
 * `~` 별칭과 react 내부 모듈을 절대 경로로 바꾼다.
 * @param fileName 컴포넌트 파일명.
 * @returns 변환된 모듈.
 */
function importTsx(fileName) {
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
    .replace(/"react"/g, JSON.stringify(join(nodeModulesDir, "react", "index.js")));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { CaiGauge } = await importTsx("cai-gauge.tsx");
const { CaiForecast } = await importTsx("cai-forecast.tsx");
const { CaiAbout } = await importTsx("cai-about.tsx");
const { CaiHistory, caiHistoryPlot } = await importTsx("cai-history.tsx");

// 아래 숫자는 테스트 전용이며 운영 코드의 기본값이 아니다.
function validIndex(overrides = {}) {
  return {
    index_id: "cushing-activity-index",
    definition_version: "wk-2026-W37",
    weighting_method: "equal-weight",
    score: 62.5,
    previous_score: 60.0,
    as_of: "2026-09-11",
    observed_at: "2026-09-11T00:35:00+00:00",
    available_at: "2026-09-11T01:00:00+00:00",
    computed_at: "2026-09-11T01:05:00+00:00",
    retrieved_at: "2026-09-11T01:06:00+00:00",
    data_origin: "OBSERVED",
    freshness: "FRESH",
    run_id: "run-001",
    constituent_count: 3,
    coverage: 0.8,
    history: [],
    ...overrides,
  };
}

function validForecast(overrides = {}) {
  return {
    model_id: "cai-logistic-v1",
    trained_run_id: "train-001",
    generated_at: "2026-09-11T01:00:00+00:00",
    decision_cutoff: "2026-09-11T23:59:59-05:00",
    target_start: "2026-09-14T00:00:00-05:00",
    target_end: "2026-09-18T23:59:59-05:00",
    target_definition: "F5 > 0",
    publication_approved: true,
    probabilities: { up: 0.642, not_up: 0.358 },
    data_origin: "OBSERVED",
    freshness: "FRESH",
    ...overrides,
  };
}

function validSnapshot(overrides = {}) {
  return {
    schema_version: "cai.public.v1",
    index: validIndex(),
    forecast: validForecast(),
    validation: {
      status: "EXPLORATORY",
      n: 120,
      sample_start: "2015-01-01",
      sample_end: "2023-12-31",
      oos_exposure: "UNSEEN",
      freeze_ref: null,
      review_ref: null,
      metrics: [],
    },
    constituents: [],
    evidence: [],
    warnings: [],
    ...overrides,
  };
}

function render(component, props) {
  return renderToStaticMarkup(createElement(component, props));
}

describe("CaiGauge", () => {
  it("null 점수는 바늘 없이 — 와 산출 대기, 등급 표현 없음", () => {
    const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score: null }) }));
    const html = render(CaiGauge, { index: out.index });
    assert.ok(html.includes("—"));
    assert.ok(!html.includes("data-needle"));
    assert.ok(!html.includes("aria-valuenow"));
    assert.ok(html.includes("산출 대기"));
    assert.ok(!/공포|탐욕|매수|매도/.test(html));
  });

  it("빈 상태는 compact이고 큰 반원 SVG를 그리지 않는다", () => {
    const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score: null }) }));
    const html = render(CaiGauge, { index: out.index });
    assert.ok(html.includes('data-cai-gauge="compact"'));
    assert.ok(!html.includes("volatility-gauge"));
    assert.ok(html.includes("/ 100"));
    assert.ok(html.includes("0–100점"));
  });

  it("점수가 있으면 기존 full 계기판을 유지한다", () => {
    const out = parseCaiPublicView(validSnapshot());
    const html = render(CaiGauge, { index: out.index });
    assert.ok(html.includes('data-cai-gauge="full"'));
    assert.ok(html.includes("volatility-gauge"));
    assert.ok(html.includes(`aria-valuenow="62.5"`));
  });

  it("0·50·100은 수치·각도·aria가 서로 맞고 0에도 바늘이 있다", () => {
    for (const score of [0, 50, 100]) {
      const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score }) }));
      assert.equal(out.index.score, score);
      const html = render(CaiGauge, { index: out.index });
      const angle = 90 - gaugeAngle(score);
      assert.ok(html.includes(`data-needle-angle="${angle.toFixed(2)}"`), `angle ${score}`);
      assert.ok(html.includes(`aria-valuenow="${score}"`), `aria ${score}`);
      assert.ok(html.includes(`data-cai-score="${score}"`), `score output ${score}`);
    }
  });

  it("범위 밖·NaN 점수는 null과 같은 비게시 상태", () => {
    const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score: 101 }) }));
    const html = render(CaiGauge, { index: out.index });
    assert.ok(html.includes("—"));
    assert.ok(!html.includes("data-needle"));
    assert.ok(!html.includes("aria-valuenow"));
  });

  it("DEMO는 비게시 라벨을 숨기지 않고 STALE은 갱신 지연을 표시", () => {
    const demo = parseCaiPublicView(
      validSnapshot({ index: validIndex({ data_origin: "DEMO", score: 50 }) }),
    );
    const demoHtml = render(CaiGauge, { index: demo.index });
    assert.ok(demoHtml.includes("데모"));
    assert.ok(demoHtml.includes("미게시"));
    assert.ok(demoHtml.includes("—"));
    const stale = parseCaiPublicView(
      validSnapshot({ index: validIndex({ freshness: "STALE" }) }),
    );
    const staleHtml = render(CaiGauge, { index: stale.index });
    assert.ok(staleHtml.includes("갱신 지연"));
    assert.ok(staleHtml.includes("62.5"));
  });

  it("기준일·가중치·전기 대비 변화를 표시", () => {
    const out = parseCaiPublicView(validSnapshot());
    const html = render(CaiGauge, { index: out.index });
    assert.ok(html.includes("2026년 9월 11일"));
    assert.ok(html.includes("동일 가중치"));
    assert.ok(html.includes("+2.5"));
    assert.ok(html.includes("이전 기준주 대비"));
  });
});

describe("CaiForecast", () => {
  it("빈 상태는 예시 확률로 보충하지 않음", () => {
    const view = emptyCaiView();
    const html = render(CaiForecast, { forecast: view.forecast, validation: view.validation });
    assert.ok(html.includes(`data-forecast-state="pending"`));
    assert.ok(html.includes("아직 예측하지 않습니다"));
    assert.ok(!html.includes("64.2"));
    assert.ok(!html.includes("35.8"));
  });

  it("미승인 forecast도 확률을 표시하지 않음", () => {
    const out = parseCaiPublicView(
      validSnapshot({ forecast: validForecast({ publication_approved: false }) }),
    );
    const html = render(CaiForecast, { forecast: out.forecast, validation: out.validation });
    assert.ok(html.includes(`data-forecast-state="pending"`));
    assert.ok(!html.includes("64.2"));
    assert.ok(!html.includes("35.8"));
  });

  it("승인된 표본은 반올림 규칙·날짜·주차·모델·검증 상태를 표시", () => {
    const out = parseCaiPublicView(validSnapshot());
    const html = render(CaiForecast, { forecast: out.forecast, validation: out.validation });
    assert.ok(html.includes(`data-forecast-state="published"`));
    assert.ok(html.includes(`data-up="64.2"`));
    assert.ok(html.includes(`data-not-up="35.8"`));
    assert.ok(html.includes("2026년 9월 14일"));
    assert.ok(html.includes("(W38)"));
    assert.ok(html.includes("2026년 9월 11일"));
    assert.ok(html.includes("(W37)"));
    assert.ok(html.includes("cai-logistic-v1"));
    assert.ok(html.includes("train-001"));
    assert.ok(html.includes("독립 검증 전"));
  });

  it("하락·보합은 100에서 뺀 값으로 반올림", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        forecast: validForecast({ probabilities: { up: 0.6499, not_up: 0.3501 } }),
      }),
    );
    const html = render(CaiForecast, { forecast: out.forecast, validation: out.validation });
    assert.ok(html.includes(`data-up="65"`));
    assert.ok(html.includes(`data-not-up="35"`));
  });

  it("DEMO forecast는 비게시 라벨을 유지", () => {
    const out = parseCaiPublicView(
      validSnapshot({ forecast: validForecast({ data_origin: "DEMO" }) }),
    );
    const html = render(CaiForecast, { forecast: out.forecast, validation: out.validation });
    assert.ok(html.includes(`data-forecast-state="pending"`));
    assert.ok(html.includes("데모"));
    assert.ok(!html.includes("64.2"));
  });
});

describe("CaiAbout", () => {
  it("기본 접힘 details이고 구성·검증·근거가 안에 있음", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        constituents: [
          {
            candidate_id: "road-traffic",
            name: "도로 통행량",
            membership: "ADOPTED",
            observed_quantity: "주간 통행량",
            geography: "쿠싱 인근",
            frequency: "주간",
            status_note: "기준선 후보",
            evidence_ids: ["e1"],
          },
        ],
        evidence: [
          { id: "e1", title: "원천 확인", url: "https://data.example.org/file", access: "public" },
          { id: "e2", title: "내부 문서", url: null, access: "team_only" },
        ],
      }),
    );
    const html = render(CaiAbout, { view: out });
    assert.ok(html.includes("<details"));
    assert.ok(!/<details[^>]*\sopen/.test(html));
    assert.ok(html.includes("CAI란?"));
    const summaryEnd = html.indexOf("</summary>");
    assert.ok(summaryEnd > 0);
    assert.ok(html.indexOf("도로 통행량") > summaryEnd);
    assert.ok(html.indexOf("현재 검증 상태") > summaryEnd);
    assert.ok(html.indexOf("https://data.example.org/file") > summaryEnd);
    assert.ok(html.includes("탐색"));
    assert.ok(!html.includes("ADOPTED"));
    assert.ok(html.includes("채택"));
    assert.ok(html.includes("팀 전용"));
    assert.ok(!/internal\.example\.org/.test(html));
  });

  it("빈 구성·근거는 지어내지 않고 대기 문구를 표시", () => {
    const view = emptyCaiView();
    const html = render(CaiAbout, { view });
    assert.ok(html.includes("<details"));
    assert.ok(!/<details[^>]*\sopen/.test(html));
    assert.ok(html.includes("아직 공개되지 않았습니다"));
    assert.ok(!html.includes("도로 통행량"));
    assert.ok(!html.includes("73.3"));
  });
});

describe("CAI 회고 이력", () => {
  it("결측 사이를 잇지 않고 실제 0점은 관측점으로 유지한다", () => {
    const points = [{date:"2020-01-01",score:0},{date:"2021-01-01",score:null},{date:"2023-01-01",score:100}];
    const plot = caiHistoryPlot(points);
    assert.equal(plot.segments.length, 2);
    assert.deepEqual(plot.segments.map((segment) => segment.length), [1,1]);
    assert.ok(plot.segments[0][0].y > plot.segments[1][0].y);
    assert.ok(plot.segments[0][0].x < plot.segments[1][0].x);
  });
  it("실험용 표시·과거 기준일·날짜 선택·최신 구성 점수를 함께 보여준다", () => {
    const view = parseCaiPublicView(JSON.parse(readFileSync(join(appDir,"data","cai-public-view.json"),"utf8")));
    const gauge = render(CaiGauge, {index:view.index});
    assert.match(gauge,/실험용 v0.1 · 과거 자료/);
    assert.match(gauge,/현재 값이 아닙니다/);
    assert.match(gauge,/직전 산출일 대비/);
    const chart = render(CaiHistory,{view});
    assert.match(chart,/확인할 지수 기준일/);
    assert.match(chart,/2023-12-29/);
    assert.match(chart,/최신 기준일의 구성/);
    assert.equal((chart.match(/data-cai-input=/g)||[]).length,2);
    assert.match(chart,/53.0/); assert.match(chart,/33.1/);
    assert.equal(render(CaiHistory,{view:emptyCaiView()}), "");
  });
});
