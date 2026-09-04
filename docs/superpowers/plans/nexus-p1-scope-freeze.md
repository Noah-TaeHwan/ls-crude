# Nexus P1 — Scope Freeze (History Dashboard)

Date: 2026-09-04 · Status: P1 scope freeze · Owner: Senior PM + Sprint Prioritizer
Model: opencode/muse-spark-1.2-contributor-free variant xhigh (verified via `app/opencode.json` + `opencode model` — previous `vault-nightly` retry corrected)

> **한 줄 결정:** P1은 새 데이터·새 팩터·새 시그널 없이, **52→0 장부가 어떻게 났는지**를 외부인이 코드 없이 이해하는 history dashboard만 만든다.

---

## 0. 읽은 것 (9 checks 출처 고정)

- `app/app/routes/home.tsx:10-11,27-105,154-183,190-435` — `CANDIDATE_COUNT=52`, `PASS_COUNT=0`, 4행 preview, 3개 recent log, 5단계 method, read-only loader/action, volatility/RV5/sparkline provenance
- `app/app/routes/research.tsx:8-10,27-96,99-134,142-295` — 52/0 상수, 6행 ledger, `VERDICT_COUNTS` 7버킷 합=52, 5단계 검증 절차, 읽기 전용 경계
- `app/app/routes/backtest.tsx:8-18,24-31,47-68` — `/backtest → 308 /research`, action 400 refusal, "백테스트는 로컬에서 진행"
- `app/app/lib/snapshot.server.ts:1-67` — `baseline-snapshot.json` → `DailyFeatureRow`/`NewsEventRow` 정규화, in-only tail 180/40
- `app/app/lib/types.ts:2-42,44-196` — `DailyFeatureRow`/`BaselineSnapshot`, `WtiMarketSnapshot` provenance+freshness contract, `isWtiMarketSnapshot` 20+ 검증
- `app/app/lib/market-snapshot.server.ts:26-59` — `readWtiMarketSnapshot(now)` fresh/stale/unavailable, `freshnessPolicy` 2-bucket
- `app/app/lib/gauge.ts:2-21,138-142` — `GAUGE_ZONES` 4구간, `volatilityBand` stable/normal/elevated/extreme
- `app/app/lib/local-backtest-guide.ts:2-48` — `LOOKAHEAD_GUARD`, `LOCAL_BACKTEST_STEPS` 6카드 (Cursor→venv→pytest→seed→date,value→IS-only)
- `app/app/lib/price-seed.server.ts:5-15,28-31,72-83` — `CLF_SEED_RELATIVE_PATH=research/data/clf-daily-2015-2026.csv`, `CLF_TICKER=CL=F`, columns `date/Open/High/Low/Close/Volume/sample`, IS `2015-01-01~2023-12-31` / OOS `2024-01-01~`
- `app/app/lib/cn.ts:1-6`, `app/app/lib/supabase.server.ts:1-16` — 유틸/서버 경계 확인 (P1에서 신규 사용 없음)
- `docs/project-plan.md:8-75` — 2026.09.01-15, 역할(오태환 데이터·피처·대시보드 / 손성찬 전략·ML·백테스트), 4대 목표, Yahoo `CL=F`+RSI+Slice+walk-forward 1회
- `docs/context.md:19-32` — `2*hormuz+1*inflation` 20d z, IS 2015-2023 OOS 2024-, Slice=초안(비교군), crypto map=메커니즘 없어 기각, 빈 후보표가 증거
- `docs/research-design.md:25-82` — 가격/뉴스/Slice/RSI/실행 고정 (야후만, Investing CSV만, Slice z, RSI 30/70, `python -m ls_crude.build`)
- `research/INTAKE.md:5-105` — 타깃=야후 `CL=F` 선물, **9 checks** 81-93, 덤프→노트→후보표→실험 한 장, 아웃샘플 1회·숫자 지어내기 금지·메커니즘 없으면 폐기
- `research/notebooks/pizza-hunt.md:4,22-34` — 상태 `001-052·통과 0`, 후보 칸 **비어 있음**, IMF PortWatch/Wiki는 축이지 후보 아님
- `research/gathering/sources/REGISTRY.md:8-71` — Yahoo/Investing/FRED/IMF/… 30+ 출처 지연·look-ahead·라이선스 등록부
- `graphify-out/GRAPH_REPORT.md:3-15,220-230` — corpus 281 files · 111k words · 2023 nodes · 2415 edges · 0 inferred fresh (commit `9368131f`) — 새 코드 없이 기존 노드 재사용 판단의 근거

