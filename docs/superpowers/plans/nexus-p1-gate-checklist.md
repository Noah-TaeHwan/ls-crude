# Nexus P1 — Gate Checklist (Legal / Quality / Evidence)

Date: 2026-09-04 · Role: Legal Compliance Checker + Workflow Optimizer + Evidence Collector
Model: opencode/muse-spark-1.2-contributor-free xhigh
Scope: 1 file, no code, verifiable gates only. Every gate has PASS/FAIL + evidence path + citation `path:line` + shell check.

Related: `research/INTAKE.md` (정본), `docs/research-design.md`, `AGENTS.md`, `research/gathering/sources/REGISTRY.md`, `docs/experiments/README.md`, `docs/superpowers/plans/nexus-p1-stakeholder-narrative.md`

---

## Enterprise Gate → Project Gate Mapping

| Enterprise gate | Project translation | Domain |
|---|---|---|
| No scraping | Investing.com은 CSV만, 프로그램이 사이트를 열지 않음 | Legal |
| No OOS tuning | 후보 선택·가중치 튜닝은 인샘플 `2015-01-01~2023-12-31`만, 아웃샘플 `2024-01-01~`은 후보 확정 후 1회만 | Quality |
| No fabricated Sharpe | 성과 숫자(Sharpe/MDD/적중률)를 지어내지 않음, 빈 후보표는 비워둠 | Evidence |

---

## How to use

각 게이트는 독립 검증 가능. FAIL 1개 = P1 차단. 증거 경로는 깃에 남은 파일/커밋이어야 하며 구두·추정은 증거가 아니다.

빠른 전체 검사 (복붙):

```bash
echo "== G-L1 scraping =="; grep -R --include="*.py" "requests\.get.*investing\|BeautifulSoup.*investing\|scrape.*investing" research/src 2>&1 | grep -v ".venv" || echo "PASS: no investing scraping in research/src"
echo "== G-L2 .gitignore raw =="; git check-ignore -q research/gathering/raw/dummy.csv && echo "PASS: raw gitignored" || echo "FAIL"
echo "== G-Q1 sample dates =="; grep -n "IN_SAMPLE\|OUT_SAMPLE\|2015-01-01\|2023-12-31\|2024-01-01" research/src/ls_crude/config.py
echo "== G-E1 fabricated metrics =="; grep -R --include="*.md" "Sharpe\|MDD.*%.*\|적중률.*%.*\|수익률.*%.*" docs/experiments/ 2>&1 | grep -v "000-oil-slice" || echo "PASS: no fabricated metrics in promoted cards"
echo "== Evidence chain =="; ls -ld research/gathering/raw research/gathering/notes research/gathering/sources docs/experiments
```

---

## G-L Legal — Scraping / License / Redistribution

### G-L1 No scraping — Investing.com은 CSV가 정본

- **Criterion:** 어떤 프로그램도 `investing.com`을 HTTP로 긁지 않는다. 뉴스는 사람이 받은 CSV만.
- **PASS:** `research/src`에 investing 도메인 대상 `requests`/`scrape` 코드 없음, 뉴스 로더가 CSV만 읽음. 덤프에 스크래핑 원문 없음.
- **FAIL:** `research/src` 어디서든 `investing.com`을 fetch/parse 하거나, `gathering/raw`에 스크래핑 산출물이 있음.
- **Evidence path:** `research/src/ls_crude/data/news.py` (CSV loader), `research/gathering/sources/REGISTRY.md`의 `수집 방법` 칸, 각 `gathering/raw/**/README.md`의 "스크래핑 안 함" 확인란.
- **Citations:** `research/INTAKE.md:28` "인베스팅닷컴 **스크래핑**. 뉴스는 사람이 받은 CSV만.", `research/INTAKE.md:87` 뉴스=CSV 행, `docs/research-design.md:36-37` "프로그램이 인베스팅닷컴을 긁지 않습니다. CSV로 넣습니다.", `AGENTS.md:24` "뉴스 정본은 Investing.com CSV (스크래핑 금지)", `research/gathering/sources/REGISTRY.md:12` "스크래핑 금지. CSV 컬럼 …", `research/src/ls_crude/data/news.py:66-78` `load_news_csv`만 존재.
- **Shell check:**
  ```bash
  grep -R --include="*.py" -n "investing" research/src/ls_crude 2>&1 | grep -v ".pyc"
  # 기대: news.py:73 source="investing.com" 같은 라벨만, requests/httpx fetch 없음
  grep -R --include="*.py" -n "requests\.get\|httpx\|BeautifulSoup\|selenium\|playwright" research/src/ls_crude/data/news.py 2>&1 | grep -v ".venv" || echo "PASS: news.py has no scraping client"
  ls -R research/gathering/raw 2>&1 | head -n 30
  cat research/gathering/raw/README.md 2>&1 | head -n 40
  ```

