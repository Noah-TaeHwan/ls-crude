# Nexus P2 — Executable Architecture (History Dashboard)

Date: 2026-09-04 · Status: P2 architecture · Owner: Tech Lead + UX Architect
Model: opencode/muse-spark-1.2-contributor-free variant xhigh
Depends: `nexus-p1-stakeholder-narrative.md` + `nexus-p1-scope-freeze.md` + `nexus-p1-dashboard-ia.md` + `nexus-p1-gate-checklist.md` — compressed, not replaced.

> **한 줄 결정:** P1의 4문서를 `app/app/routes/*.tsx` 2파일의 `loader/action` 읽기 전용 + 2개 hash 섹션(`#history`, `#sources`) 추가라는 최소 diff로 실행 가능하게 만든다.

---

## 0. P1 Compress — 무엇을 그대로 쓰는가

| P1 doc | Carry to P2 | Drop (already enforced) |
|---|---|---|
| `nexus-p1-stakeholder-narrative.md:8-48` 52→0 서사 + `VERDICT_COUNTS` 7버킷(기각17 보류16 미검증7 보관6 분석제외2 관측만3 별도전략1) | `research.tsx:8-10` `CANDIDATE_COUNT=52`/`PASS_COUNT=0` + `research.tsx:88-96` distribution 그대로 노출. 카피는 `research.tsx:130-134` "읽기 전용" | 새 지표·차트·성과 숫자 신설 금지 (`research/INTAKE.md:30,92`) |
| `nexus-p1-scope-freeze.md:56-66` S1–S8 INTAKE 9 checks 매핑 | S1(Market Observation 읽기 전용), S2(Ledger), S3(IS-only snapshot), S4(Investing CSV), S7(No web backtest 308) → §2 Data Contract의 `Contract/Guard`로 고정 | OUT: 새 팩터·OOS 재튜닝·웹 백테스트 엔진·차트 라이브러리·Supabase 쓰기 |
| `nexus-p1-dashboard-ia.md:31-134` 30s/2min/10min + Route Map + Data Contract | §1 IA→파일 매핑, §2 섹션별 single source-of-truth, `app/app/routes.ts:3-6` 3 routes 유지 | 새 route·map·world heatmap (`AGENTS.md:24`, `research/INTAKE.md:99`) |
| `nexus-p1-gate-checklist.md:39-233` G-L1–E5 12 gates | §3 Diff Table의 `Gate` 컬럼이 각 diff가 닫는 gate를 명시. `git status` clean + `graphify-out/GRAPH_REPORT.md` node 0 증가로 검증 | 구두 추정·스크래핑·빈 후보표 채우기 |

P1 4문서를 다시 읽지 않아도 P2만으로 구현 가능해야 한다 — 아래 §1–§3이 그 계약.

---

## 1. IA → Files — 30s / 2min / 10min 매핑

원칙: **같은 페이지, 더 깊게 스크롤.** 새 top nav 없음. `desk-chrome.tsx:42-53`에 hash 1개만 추가, `watch-gauge.tsx:38-171`은 그대로.

### 1.1 `/` — WTI 관측 (30s glance + 2min preview) — **no change**

`app/app/routes/home.tsx:190-435` 전체가 30s/2min를 이미 닫는다. P2에서 코드는 건드리지 않는다.