---

## 1. IN vs OUT — P1에서 선을 긋는다

### IN (history dashboard가 52→0 trace를 이해시키는 데 필요한 것만)

- 기존 `home.tsx`/`research.tsx`가 이미 보여주는 것의 **가독성·추적성** 개선: 52 분포, 6 대표행, 5단계 절차, WTI 관측 provenance가 한 화면에서 연결되는지
- `snapshot.server.ts`/`types.ts`/`market-snapshot.server.ts`가 보증하는 **in-sample-only, 읽기 전용, 신선도** 계약을 문장과 라벨로 드러내기
- `local-backtest-guide.ts:6-8`의 `LOOKAHEAD_GUARD`("신호는 그날 알고, 손익은 다음날 CL")와 IS/OOS 경계를 카피에서 반복
- `research/INTAKE.md:14-24`의 덤프→노트→후보표→실험 한 장 흐름을 링크로만 참조 (새 수집 없음)

### OUT (P1에서 하지 않는 것 — 다음 스코프의 유혹 차단)

- **새 팩터/새 데이터 파이프라인 없음** — `research/notebooks/pizza-hunt.md:22-24`가 비어 있음이 정상. crypto map을 메인 신호로 올리지 않음 (`docs/context.md:27`, `research/INTAKE.md:99,16`)
- **검증 안 된 Sharpe/MDD/적중률 없음** — `research/INTAKE.md:30,92` "숫자를 지어 내지 않음" 위반. 웹에 성과 차트·숫자 추가 금지
- **OOS 재사용 없음** — `research/INTAKE.md:29,91` / `docs/research-design.md:30` / `research.tsx:238-239` "OOS는 한 번만" 위반 시 즉시 폐기
- **신규 백테스트 엔진 없음** — `app/app/routes/backtest.tsx:16`은 308 유지, 실행은 `research/src/ls_crude/models` + `backtest` 로컬에서만 (`app/app/lib/local-backtest-guide.ts:2`)
- **Investing.com 스크래핑·가격 스크래핑 없음** — `research/INTAKE.md:28,87` / `docs/research-design.md:36`
- **새 의존성·Supabase auth·차트 라이브러리 없음** — graphify 2023 nodes 재사용, 신규 edge 추가 금지

---

## 2. Scope Table S1–S8 — INTAKE 9 checks에 묶기

> 9 checks 재고: `research/INTAKE.md:81-93` — 타깃 / 가격 / 뉴스 / 라이선스 / look-ahead / 인샘플 / 아웃샘플 / 숫자 / 메커니즘

