# A/B 방향안 — Arena식 고도화 설계 (001)

- **정본**: `docs/design/PLAN.md` (모순 시 PLAN 우선)
- **상태**: 설계 문서. 코드 수정 없음.
- **범위**: `/` 홈, `/research` 연구 장부. 새 라우트·새 페이지 없음. 다크 테마 유지.
- **읽은 근거**: `docs/design/PLAN.md`, `app/app/routes/home.tsx`, `app/app/routes/research.tsx`,
  `app/app/components/` (`desk-chrome.tsx`, `hub-card.tsx`, `news-desk.tsx`, `watch-gauge.tsx`, `ui/`),
  `docs/ui-design-oil-pulse.md`, `app/public/wti-market-snapshot.json`,
  `app/app/lib/defcon-sample.ts`, `app/app/lib/gauge.ts`, `app/public/baseline-snapshot.json`(선두 60행만 확인)
- **라이브 진실**(메인 ego-browser 실측, 그대로 수용): 다크 테마. 홈 좌측 WTI 종가 91.48 +
  60봉 차트 + 지표 4칸(rv5·백분위·기준일·마지막확인) + 방법 expander, 우측 원유 DEFCON 예시 게이지 58.
  하단 피자 질문 헤드라인, 연구 장부 테이블(52 후보·통과 0, 판정 4종), 최근 기록 3건, 연구 방법 5단계.

## 0. 데이터 계약 (양 안 공통, 전부 실값 바인딩)

`app/public/wti-market-snapshot.json` 실측 필드 (스냅샷 생성 2026-09-06T01:40:54Z):

| 필드 | 실값 예시 | 용도 |
|---|---|---|
| `ticker` / `interval` | `CL=F` / `1d` | 헤더·축 라벨 |
| `bars[{date,open,high,low,close,volume}]` | 60봉, `2026-06-11`→`2026-09-04`, 마지막 close **91.48** | 차트·파형·범위 전환의 유일한 시계열원 |
| `asOf` / `checkedAt` | `2026-09-04` / `2026-09-06T01:40:54Z` | 지표 4칸 중 기준일·마지막확인(KST 변환 표시) |
| `source.{provider,library,autoAdjust}` | Yahoo Finance / yfinance / true | 출처 expander |
| `volatility.{method,formula,annualization}` | simple-return-rms / `100 × sqrt((252 / N) × sum(r_t²))` / 252 | 산식 expander |
| `volatility.rv5AnnualizedPct` | 42.57 | 지표 토글 |
| `volatility.rv20AnnualizedPct` | 36.02 | 지표 토글·expander 보조(현 홈 expander에 이미 노출) |
| `volatility.rv5ReferencePercentile` | 73.11 | 지표 토글·게이지 바늘의 유일한 정합 입력 |
| `volatility.{referenceStart,referenceEnd,referenceWindowCount}` | 2015-01-01 / 2023-12-31 / 2257 | 기준 분포 라벨 |
| `provenance.{firstDate,lastDate,rowCount,contentSha256,contentSha256Scope}` | 2015-01-02 / 2026-09-04 / 2936 / `43a4e8cd…` / all-completed-bars | 검증 expander (앞 12자리 + 행수) |
| `freshnessPolicy.{maxCheckAgeHours,maxBarAgeDays}` | 36 / 4 | 신선도 판정 근거 |
| `status` | `ok` | 빈 상태 분기 |

연구 장부 하드코딩원 (`app/app/routes/research.tsx`, `home.tsx`):

| 원천 | 내용 |
|---|---|
| `research.tsx` `LEDGER_ROWS` | 대표 6행(철회·기각·보류·별도 전략 4종), 각 행 `{hypothesis,target,data,inSample,outSample,verdict,reason}` |
| `research.tsx` `VERDICT_COUNTS` | 판정 분포 7버킷(기각 17·보류 16·미검증 7·보관 6·분석 제외 2·관측만 3·별도 전략 1) |
| `research.tsx` `CANDIDATE_COUNT`/`PASS_COUNT` | 52 / 0 |
| `home.tsx` `RESEARCH_PREVIEW` | 대표 4행(철회·기각·보류 3종), `{hypothesis,data,inSample,outSample,verdict}` |
| `home.tsx` `RECENT_RESEARCH_LOG` | 최근 기록 3건(손성찬, 2026-09-03), 외부 GitHub 원문 링크 |
| 양 라우트 `METHOD_STEPS` | 연구 방법 5단계(가설→적격성→IS→동결→OOS 1회) |