| Layer | Section | File:Lines | Reads | 계약 |
|---|---|---|---|---|
| **30s** | **WatchGauge + MarketFact 4칸** | `home.tsx:212-224` (`WatchGauge` + `dl>MarketFact`) | `app/public/wti-market-snapshot.json` via `app/app/lib/market-snapshot.server.ts:26` `readWtiMarketSnapshot()` → `app/app/lib/types.ts:127-196` `isWtiMarketSnapshot` | `freshnessPolicy maxCheckAgeHours=36 / maxBarAgeDays=4` (`market-snapshot.server.ts:48-53`) → `fresh/stale/unavailable` dot `desk-chrome.tsx:18-24` + `home.tsx:243-249`. `provenance.contentSha256[0:12]·rowCount·all-completed-bars` `home.tsx:293-296` + `types.ts:80-87` |
| **30s** | **Sparkline** | `home.tsx:253-279` (`sparklinePath` `home.tsx:140-152`, 60 bars `home.tsx:257`) | 같은 `wti-market-snapshot.json` `bars[].close` | Raw SVG `home.tsx:256-270` — chart lib 없음. `viewBox 520×116` `home.tsx:14-16` |
| **30s** | **한 줄 질문** | `home.tsx:305-314` (`signal-question`) | Static copy in `home.tsx:307-312` — json 없음 | 방향 예측 금지, "크기"만. `meta` `home.tsx:155-164`와 같은 톤 |
| **2min** | **공개 신호 연구 장부 4행 preview** | `home.tsx:316-351` (`RESEARCH_PREVIEW` `home.tsx:28-57`) | Hardcoded `home.tsx:28-57` mirroring `research.tsx:27-82` — **source of record = `research.tsx`** | `CANDIDATE_COUNT=52 PASS_COUNT=0` `home.tsx:10-11` === `research.tsx:8-10` invariant. `Link to="/research"` `home.tsx:324` 유지 |
| **2min** | **최근 연구 기록 3 rows** | `home.tsx:389-415` (`RECENT_RESEARCH_LOG` `home.tsx:68-91` → `ResearchLog`) | Hardcoded → GitHub `research/gathering/notes/*.md` | `ResearchLog` 각 row `href`는 `gathering/notes/2026-09-03-*.md` 3파일로 링크. r= `-0.332→+0.530` `home.tsx:88`은 `research/INTAKE.md:30` 위반 없이 원문 링크로 검증 |
| **2min** | **연구 방법 5 steps** | `home.tsx:417-435` (`METHOD_STEPS` `home.tsx:94-100`) + `research.tsx:99-105` 동일 | Static | `가설→적격성→IS(2015-2023)→동결→OOS 1회` + `LOOKAHEAD_GUARD` (`app/app/lib/local-backtest-guide.ts:6-8` "신호는 그날 알고, 손익은 다음날 CL") 문장 반복. OOS 1회 `research/INTAKE.md:29,91` |

`loader` `home.tsx:170-172` (`readWtiMarketSnapshot()`), `action` `home.tsx:178-183` (405 read-only) — **변경 없음**. `meta` `home.tsx:155-164` 유지.

### 1.2 `/research` — 연구 장부 (2min scan + 10min trace) — **2 hashes만 추가**

기존: `research.tsx:149-258` 5 sections (`header`/`#distribution`/`#ledger`/`#method`/`#team`). P2: `#history` + `#sources` 2개만 추가, 나머지는 위치·카피 유지.

| Layer | Section | File:Lines | Reads (single source-of-truth) | 계약 |
|---|---|---|---|---|
| **2min** | **헤더 카피** | `research.tsx:149-161` | `loader` `research.tsx:122-124` `{candidateCount, passCount}` + static | "찾은 신호보다 버린 가설" + 52·0 + GitHub link `research.tsx:160` |
| **2min** | **판정 분포 `#distribution`** | `research.tsx:163-176` (`VERDICT_COUNTS` `research.tsx:88-96`) | Hardcoded 7 buckets Σ=52 | `Σ==52` invariant `research.tsx:88-96` (17+16+7+6+2+3+1). 미검증·보류 ≠ 통과 `research.tsx:174`. `dl.flex` `research.tsx:165-171` 유지 |
| **2min** | **대표 검증 기록 `#ledger` 6 rows** | `research.tsx:178-224` (`LEDGER_ROWS` `research.tsx:27-82`) | Hardcoded — ledger **source of record** | IS/OOS `r` literal (`r=-0.003→-0.002` Iran `research.tsx:41`, `r=+0.051→-0.455` SPR `research.tsx:51`). Pentagon row `research.tsx:28-36` = `data: 적격 익명 장기 집계 미확보`, `reason: 공개 시계열이 없어 대체값 만들지 않음` |
| **10min NEW** | **`#history` — Dump→Note→Sources→pizza-hunt→000 chain** | **`research.tsx:162a` — `#distribution` 바로 위 신규 `<section id="history">`** (insert between `research.tsx:161` header and `research.tsx:163` distribution) | Links to `research/gathering/notes/*.md` (`_TEMPLATE.md:1-46` contract) + `research/gathering/sources/REGISTRY.md:7-71` + `research/notebooks/pizza-hunt.md:22-24` (empty) + `docs/experiments/000-oil-slice-draft.md:1-28` | Chain: `한 줄 가설` (`_TEMPLATE.md:10-12`) → `크립토의 뭐×뉴스의 무슨` (`_TEMPLATE.md:15-21`) — 둘 다 비면 `pizza-hunt.md:22-24` "비어 있음"이 증거 (`research/INTAKE.md:66-67`). `gathering/raw/`는 gitignored (`research/INTAKE.md:14`) — **링크 금지**, 노트가 간접 참조만. `Oil Slice 000`은 비교군 `docs/experiments/000-oil-slice-draft.md:3` |
| **2min** | **검증 절차 `#method` 5 steps** | `research.tsx:226-241` (`METHOD_STEPS` `research.tsx:99-105`) | Static — `docs/research-design.md:27-30` IS/OOS 날짜와 verbatim 동일 | `"2024-2026은 이미 확인… 미래 구간"` `research.tsx:237-239` + `LOOKAHEAD_GUARD` 반복 |
| **10min NEW** | **`#sources` — REGISTRY.md 링크** | **`research.tsx:241a` — `#method` 내부 sub-anchor `<section id="sources">` (insert between `research.tsx:241` method `</section>` and `research.tsx:243` team)** | `research/gathering/sources/REGISTRY.md:8-71` 30+ rows + `docs/research-design.md:36-48` (Investing CSV) + `research/gathering/sources/_TEMPLATE.md` | News는 `investing.com` CSV `research-design.md:36-37` / `REGISTRY.md:12` + `AGENTS.md:24` "스크래핑 금지" 한 줄 고지. Yahoo `CL=F` `research/INTAKE.md:86` / `research/src/ls_crude/config.py:5` 티커 고정도 같은 줄에 병기. `라이선스·지연·look-ahead` 3칸이 `REGISTRY.md:7` 헤더와 일치 |
| **2min** | **팀이 남기는 증거 `#team`** | `research.tsx:243-258` (`TeamRole` `research.tsx:272-294`) | Static — GitHub 링크 | `supabase.server.ts:1-16` 미사용, auth 없음 유지 |