| ID | Scope | INTAKE check | 증거 path | Done (한 문장) | OUT 가드 |
|---|---|---|---|---|---|
| **S1** | **Market Observation 읽기 전용** — WTI CL=F 관측·변동성·신선도 고지 | 타깃·가격·look-ahead | `app/app/routes/home.tsx:190-302` `app/app/lib/market-snapshot.server.ts:26-59` `app/app/lib/types.ts:68-103,127-196` `app/app/lib/gauge.ts:15-21` | 게이지+RV5/RV20+기준일+마지막확인+provenance SHA가 fresh/stale 라벨과 함께 보이고, 쓰기 시 405 | 가격을 Yahoo 외에서 받지 않음, 당일 봉으로 신호 계산 금지 |
| **S2** | **Research Ledger 공개 장부** — 52 분포 + 6 대표행이 실패 유형을 가르침 | 인샘플·아웃샘플·숫자·메커니즘 | `app/app/routes/research.tsx:27-96` `app/app/routes/home.tsx:27-57` | 7버킷 합=52, 통과 0이 두 라우트에서 일치하고 대표행의 IS/OOS r이 기각 이유와 함께 읽힘 | 미검증·보류를 통과에 포함하지 않음 (`research.tsx:174`) |
| **S3** | **In-Sample Snapshot 경계** — 빌드 산출이 IS만 담음 | 인샘플·아웃샘플·가격·숫자 | `app/app/lib/snapshot.server.ts:56-67` `app/app/lib/price-seed.server.ts:5-15,72-83` `docs/research-design.md:25-30` | `baseline-snapshot.json` rows의 `sample=="in"`만, `max(date) ≤ 2023-12-31`, 카피가 IS 경계를 명시 | OOS 행·OOS 뉴스를 공개 스냅샷에 포함 금지 |
| **S4** | **News 정본 계약** — Investing.com CSV만, 주말 뉴스는 다음 거래일 | 뉴스·라이선스·look-ahead | `research/INTAKE.md:87` `docs/research-design.md:36-48` `research/gathering/sources/REGISTRY.md:12-13` `app/app/lib/snapshot.server.ts:42-54` | 뉴스 소스가 `investing.com` CSV로 표기되고 스크래핑 코드가 없으며, 일자 경계가 문서와 일치 | Investing.com 스크래핑·야후 시세 스크래핑 추가 금지 |
| **S5** | **Price Seed 계약** — Yahoo CL=F 단일, 컬럼 고정 | 타깃·가격·인샘플·아웃샘플 | `app/app/lib/price-seed.server.ts:5-15` `research/INTAKE.md:86` `docs/research-design.md:25-26` | 시드 경로·티커·6컬럼·IS/OOS 날짜가 코드와 문서에서 동일 | `BZ=F`/현물로 몰래 교체 금지 (`research/INTAKE.md:85`) |
| **S6** | **Failure Taxonomy 보존** — 52→0을 "통제"로 읽게 함 | 메커니즘·숫자·인샘플 | `app/app/routes/research.tsx:88-96` `research/notebooks/pizza-hunt.md:22-34` `research/INTAKE.md:97-100` | 빈 후보표가 "없으면 없다고 함" 증거로 유지되고, 폐기 사유(메커니즘 없음·맵 메인 신호·OOS 봐야 산다)가 추적됨 | 실후보 없이 `pizza-hunt.md`에 행 채우기 금지 |
| **S7** | **No Web Backtest Engine** — 웹은 보여주고 실행은 로컬 | 숫자·아웃샘플·look-ahead | `app/app/routes/backtest.tsx:8-31` `app/app/lib/local-backtest-guide.ts:2-48` | `/backtest` GET 308 + POST 400, `LOOKAHEAD_GUARD` 문장 노출, 실행 단계는 로컬 pytest로만 | 웹 Sharpe/MDD/적중률 계산·표시 금지 |
| **S8** | **Provenance & Replayability** — 다음 사람이 같은 답에 도달 | 라이선스·look-ahead·타깃 | `app/app/lib/types.ts:80-87,189-195` `app/app/routes/home.tsx:281-301` `docs/research-design.md:75-82` | `WtiMarketSnapshot` provenance(first/last/rowCount/SHA256) 노출 + `python -m ls_crude.build` 1커맨드 재현 경로 고지 | 원천 parquet·대용량 CSV를 깃에 올리지 않음 (`research/INTAKE.md:31`) |

> S1–S8 모두 **새 데이터 없이** 기존 파일의 카피·라벨·링크 재배치로 닫힌다. graphify 281 files / 2023 nodes (`GRAPH_REPORT.md:3`)를 새로 늘리지 않는다.

---

## 3. P0 / P1 / P2 Stack — 무엇을 먼저, 무엇을 버리나

### P0 — Must (이번 프리즈의 정의, 없으면 52→0을 이해할 수 없음)

| 순위 | 작업 | INTAKE check | 근거 |
|---|---|---|---|
| P0-1 | 두 라우트의 52/0 일치와 `VERDICT_COUNTS` 합=52 고정 | 인샘플·숫자·메커니즘 | `home.tsx:10-11` `research.tsx:8-10,88-96` / 현재 실패 0이 "실패"가 아니라 "통제"임을 증명 |
| P0-2 | 6 대표행(IS/OOS r + 판정·이유)이 서로 다른 실패 유형을 보여줌 | 인샘플·아웃샘플·숫자·메커니즘 | `research.tsx:27-82` `home.tsx:28-57` / Iran r=-0.003→-0.002 기각 같은 반전 사례 |
| P0-3 | 5단계 절차(가설→적격성→IS→동결→OOS 1회) + `LOOKAHEAD_GUARD` 노출 | look-ahead·인샘플·아웃샘플 | `research.tsx:99-105` `home.tsx:94-100` `local-backtest-guide.ts:6-8` |
| P0-4 | `/backtest` 308 + 읽기 전용 405 경계 유지 | 숫자·아웃샘플·look-ahead | `backtest.tsx:16,24-31` — 웹에서 OOS 재튜닝 차단 |

### P1 — Should (있으면 이해가 빨라지나, P0 없이 단독으로는 무의미)

