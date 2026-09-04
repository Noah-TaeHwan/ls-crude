# Nexus P3 — QA Gate Report (Startup MVP Build · NEXUS-Sprint)

Date: 2026-09-04 · Role: Evidence Collector + Reality Checker (메인 에이전트가 파일·명령으로 재검증)
Scope: `#33` 이후 P1 게이트 12개. 대시보드 코드는 이 PR에서 바꾸지 않음.
Depends: `nexus-p1-gate-checklist.md` (게이트 정의), `nexus-p2-architecture.md` (diff 계약)

> **한 줄 판정 (재검):** G-L3 zip 추적 0 + 풀린 소스 git 추적, G-E4 날짜 노트 57개 전부 `## 체크` + `look-ahead`/`발표 지연`. **12/12 PASS → P3 OPEN.** P4(cron 첫 스케줄 발화)는 별도.

1차 런(같은 날 13:47 KST)은 G-L3·G-E4 2 FAIL로 CLOSED였다. 아래 §2는 보정 후 재검, §7은 1차 FAIL 보존.

---

## 0. 런북 단계 ↔ 이 레포 매핑

| Runbook phase | 레포 산출물 | 상태 | 증거 |
|---|---|---|---|
| P0 Scope freeze | `nexus-p1-scope-freeze.md` 외 | ✅ | `#33` |
| P1 Architecture | `nexus-p2-architecture.md` | ✅ | 2파일 41줄 diff 계약 |
| P2 Build | `desk-chrome.tsx` + `research.tsx` 앵커 | ✅ | `08218ba` |
| **P3 QA gate** | **이 문서** | **✅ OPEN** | §1–§2 재검 |
| P4 Launch hardening | cron 첫 발화 + `checkedAt` 갱신 | ⏳ | §3 |
| P5 Growth (week 3+) | 발표(09-15) | 미착수 | P3 OPEN 후 |

---

## 1. 런타임 증거 (재검 2026-09-04 14:14 KST)

| 항목 | 결과 | 명령 |
|---|---|---|
| typecheck | PASS (출력 0) | `cd app && npm run typecheck` |
| pytest | **35 passed** in 0.96s | `cd research && .venv/bin/python -m pytest -q` |
| localhost:5173 | 연결 거부 — 이 세션에서 `npm run dev` 하지 않음 | `curl 127.0.0.1:5173` |
| live `/` `/research` | 200 / 200 | `curl -w %{http_code}` |
| live `/backtest` | **308 → /research** | `curl -sSI` |
| live POST `/research` | **405** | `curl -sSI -X POST` |
| `wti-market-snapshot.json` | `ticker CL=F` `provider Yahoo Finance` `checkedAt 2026-09-03T10:08:58Z` `asOf 2026-09-02` | live GET |
| `CANDIDATE_COUNT`/`PASS_COUNT`/`VERDICT_COUNTS` | 52 / 0 / Σ=52 불변 | `research.tsx` git diff 없음 |
| pizza-hunt | 후보 칸 **비어 있음** | `pizza-hunt.md:24` |
| 신규 의존성·차트·Supabase 쓰기 | 0 | 이 PR 경로에 `app/` 없음 |

---

## 2. 게이트 판정 (보정 후)