**Trace 예시 (10min, 링크만 — 렌더 없음):**

```
Pick: "027·042 구성요소 반증" (home.tsx:80-83 → gathering/notes/2026-09-03-027-042-rescue-falsification.md)
  1. 한 줄 가설       → note _TEMPLATE.md:10-12
  2. 크립토×뉴스       → note _TEMPLATE.md:15-21 — 둘 중 하나라도 비면 pizza-hunt 행 없음
  3. 본문              → _TEMPLATE.md:23-29 (본 것/안 본 것/000과 다른 점) — raw 링크는 노트가 간접 참조
  4. 체크 8 rows       → _TEMPLATE.md:33-42 (price=Yahoo CL=F? news=Investing CSV? license? delay? look-ahead? IS-only? OOS봤나? 성과숫자=없음) — INTAKE 9 checks INTAKE.md:81-93
  5. 출처              → REGISTRY.md:7-71 row (URL/license/delay/look-ahead) + _TEMPLATE.md 상세 링크
  6. 후보표            → pizza-hunt.md:22-24 — no row (메커니즘 없거나 OOS를 봐야 산다 → 폐기 INTAKE.md:99)
  7. 실험카드          → docs/experiments/ — no 001 (승격 조건 INTAKE.md:73 미충족)
  8. 검증 반영         → ledger R3 + distribution R2 (기각/보류, not pass)
```

### 1.3 `DeskHeader` nav — **hash 1개만 추가**

```
app/app/routes.ts:3-6 (unchanged: index(home) + research + backtest(308))
desk-chrome.tsx:42-53 existing:  WTI 관측(/) · 연구 장부(/research) · 방법(/research#method) · 팀(/research#team)
desk-chrome.tsx:46a  NEW:       <a class="desk-nav-link" href="/research#history">추적</a>  — between 연구 장부 and 방법
```

Why: `#history`는 10min trace의 진입점. `#sources`는 `#method`의 sub-anchor라 top nav 불필요 — `research.tsx:226` method 섹션 내부에서 링크로 노출.

---

## 2. Data Contract — Section별 Single Source-of-Truth

`loader`/`action`은 **읽기 전용 유지**. 새 fetch/Supabase/backtest 호출 없음.

