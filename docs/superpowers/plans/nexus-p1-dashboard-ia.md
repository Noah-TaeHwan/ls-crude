# Nexus P1 — Dashboard IA (Research History)

Date: 2026-09-04 · Status: P1 IA draft · Role: UX Architect + UI Designer (Ponytail full)
Model: opencode/muse-spark-1.2-contributor-free variant xhigh

> **One-line IA:** One dashboard, three depths (30s / 2min / 10min) on **existing two routes** (`/` + `/research`). No new route, no chart lib, no map. Every section reuses a file that already exists.

---

## 0. Read (6 + 4)

| # | File | What was taken |
|---|------|----------------|
| 1 | `app/app/routes/home.tsx:10-11,27-105,170-302,305-435` | `CANDIDATE_COUNT=52`/`PASS_COUNT=0`, 4-row preview (`RESEARCH_PREVIEW`), 3-row `RECENT_RESEARCH_LOG`, 5-step `METHOD_STEPS`, `loader=readWtiMarketSnapshot()`, read-only `action 405`, gauge+sparkline+provenance |
| 2 | `app/app/routes/research.tsx:8-105,142-295` | 6-row `LEDGER_ROWS` (incl. 철회/기각/보류/별도전략), `VERDICT_COUNTS` 7 buckets Σ=52, 5-step method, `#ledger/#method/#team` anchors, read-only |
| 3 | `app/app/components/desk-chrome.tsx:17-74,76-114` | `DeskHeader` (fresh/stale dot + `source·ticker`) + `DeskNavLink` (`/`, `/research`, `#method`, `#team`) — **only nav to extend** |
| 4 | `app/app/components/watch-gauge.tsx:12-23,38-171` | Single `WatchGauge({score, rv5})` = percentile 0–100 + `volatilityBand` 4 zones — **only gauge to reuse** |
| 5 | `docs/research-gathering.md:1-27` | Gathering flow `raw → notes → sources → pizza-hunt → experiments`; Oil Slice = `000` 초안(comparison group) not final candidate |
| 6 | `research/gathering/notes/_TEMPLATE.md:1-46` | Note contract: 한줄가설 / `크립토의 뭐×뉴스의 무슨` / 체크(가격=CL=F, 뉴스=Investing CSV, license, delay, look-ahead, IS-only, OOS-not-seen) / 다음한가지 |
| 7 | `docs/research-design.md:25-30,36-48,53-58` | Price=Yahoo `CL=F` IS 2015-2023 OOS 2024- / News=Investing CSV only / Slice=`2*hormuz+1*inflation` 20d z |
| 8 | `research/INTAKE.md:14-24,81-93` | Canonical 9 checks; dump→note→candidate→experiment pipeline; OOS 한 번·숫자 지어내기 금지·메커니즘 없으면 폐기 |
| 9 | `docs/experiments/000-oil-slice-draft.md:1-28` | Oil Slice code `ls_crude.features.slice_index.oil_slice`, check table (crypto=없음, news=hormuz·inflation, IS-only) |
| 10 | `research/notebooks/pizza-hunt.md:4,22-24` | Candidate table **empty = evidence** ("비어 있음"); IMF PortWatch/Wiki are axes not candidates |

Routes today: `app/app/routes.ts:3-6` → `index(home)` + `research` + `backtest(308)` only. `types.ts:89-103` + `market-snapshot.server.ts:26-59` + `snapshot.server.ts:56-67` = two-snapshot contract (market vs in-sample baseline).

---

## 1. The 3 Layers (progressive disclosure, not 3 pages)

```
30s  — "What's the bet, did it work?"   → glance
2min — "52→0 how, and what failed how?" → scan
10min — "Can I retrace one failure?"    → trace
```

| Layer | Goal | Where (existing routes only) | Time-box copy rule |
|-------|------|------------------------------|--------------------|
| **30s — At a glance** | Answer: WTI how shaky now? project what? result? | `/` hero: `WatchGauge` + 4 `MarketFact` + `signal-question` one-liner | ≤ 2 sentences per block. No numbers invented. |
| **2min — Scan** | Answer: What was tried, what died how, what method guards it? | `/` `#ledger` preview (4 rows) + `ResearchLog` (3 rows) + `#method` (5 steps) ; `/research` `#distribution` (7 buckets Σ=52) + `#ledger` (6 representative rows) | Table scan, one reason per row (`research.tsx:35,44,53,62,72,81`) |
| **10min — Deep trace** | Answer: Pick one hypothesis and follow dump→note→sources→(no candidate)→no experiment, with look-ahead & IS/OOS boundary intact | `/research` anchored subsections that **link out** to files, not inline-dump: `gathering/notes/*.md` + `gathering/sources/REGISTRY.md` + `docs/experiments/000` + `notebooks/pizza-hunt.md` + `research/data/clf-daily-2015-2026.csv` | Link-first, not render-first. Raw (`gathering/raw/`) is gitignored → never link directly. |