### G-L2 No price scraping — Yahoo Finance만 프로그램으로 받음

- **Criterion:** 가격 시세는 `yfinance`로 `CL=F`만 프로그램 수집. 인베스팅 시세 스크래핑 금지.
- **PASS:** 가격 수집이 `yfinance.download` 단일 경로, 인베스팅 시세 fetch 없음.
- **FAIL:** `yfinance` 외 HTTP로 가격을 긁는 코드가 있음.
- **Evidence path:** `research/src/ls_crude/data/yahoo.py`, `research/src/ls_crude/config.py:5` 티커 고정.
- **Citations:** `research/INTAKE.md:86` "가격 — Yahoo Finance만 프로그램으로 받음", `docs/research-design.md:25-26` 티커 `CL=F`, `research/gathering/sources/REGISTRY.md:9` "yfinance만. 인베스팅 시세 스크래핑 금지", `AGENTS.md:23` "가격 API는 Yahoo Finance".
- **Shell check:**
  ```bash
  grep -R --include="*.py" -n "yfinance\|yf\.download\|WTI_TICKER" research/src/ls_crude 2>&1 | grep -v ".venv"
  grep -R --include="*.py" -n "investing.*price\|price.*scrap" research/src 2>&1 | grep -v ".venv" || echo "PASS"
  grep -n "WTI_TICKER\|CL=F" research/src/ls_crude/config.py
  ```

### G-L3 License & redistribution disclosed

- **Criterion:** 모든 출처의 라이선스·재배포 가능 여부를 `REGISTRY.md`에 적음. 모르면 «모름»이라 적음. 원천 parquet/대용량/키는 깃에 올리지 않음.
- **PASS:** `REGISTRY.md` 각 행의 `라이선스` 칸이 비어있지 않음(모름 포함), `.gitignore`가 raw/parquet 차단.
- **FAIL:** 라이선스 칸 공란, 또는 parquet/zip/원천 CSV가 깃에 추적됨.
- **Evidence path:** `research/gathering/sources/REGISTRY.md:7-71` 표, `.gitignore`, `research/gathering/sources/_TEMPLATE.md:8-12`.
- **Citations:** `research/INTAKE.md:88` "라이선스 — 재배포·저장 가능 여부를 출처 표에 적음", `research/INTAKE.md:31` "비밀키, .env, 대용량 parquet/zip/원본 CSV를 깃에 올리기" 금지, `research/gathering/sources/REGISTRY.md:5` "모르면 «모름»입니다".
- **Shell check:**
  ```bash
  cat research/gathering/sources/REGISTRY.md | head -n 20
  grep -n "라이선스\|모름\|재배포" research/gathering/sources/REGISTRY.md
  git check-ignore -v research/gathering/raw/dummy.csv research/data/processed/dummy.parquet 2>&1
  git ls-files | grep -E "\.parquet|\.zip|gathering/raw/.+\.csv" 2>&1 | head -n 20 || echo "PASS: no tracked raw/parquet"
  ```

### G-L4 Look-ahead disclosed per source

- **Criterion:** 발표 지연·주말·타임존·다음 거래일 시프트를 출처마다 기록. 같은 봉 미래 정보를 쓰지 않음.
- **PASS:** `REGISTRY.md`의 `지연`·`look-ahead` 칸과 노트의 `look-ahead`·`발표 지연` 칸이 채워짐.
- **FAIL:** look-ahead 위험을 적지 않고 당일 봉에 당일 뉴스를 붙여 씀.
- **Evidence path:** `research/gathering/sources/REGISTRY.md:7` 헤더, 각 노트 `## 체크` 표, `research/src/ls_crude/data/splits.py`.
- **Citations:** `research/INTAKE.md:89` "look-ahead — 발표 지연·주말·타임존을 적음. 같은 봉으로 몰래 쓰지 않음", `docs/research-design.md:48` "주말·장후 뉴스는 다음 거래일", `research/INTAKE.md:79-93` 매번 체크 표.
- **Shell check:**
  ```bash
  grep -n "look-ahead\|발표 지연\|다음 거래일\|시프트" research/gathering/sources/REGISTRY.md | head -n 20
  grep -n "look-ahead\|발표 지연" research/gathering/notes/_TEMPLATE.md
  grep -R --include="*.md" -n "look-ahead" research/gathering/notes 2>&1 | head -n 20
  ```