| Gate | Verdict | 증거 |
|---|---|---|
| G-L1 No scraping | ✅ PASS | `news.py` requests/httpx/BeautifulSoup 0건. 풀린 khutbah/pipeline `oil_data.py`는 **합성 데모 시계열**(yfinance/investing 0건) |
| G-L2 Yahoo only | ✅ PASS | `config.py:5 WTI_TICKER="CL=F"` |
| **G-L3 License/redistribution** | ✅ PASS | `git ls-files \| grep '\.zip$'` → 없음. `.gitignore:39` `research/factors/**/legacy/*.zip`. dummy zip `git check-ignore` 히트. khutbah 17파일·pipeline 14파일 **index에 있음**(언팩만 하고 미추적이면 FAIL) |
| G-L4 Look-ahead per source | ✅ PASS* | 1차와 동일. REGISTRY 헤더 존재. *11행 휴리스틱 약함은 잔존 수동 권장 |
| G-Q1 Frozen dates | ✅ PASS | IS `2015-01-01~2023-12-31`, OOS `2024-01-01` |
| G-Q2 No OOS tuning | ✅ PASS | 튜닝 코드 없음. 노트 체크표는 이미 본 OOS를 «아니오»로 거짓말하지 않음 |
| G-Q3 Mechanism | ✅ PASS | `pizza-hunt.md:24` 비어 있음 |
| G-Q4 Reproducible | ✅ PASS | `update-wti-market.yml` 체인 불변(이 PR 미터치) |
| G-E1 No fabrication | ✅ PASS | 체크표 성과 칸은 «없음» 또는 본문 반증 r 인용. 새 샤프/MDD 없음 |
| G-E2 Chain intact | ✅ PASS | 덤프를 실험 카드로 올리지 않음 |
| G-E3 Empty = evidence | ✅ PASS | pizza-hunt 빈 표 |
| **G-E4 Note checks** | ✅ PASS | 날짜 노트 57개 모두 `## 체크`. `grep -L 'look-ahead\|발표 지연'` 빈 출력. `_TEMPLATE.md`·`README.md`는 템플릿/안내 |
| G-E5 No silent delete | ✅ PASS | `*hold.md`+`*withdrawn.md` **22**. `VERDICT_COUNTS` 미변경 |

**Σ: Legal 4/4 · Quality 4/4 · Evidence 5/5 → P3 OPEN.**

---

## 3. P4 Launch 리스크 (라이브 유저 관점)

- 스냅샷 cron `30 6 * * 1-5` UTC는 이 P3 PR과 무관. 라이브 `checkedAt`은 여전히 `2026-09-03T10:08:58Z`.
- 실패 시 주말 지나 09-07부터 bar 경과가 `stale` 임계에 접근할 수 있다.
- Supabase 쓰기는 P1 OUT 유지.

P4 완료 조건: cron 1회 자동 성공 run + 배포 `checkedAt` 갱신. **P3 OPEN이 P4 완료를 의미하지 않는다.**

---

## 4. 이번 PR에서 한 일 (D1/D2)

| # | 결정 | 실제 diff |
|---|---|---|
| D1 | G-L3 zip 5개 | zip `git rm`. 012·mosque는 기존 풀린 소스 유지. khutbah·pipeline은 소스만 unzip 후 **git add**. `.gitignore`에 `research/factors/**/legacy/*.zip` |
| D2 | G-E4 체크표 | `_TEMPLATE.md` 8행을 날짜 노트에 복사. 본문 사실만 채움. `VERDICT_COUNTS`/pizza-hunt 행 추가 없음 |

대안(INTAKE zip 예외 1줄, 4노트 withdrawn 재분류)은 쓰지 않음.

---

## 5. 서브에이전트

읽기 전용 Evidence Collector·Reality Checker를 위임했다. 쓰기 워커는 메인만. `Agents Orchestrator` 미호출.

재검증은 메인이 파일·`git ls-files`·grep·pytest·curl로 다시 했다. 서브에이전트 보고만으로 OPEN하지 않음.

---

## 6. Provenance

모든 `path:line`은 로컬 파일·`git`·`curl`로 직접 확인. 스크래핑·성과 수치 생성 없음. 재현: `nexus-p1-gate-checklist.md` Shell check + §1.

Vault: gbrain `query` `noah-wiki` — 관련 히트는 `2026-09-04-ls-crude-research-freeze-and-public-ledger`(원장 52 동결), `qa-release-gate-principles`(게이트는 PASS 증거+롤백. 대시보드 눈으로 괜찮아 보임은 PASS 아님).

---

## 7. 1차 FAIL 보존 (2026-09-04 13:47 KST, CLOSED)

| Gate | 당시 증거 |
|---|---|
| G-L3 | 추적 zip 5개(`oil-pairs-go-crack.zip` 951KB, `ou-hmm-oil-pairs.zip` 933KB, `khutbah-signal.zip`, `mosque-sermon-oil-signal.zip`, `pipeline-noise-signal.zip`) |
| G-E4 | `look-ahead`/`발표 지연` 없는 노트 28개. 그중 `## 체크` 자체 없음 4개 |

보정 후 §2가 이 두 행을 대체한다.