게이지 계약 (`watch-gauge.tsx` + `lib/gauge.ts` + `lib/defcon-sample.ts`):

- `WatchGauge` props: `score/title/bandLabel/scoreCaption/explainer/detail/isExample/ariaLabel`.
- 현 홈 게이지는 **예시**: `sampleDefconScore()`가 백분위를 받아도 무시하고 항상 58 반환,
  `SAMPLE_DEFCON_TITLE`="원유 DEFCON", `isExample` 배지, "실전 신호가 아닙니다."
- 실값 게이지 입력 후보: `volatility.rv5ReferencePercentile` → `volatilityBand()` (안정 <25 / 보통 <50 / 고조 <75 / 급변).
  현 `GAUGE_ZONES`(stable/normal/elevated/extreme) 경계는 기하학 상수이며 의미 역치로 사용하지 않는다 — 바늘은 위치 표시, 밴드 판정은 `volatilityBand()` 텍스트가 정본 (동결).

금지 재확인 (PLAN OUT): `/backtest`·웹 백테스트 실행, 미검증 신호의 게이지 혼합,
라이트테마·신규 페이지·실시간 소켓·알림, 샤프·MDD·적중률 등 성과 숫자 생성,
`useLoaderData`/`useActionData`, 하드코딩 데모 수치, `docs/experiments/` 작성,
pizza-hunt·INTAKE·REGISTRY 수정. B안 원문(`docs/ui-design-oil-pulse.md`)의
$72.45·STRONG LONG 82/100·팩터 85% 등은 **데모 수치로 채택 금지** — 전부 아래 매핑표 필드로 대체한다.
B안 원문의 WebSocket/SSE·알림·라이트테마·내보내기·Pulse Speed/Sensitivity 슬라이더·1D/1W/1M/3M/YTD/ALL 중
스냅샷 60봉을 넘는 범위는 **범위 OUT 또는 데이터 없음**으로 marking한다 (개별 항목에 명시).

---

## A안 "관측소" — 현 구조 polish (권장: 안전·정직 우선)

### 콘셉트 (3줄 요약이기도 함)
1. 지금의 2열 데스크(좌측 관측값 + 우측 게이지)와 하단 서사(질문→장부→기록→방법) 순서를 **그대로 유지**하고 밀도·타이포·차트만 다듬는다.
2. 모든 인터랙션(P1)은 60봉 스냅샷의 **클라이언트 계산**으로 닫히며, 새 데이터·새 라우트·새 의존성이 없다.
3. 게이지는 "예시 DEFCON" 딱지를 유지하거나, 실값 백분위 게이지로 교체하되 **둘을 절대 섞지 않는다**(예시 바늘 + 실값 숫자 병기 금지).

### 레이아웃 (현 구조 유지)
- `DeskHeader` (source=`source.provider`, ticker=`ticker`, freshness) → sticky, skip-link 유지.
- Row 1 (`lg:grid-cols-2`, `max-w-[1440px]` 유지):
  - 좌: 종가 블록(hero 숫자 + 전일 대비 `bars[-1].close − bars[-2].close`, % 병기) → 60봉 sparkline →
    지표 4칸 → `<details>` 출처·산식·검증 expander → freshnessReasons.
  - 우: `WatchGauge` (현 예시 유지가 기본안; 교체안은 §A-게이지 참조).
- Row 2: 피자 질문 헤드라인 (문구 고정, 장식 추가 금지 — 발표 임팩트는 타이포 스케일로만).
- Row 3: `#ledger` 미리보기 테이블 (4행, `/research` 링크).
- Row 4: 최근 연구 기록 3건 → Row 5: 연구 방법 5단계 → `DeskFooter` (비교환 문구 유지).