Principle: **same page, deeper scroll.** No new top nav item. The only IA change is hash anchors inside `/research` that already exist (`#ledger`, `#method`, `#team`) plus two added anchors (`#history`, `#sources`) reusing `DeskHeader` nav.

---

## 2. Route Map — Minimal Delta

```
app/app/routes.ts:3-6  (unchanged)
  /            → home.tsx         30s + 2min preview
  /research    → research.tsx     2min + 10min trace  (add 2 hashes)
  /backtest    → backtest.tsx     308 → /research (keep, INTAKE S7 guard)
```

| Delta | File | Change | Why smallest |
|-------|------|--------|--------------|
| **0 — keep** | `app/components/desk-chrome.tsx:42-53` | Keep `WTI 관측 · 연구 장부 · 방법 · 팀`. Add at most one link: `연구 장부#history` (hash, not new route) | No new route, no new `route()` entry |
| **0 — keep** | `app/components/watch-gauge.tsx:38-171` | No change. Only gauge on site | No chart lib |
| **A** | `app/app/routes/home.tsx:305-353` | Keep `signal-question` (203 chars), `#ledger` preview, `ResearchLog`, `MethodSection` as-is. Only change: `#ledger` "전체 연구 장부 보기" `Link to="/research"` already exists `:324` — no code | 30s layer already built |
| **B** | `app/app/routes/research.tsx:149-260` | Add `id="history"` section **above** existing `#distribution` (reuses `RECENT_RESEARCH_LOG` shape, reads `research/gathering/notes/*.md` index). Add `id="sources"` subsection under `#method` that links `REGISTRY.md`. No new fetch | All data is markdown already on disk; no API |
| **C** | `app/app/lib/*` | No new lib. `market-snapshot.server.ts:26` + `snapshot.server.ts:56` are the only two readers | Ponytail: delete-before-adding |

Add when: `research/notebooks/pizza-hunt.md:22` gains a real row (`크립토의 뭐 × 뉴스의 무슨` + mechanism + frozen IS rule passing `INTAKE.md:81-93`). Then and only then add `docs/experiments/001` and a `/research#001` anchor.

---

## 3. Section List + Data Contract

### 3.1 `/` — Home (30s + 2min preview)

| # | Section | What the user reads | Reads (single source of truth) | Contract / Guard |
|---|---------|---------------------|-------------------------------|------------------|
| H1 | **WTI 관측 — Gauge + MarketFact + sparkline** | 현재 흔들림 크기만 (방향 아님), RV5/RV20/기준일/마지막확인/신선도 | `app/public/wti-market-snapshot.json` via `app/app/lib/market-snapshot.server.ts:26` → `app/app/lib/types.ts:89-103,127-196` `isWtiMarketSnapshot` | `freshnessPolicy maxCheckAgeHours=36 / maxBarAgeDays=4` → `fresh/stale/unavailable`; `provenance.rowCount/SHA256/all-completed-bars` displayed `home.tsx:293-296` |
| H2 | **한 줄 질문** `home.tsx:305-314` | "피자 주문 같은 평범한 흔적이 WTI 변동성을 먼저 말할까? 방향 아니라 크기, 관계 없으면 그대로 기록" | Static copy in `home.tsx:307-312` (no json) | No prediction claim; no `CL=F` direction |
| H3 | **공개 신호 연구 장부 — 4행 preview** `home.tsx:316-351` | 가설/확보데이터/IS/OOS/판정 (대표 4) | Hardcoded `RESEARCH_PREVIEW:28-57` mirroring `research.tsx:27-82` (source of record = `research.tsx`) | `CANDIDATE_COUNT=52 PASS_COUNT=0` `home.tsx:10-11` must equal `research.tsx:8-10` |
| H4 | **최근 연구 기록 — 3 rows** `home.tsx:389-415` | 2026-09-03 3 entries: 제목·저자·한줄결과·원문 링크 | Hardcoded `RECENT_RESEARCH_LOG:68-91` → GitHub `research/gathering/notes/*.md` + `research/reports/*.md` | Each row links to `gathering/notes/*.md` (§3.3); r values not invented |
| H5 | **연구 방법 — 5 steps** `home.tsx:94-100,417-435` | 가설→데이터적격성→IS(2015-2023)→규칙동결→OOS 한 번 | Static `METHOD_STEPS` in both `home.tsx:94-100` and `research.tsx:99-105` | OOS 1회 only `INTAKE.md:91`; look-ahead guard `local-backtest-guide.ts:6-8` |