---

## G-Q Quality — Sample split / OOS discipline / Mechanism

### G-Q1 Sample boundaries frozen

- **Criterion:** 인샘플 `2015-01-01~2023-12-31`, 아웃샘플 `2024-01-01~`. 코드·문서·파이프라인 전부 동일.
- **PASS:** 세 곳이 일치 — `config.py`, `research-design.md`, `INTAKE.md`.
- **FAIL:** 어디서든 날짜가 다르게 하드코딩됨.
- **Evidence path:** `research/src/ls_crude/config.py:10-12`, `research/src/ls_crude/build.py:69`, `research/src/ls_crude/data/splits.py:7-27`.
- **Citations:** `research/INTAKE.md:90` "인샘플 — 고르기·튜닝은 `2015-01-01`~`2023-12-31`만", `research/INTAKE.md:91` "아웃샘플 — `2024-01-01`~ 은 후보를 **언 뒤** 한 번만", `docs/research-design.md:27-30` 인샘플/아웃샘플 정의, `research/src/ls_crude/config.py:10-12` 상수, `AGENTS.md:25` "아웃샘플은 후보 확정 후 한 번만".
- **Shell check:**
  ```bash
  grep -n "IN_SAMPLE\|OUT_SAMPLE\|2015-01-01\|2023-12-31\|2024-01-01" research/src/ls_crude/config.py
  grep -n "2015-01-01\|2023-12-31\|2024-01-01" docs/research-design.md research/INTAKE.md
  grep -n "cutoff\|IN_SAMPLE_END" research/src/ls_crude/build.py
  ```

### G-Q2 No OOS tuning — OOS는 후보 확정 후 1회만

- **Criterion:** 모델 선택·피처 선택·walk-forward·가중치 튜닝은 인샘플에서만. 아웃샘플은 후보를 고른 뒤 한 번만 열고 재튜닝 금지.
- **PASS:** OOS를 여는 코드가 `build.py`의 1회 빌드 외에 없음, 실험 카드에 `인샘플만 봤는지`가 `예`로 기록.
- **FAIL:** `2024-01-01` 이후 구간으로 하이퍼파라미터를 고르거나 가중치를 만짐.
- **Evidence path:** `research/src/ls_crude/build.py:57-69`, `docs/experiments/000-oil-slice-draft.md:31` "가중치 재튜닝 금지", `research/notebooks/pizza-hunt.md:7-12` 규칙.
- **Citations:** `research/INTAKE.md:29` "아웃샘플로 후보를 고르거나 가중치를 만지는 일" 금지, `research/INTAKE.md:73` "이 단계 전에는 `docs/experiments/`에 쓰지 않습니다", `docs/research-design.md:29-30` "모델 선택·피처 선택·Walk-forward 튜닝은 **인샘플만**", `AGENTS.md:25` 동일, `.agents/skills/running-sample-splits/SKILL.md:21` "Open out-sample once after the candidate is frozen".
- **Shell check:**
  ```bash
  grep -R --include="*.py" -n "2024-01-01\|OUT_SAMPLE\|out_sample" research/src 2>&1 | grep -v ".venv"
  grep -R --include="*.md" -n "아웃샘플.*한 번\|OOS.*1회\|재튜닝" docs research 2>&1 | head -n 20
  grep -n "인샘플만" docs/experiments/000-oil-slice-draft.md research/INTAKE.md docs/research-design.md
  ```

### G-Q3 No mechanism → discard