### Polish 스펙 (토큰·타이포·밀도)
- 토큰: 기존 다크 토큰만 사용 (`background/border/foreground/primary/muted/card/watching/ring`).
  새 색상 도입 금지. B안 원문의 emerald/amber/red 5색 신호 팔레트(`--pulse-strong-long` 등)는 **A안에서 사용 금지**
  (신호 의미 부여 = 미검증 신호 혼합 위험). 강조는 `primary` 단일색 + 굵기·크기로만.
- 타이포: hero 종가는 현 `text-5xl/sm:text-6xl` mono tabular-nums 유지. 섹션 타이틀은 현 2단계
  (`text-2xl` 섹션 / `text-2xl sm:text-4xl` 질문 헤드라인) 유지 — 스케일 추가 금지.
- 차트: 현 SVG sparkline(`sparklinePath`, `viewBox 520×116`) 유지 + 아래 4개만:
  1. 종가 storage가 아닌 `close` 실선 + 마지막 점 도트(종가값 라벨은 hero와 중복되므로 도트만).
  2. `role="img"` + `aria-label`("최근 N개 WTI 종가 흐름") + `#price-trend-summary` 텍스트 요약 유지
     (P1 범위 전환 시 N·최저·최고·마지막을 함께 갱신 — §P1-1).
  3. 호버 크로스헤어는 **P2로 연기** (P1은 정적 완성 원칙; 키보드 동등 제공이 전제돼야 하므로).
  4. OHLC 캔들은 그리지 않는다 (60봉 일봉 + 변동성 서사에는 종가선이 충분; 캔들은 밀도만 올림).
- 밀도: `px-5 sm:px-8`, 섹션 `py-8 sm:py-10`, 카드 경계 `border-border` — 현 리듬 유지.
  모바일은 현 `evidence-table-stacked` 쌓기 패턴 재사용.

### §A-게이지 (둘 중 하나, 혼합 금지)
- **A-1 (기본, 무변경)**: 현 예시 게이지 유지 — score 58(`SAMPLE_DEFCON_SCORE`), band "DEFCON 3",
  `isExample` 배지, caption "실전 신호 아님", explainer "실전 신호가 아닙니다.",
  detail "통과한 공개 흔적이 아직 없습니다." P1·P2와 무관하게 동작 없이 유지.
- **A-2 (교체, 조건부)**: 예시 DEFCON을 걷어내고 실값 변동성 게이지로 교체 —
  `title`="WTI 변동성 위치"(신규 정의, 변동성 위치 의미의 한글 표제 — "원유 DEFCON" 어휘 사용 금지),
  `score`=`volatility.rv5ReferencePercentile`(73.11), `bandLabel`=`volatilityBand()` 결과(현 값이면 "고조"),
  `scoreCaption`="5일 실현변동성 기준 백분위", `explainer`="장기 기준 분포 대비 현재 위치입니다. 방향 신호가 아닙니다.",
  `detail`=`referenceStart–referenceEnd · N개 창 · rv5 X% / rv20 Y%`, `isExample`=false,
  `ariaLabel`=`${title} ${score}, ${band}` 고정(예: "WTI 변동성 위치 73, 고조").
  존↔밴드 정합 동결: `GAUGE_ZONES` 존은 바늘 위치 표시용이며, 밴드 판정은 `volatilityBand()` 텍스트가 정본이다.
  A-1/A-2 택일은 사용자 채택 시 1회 결정.

### 재사용 컴포넌트
`desk-chrome` (그대로) · `watch-gauge` (props만 교체, 기하학 불변) · `ui/badge` (판정·딱지) ·
`ui/button` + 네이티브 `<details>` (expander·토글, `news-desk.tsx`의 접힘 패턴 선례) ·
`hub-card` (지표 4칸의 카드화 선택지 — §P1-2). `news-desk`의 Supabase 쓰기 폼은 홈에 이식 금지.

---

## B안 "Oil Pulse" — 파형 + 게이지 전면 (발표 임팩트 우선, 정직 가드레일 포함)

### 콘셉트 (3줄 요약이기도 함)
1. 홈 Row 1을 파형 스테이지로 교체한다: B안 원문 Option D(색=방향·위치=강도·속도=모멘텀)를 빌리되,
   **방향·강도·모멘텀에 검증된 데이터원이 없으므로 파형은 `bars[].close` 실형을 그대로 그리고 색·라벨만 백분위 밴드로 제한**한다.