### 3.2 `/research` — Research Ledger (2min + 10min)

| # | Section | What the user reads | Reads | Contract / Guard |
|---|---------|---------------------|-------|------------------|
| R1 | **헤더 카피** `research.tsx:149-161` | "찾은 신호보다 버린 가설을 먼저 공개" + 52·0 + GitHub link | `research.tsx:122-124` loader `{candidateCount, passCount}` + static copy | Copy cites `연구 장부 읽기 전용` `research.tsx:130-134` |
| R2 | **판정 분포** `research.tsx:163-176` | 7 buckets Σ=52: 기각17 보류16 미검증7 보관6 분석제외2 관측만3 별도전략1 | Hardcoded `VERDICT_COUNTS:88-96` (Σ must =52) | 미검증·보류 ≠ 통과 `research.tsx:174`; rendered as `dl` flex wrap |
| R3 | **대표 검증 기록 — 6 rows** `research.tsx:178-224` | 가설/목표/데이터/IS/OOS/판정과이유 (서로 다른 실패 유형) | Hardcoded `LEDGER_ROWS:27-82` | IS/OOS `r` strings are literal (e.g. `r=-0.003→-0.002` Iran, `r=+0.051→-0.455` SPR) — no computed Sharpe |
| R4 | **검증 절차 — 5 steps** `research.tsx:226-241` | Same 5 steps + "2024-2026은 이미 확인했으므로 최종 검증 구간 아님, 다음 후보는 미래 구간" | Static `METHOD_STEPS:99-105` | Repeats `docs/research-design.md:27-30` IS/OOS dates verbatim |
| R5 | **History trace — NEW anchor `#history` (minimal addition)** | One chosen hypothesis traced: 한줄가설 → 노트 → 출처 → 후보표(비어있음) → 실험(없음/000) | Links to `research/gathering/notes/YYYY-MM-DD-*.md` (template `_TEMPLATE.md:11-46`) + `research/gathering/sources/REGISTRY.md` + `docs/experiments/000-oil-slice-draft.md` | Each trace row shows `크립토의 뭐 × 뉴스의 무슨` columns `INTAKE.md:20`; empty = evidence, not bug |
| R6 | **Sources — sub-anchor `#sources` under `#method`** | Investing CSV / Yahoo CL=F / FRED / IMF PortWatch license·delay·look-ahead | `research/gathering/sources/REGISTRY.md:8-71` (30+ rows) | News source must read `investing.com` CSV `research-design.md:36-48` + `REGISTRY.md:12-13`; scrapping = reject |
| R7 | **팀이 남기는 증거** `research.tsx:243-258` | 오태환(데이터·대안신호·대시보드) / 손성찬(전략·ML·백테스트) | Static `TeamRole` links to GitHub | No new auth/supabase |

### 3.3 Where Each Narrative Lives (the question asked)