- **Criterion:** «유가 공개 신호와 왜 붙는지» 메커니즘이 없으면 후보 폐기. 통제 전 상관·히트맵·맵은 알파가 아님.
- **PASS:** 각 노트에 `한 줄 가설`·`크립토의 뭐 × 뉴스의 무슨` 칸이 있고, 메커니즘 없으면 `폐기`로 남음.
- **FAIL:** 메커니즘 없이 후보표·실험카드로 승격.
- **Evidence path:** `research/gathering/notes/_TEMPLATE.md:7-16` 가설·칸, `research/INTAKE.md:93-99` 메커니즘/승격·폐기 규칙, `docs/experiments/README.md:18-25`.
- **Citations:** `research/INTAKE.md:93` "메커니즘 — «유가 공개 신호와 왜 붙는지»가 없으면 폐기", `research/INTAKE.md:99` "메커니즘 없음, 맵/히트맵이 메인 신호 … 폐기", `docs/research-design.md:61` "Slice가 Sharpe/MDD/적중률을 실제로 개선하는지 보는 것이 이 후보의 실험", `docs/CONTEXT.md:27` "체인에는 국가가 없고, '트랜잭션이 많다 → WTI'는 메커니즘이 비어 있습니다".
- **Shell check:**
  ```bash
  grep -n "메커니즘\|폐기\|승격\|보류" research/INTAKE.md
  grep -R --include="*.md" -n "한 줄 가설\|크립토의 뭐" research/gathering/notes/_TEMPLATE.md research/gathering/notes 2>&1 | head -n 20
  cat docs/experiments/README.md
  ```

### G-Q4 Walk-forward / build is reproducible

- **Criterion:** `python -m ls_crude.build` 1커맨드로 `research/data/processed/` + `app/public/baseline-snapshot.json` 재생성 가능. 원천 parquet는 깃 금지.
- **PASS:** `build.py`가 `IN_SAMPLE_START`부터 OHLCV를 받고 `IN_SAMPLE_END`로 컷오프, 스냅샷 갱신.
- **FAIL:** 빌드가 외부 수동 전처리 없이는 재현 안 됨.
- **Evidence path:** `research/src/ls_crude/build.py:40-69`, `docs/research-design.md:75-82`.
- **Citations:** `docs/research-design.md:75-82` 실행 블록, `research/INTAKE.md:24` "Yahoo 빌드 산출 — `data/processed/`", `research/src/ls_crude/config.py:10-12` 기준 날짜.
- **Shell check:**
  ```bash
  cat docs/research-design.md | sed -n '75,82p'
  grep -n "IN_SAMPLE\|OUT_SAMPLE\|download_ohlcv\|baseline-snapshot" research/src/ls_crude/build.py
  ls -ld research/data/processed app/public/baseline-snapshot.json 2>&1 | head -n 20
  ```

---

## G-E Evidence — No fabrication / Provenance / Promotion discipline

### G-E1 No fabricated numbers

- **Criterion:** 없는 성과 숫자(Sharpe, MDD, 적중률, 수익률)를 지어내지 않음. 모르면 «모름».
- **PASS:** 승격된 `docs/experiments/001-*.md`에 수치가 있으면 재현 커밋·로그가 같이 있음. 초안 `000` 외 빈 수치는 없음.
- **FAIL:** 실행 로그 없이 `Sharpe 1.8` 같은 수치가 실험 카드에 단독 기재됨.
- **Evidence path:** `docs/experiments/000-oil-slice-draft.md:31` 비수치 초안, `research/notebooks/pizza-hunt.md` 빈 표, 각 노트 `## 체크`.
- **Citations:** `research/INTAKE.md:30` "없는 성과 숫자(샤프, MDD, 적중률)를 지어 내기" 금지, `research/INTAKE.md:92` "숫자 — 백테스트 숫자를 지어 내지 않음", `research/INTAKE.md:82` "답을 모르면 «모름»이라고 씁니다", `AGENTS.md:28` "성과 숫자를 지어 내지 않습니다", `docs/experiments/README.md:18-25` 카드에 적을 것(look-ahead·인샘플 여부 필수).
- **Shell check:**
  ```bash
  grep -R --include="*.md" -n "Sharpe\|MDD\|적중률\|수익률.*%" docs/experiments 2>&1 | grep -v "000-oil-slice" | head -n 20 || echo "PASS: no standalone fabricated metrics in promoted cards"
  grep -n "지워 내지\|모름" research/INTAKE.md
  cat docs/experiments/README.md
  ```

### G-E2 Provenance chain intact — Dump → Note → REGISTRY → pizza-hunt → Experiment