2. 팩터 바(원문 85%·72% 등)는 스냅샷에 원천이 없어 **실값 바를 그리지 않는다** — P2 드릴다운은 장부 행(검증 기록)으로만 연결한다.
3. 원문의 실시간·알림·슬라이더·라이트테마·내보내기는 전부 OUT — B안의 살리는 것은 **파형 스테이지 + 밴드 라벨 + 장부 연결**뿐이다.

### 레이아웃 (Row 1 교체, Row 2 이하 유지)
- `DeskHeader`·Row 2 이하(질문→장부→기록→방법→푸터)는 A안과 동일.
- Row 1 전면 (`lg:grid-cols-2` 유지, 내용만 교체):
  - 좌(스테이지): 헤더(`OIL PULSE` 대신 **"WTI Pulse — 관측 파형"**; 이모지·"부엌" 카피 사용 금지 —
    발표 톤과 데이터 정직성에 어긋남) → 현재가(`bars[-1].close` 91.48 + 전일 대비) →
    밴드 라벨(`volatilityBand(rv5ReferencePercentile)`, 예: 고조) → 파형 SVG → 시간축(`bars[].date`) →
    P1 범위 전환 + P1 지표 토글.
  - 우: `WatchGauge` 실값안(A-2와 동일 바인딩) + 밴드 설명 + "방향 신호가 아닙니다" 고정 문구 +
    `/research` 연결("왜 방향이 아닌가 → 장부").

### 파형 스펙 (정직 버전 Option D)
- 경로: `bars[].close`를 선택 범위 N개로 잘라 min-max 정규화한 실형 꺾은선. 정현파 합성·진폭 과장 금지.
  합성파가 필요해 보이는 구간은 **그리지 않는 것으로** 해결한다.
- 색: 방향 신호가 아니라 변동성 위치이므로 5색이 아닌 **단일 `primary` 실선** + 밴드 텍스트.
  원문 `--pulse-strong-long` 5색 팔레트·이모지 신호등(🟢🔵🟡🔴)·"STRONG LONG 82/100" 숫자 표기는 **채택 금지**
  (신뢰도 0–100의 원천이 없음 — «모름»).
- 속도(모멘텀): 실시간 애니메이션 대신 **정적 draw-once** (stroke-dashoffset 1회 또는 없음).
  무한 `pulse-beat`·`pulse-draw infinite`는 금지 — 일봉 데이터에 과함 + `prefers-reduced-motion` 위반 소지.
  모션은 `prefers-reduced-motion: reduce`에서 완전 정지, 그 외에도 1회 500ms 이하.
- 숫자 표기: 파형 옆에 붙는 숫자는 `close`·`rv5AnnualizedPct`·`rv20AnnualizedPct`·`rv5ReferencePercentile`만.
  confidence/momentum/BPM/진폭 px 같은 파생 숫자는 원천이 없어 표기 금지 («모름»).
- 접근성: 파형은 `role="img"` + 선택 범위·최저·최고·마지막을 읽는 텍스트 요약(현 `#price-trend-summary` 확장).
  색만으로 밴드를 전달하지 않고 텍스트 라벨 병기.

### 팩터 드릴다운 자리 (P2, 실값 없음 선언)
- 원문 팩터 6종(Oil Slice·Whale·Truth Social·Wholesale-Logistics·Renewable·Financial ML)은
  스냅샷·장부에 기여도 필드가 없어 **B안에서도 바 길이를 그리지 않는다**.
- 대신 "팩터" 자리는 **장부 행 드릴다운**으로 대체: 가설 카드 클릭 → 해당 `LEDGER_ROWS` 행의
  `{target,data,inSample,outSample,verdict,reason}` + (후보일 경우) "연구 후보·예시" 배지.
  후보 기여도 %·순위·점수는 전부 «모름»으로 표기 금지.

### B안에서 버리는 것 (원문 대비 삭제 목록)
실시간 업데이트(WebSocket/SSE/폴링)·알림·Pulse Speed/Sensitivity 슬라이더·1D/1W/1M/3M/YTD/ALL 중
60봉 초과 범위·다크/라이트 전환·PNG/SVG/CSV 내보내기·이모지 신호 라벨·합성 정현파·무한 박동 애니메이션·
D3/Recharts/Visx/Framer Motion 등 새 의존성. P1 범위 전환은 §P1-1의 스냅샷 내 범위로만.