| Route | Section | Source-of-truth (file) | Reader (file:line) | Freshness / Invariant | Guard |
|---|---|---|---|---|---|
| `/` | WatchGauge + MarketFact | `app/public/wti-market-snapshot.json` | `app/app/lib/market-snapshot.server.ts:26` `readWtiMarketSnapshot()` → `app/app/lib/types.ts:127-196` `isWtiMarketSnapshot` (20+ checks: ticker `CL=F`, bars sorted/OHLC, volume≥0, SHA256 64hex) | `freshnessPolicy` `maxCheckAgeHours=36` / `maxBarAgeDays=4` `market-snapshot.server.ts:48-53`; `provenance.contentSha256[0:12]`+`rowCount` `home.tsx:293-296`; bars=all-completed-bars `types.ts:86` | Legal G-L1/G-L2, Quality G-Q4 |
| `/` | Sparkline | same `wti-market-snapshot.json` `bars[].close` | `home.tsx:198-199` `sparklinePath` → SVG `home.tsx:256-270` | 60 bars tail, SVG 520×116 `home.tsx:14-16` | — |
| `/` | 신호 질문 / ResearchLog / Method | Static in `home.tsx:307-312` / `home.tsx:68-91` / `home.tsx:94-100` | — | Copy is contract. `CANDIDATE_COUNT` `home.tsx:10-11` === `research.tsx:8-10` | Evidence G-E1/G-E2 |
| `/research` | 헤더 52·0 | `research.tsx:8-10` consts | `research.tsx:122-124` loader | Header `research.tsx:150-152` reads loader | — |
| `/research` | 판정 분포 `#distribution` | `research.tsx:88-96` `VERDICT_COUNTS` | Static `dl` `research.tsx:165-171` | **Σ=52** invariant. 미검증·보류 ≠ 통과 `research.tsx:174` | Quality G-Q1, Evidence G-E3 |
| `/research` | 대표 검증 6 rows `#ledger` | `research.tsx:27-82` `LEDGER_ROWS` | Static `table` `research.tsx:195-223` | Ledger is **source of record**; `home.tsx:28-57` mirrors it. `r` literal, no computed Sharpe | Quality G-Q1/G-Q2, Evidence G-E1 |
| `/research` | 검증 절차 `#method` | `research.tsx:99-105` `METHOD_STEPS` | Static `ol` `research.tsx:228-235` | Mirrors `docs/research-design.md:27-30` + `research/INTAKE.md:7-24` verbatim. `LOOKAHEAD_GUARD` `local-backtest-guide.ts:6-8` | Quality G-Q2/G-Q4 |
| `/research` | History trace `#history` **NEW** | `research/gathering/notes/*.md` + `research/gathering/notes/_TEMPLATE.md:1-46` + `research/notebooks/pizza-hunt.md:22-24` + `docs/experiments/000-oil-slice-draft.md:1-28` | **Direct file links (no loader)** — `<a href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/notes/…">` | Note filename `YYYY-MM-DD-slug.md` `research/INTAKE.md:52`; empty `pizza-hunt` = valid `research/INTAKE.md:66-67`; `gathering/raw/` never linked (gitignored) `research/INTAKE.md:14` | Legal G-L3/G-L4, Evidence G-E2/G-E3/G-E4/G-E5 |
| `/research` | Sources `#sources` **NEW** | `research/gathering/sources/REGISTRY.md:8-71` + `research/gathering/sources/_TEMPLATE.md` | **Direct file links** inside `#method` | `investing.com` CSV `research-design.md:36-48` + `REGISTRY.md:12-13`; Yahoo `CL=F` `research/INTAKE.md:86` + `config.py:5`; 각 row `라이선스·지연·look-ahead` `REGISTRY.md:7` | Legal G-L1–G-L4 |
| `/research` | 팀 `#team` | Static `research.tsx:243-258` | `TeamRole` `research.tsx:272-294` | GitHub links only. No auth | — |
| — | Oil Slice 상세 (comparison group) | `docs/experiments/000-oil-slice-draft.md:11-14` `2*hormuz+1*inflation` 20d z + `app/public/baseline-snapshot.json` (`snapshot.server.ts:56-67` `normalizeFeatureRow` IS tail) | `snapshot.server.ts:56-67` + direct md link at `#history` | `baseline-snapshot.json` `in_sample 2015-01-01~2023-12-31` `types.ts:30-36` (`baseline-snapshot.json:3-6`); OOS rows excluded from public snapshot; `pizza-hunt.md:22-24` 빈 표는 Oil Slice를 후보에 넣지 않음 `research/INTAKE.md:65` | Quality G-Q1/G-Q3 |
| Both | `backtest` | `app/app/routes/backtest.tsx:8-31` | 308 → `/research` (GET) + 400 refusal (POST) | `local-backtest-guide.ts:2-48` `LOOKAHEAD_GUARD` + `LOCAL_BACKTEST_STEPS` | Quality G-Q2 |

**Loader/Action contract (both routes read-only):**

- `home.tsx:170-172` `loader → {market: readWtiMarketSnapshot()}` — no params, no Supabase.
- `home.tsx:178-183` `action → 405 {ok:false}` — 쓰기 거절.
- `research.tsx:122-124` `loader → {candidateCount, passCount}` — constants only.
- `research.tsx:130-135` `action → 405` — 쓰기 거절.
- `snapshot.server.ts:56-67` `readSnapshotFile()` is **not called by `home.tsx` loader** — it is the IS-only `baseline-snapshot.json` reader for future `#history` detail pages (P2에서는 링크만, 호출 없음). 혼용 금지: `wti-market-snapshot.json`(market, fresh/stale) vs `baseline-snapshot.json`(IS-only research) — never mixed (`nexus-p1-dashboard-ia.md:171`).