- **Criterion:** 조사 출력이 섞이지 않음. 원문은 `gathering/raw/`(깃 제외) → 한 장 노트(`gathering/notes/`) → 출처 표(`REGISTRY.md`) → (선택) `pizza-hunt.md` 한 줄 → 승격 시에만 `docs/experiments/NNN-*.md`.
- **PASS:** 각 단계 파일이 제 위치에 있고, 덤프를 실험 카드에 바로 올리지 않음.
- **FAIL:** 원문 붙여넣기를 실험 카드에 하거나, `pizza-hunt.md`에 크립토/뉴스 둘 다 없이 행을 만듦.
- **Evidence path:** `research/gathering/raw/README.md`, `research/gathering/notes/README.md`, `research/gathering/sources/REGISTRY.md`, `research/notebooks/pizza-hunt.md:4-24`, `docs/experiments/README.md:7-14`.
- **Citations:** `research/INTAKE.md:14-24` 위치 표, `research/INTAKE.md:13` "덤프를 실험 카드에 바로 올리지 않습니다", `research/INTAKE.md:63-67` 후보표는 크립토×뉴스 둘 다 있을 때만, `research/INTAKE.md:73` "이 단계 전에는 `docs/experiments/`에 쓰지 않습니다", `docs/research-gathering.md:7-17` 흐름도, `AGENTS.md:14-19` 동일.
- **Shell check:**
  ```bash
  ls -R research/gathering 2>&1 | head -n 40
  cat research/gathering/notes/README.md 2>&1 | head -n 20
  cat research/notebooks/pizza-hunt.md 2>&1 | head -n 40
  ls -1 docs/experiments 2>&1 | head -n 20
  git ls-files | grep -E "gathering/raw/.+\.(csv|parquet|zip)" 2>&1 | head -n 20 || echo "PASS: raw not tracked"
  ```

### G-E3 pizza-hunt empty when no real candidate

- **Criterion:** 실후보가 없으면 `pizza-hunt.md` 후보표를 비워둠. Oil Slice(`000`)는 비교군이라 후보표에 넣지 않음.
- **PASS:** `pizza-hunt.md:22-24` "비어 있음" + `docs/experiments/000-oil-slice-draft.md:3` 비교군 표기 일치.
- **FAIL:** 메커니즘 없는 행을 채워 표를 부풀림.
- **Evidence path:** `research/notebooks/pizza-hunt.md:22-24`, `docs/experiments/README.md:14` `000`은 비교군.
- **Citations:** `research/INTAKE.md:66-67` "실후보가 없으면 표를 **비워 둡니다**", `research/INTAKE.md:65` "Oil Slice는 이미 실험 `000`에 있으므로 후보 표에 다시 넣지 않습니다", `docs/experiments/README.md:14` "공개 신호 초안 … 비교군. 최종 후보 아님".
- **Shell check:**
  ```bash
  cat research/notebooks/pizza-hunt.md | grep -A2 "후보 칸"
  grep -n "비어 있음\|실후보 없으면" research/notebooks/pizza-hunt.md research/INTAKE.md
  grep -n "비교군\|최종 후보 아님" docs/experiments/000-oil-slice-draft.md docs/experiments/README.md
  ```

### G-E4 Every note has verifiable checks

- **Criterion:** 모든 노트·실험 카드가 `타겟·가격·뉴스·라이선스·look-ahead·인샘플·아웃샘플·숫자·메커니즘` 체크를 통과하거나 명시적 «모름»/보류/폐기 사유를 남김.
- **PASS:** `_TEMPLATE.md`의 체크 표가 그대로 노트에 복사되어 값이 채워짐.
- **FAIL:** 체크 없이 가설만 쓰고 출처·지연을 비워둠.
- **Evidence path:** `research/gathering/notes/_TEMPLATE.md:28-40`, `research/gathering/notes/2026-09-*.md` 각 파일.
- **Citations:** `research/INTAKE.md:79-93` 매번 체크 표, `research/INTAKE.md:81-82` "답을 모르면 «모름»", `docs/experiments/README.md:18-25` 한 장에 적을 것.
- **Shell check:**
  ```bash
  grep -n "가격 출처\|뉴스 출처\|라이선스\|발표 지연\|look-ahead\|본 기간" research/gathering/notes/_TEMPLATE.md
  grep -R --include="*.md" -L "look-ahead\|발표 지연" research/gathering/notes 2>&1 | head -n 20 || echo "PASS: all notes have look-ahead"
  ls -1 research/gathering/notes | wc -l; echo "notes count"
  ```

