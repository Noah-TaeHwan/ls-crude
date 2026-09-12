import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = "/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/app";
const appDir = join(appRoot, "app");
const nodeModulesDir = join(appRoot, "node_modules");
const compiledDir = mkdtempSync(join(tmpdir(), "cai-preview-"));

const { createElement } = await import(join(nodeModulesDir, "react", "index.js"));
const { renderToStaticMarkup } = await import(join(nodeModulesDir, "react-dom", "server.node.js"));
const { default: ts } = await import(join(nodeModulesDir, "typescript", "lib", "typescript.js"));

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
    .replace(/"react\/jsx-runtime"/g, JSON.stringify(join(nodeModulesDir, "react", "jsx-runtime.js")));
  const outPath = join(compiledDir, fileName.replace(/\.tsx$/, ".mjs"));
  writeFileSync(outPath, output);
  return import(pathToFileURL(outPath).href);
}

const { CaiGauge } = await importTsx("cai-gauge.tsx");
const { CaiForecast } = await importTsx("cai-forecast.tsx");
const { CaiAbout } = await importTsx("cai-about.tsx");
const { emptyCaiView, parseCaiPublicView } = await import(join(appDir, "lib", "cai-view.ts"));

const rich = parseCaiPublicView({
  schema_version: "cai.public.v1",
  index: {
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
  },
  forecast: {
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
  },
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
  warnings: [],
});
const empty = emptyCaiView();

function block(view, label) {
  return createElement(
    "div",
    { className: "space-y-6" },
    createElement("p", { className: "font-mono text-xs text-muted-foreground" }, label),
    createElement(CaiGauge, { index: view.index }),
    createElement(CaiForecast, { forecast: view.forecast, validation: view.validation }),
    createElement(CaiAbout, { view }),
  );
}

const body = renderToStaticMarkup(
  createElement(
    "div",
    { className: "mx-auto max-w-5xl p-4" },
    block(rich, "PUBLISHED FIXTURE"),
    createElement("hr", { className: "my-8 border-border" }),
    block(empty, "EMPTY / NO_DATA"),
  ),
);

const assetsDir = join(appRoot, "build", "client", "assets");
const cssFile = readdirSync(assetsDir).find((name) => name.endsWith(".css"));
const css = readFileSync(join(assetsDir, cssFile), "utf8");

const html = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CAI components preview</title><style>${css}</style></head>
<body class="bg-background text-foreground">${body}</body></html>`;

writeFileSync(join(here, "index.html"), html);
console.log("WROTE", join(here, "index.html"), "css:", cssFile, "bytes:", html.length);