---

## 3. Component Diff Table — 최소 diff, 왜 가장 짧은지, 어떤 gate를 닫는지

`app/app/routes.ts:3-6` routes 3개, `watch-gauge.tsx:38-171` gauge 1개는 그대로. **신규 파일 0, 신규 의존성 0.**

| # | File | Lines | Change | Why smallest (Ponytail) | Gate |
|---|---|---|---|---|---|
| **A0** | `app/app/routes/home.tsx` | `190-302` + `305-435` | **no change** — `WatchGauge` (`watch-gauge.tsx:38-171`) + `MarketFact` 4칸 (`home.tsx:219-224`) + `freshness` dot (`home.tsx:243-249`) + `provenance` SHA/rowCount (`home.tsx:293-296`) 그대로 | 30s layer already built (`nexus-p1-dashboard-ia.md:60`, `nexus-p1-scope-freeze.md:58` S1). `wti-market-snapshot.json` provenance로 Legal/Quality 이미 증명 | **G-L1 Legal** (Yahoo `CL=F` provenance), **G-L4** (freshness), **G-Q4** (all-completed-bars) |
| **A1** | `app/app/components/desk-chrome.tsx` | `42-53` nav block | **+1 hash link**: `<a class="desk-nav-link" href="/research#history">추적</a>` between `DeskNavLink to="/research"` (`desk-chrome.tsx:46`) and `<a href="/research#method">` (`desk-chrome.tsx:47`) | IA가 요구하는 10min 진입점을 top nav 1 link로 해결. 새 route(`routes.ts:3-6`) 추가 대비 diff 1줄. `DeskNavLink` 재사용 아님 — hash는 `NavLink` active 불필요라 `<a>`가 짧음 | **G-E2 Evidence** (chain 진입점) |
| **B0** | `app/app/routes/research.tsx` | `149-161` header | **no change** — `research.tsx:149-161` header 카피 + `Link to="/"` 유지 | P0 story (`nexus-p1-scope-freeze.md:77` P0-1) 이미 충족 | — |
| **B1** | `app/app/routes/research.tsx` | `162a` (new section between `161` header and `163` `#distribution`) | **NEW `<section id="history">`** — title "추적: Dump→Note→Sources→후보표→실험" + 5-row trace list (each row = one link): `한 줄 가설` → `크립토의 뭐×뉴스의 무슨` → `출처 REGISTRY.md` → `pizza-hunt.md:22-24` "비어 있음" → `000-oil-slice-draft.md`. Reuses `RECENT_RESEARCH_LOG` visual shape (`home.tsx:389-415` `ol>li grid`) — inline fetch 없음, hardcoded links only | 모든 데이터는 이미 `research/gathering/notes/*.md` markdown on disk. 새 loader/fetch 없이 링크만으로 10min trace 완성 (`nexus-p1-dashboard-ia.md:61` Delta B + `114` "The trace is links"). `gathering/raw/`는 링크 금지라 검증 비용 0 | **G-L3** (license), **G-L4** (look-ahead), **G-Q3** (mechanism), **G-E2** (chain), **G-E3** (empty table), **G-E4** (note checks), **G-E5** (hold/discard 보존) — **7 gates를 1 section이 닫음** |
| **B2** | `app/app/routes/research.tsx` | `241a` (new sub-section inside `226-241` `#method`, between `241` and `243` `#team`) | **NEW `<section id="sources">`** — compact `dl` or `ul` with 4 links: Investing CSV (`research-design.md:36-48`, `REGISTRY.md:12`), Yahoo `CL=F` (`REGISTRY.md:9`, `config.py:5`), FRED/IMF (`REGISTRY.md:14-15`), `REGISTRY.md` full table + `_TEMPLATE.md`. Static only | `#method` 내부 sub-anchor라 top nav 추가 불필요. `REGISTRY.md:7` 30+ rows를 앱에서 렌더하지 않고 링크로 위임 — 테이블 렌더·필터·검색 코드 0줄 | **G-L1** (no scraping), **G-L2** (Yahoo only), **G-L3** (license), **G-L4** (delay/look-ahead) |
| **B3** | `app/app/routes/research.tsx` | `163-176` `#distribution` / `178-224` `#ledger` / `226-241` `#method` / `243-258` `#team` | **no change** — `VERDICT_COUNTS` `research.tsx:88-96` Σ=52, `LEDGER_ROWS` 6 rows `research.tsx:27-82`, `METHOD_STEPS` 5 steps `research.tsx:99-105`, `TeamRole` 그대로 | 2min scan already built (`nexus-p1-dashboard-ia.md:40-41`). 변경 시 S2/S6 invariant 깨짐 위험 | **G-Q1** (Σ=52), **G-Q2** (OOS 1회), **G-E1** (no fabrication) |
| **C0** | `app/app/lib/market-snapshot.server.ts` | `26-59` | **no change** — `readWtiMarketSnapshot(now)` fresh/stale/unavailable + `freshnessReasons` | S1 contract의 유일한 reader. 수정 시 `isWtiMarketSnapshot` `types.ts:127-196` + `wti-market-snapshot.json` provenance 체인 동시 변경 필요 — P2 스코프 밖 | **G-Q4** |
| **C1** | `app/app/lib/snapshot.server.ts` | `56-67` | **no change** — `readSnapshotFile()` + `normalizeFeatureRow` IS tail | S3 IS-only 경계. P2에서는 `#history`가 링크만 하므로 호출 없음 — 파일 자체는 그대로 둠 (future 001 detail 대비) | **G-Q1** |
| **C2** | `app/app/lib/types.ts` | `2-42` `DailyFeatureRow`/`BaselineSnapshot` + `68-103` `WtiMarketSnapshot` + `127-196` `isWtiMarketSnapshot` | **no change** | 두 snapshot contract의 타입 가드. 변경 시 `wti-market-snapshot.json` + `baseline-snapshot.json` 동시 재생성 필요 | **G-L1/G-L2/G-Q4** |
| **C3** | `app/app/components/watch-gauge.tsx` | `38-171` | **no change** — `WatchGauge({score, rv5})` + `volatilityBand` `gauge.ts:15-21` 4 zones | Only gauge on site (`nexus-p1-dashboard-ia.md:17` Delta 0). Sparkline `home.tsx:256-270`로 충분 | — |
| **C4** | `app/app/lib/*` rest | `gauge.ts:15-21` `cn.ts:1-6` `local-backtest-guide.ts:2-48` `price-seed.server.ts:5-83` | **no change** | `LOOKAHEAD_GUARD` (`local-backtest-guide.ts:6-8`), `CLF_SEED_RELATIVE_PATH` (`price-seed.server.ts:5`), `GAUGE_ZONES` (`gauge.ts:15-21`) — P2에서 카피로만 참조 | **G-Q2** (LOOKAHEAD), **G-Q1** (seed IS/OOS dates) |