| Narrative | Lives | Why there | Not there |
|-----------|-------|-----------|-----------|
| **Pentagon Pizza narrative** (the metaphor that frames the project) | **Home `H2` signal-question** `home.tsx:305-314` + **Research `R3` row 1 "Pentagon Uber Eats — 철회"** `research.tsx:28-36` (`data: 적격 익명 장기 집계 미확보`, `reason: 공개 시계열이 없어 대체값 만들지 않음`) + **Research `R4` method** (why it fails the 9 checks) | Pizza index is a **story about indirect public signals**, not a dataset. Its home is copy that sets the mental model (30s), and its fate is one ledger row that teaches "no public time series → withdraw, don't proxy" | Not in `baseline-snapshot.json` (no numeric `slice` for it), not in `pizza-hunt.md` candidate table (never had `크립토의 뭐` — `INTAKE.md:20` blocks row creation), not on WTI gauge |
| **Oil Slice draft** (comparison group, `2*hormuz+1*inflation` 20d z) | **Primary:** `docs/experiments/000-oil-slice-draft.md:1-28` (status: 비교군, not final candidate). **Surfaced on dashboard only as:** `baseline-snapshot.json` `slice_score/slice_z/hormuz_count/inflation_count` columns (IS-only tail, via `snapshot.server.ts:56-67`) under `/research#history` as "비교군 — Slice vs future candidate" | `docs/research-gathering.md:19` and `docs/experiments/README.md:14` explicitly mark `000` as comparison group; `docs/slice-index.md:1-14` frames it as 뉴스-only counterpart to a future `크립토×뉴스` candidate | Not on home gauge (gauge is RV5 percentile only `spec:11-14`); not a candidate row in `pizza-hunt.md` (`INTAKE.md:65` "Oil Slice는 이미 000이므로 후보 표에 다시 넣지 않음"); not in `wti-market-snapshot.json` (that's market observation, not research features) |
| **52→0 evidence** (the headline as credibility) | **Everywhere as one number, explained in two places:** `home.tsx:10-11` + `research.tsx:8-10` (`CANDIDATE_COUNT`/`PASS_COUNT`), **distribution** `research.tsx:88-96` Σ=52, **6 representative failures** `research.tsx:27-82`, **preview** `home.tsx:28-57`, **empty candidate table as evidence** `research/notebooks/pizza-hunt.md:22-24` ("비어 있음") | 52→0 is not a chart — it is a **distribution + taxonomy + empty table**. The taxonomy (기각/보류/미검증/보관/분석제외/관측만/별도전략) teaches failure types; the empty `pizza-hunt` teaches "없으면 없다고 함" `research/INTAKE.md:66-67` | Not a Sharpe/MDD chart (`INTAKE.md:30` "숫자 지어내지 않음" — P1 OUT in `nexus-p1-scope-freeze.md:44`), not a map/heatmap (`INTAKE.md:99,16`), not computed client-side — hardcoded and Σ-checked |

### 3.4 10min Trace — One Example (how a reader retraces, no new UI)

```
Pick: "027·042 구성요소 반증"  (home.tsx:81-84 → gathering/notes/2026-09-03-027-042-rescue-falsification.md)
  1. 한줄가설    → note frontmatter `한 줄 가설` (_TEMPLATE.md:9-12)
  2. 크립토×뉴스 → note table `크립토의 뭐 × 뉴스의 무슨` (_TEMPLATE.md:15-21) — 둘 중 하나라도 비면 pizza-hunt 행 없음
  3. 본문        → `본 것 / 안 본 것 / 000과 다른 점` (_TEMPLATE.md:23-29) — no raw paste, link to gathering/raw/
  4. 체크        → 8-row check (_TEMPLATE.md:33-42): price=Yahoo CL=F? news=Investing CSV? license? delay? look-ahead? 본기간=IS only? OOS봤나? 성과숫자=없음
  5. 출처        → gathering/sources/REGISTRY.md row (URL, license, delay, look-ahead)
  6. 후보표      → notebooks/pizza-hunt.md — no row added (메커니즘이 없거나 OOS를 봐야 산다 → 폐기 INTAKE.md:99)
  7. 실험카드    → docs/experiments/ — no 001 created (승격 조건 INTAKE.md:73 미충족)
  8. 검증        → ledger R3 + distribution R2 reflect the outcome (기각/보류, not pass)
```

No new table, no map, no chart. The trace is **links to files that already exist**.

---

## 4. Data Contract Summary (which json/md each section reads)

| Layer | Section | File read | Reader | Freshness / Invariant |
|-------|---------|-----------|--------|----------------------|
| 30s | H1 WTI 관측 | `app/public/wti-market-snapshot.json` | `app/app/lib/market-snapshot.server.ts:26` `readWtiMarketSnapshot()` → `types.ts:127` `isWtiMarketSnapshot` | `freshnessPolicy` 36h/4d; `provenance.contentSha256[0:12]` + `rowCount` shown `home.tsx:295`; bars = completed bars only |
| 30s | H1 sparkline | same `wti-market-snapshot.json` `bars[].close` | `home.tsx:198-199` `sparklinePath` | 60 bars tail; SVG `home.tsx:255-270` no chart lib |
| — | H2/H4/H5 copy | None (static in `home.tsx`) | — | Copy is the contract (`spec:17` wording) |
| 2min | H3 ledger preview | `home.tsx:28-57` (mirror of `research.tsx:27-82`) | Static | Must stay in sync with `research.tsx` (single source = `research.tsx`) |
| 2min | R2 distribution | `research.tsx:88-96` | Static | Σ=52 invariant; display `dl` `research.tsx:165-171` |
| 2min | R3 ledger 6 rows | `research.tsx:27-82` | Static | Each row `inSample/outSample/verdict/reason` literal |
| 2min | R4 method | Static `research.tsx:99-105` | — | Text mirrors `docs/research-design.md:9-10` + `INTAKE.md:7-24` |
| 10min | R5 history trace | `research/gathering/notes/*.md` + `research/gathering/notes/_TEMPLATE.md:1-46` | Direct file link (no loader) | Note filename `YYYY-MM-DD-slug.md` `INTAKE.md:52`; git-tracked md only |
| 10min | R6 sources | `research/gathering/sources/REGISTRY.md` + `sources/_TEMPLATE.md` | Direct file link | 30+ rows, `investing.com` + `Yahoo CL=F` already registered |
| 10min | Oil Slice detail | `docs/experiments/000-oil-slice-draft.md` + `app/public/baseline-snapshot.json` `slice_*` cols | `snapshot.server.ts:56-67` `normalizeFeatureRow` (IS tail) + direct md link | `baseline-snapshot.json` `in_sample 2015-01-01~2023-12-31` `types.ts:30-36`; OOS rows excluded from public snapshot |
| 10min | Candidate table (empty) | `research/notebooks/pizza-hunt.md:22-24` | Direct file link | Empty = valid state `INTAKE.md:66-67` |
| 10min | Price seed | `research/data/clf-daily-2015-2026.csv` (seed) | `app/app/lib/price-seed.server.ts:5-15` `CLF_SEED_RELATIVE_PATH` | Columns `date/Open/High/Low/Close/Volume/sample` `price-seed.server.ts:28-31`; IS/OOS split `72-83` |

No new `fetch`, no Supabase read, no chart lib import. `gathering/raw/` is gitignored (`INTAKE.md:14`) — never read by the app.

---

## 5. Visual Rules (from `spec:42-48`, already in `home.tsx`/`research.tsx`)

- Palette: `spec:45` 짙은 숯빛 녹색 / 앰버 데이터 잉크 / 아이보리 — reuse `gauge.ts:15-21` 4 zones, no new colors.
- Type: sans body, mono numbers/dates/sources `home.tsx:232-236`, `research.tsx:166-168`.
- Layout: tables + thin dividers (`border border-border`), open layout — no card grid, no glow, no gradient.
- Anti-patterns: **no map, no world heatmap, no fake needle, no duplicate ticker, no AI/cyberpunk** `spec:47`. Crypto map is OUT `INTAKE.md:99`.
- Gauge: `WatchGauge` only. Sparkline is raw SVG `home.tsx:255-270`, not a lib.
- A11y: `DeskHeader` skip link `desk-chrome.tsx:28`, `gauge` `role=img` + `aria-describedby` `watch-gauge.tsx:55-64`, table `scope="col"` `research.tsx:199-204`.

---

## 6. What This IA Does NOT Add (Ponytail — delete-before-adding)

Skipped: new route, new chart/map lib, Supabase write, backtest engine, price/News scraper, Sharpe/MDD cards, dependency.
Add when: `research/notebooks/pizza-hunt.md:22` has a real candidate row (`크립토의 뭐 × 뉴스의 무슨` + mechanism + frozen IS rule, 9 checks pass `INTAKE.md:81-93`).

```
ponytail: one-file IA, zero new runtime code — new UI only after pizza-hunt row + frozen IS rule exist
```

---

## 7. Verification

```bash
ls -l docs/superpowers/plans/nexus-p1-dashboard-ia.md
# this file, one file, no code
```

- `git status` shows 1 new file, 0 new `*.tsx`/`*.ts`/`package.json` changes.
- `app/app/routes.ts:3-6` still 3 routes; `desk-chrome.tsx` nav still 4 links (+ at most one hash).
- `graphify-out/GRAPH_REPORT.md` node/edge count unchanged (no new code to index).
- Two-snapshot invariant holds: `wti-market-snapshot.json` (market, fresh/stale) vs `baseline-snapshot.json` (IS-only research) — never mixed.

---

## 8. Open Question (one, not a list)

The 10min trace links to `gathering/notes/*.md` on GitHub, not rendered in-app. If stakeholder wants in-app rendering, the next decision is: **server-render one `notes/*.md` by slug at `/research/history/:slug` vs keep GitHub as canonical and add only hash anchors.** Ponytail default: keep GitHub (zero code). Say so if you want the route.