---

## A/B 비교표

| 축 | A안 "관측소" | B안 "Oil Pulse" |
|---|---|---|
| 첫인상 | 수치·표·게이지의 데스크. 발표 임팩트는 타이포와 여백으로 | 파형 스테이지 전면. 발표 임팩트는 파형으로 |
| 차트 | 현 sparkline polish (종가선 + 마지막 도트) | 동일 `bars[].close` 실형 파형, 크게. 합성파 금지 |
| 게이지 | A-1 예시 유지(기본) 또는 A-2 실값 교체, 혼합 금지 | A-2 실값 고정 + "방향 아님" 문구 + 장부 연결 |
| 색 | `primary` 단일 강조 유지 | 파형도 단일 `primary`. 원문 5색 팔레트 불채택 |
| 모션 | 없음(현 상태) | draw-once 1회 이하 + reduced-motion 정지 |
| P1 비용 | 최소(현 컴포넌트 props·상태만) | 중간(Row 1 교체, 동일 데이터원) |
| P2 연결 | 팩터 없이 장부 테이블로 직접 | 파형↔장부 행 드릴다운(기여도 % 없이) |
| 정직 리스크 | 낮음(현 고지 구조 유지) | 중간(파형이 신호처럼 보일 수 있어 문구 가드 필수) |
| 접근성 | 현 패턴 확장(`details`·테이블·게이지 aria) | 파형 요약 텍스트·모션 정지가 추가 조건 |
| 추천 용도 | 데이터 정직성을 최우선으로 증명할 때 | 발표 임팩트가 필요하되 문구 가드를 지킬 때 |

---

## P1 스펙 (정적 데이터로 완성, 새 의존성 없음)

공통: 전부 클라이언트 상태(`useState` 수준, 새 라우트·소켓 없음). `useLoaderData`/`useActionData` 사용 금지(AGENTS.md).
모든 라벨 숫자는 아래 데이터원 표의 필드에서만. 해당 범위·값이 없으면 "데이터 없음" 표시(합성 금지).
키보드: 전 컨트롤 네이티브 요소(`button`·`select`·`details`) + `:focus-visible` 유지. `aria-pressed`(토글)·
`aria-sort`(정렬)·`aria-expanded`(expander, 네이티브 `details`는 자동).

### P1-1 시간 범위 전환 (홈 차트; A·B 공통)
- 위치: 차트/파형 상단 "최근 완료 일봉 N개" 라벨 옆 세그먼트 컨트롤.
- 선택지(60봉 스냅샷 안에서만): **20봉 / 40봉 / 60봉** (라벨에 날짜 범위 병기, 예: "20봉 · 08-06→09-04").
  원문 1D/1W/1M/3M/YTD/ALL은 60봉 초과·시간足 미지원으로 **불채택**.
- 동작: `bars.slice(-N)` → 종가선·요약(최저·최고·마지막)·시간축 재계산. 전일 대비는 범위와 무관하게
  항상 `bars[-1]` vs `bars[-2]`(전체 스냅샷 기준)로 고정하고 라벨에 "전일 대비(전체 기준)" 명시.
- 데이터원: `bars[].date`, `bars[].close` (축·요약에 `bars[].open/high/low/volume` 병기 선택지 — 캔들 전환은 P2로 연기).
- 빈 상태: N > `bars.length`이면 컨트롤 비활성화 + "스냅샷 60봉 범위를 넘을 수 없습니다".
- a11y: `role="group" aria-label="차트 표시 범위"`, 선택 버튼 `aria-pressed`.

### P1-2 지표 토글 rv5 / rv20 / 백분위 (홈 지표 4칸; A·B 공통)
- 위치: 현 4칸(`5일 실현변동성`·`장기 기준 백분위`·`기준일`·`마지막 확인`) 블록.
- 동작: 토글 3종 — `rv5AnnualizedPct`(42.6%) ↔ `rv20AnnualizedPct`(36.0%)를 주지표 슬롯에 전환,
  `rv5ReferencePercentile`(73.1)을 백분위 슬롯에 표시/숨김. 기준일(`asOf`)·마지막 확인(`checkedAt` KST)은 고정(토글 대상 아님).