**Diff size:** `A1` 1 line + `B1` ~25 lines + `B2` ~15 lines = **~41 lines in 2 files**. No new file, no new dependency (`package.json` untouched), `graphify-out/GRAPH_REPORT.md` nodes 0 증가.

---

## 4. YAGNI — 만들지 않는 것 (P2에서 금지, 다음을 여는 조건과 함께)

| 금지 항목 | 왜 P2에서 금지 | 다시 여는 조건 (P1 P2와 동일) | 위반 시 폐기 |
|---|---|---|---|
| **새 route** (`routes.ts:3-6` 4번째) | One dashboard, hash로 충분 (`nexus-p1-dashboard-ia.md:42-43`). `/research/history/:slug` 같은 동적 렌더는 GitHub가 canonical인 동안 불필요 | `research/gathering/notes/*.md`를 앱에서 렌더해야 한다는 스테이크홀더 명시 요청이 있고, 단일 `slug` 서버 렌더 vs GitHub 링크 트레이드오프를 문서로 결정한 뒤 | `AGENTS.md:27` "페이지는 `loader`, `action`, `meta`를 내보내고…" — 새 route는 새 loader/action 계약 필요 |
| **차트 라이브러리** (recharts/chart.js 등) | `gauge` `watch-gauge.tsx:55-160` + sparkline `home.tsx:256-270` raw SVG로 충분 (`nexus-p1-dashboard-ia.md:145`, `nexus-p1-scope-freeze.md:98`) | 새 시각화가 52→0 이해에 1문장 이상 기여함을 입증한 뒤 | `package.json` diff 금지 |
| **Supabase 쓰기 / auth** | 공개 장부는 읽기 전용 (`home.tsx:178-183` 405, `research.tsx:130-135` 405). `supabase.server.ts:1-16` 미사용 유지 (`nexus-p1-scope-freeze.md:99`) | 쓰기가 필요하면 별도 스코프 문서에서 RLS·레이트리밋과 함께 정의 | `research/INTAKE.md:31` parquet/키 커밋 금지 + RLS 미정의 쓰기는 Legal FAIL |
| **백테스트 엔진 (웹)** | `/backtest` `backtest.tsx:8-31` 308 유지, 실행은 `research/src/ls_crude/models` + `backtest` 로컬에서만 (`local-backtest-guide.ts:2-48`, `nexus-p1-scope-freeze.md:46,65` S7) | `local-backtest-guide.ts:20-48` pytest 통과를 인계 조건으로 유지하는 한 **영구 보류** | Quality G-Q2 + Evidence G-E1 — 웹 Sharpe/MDD는 `research/INTAKE.md:30,92` 위반 |
| **가격/뉴스 스크래핑** | Yahoo `yfinance` `CL=F`만, Investing.com CSV만 (`research/INTAKE.md:28,86-87`, `docs/research-design.md:36-37`, `AGENTS.md:23-24`) | 없음 — 영구 금지. 새 출처는 `REGISTRY.md:7-71`에 수동 등록만 | Legal G-L1/G-L2 즉시 FAIL |
| **성과 숫자 차트 (Sharpe/MDD/적중률)** | `research/INTAKE.md:30,92` "숫자를 지어내지 않음". `baseline-snapshot.json` 검증 전 수치는 원문 링크로만 (`nexus-p1-scope-freeze.md:44`) | 로컬 `research/src`에서 IS에서 잠근 규칙으로 1회 OOS를 열고, 원시 로그를 `gathering/raw/`에 둔 뒤에만 | Evidence G-E1 FAIL |
| **새 의존성 / 유틸 / lib** | `graphify-out/GRAPH_REPORT.md:3` 281 files / 2023 nodes 재사용, 신규 edge 추가 금지 (`nexus-p1-scope-freeze.md:67`) | `pizza-hunt.md:22-24`에 실후보 한 줄(크립토의 뭐×뉴스의 무슨+메커니즘+동결 규칙)이 생기고 9 checks 통과 뒤에만 | Scope S8 — 새 의존성은 새 node/edge |

