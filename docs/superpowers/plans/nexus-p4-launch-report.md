# Nexus P4 — Launch hardening report (Startup MVP Build · NEXUS-Sprint)

Date: 2026-09-04 · Role: 메인 에이전트가 Actions·라이브 HTTP로 재검증
Scope: `update-wti-market.yml` 1회 발화 + 배포 `checkedAt`. 앱 로직·장부 카운트·pizza-hunt는 이 단계에서 바꾸지 않음.
Depends: `nexus-p3-qa-gate-report.md` §3 (P3 OPEN ≠ P4 완료)

> **한 줄 판정:** `workflow_dispatch` 성공 + 봇 PR `#35` squash + 라이브 `checkedAt` 갱신 → **유저 관측면 PASS.** `schedule` 이벤트 run은 **0건** → 런북 문구 «cron 1회 자동 성공»은 **아직 OPEN.** dispatch ≠ cron.

GitHub Actions: `schedule`은 POSIX cron이고 기본 브랜치 워크플로만 돈다. `workflow_dispatch`는 CLI/UI/API 수동 발화다. 둘은 다른 `event`다.

---

## 0. 런북 단계

| Runbook phase | 상태 | 증거 |
|---|---|---|
| P3 QA gate | ✅ OPEN | `#34` / `524b1a2` |
| **P4 dispatch + 배포 freshness** | ✅ PASS | `#35` / run `33840666306` / 라이브 JSON |
| **P4 cron (`event=schedule`)** | ⏳ OPEN | `gh run list --workflow=update-wti-market.yml --event schedule` 빈 목록 |
| P5 발표(09-15) | 미착수 | — |

다음 cron 창: `30 6 * * 1-5` UTC = **2026-09-04 15:30 KST**(금). 주말엔 스케줄 없음.

---

## 1. 발화 체인 (실측)

| 항목 | 값 |
|---|---|
| 명령 | `gh workflow run update-wti-market.yml` (ref 생략 → 기본 브랜치) |
| Run | https://github.com/Noah-TaeHwan/ls-crude/actions/runs/33840666306 |
| event | `workflow_dispatch` |
| 결과 | **success** · 8m19s · 2026-09-04T05:29:22Z |
| validate | snapshot `05:30:09Z` · pytest · `npm ci`+typecheck+build |
| publish | `origin` HEAD == `GITHUB_SHA` 통과 후 데이터 전용 PR |
| 봇 PR | https://github.com/Noah-TaeHwan/ls-crude/pull/35 · MERGED |
| 착지 SHA | `829149c` `chore: WTI 시장 관측값을 갱신한다 (#35)` |
| diff | `app/public/wti-market-snapshot.json` **1파일만** (18+/18−) |

이전 성공 dispatch는 `33742650539`(2026-09-03T10:07:55Z). 그 시점까지 `schedule` 0.

---

## 2. 라이브 관측 (curl 2026-09-04 14:39 KST)

| 항목 | 결과 |
|---|---|
| GET `/` `/research` | 200 / 200 |
| GET `/backtest` | **308 → /research** |
| POST `/research` | **405** |
| ticker | `CL=F` |
| `source.provider` | `Yahoo Finance` |
| `status` | `ok` |
| `checkedAt` / `generatedAt` | **`2026-09-04T05:30:09Z`** (직전 `2026-09-03T10:08:58Z`) |
| `asOf` / last bar | **`2026-09-03`** (직전 `2026-09-02`) |
| bars | 60 |
| freshness | `maxCheckAgeHours=36` / `maxBarAgeDays=4` |
| `CANDIDATE_COUNT` / `PASS_COUNT` | 52 / 0 불변 |
| `VERDICT_COUNTS` Σ | 17+16+7+6+2+3+1 = **52** |
| pizza-hunt 후보 칸 | **비어 있음** |
| Supabase 쓰기 | 이 단계 없음 (P1 OUT) |

재현:

```bash
curl -sS https://ls-crude.vercel.app/wti-market-snapshot.json
gh run list --workflow=update-wti-market.yml --limit 5
gh run list --workflow=update-wti-market.yml --event schedule --limit 5
```

---

## 3. P4를 cron까지 닫으려면

15:30 KST 이후:

```bash
gh run list --workflow=update-wti-market.yml --event schedule --limit 3
```

기대: `event=schedule` 1건, conclusion `success`, 필요하면 봇 PR이 JSON만 다시 갱신. 실패하면 주말 공백 뒤 09-07 bar age가 `maxBarAgeDays=4`에 접근할 수 있다. 그때는 dispatch로 메우지, Investing.com 시세를 긁지 않는다.

---

## 4. 이번 단계에서 하지 않은 일

- `app/` 라우트·카운트·차트 라이브러리 변경 없음
- pizza-hunt 행 추가 없음, 성과 숫자 창작 없음
- zip을 깃에 되돌리지 않음
- 이 문서 PR은 스냅샷 JSON을 다시 쓰지 않음 (`#35`가 이미 씀)

---

## 5. Provenance

파일·`gh`·`curl` 직접 확인. 스크래핑 없음.

Vault: gbrain `query` `noah-wiki` — `2026-09-04-ls-crude-research-freeze-and-public-ledger`(장부 52·웹 Sharpe 금지). graphify «NEXUS P4 cron»은 잡음(Hermes/Vercel 다른 프로젝트) → 게이트 증거로 쓰지 않음.