- 카드화 선택지: 슬롯을 `hub-card`로 감싸 `kicker`(예: "RV·5D") + `title`(값) + 보조줄(산식·기준)로.
  `hub-card`의 `interactive/disabled` 남용 금지(토글 자체가 버튼 역할).
- 데이터원: `volatility.rv5AnnualizedPct`, `volatility.rv20AnnualizedPct`,
  `volatility.rv5ReferencePercentile`, 라벨용 `volatility.{formula,annualization,referenceStart,referenceEnd,referenceWindowCount}`,
  `asOf`, `checkedAt`.
- a11y: 토글 `aria-pressed` + 값 변경을 `aria-live="polite"` 한 곳에서만 알림(4칸 전체 live 금지).

### P1-3 방법 expander (홈; A·B 공통, 현 `<details>` 확장)
- 위치·형식: 현 "관측 출처·산식·검증" `<details>` 유지, 행만 추가. `news-desk.tsx`의 접힘 문법이 선례.
- 행(전부 실값): 출처(`source.provider`·`ticker`·`interval`·자동조정 `source.autoAdjust`·라이브러리 `source.library`) /
  산식(`volatility.method`·`volatility.formula`·연환산 `volatility.annualization`일 + "CL=F 롤 갭 포함 가능" 고정 주의) /
  기준 분포(`referenceStart–referenceEnd`·`referenceWindowCount`개 창) /
  검증(전체 완료봉 `provenance.rowCount`행 · SHA-256 `provenance.contentSha256` 앞 12자리… · 범위 `provenance.firstDate–lastDate`) /
  신선도(`freshnessPolicy.maxCheckAgeHours`h·`maxBarAgeDays`d + freshnessReasons).
- `baseline-snapshot.json` 언급은 expander에 넣지 않는다 (보조 스냅샷이며 홈 주장과 무관 — 혼선 방지).
- a11y: 네이티브 `<details><summary>` (키보드·스크린리더 기본 지원), `summary`는 `cursor-pointer` + focus-visible.

### P1-4 장부 테이블 정렬·필터 (`/research` + 홈 미리보기; A·B 공통)
- 대상: `research.tsx` 대표 6행 테이블 + `VERDICT_COUNTS` 분포 + 홈 4행 미리보기(정렬 없이 유지, "대표 4행" 라벨).
- 정렬: 열 `가설·목표·데이터·IS·OOS·판정` 중 정렬 가능은 **가설(문자)·IS·OOS(수치, "—"는 항상 끝)·판정(판정 순서 동결: 별도 전략·보류·기각·철회 — PLAN Q3 확정)**.
  목표·데이터·판정 이유는 정렬 대상 아님(서술형). 헤더 `button` + `aria-sort`.
- IS/OOS 파싱: `"r=-0.003"` → 부호·소수 보존 수치 파싱, `"—"`는 null 취급(정렬 끝·필터 무관).
- 필터: 판정 4종 체크박스(철회·기각·보류·별도 전략) + 텍스트 검색(가설·데이터 대상, 대소문자 무시).
  `VERDICT_COUNTS` 7버킷은 필터와 무관한 전체 분포로 유지(혼선 방지 문구: "분포는 전체 52개, 표는 대표 6행").
- "미검증·보류는 성과로 세지 않음" 문구 유지. 후보 행에는 "연구 후보·예시" 배지(`ui/badge` outline).
- 데이터원: `LEDGER_ROWS[]` 전 필드 + `VERDICT_COUNTS` + `CANDIDATE_COUNT`/`PASS_COUNT`(헤더 카운트).
  52개 전행 데이터원은 스냅샷·라우트에 없음 — «모름»(전행 테이블 설계 불가, PLAN Q1: 대표 6행 기준 확정).
- a11y: 결과 건수 `aria-live="polite"` ("6행 중 2행 표시"), 필터 `fieldset`+`legend`, 빈 결과 행("조건에 맞는 행이 없습니다").

---

## P2 스펙 (설계 후, 구현은 채택안 확정 뒤)