### G-E5 No silent deletion — hold/discard stays as one line

- **Criterion:** 보류·폐기도 노트에 한 줄로 남김. 조용히 지우지 않음. 팀원 랩 드롭(`research/data/…`)을 `gathering/`으로 옮기지 않음.
- **PASS:** 17 기각·16 보류 등 실패 유형이 분류·보존됨 (`nexus-p1-stakeholder-narrative.md:34-46` VERDICT_COUNTS).
- **FAIL:** 실패 노트를 삭제하거나 드롭 폴더를 이동.
- **Evidence path:** `research/gathering/notes/2026-09-02-*-hold.md`, `research/data/README.md`, `app/app/routes/research.tsx:88-96`.
- **Citations:** `research/INTAKE.md:33` "팀원 드롭을 `gathering/`으로 이사하기" 금지, `research/INTAKE.md:101` "폐기도 노트에 한 줄로 남깁니다. 조용히 지우지 않습니다", `research/INTAKE.md:32-33` 코드·드롭 보존 규칙.
- **Shell check:**
  ```bash
  ls research/gathering/notes/*hold.md research/gathering/notes/*withdrawn.md 2>&1 | head -n 20
  cat research/data/README.md 2>&1 | head -n 30
  git log --oneline -- research/gathering/notes 2>&1 | head -n 20
  ```

---

## Verdict

| Gate | Domain | Verdict | Evidence bundle |
|---|---|---|---|
| G-L1 | Legal | ☐ PASS / ☐ FAIL | `news.py:66-78`, `REGISTRY.md:12`, `raw/**/README.md` |
| G-L2 | Legal | ☐ PASS / ☐ FAIL | `yahoo.py`, `config.py:5`, `REGISTRY.md:9` |
| G-L3 | Legal | ☐ PASS / ☐ FAIL | `REGISTRY.md:7`, `.gitignore` raw/parquet |
| G-L4 | Legal | ☐ PASS / ☐ FAIL | `REGISTRY.md:7` 지연/look-ahead, `notes/_TEMPLATE.md:28-40` |
| G-Q1 | Quality | ☐ PASS / ☐ FAIL | `config.py:10-12`, `research-design.md:27-30` |
| G-Q2 | Quality | ☐ PASS / ☐ FAIL | `build.py:57-69`, `AGENTS.md:25` |
| G-Q3 | Quality | ☐ PASS / ☐ FAIL | `INTAKE.md:93-99`, `notes/_TEMPLATE.md:7-16` |
| G-Q4 | Quality | ☐ PASS / ☐ FAIL | `build.py:40`, `research-design.md:75-82` |
| G-E1 | Evidence | ☐ PASS / ☐ FAIL | `INTAKE.md:30,92`, `docs/experiments/000` |
| G-E2 | Evidence | ☐ PASS / ☐ FAIL | `INTAKE.md:14-24`, `pizza-hunt.md`, `docs/experiments/README.md` |
| G-E3 | Evidence | ☐ PASS / ☐ FAIL | `pizza-hunt.md:22-24`, `INTAKE.md:66-67` |
| G-E4 | Evidence | ☐ PASS / ☐ FAIL | `notes/_TEMPLATE.md:28-40`, `INTAKE.md:79-93` |
| G-E5 | Evidence | ☐ PASS / ☐ FAIL | `INTAKE.md:101`, `notes/*hold.md` |

P1 Gate **OPEN** iff Legal 4 PASS + Quality 4 PASS + Evidence 5 PASS. 1 FAIL = 차단, 노트에 사유 한 줄 추가 후 재검.

---

## Provenance of this checklist

이 체크리스트의 모든 인용은 로컬 파일의 `path:line`을 직접 읽어 검증했다. 추정은 «모름»으로 표기하며, 외부 검색·스크래핑·성과 숫자 생성은 하지 않았다. 검증은 위 Shell check를 그대로 실행하면 재현된다.

- No scraping → `research/INTAKE.md:28`, `docs/research-design.md:36-37`, `AGENTS.md:24`, `research/gathering/sources/REGISTRY.md:9,12`
- No OOS tuning → `research/INTAKE.md:29,90-91`, `docs/research-design.md:27-30`, `research/src/ls_crude/config.py:10-12`, `AGENTS.md:25`
- No fabricated Sharpe → `research/INTAKE.md:30,92`, `AGENTS.md:28`, `docs/experiments/README.md:18-25`