```
ponytail: 2 hashes + 1 nav link, zero new runtime code — new UI only after pizza-hunt row + frozen IS rule exist
```

---

## 5. Verification — P2가 닫혔는지 확인

### 5.1 Shell checks (붙여넣기 그대로)

```bash
# 1) P2 파일 존재 + 사이즈
ls -l docs/superpowers/plans/nexus-p2-architecture.md
# -rw-r--r-- 1 file — this file, design only, no new package.json

# 2) P2는 1파일만 추가, 코드 diff 0 (설계 단계)
git status --porcelain | grep -E "nexus-p2|home\.tsx|research\.tsx|desk-chrome" || echo "P2 design: 1 doc, 0 code — by intent"

# 3) Routes 3개 유지
grep -n "index\|route" app/app/routes.ts
# expect: index(home) + research + backtest only — 4th route 없음

# 4) Loaders read-only
grep -n "405\|read-only\|readWtiMarketSnapshot\|candidateCount" app/app/routes/home.tsx app/app/routes/research.tsx
# home loader: readWtiMarketSnapshot / action 405 — research loader: candidateCount / action 405

# 5) No new chart/Supabase/backtest/price scraping imports
grep -R --include="*.tsx" --include="*.ts" -n "recharts\|chart\.js\|supabase.*insert\|supabase.*update\|yfinance.*investing\|BeautifulSoup.*investing" app 2>&1 | grep -v ".venv" || echo "PASS: no new chart/Supabase/scraping in app"

# 6) Gate quick suite (from nexus-p1-gate-checklist.md:27-33)
echo "== G-L1 =="; grep -R --include="*.py" -n "investing" research/src/ls_crude 2>&1 | grep -v ".pyc" | head
echo "== G-L2 .gitignore raw =="; git check-ignore -q research/gathering/raw/dummy.csv && echo "PASS: raw gitignored" || echo "FAIL"
echo "== G-Q1 dates =="; grep -n "2015-01-01\|2023-12-31\|2024-01-01" research/src/ls_crude/config.py docs/research-design.md research/INTAKE.md | head -n 10
echo "== G-E3 empty =="; grep -n "비어 있음\|실후보 없으면" research/notebooks/pizza-hunt.md research/INTAKE.md

# 7) Graphify unchanged (AST-only, no API cost)
# graphify update . 2>&1 | tail -5  # run after code diff lands (P2 design has 0 code, so skip now)
```

### 5.2 Gate → Diff 매핑 (P2가 닫는 gate)