### P2-1 파형 (B안 전용; A안은 불채택)
- 입력: P1-1의 선택 범위 N의 `bars[].{date,close}`. P1과 동일 파서 재사용.
- 렌더: 실형 꺾은선 + 시간축(첫·중간·마지막 `date`) + 요약 텍스트(P1-1 확장). 정현파·진폭 과장·BPM·신뢰도 숫자 금지.
- 밴드 연결: 선 색 단일 `primary`, 밴드는 `volatilityBand(rv5ReferencePercentile)` 텍스트로만.
  게이지 존 색상(`GAUGE_ZONES` 4존 명도 단계)은 파형에 이식 금지(동결: 바늘은 위치 표시, 밴드 텍스트가 정본 — §A-게이지).
- 모션: draw-once ≤500ms 1회 + `prefers-reduced-motion` 정지. 무한 애니·박동 도트 금지.
- OUT: 실시간 스트리밍·소켓·폴링·알림·속도/민감도 슬라이더(원천 없음).

### P2-2 팩터 드릴다운 (A·B 공통 위치: 장부; B안은 파형에서도 진입)
- 진입점: 장부 행(가설명 버튼) 또는 B안 파형 하단 "이 위치의 근거 행" 링크 → 행 상세 영역(새 페이지 아님, 같은 화면 확장).
- 내용: 해당 `LEDGER_ROWS` 행의 `{hypothesis,target,data,inSample,outSample,verdict,reason}` 전문 +
  "연구 후보·예시" 배지(후보인 경우) + GitHub 원문 링크(홈 최근기록 패턴 재사용).
- 기여도 %·순위·추세 화살표(📈📉)는 원천이 없어 **표시 금지**. `baseline-snapshot.json`의
  `slice_score`·`slice_z`·`hormuz_count`·`inflation_count`는 미검증 후보 지표이므로 게이지·파형에 혼합 금지,
  드릴다운 안에서 "연구 후보·예시" 배지와 함께만 언급 가능(수치 인용 시 필드명 병기).
- 데이터원: `LEDGER_ROWS[]` 전 필드. 후보별 기여도 필드는 «모름»(스냅샷·장부에 없음).

---

## P1·P2 전체 데이터원 매핑표 (구현 전 체크리스트)

| 항목 | 화면 | 데이터원 (필드명 수준) | 비고 |
|---|---|---|---|
| P1-1 범위 20/40/60봉 | 홈 차트·파형 | `bars[].date`, `bars[].close` | `slice(-N)`. 전일 대비는 `bars[-1]–bars[-2]` 고정 |
| P1-1 범위 라벨 | 홈 차트 | `bars[].date` (첫·끝), `bars.length` | N>`bars.length` 비활성화 |
| P1-1 요약(최저·최고·마지막) | 홈 차트 | `bars[].close` (선택 범위) | `formatNumber` 2자리 유지 |
| P1-2 주지표 rv5↔rv20 | 홈 지표칸 | `volatility.rv5AnnualizedPct`, `volatility.rv20AnnualizedPct` | 소수 1자리(현 포맷 유지) |
| P1-2 백분위 표시/숨김 | 홈 지표칸 | `volatility.rv5ReferencePercentile` | 소수 0자리(현 포맷 유지) |
| P1-2 라벨(산식·기준) | 홈 지표칸 | `volatility.{formula,annualization,referenceStart,referenceEnd,referenceWindowCount}` | — |
| P1-2 고정칸 | 홈 지표칸 | `asOf`, `checkedAt`(KST 변환) | 토글 대상 아님 |
| P1-3 출처 행 | 홈 expander | `source.{provider,library,autoAdjust}`, `ticker`, `interval` | — |
| P1-3 산식 행 | 홈 expander | `volatility.{method,formula,annualization}` + 롤 갭 고정 주의 | — |
| P1-3 기준 행 | 홈 expander | `volatility.{referenceStart,referenceEnd,referenceWindowCount}` | — |
| P1-3 검증 행 | 홈 expander | `provenance.{rowCount,contentSha256,firstDate,lastDate}` | SHA 앞 12자리 |
| P1-3 신선도 행 | 홈 expander | `freshnessPolicy.{maxCheckAgeHours,maxBarAgeDays}`, `status` | freshnessReasons와 병기 |
| P1-4 정렬(가설·IS·OOS·판정) | 연구 장부 | `LEDGER_ROWS[].{hypothesis,inSample,outSample,verdict}` | "—" null 취급 |
| P1-4 필터(판정·검색) | 연구 장부 | `LEDGER_ROWS[].{verdict,hypothesis,data}` | 판정 4종 |
| P1-4 분포·카운트 | 연구 장부 | `VERDICT_COUNTS`, `CANDIDATE_COUNT`, `PASS_COUNT` | 필터와 무관한 전체값 |
| P1-4 홈 미리보기 | 홈 장부 | `home.tsx` `RESEARCH_PREVIEW[]` | 정렬 없음, 대표 4행 |
| P2-1 파형 경로·축 | 홈(B) | `bars[].{date,close}` (P1-1 선택 범위) | 합성파 금지 |
| P2-1 밴드 라벨 | 홈(B) | `volatility.rv5ReferencePercentile` → `volatilityBand()` | 색 5색 금지, 텍스트만 |
| P2-2 행 상세 | 장부·파형 | `LEDGER_ROWS[].{hypothesis,target,data,inSample,outSample,verdict,reason}` | 새 페이지 없음 |
| P2-2 후보 배지 | 장부·파형 | (상수 문구) "연구 후보·예시" + `ui/badge` | 수치 아님 |
| 게이지(A-1) | 홈 우측 | `SAMPLE_DEFCON_*` 상수, `sampleDefconScore()` | 예시, 백분위 무시(현 동작) |
| 게이지(A-2·B) | 홈 우측 | `volatility.rv5ReferencePercentile`, `volatility.{rv5AnnualizedPct,rv20AnnualizedPct,referenceStart,referenceEnd,referenceWindowCount}`, `title` 상수 "WTI 변동성 위치", `ariaLabel` `${title} ${score}, ${band}` | `isExample`=false, 방향 문구 금지 |
| 사용 불가(«모름») | 파형·팩터 | 방향·신뢰도 0–100·모멘텀·BPM·팩터 기여도%·52개 전행·존↔밴드 역치 정의 | 결정 확정 박스 참조, 합성 금지 |