| 순위 | 작업 | INTAKE check | 근거 |
|---|---|---|---|
| P1-1 | Snapshot 신선도(fresh/stale)와 provenance(SHA/rowCount/first→last) 라벨 가시성 | 라이선스·look-ahead·타깃 | `market-snapshot.server.ts:46-53` `types.ts:80-87` `home.tsx:293-301` |
| P1-2 | Price seed 계약 한 줄 고지 (`CL=F`·`research/data/clf-daily-2015-2026.csv`·6컬럼·IS/OOS 날짜) | 타깃·가격·인샘플·아웃샘플 | `price-seed.server.ts:5-15,30-31` |
| P1-3 | 빈 `pizza-hunt.md`를 "증거"로 설명하는 문장 (비어 있음 = 아직 메커니즘 없음) | 메커니즘·인샘플 | `pizza-hunt.md:22-24` `INTAKE.md:66-67` `context.md:30-31` |
| P1-4 | 뉴스 정본 1줄 고지 (Investing CSV, 스크래핑 금지, 주말→다음 거래일) | 뉴스·라이선스·look-ahead | `research-design.md:36-48` `INTAKE.md:28` `REGISTRY.md:12` |

### P2 — Explicitly Deferred (이번에 하지 않음 — 다음 P의 입구 조건과 함께)

| 항목 | 왜 미루나 | 다시 여는 조건 | INTAKE 가드 |
|---|---|---|---|
| 새 팩터·새 수집·crypto map 메인 신호화 | `pizza-hunt`에 크립토의 **뭐**×뉴스의 **무슨** 한 줄이 없음; 메커니즘 없으면 폐기 | 한 줄 가설 + IS 실패 조건 + 동결 규칙이 `pizza-hunt.md`에 먼저 기록된 뒤에만 | 메커니즘 (`INTAKE.md:93`) |
| Sharpe/MDD/적중률 웹 차트 | 숫자 지어내기·OOS 재사용 유혹 | 로컬 `research/src/ls_crude/models`+`backtest`에서 IS에서 잠근 규칙으로 1회 OOS를 열고, 원시 로그를 `gathering/raw/`에 둔 뒤에만 | 숫자·아웃샘플 (`INTAKE.md:91-92`) |
| 웹 백테스트 실행 버튼 | P1 정의 자체에 반함 | `local-backtest-guide.ts:20-48` pytest 통과를 인계 조건으로 유지하는 한 영구 보류 | look-ahead·아웃샘플 |
| 추가 차트/게이지/의존성 | Ponytail delete-before-adding: `gauge.ts:15-21` 4구간이면 충분 | 새 시각화가 52→0 이해에 1문장 이상 기여함을 입증한 뒤에만 | 가격·숫자 |
| Supabase 쓰기·인증 | 공개 장부는 읽기 전용 | 쓰기가 필요하면 별도 스코프 문서에서 RLS·레이트리밋과 함께 정의 | 라이선스·보안 |

---

## 4. Ponytail — Delete-before-adding (one file, no code)

- **이 문서는 1파일로 끝.** 코드·의존성·스샷 생성 없음. 기존 `app/app/routes/*.tsx` + `app/app/lib/*` 7파일의 재배치·카피 정리로 P1을 닫는 것이 가장 짧은 diff.
- Skipped: 새 대시보드, 새 팩터 카드, crypto 트랜잭션 맵, 성과 차트, Supabase 쓰기. Add when: `research/notebooks/pizza-hunt.md:22`에 실후보 한 줄(크립토의 뭐×뉴스의 무슨+메커니즘+IS 동결 규칙)이 생기고, `research/INTAKE.md:81-93` 9 checks를 통과한 뒤에만.
- `ponytail: one-file scope doc, code diff is zero by design — add code only after pizza-hunt row + frozen IS rule exist`

---

## 5. Verification (이 문서의 닫힘 조건)

```bash
ls -l docs/superpowers/plans/nexus-p1-scope-freeze.md
# -rw-r--r-- 1 file, no code, no new dependency — 이 한 줄이 증거
```

- 이 파일 1개 외 `git status` clean (새 `*.tsx`/`*.ts` 없음).
- `graphify-out/GRAPH_REPORT.md:13`의 `9368131f` 대비 신규 node/edge 0.
- 다음 스프린트는 이 문서의 P2 "다시 여는 조건"을 체크리스트로 재사용 — 조건 없이는 열지 않음.

---

**귀결:** 통과 0은 실패가 아니라 통제 (`research.tsx:238-239` "2024–2026은 이미 여러 연구에서 확인했으므로 더 이상 손대지 않은 최종 검증 구간이 아닙니다"). 다음 후보는 동결된 규칙으로 **미래 구간**에서만 검증한다.