| Gate | Diff가 닫는 것 | 증거 |
|---|---|---|
| G-L1 No scraping | `#sources`가 Investing CSV=정본임을 문서화, 코드에서 fetch 없음 유지 | `B2` + `C0` no change, `REGISTRY.md:12` |
| G-L2 Yahoo only | `#sources` + provenance `home.tsx:283-296`가 `CL=F` 단일임을 고지 | `A0` no change, `REGISTRY.md:9`, `config.py:5` |
| G-L3 License | `#history` trace가 `REGISTRY.md` 라이선스 칸으로 연결 | `B1` + `B2`, `REGISTRY.md:7` |
| G-L4 Look-ahead | `#history` check table + `#sources` delay 칸이 같은 봉 미래 사용 금지 고지 | `B1` (`_TEMPLATE.md:33-42`), `REGISTRY.md:7` |
| G-Q1 Frozen dates | Distribution Σ=52 + IS 2015-2023 경계가 두 route에서 일치 | `B3` no change, `config.py:10-12` |
| G-Q2 No OOS tuning | Method 5 steps + `LOOKAHEAD_GUARD` + `/backtest` 308 유지 | `B3` no change, `local-backtest-guide.ts:6-8` |
| G-Q3 Mechanism | `#history`가 크립토×뉴스 둘 다 없으면 행 없음 → 폐기를 시각화 | `B1`, `pizza-hunt.md:22-24`, `INTAKE.md:99` |
| G-Q4 Reproducible | Provenance SHA/rowCount + `python -m ls_crude.build` 고지 | `A0` `home.tsx:293-296`, `docs/research-design.md:75-82` |
| G-E1 No fabrication | Ledger 6 rows r literal, Sharpe 없음, 신규 수치 금지 | `B3` no change, `INTAKE.md:30,92` |
| G-E2 Chain intact | `#history`가 dump→note→sources→pizza-hunt→000 chain을 링크로 보존 | `B1`, `INTAKE.md:14-24` |
| G-E3 Empty = evidence | `#history`가 빈 `pizza-hunt.md:22-24`를 버그가 아니라 증거로 렌더 | `B1`, `INTAKE.md:66-67` |
| G-E4 Note checks | `#history`가 `_TEMPLATE.md:33-42` 8-row check를 참조 | `B1`, `INTAKE.md:81-93` |
| G-E5 No silent delete | 17 기각·16 보류 `research.tsx:88-96` 유지, 드롭 이동 금지 | `B3` no change, `INTAKE.md:101` |

P2 Gate **OPEN** iff Legal 4 PASS + Quality 4 PASS + Evidence 5 PASS — 1 FAIL = 차단, 노트에 사유 한 줄 추가 후 재검 (`nexus-p1-gate-checklist.md:254`).

### 5.3 이 문서의 닫힘 조건

- `docs/superpowers/plans/nexus-p2-architecture.md` 1파일 생성, `git status`에서 `nexus-p1-*` 4파일 unchanged.
- `app/` 코드 diff 0 — 설계만, 구현은 다음 PR (P2-impl).
- `ls -l` 1줄이 증거 (아래 §6).

---

## 6. Provenance

모든 `path:line`은 로컬 파일을 직접 읽어 검증했다. 추정은 «모름»으로 표기하며, 외부 검색·스크래핑·성과 숫자 생성은 하지 않았다.

- Narrative/IA/Scope/Gate 4문서: `docs/superpowers/plans/nexus-p1-*.md` (2026-09-04, 75/124/177/264 lines)
- App routes: `app/app/routes/home.tsx:10-11,28-57,68-105,170-183,190-435` + `app/app/routes/research.tsx:8-10,27-105,122-135,149-258`
- Lib: `app/app/lib/market-snapshot.server.ts:26-59` + `app/app/lib/snapshot.server.ts:56-67` + `app/app/lib/types.ts:2-196` + `app/app/components/desk-chrome.tsx:42-53` + `app/app/components/watch-gauge.tsx:38-171` + `app/app/routes.ts:3-6`
- Research contract: `research/INTAKE.md:14-24,28-30,81-93` + `research/gathering/notes/_TEMPLATE.md:1-46` + `research/gathering/sources/REGISTRY.md:7-71` + `research/notebooks/pizza-hunt.md:22-24` + `docs/experiments/000-oil-slice-draft.md:1-28`
- Snapshots: `app/public/wti-market-snapshot.json:2-17` freshnessPolicy + `app/public/baseline-snapshot.json:3-6` in_sample
- Build: `docs/research-design.md:25-30,36-48,75-82` + `research/src/ls_crude/config.py:5,10-12` + `AGENTS.md:23-25`

---

**귀결:** P2는 코드가 아니라 **diff 계약**이다 — `research.tsx`에 2개 hash 섹션, `desk-chrome.tsx`에 1개 hash 링크, `home.tsx`·`watch-gauge.tsx`·`market-snapshot.server.ts`·`snapshot.server.ts`는 그대로. 통과 0은 실패가 아니라 통제 — 다음 후보는 동결된 규칙으로 미래 구간에서만 검증한다 (`research.tsx:237-239`).