---

## 접근성 계약 (WCAG 2.2 AA, 양 안 공통 — ⑤ 감사 전제)

- 대비: 다크 테마 현 토큰 유지(신규 저대비 색 금지). 파형·게이지는 색 단독 전달 금지(밴드 텍스트·수치 병기).
- 키보드: 범위·토글·정렬·필터·expander 전부 네이티브 요소. `skip-link`→`#main-content` 유지. focus-visible 링 유지.
- 스크린리더: 게이지 `aria-label`=`${title} ${score}, ${band}` 고정(A-2·B의 `title`은 "WTI 변동성 위치"). 차트·파형 `role="img"` + 텍스트 요약.
  토글 `aria-pressed`, 정렬 `aria-sort`, 결과 건수 `aria-live="polite"`(과도 live 금지).
- 모션: `prefers-reduced-motion: reduce`에서 파형·게이지 모션 완전 정지. 무한 애니메이션 없음.
- 터치: 컨트롤 최소 44px. 테이블은 `evidence-table-stacked` 모바일 쌓기 재사용.
- 텍스트 확대 200%: `max-w-[1440px]` + 유동 그리드 유지, 고정 px 높이 금지(차트는 viewBox 스케일).

---

## 결정 확정 (PLAN 결정 기록 반영 — 닫힘, 추가 질문 없음)

- **Q1 (대표 6행 기준)**: P1-4 정렬·필터는 대표 6행(`LEDGER_ROWS`) 기준. 52개 전행 노출은 별도 과제 — 전행 데이터원 «모름» 유지.
- **Q2 (변형별 라벨 + 지시 1·2 정합)**: A-1은 "DEFCON 3"·예시 딱지 유지. A-2·B는 한글 밴드(안정·보통·고조·급변) + `title` "WTI 변동성 위치" + `ariaLabel` `${title} ${score}, ${band}` 고정 + 동결 선언(바늘은 위치 표시, 밴드 텍스트가 정본).
- **Q3 (순서 + 문구 유지)**: 판정 정렬 순서 동결 — 별도 전략·보류·기각·철회. "미검증·보류는 성과로 세지 않음" 문구 유지.
