# Nexus P1 — Stakeholder Narrative (1-page)

Date: 2026-09-04 · Status: P1 plan · Owner: UX Researcher + Project Shepherd
Model: opencode/muse-spark-1.2-contributor-free ×high (verified via opencode.json)

---

## Headline

52개 후보, 통과 0개를 그대로 공개한다 — **버린 가설이 증명하는 재현성**.

> fake success(좋아 보이는 Sharpe 하나)는 1시간 만에 만든다. 52→0 장부는 1시간 만에 못 만든다.

## 2 Lenses — 무엇을 보면 역량을 믿는가

### (a) Hiring manager / Portfolio reviewer

- **보는 것:** 과정이 채용 후에도 반복될 수 있는가, 실패를 숨기지 않는가.
- **52→0이 증명하는 것:**
  - 후보를 인샘플에서만 고르고 아웃샘플은 한 번만 열었다 → cherry-picking 불가.
  - 실패 유형을 분류·보존했다 → 같은 실패를 팀이 반복하지 않는다.
  - 대시보드/코드를 지우지 않고 수집 규칙을 따로 강제했다 → 협업 문해력.
- **fake success와 차이:** Sharpe 1.8 한 장은 면접에서 3질문 만에 무너진다. 52개 분포와 폐기 이유는 30분 심문에도 일관된다.

### (b) Quant reviewer / Professor

- **보는 것:** look-ahead, data leakage, p-hacking 통제, 재현 가능성.
- **52→0이 증명하는 것:**
  - 인/아웃샘플 경계 고정(2015–2023 vs 2024–)과 규칙 동결 → `research-design.md:27-30`.
  - OOS 한 번 원칙 → `research/INTAKE.md:29,91` 위반 시 폐기.
  - 빈 `pizza-hunt.md` 후보표(실후보 없으면 비워 둠) → `research/INTAKE.md:66-67`.
- **fake success와 차이:** IS r=-0.332가 OOS r=+0.530으로 뒤집힌 사례를 기각으로 남긴 기록(`home.tsx:88`)이, 통제 전 상관 하나를 알파로 포장한 것보다 신뢰 신호다.

## Failure Taxonomy — VERDICT_COUNTS

출처: `app/app/routes/research.tsx:88-96`

| 판정 | n | 의미 |
|---|---|---|
| 기각 | 17 | IS/OOS 중 하나 이상에서 관계 소멸·반전 |
| 보류 | 16 | 공개 시점/지연/라이선스 미검증 — 성과로 세지 않음 |
| 미검증 | 7 | 아직 IS/OOS 양쪽 검증 전 |
| 보관 | 6 | 재현 불가하지만 기록 보존 |
| 분석 제외 | 2 | 타겟 불일치 |
| 관측만 | 3 | 신호가 아니라 관측치 |
| 별도 전략 | 1 | WTI 선행 신호가 아닌 독립 전략 |

합계 52, 통과 0 — `research.tsx:8-10`, `research/notebooks/pizza-hunt.md:4`와 일치. 미검증·보류는 통과에 포함하지 않는다(`research.tsx:174`).

대표 행: Pentagon Uber Eats(철회·데이터 없음), Iran FX Stress(r=-0.003→-0.002 기각), SPR Injection(r=+0.051→-0.455 기각), Refinery Thermal(보류) — `research.tsx:27-82`.

## Evidence Chain (짧게, 검증 가능)

1. **가설→적격성→IS→동결→OOS 1회** — 5단계 고정 절차 `research.tsx:99-105`과 동일하게 `research-design.md:9-10`, `research/INTAKE.md:7-24`가 강제.
2. **덤프→노트→후보표→실험카드** — 원문은 `gathering/raw/`(깃 제외), 한 장 노트만 `gathering/notes/`, 승격만 `docs/experiments/` — `research/INTAKE.md:14-24`.
3. **뉴스 정본=Investing.com CSV, 스크래핑 금지** — `research-design.md:36-48`, `research/INTAKE.md:28`.
4. **가격=Yahoo `CL=F` 단일** — `research-design.md:25-26`, `docs/context.md:20`.

## Replayability — 다음 사람이 같은 답에 도달하는가

- `research-design.md:75-82` 빌드 1커맨드(`python -m ls_crude.build`)로 `research/data/processed/` + `app/public/baseline-snapshot.json` 재생성.
- 홈의 RV5/백분위/롤갭 고지가 스냅샷에 동봉 — `app/app/routes/home.tsx:282-296`.
- 연구 장부 읽기 전용(`research.tsx:130-134`, `home.tsx:178-183`) — 장부 조작 불가, Git 히스토리가 진실.

## YAGNI — 만들지 않는 것

- 새 대시보드/백테스트 UI, 새 지표·차트, 추가 데이터 파이프라인.
- 아웃샘플 재튜닝, 가중치 재조정, 성과 숫자 재해석(숫자 지어내기 금지 `research/INTAKE.md:30`).
- 크립토 트랜잭션 월드맵을 메인 신호로 승격 — 메커니즘 없으면 폐기(`research/INTAKE.md:99`, `docs/context.md:27`).
- `pizza-hunt.md`에 실후보 없이 행 채우기 — 비어 있음이 증거(`research/notebooks/pizza-hunt.md:22-24`).
- 이 문서 밖 코드·파일 — 본 문서는 1파일로 끝. 필요해질 때 별도 PR.

---

**1문장 귀결:** 통과 0은 실패가 아니라 통제 — 다음 후보는 동결된 규칙으로 미래 구간에서만 검증한다(`research.tsx:238-239`).
