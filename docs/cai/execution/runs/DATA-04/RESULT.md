# 실행 결과 — DATA-04 (CHAI/DMR 계열 감사 + SPP 접근·약관 확인)

```yaml
unit_id: DATA-04
status: COMPLETED (DMR 감사) / BLOCKED (SPP 표본 미수집)
run_id: 20260911T102736Z
executed_at_utc: "2026-09-11T10:27:36Z .. 2026-09-11T10:35:00Z"
executed_at_kst: "2026-09-11 19:27 .. 19:35"
repo: /Users/noah/orca/ls-crude
git_head: b981cebe52e52a327ae7d34ad7844f5630b443e4   # 미커밋, commit/push 0건
limits_observed:
  max_total_bytes: 2147483648        # 누적 370,845,364 B (17.27%) — 이 런 신규 시장데이터 0
  concurrency: 1
  max_attempts_per_url: 3            # portal 접속 시도 5회(약관 확인 목적), 전부 타임아웃
  pip_installs: 0
  sudo: false
  no_2024_plus_data: true
forbidden_paths_touched: none
```

## 1. 상태 요약

- **DMR(로컬 실측):** 18개 permit JSON 전량 재파싱 → 1722 flow 행, 동결 CSV와 키 집합
  완전 일치(추가 0·누락 0·중복 0). 시설×outfall×단위×통계기준 32계열 생성. 합산·환산·채움
  0건. train/val funnel과 계열별 판정은 §2.4.
- **선행 문서 정정:** 동결 README/영수증의 “permitsWithFlow 5 of 18” 표기는 같은 영수증의
  `perPermit` 6개 키와도 어긋난다. 이 런의 독립 재파싱으로 **flow 공개 permit = 6개**
  (OK0026701·OK0043320·OK0044598·OK0100374·OKG270057·OKG950028)로 확정한다.
- **SPP(공식 표본):** `portal.spp.org`가 이 환경에서 **TCP 타임아웃**(5회 시도, 0바이트).
  약관은 `www.spp.org`에서 확인·기록. **표본 0바이트, SHA-256 없음.** 우회 없음.
- **정체 판별:** DMR = 실제 신고 관측(EPA ECHO), CHAI v3·SPP v3/v4 엔진 = 합성·스캐폴드.
  CHAI v3 INSTALL 자체가 “합성 데이터는 연구 PASS가 될 수 없다”고 명시한다.

## 2. 후보 A — CHAI/DMR

### 2.1 실제 관측 vs 구조/템플릿/합성

| 대상 | 정체 | 근거 |
| --- | --- | --- |
| DMR (EPA ECHO effluent REST) | **실제 신고 관측** | NPDES 허가시설이 제출한 월별 방류량이 ECHO에 적재된 filed 값. 2026-09-10 keyless 수집, 이 런은 재파싱만 |
| CHAI v3 엔진 (성찬님 수신) | **구조/합성** | `chai_v3_test_output.txt`의 SCENARIO TESTS는 주입 z-점수 시나리오, walk-forward “true activity”도 합성. 실측 입력 0행 |
| CHAI↔DMR 계약 | **미정의** | CHAI가 요구하는 `wastewater_mgd`류 입력에 대응하는 실측은 DMR OK0026701 MGD뿐. 엔진 테스트 수치를 검증 근거로 쓰지 않음 |

### 2.2 무엇을 측정하고 쿠싱과 어떻게 닿는가

- 측정: NPDES parameter **50050 “Flow, in conduit or thru treatment plant”** — 시설이 신고한
  월별 방류 유량(모니터링 기간 종료일 기준). 단위는 filed 그대로 MGD / gal/d / null.
- 연결: ① 시 남부 하수처리장(OK0026701) = 주민·강수·유입수(I&I)의 함수로 쿠싱 시 활동과
  느슨하게 닿음(원유 활동 아님). ② 산업·복원 시설(Greenfield·Skull Creek·Stewart Stone·
  Wildhorse Terminal·Private Property) = 시설 운영의 규제 로그. **어느 계열도 원유 처리량·
  저장량을 직접 재지 않는다.**
- confound: 강수·I&I, 계량·신고 관행, NODI `C`(무방류) 면제, 단위·기준 혼합.

### 2.3 파일 / 소스 / 단위 / 지역 / 기간 / 주기

| 항목 | 값 |
| --- | --- |
| 소스 | EPA ECHO effluent charts REST (keyless), `p_id=<NPDES>` + 명시적 기간 |
| 로컬 원자료 | `research/gathering/raw/091-cushing-dmr/dmr_*.json` (18 permit, 2026-09-10 수집) |
| 지역 | 전 permit header `CWPCity=CUSHING`, `CWPState=OK` |
| 파라미터 | 50050 Flow만 계열화. 전체 634개 파라미터 구분은 `dmr_parameters.csv`에 보존 |
| 단위 / 기준 | MGD 488행 · gal/d 230행 · null 1004행 / MO AVG 861 · DAILY MX 861 (환산·혼합 없음) |
| 기간 / 주기 | 계열별 상이(최장 2015-01-31..2026-07-31), 월별 신고, 관측일=모니터링 기간 종료일 |
| 값 | 880 수치 / 842 null(전부 NODI `C`). 수치 중 162행은 단위 필드 null — 별도 단위 클래스 |
| 수신일 | `ValueReceivedDate` 전 행 존재. 기간종료일 대비 중앙값 +7~17일(음수 1건) — 가용일 규칙 필요 |

### 2.4 계열별 판정 (32계열 = 14 그룹, MO AVG/DAILY MX는 날짜 동일·판정 동일)

| 시설(permit\|outfall\|단위) | 실측 스팬 | obs/수치 | 역할 | 구성요소 준비도 | 최소 다음 개선 1개 |
| --- | --- | --- | --- | --- | --- |
| OK0026701\|001\|MGD — City South STP | 2016-12-31..2026-07-31 | 116/116, 결측월 0 | **proxy hypothesis**(시 하수 흐름) | **사용 가능(기계적 1순위)** — 단일 outfall·단일 단위·연속 116월. `ValueReceivedDate` 가용일 규칙만 추가 | 가용일 = received_date 규칙 확정 후 월간 구성요소로 dev 입력 |
| OK0026701\|001\|null — 동일 시설 2015–2016 | 2015-01-31..2016-11-30 | 23/23 | proxy hypothesis(단위 미표기) | **미준비** — 단위 클래스 null(값 크기는 MGD와 정합하나 환산 금지) | 2016-12 이전 행의 단위를 permit/DMR 원문에서 확인, 불가하면 2016-12부터 사용 |
| OK0043320\|001\|MGD — Greenfield Cushing | 2020-11-30..2022-01-31 | 5/5, 결측월 10(연속 5) | interest | **불가** — 5점 | 없음 |
| OK0043320\|001\|null | 2015-01-31..2026-07-31 | 134/**0** | unusable(전 행 NODI `C`) | **불가** — 수치 0 | 없음 |
| OK0043320\|007\|MGD · 008\|MGD — Greenfield | 2017-02-28..2026-07-31 | 55/55, 결측월 59(연속 6) | proxy hypothesis(처리시설 가동) | **조건부** — 갭 많음, outfall 007·008 합산 불가 | 007/008이 병렬 계열인지 permit 문서로 확인 후 단일 outfall 선택 |
| OK0043320\|007\|null · 008\|null | 2015-01-31..2026-06-30 | 84/14(2015–16), 나머지 NODI | unusable(레거시·단위 미표기) | **불가** | 없음 |
| OK0044598\|gal/d — Skull Creek | 2016-11-30..2026-07-31 | 115/115, 결측월 2 | proxy hypothesis(**정보량 낮음** — 8000/6000 상수 구간) | **조건부** — 분산 부족. 2016-11-30 행 값 `.008`(이후 8000대, 1e6 불일치) filed 보존 | 신고값이 실측인지 명목·최소값인지 확인, 또는 제외 |
| OK0044598\|null — 동일 시설 2015–2017 | 2015-01-31..2017-04-30 | 24/24 | proxy hypothesis(단위 미표기) | **미준비** | OK0026701과 동일: 단위 확인 |
| OK0100374\|001\|null | 2015-01-31..2015-10-31 | 10/4 | unusable(종료 permit) | **불가** | 없음 |
| OK0100374\|002\|null | 2015-01-31..2015-10-31 | 10/0 | unusable | **불가** | 없음 |
| OKG270057\|001\|MGD | 2020-07-31..2020-08-31 | 2/2 | unusable(종료 permit) | **불가** | 없음 |
| OKG270057\|001\|null | 2020-09-30..2021-01-31 | 5/0 | unusable | **불가** | 없음 |
| OKG950028\|001\|MGD — Stewart Stone | 2017-05-31..2025-06-30 | 11/11, 결측월 87(연속 35) | interest | **불가** — 불연속 | 없음 |
| OKG950028\|001\|null | 2015-01-31..2026-07-31 | 128/2 | unusable(대부분 NODI) | **불가** | 없음 |

### 2.5 정렬 (WTI 거래일 · TMAS AVC040 2023)

- WTI 거래일: `CLF_daily_2015-2023.csv` 2262일(2015-01-02..2023-12-29).
- TMAS: AVC040 2023 일별 363일(12개월, DST 결측 2023-03-12·2023-11-05). mar2020은 인샘플
  train 쪽 탐침이지만 TMAS 2023 정렬에는 쓰지 않음.
- 공통 기간(3자): **2023만** (DMR∩WTI∩TMAS). DMR∩WTI는 2015-01–2023-12 관측에 한함
  (2024+ 아웃샘플 미접촉).
- 계열별 공통 수(요약): South STP MGD 2023 12/12일 TMAS 공통, WTI 교집합 전기간 60;
  Skull Creek gal/d 12/12; Greenfield 007/008 MGD 5/5(2023 관측 5개 전부); OKG950028 null
  12/12(NODI 포함 관측).
- 상세: `dmr_tmas2023_common.csv`, `dmr_series_summary.csv`.

### 2.6 train/val 사용가능 행 수 (funnel = 달력일 present → WTI 교집합 → 7일 lookback → 5거래일 라벨)

규칙: train ≤2020-12-31(2015-01-01부터), val 2021-01-01..2023-12-31.
`present/WTI/7d/label` 순. lookback 경계(창 시작+7일)는 전 계열 첫 관측이 2015-01-31 이후라
**실제로 아무 행도 자르지 않음**(WTI 열과 동일). 라벨 경계는 창 끝(2020-12-31·2023-12-31)에
5거래일이 남지 않는 마지막 관측을 자름. 수치 계열은 전 단계 동일(아래 별도 표기 없으면).

| 계열 | train present/WTI/7d/label | val present/WTI/7d/label |
| --- | --- | --- |
| OK0026701\|001\|MGD (MO·MX) | 49/35/35/**34** | 36/25/25/**25** |
| OK0026701\|001\|null (MO·MX) | 23/16/16/**16** | 0/0/0/**0** |
| OK0043320\|001\|MGD (MO·MX) | 1/1/1/**1** | 4/3/3/**3** |
| OK0043320\|001\|null (MO·MX) | 71/50/50/**49** (수치 0/0/0/**0**) | 32/22/22/**22** (수치 0) |
| OK0043320\|007\|MGD (MO·MX) | 24/20/20/**19** | 21/14/14/**14** |
| OK0043320\|007\|null (MO·MX) | 48/31/31/**31** (수치 14/11/11/**11**) | 15/11/11/**11** (수치 0) |
| OK0043320\|008\|MGD (MO·MX) | 24/20/20/**19** | 21/14/14/**14** |
| OK0043320\|008\|null (MO·MX) | 48/31/31/**31** (수치 14/11/11/**11**) | 15/11/11/**11** (수치 0) |
| OK0044598\|001\|gal/d (MO·MX) | 48/35/35/**34** | 36/25/25/**25** |
| OK0044598\|001\|null (MO·MX) | 24/16/16/**16** | 0/0/0/**0** |
| OK0100374\|001\|null (MO·MX) | 10/6/6/**6** (수치 4/2/2/**2**) | 0 |
| OK0100374\|002\|null (MO·MX) | 10/6/6/**6** (수치 0) | 0 |
| OKG270057\|001\|MGD (MO·MX) | 2/2/2/**2** | 0 |
| OKG270057\|001\|null (MO·MX) | 4/3/3/**2** (수치 0) | 1/0/0/**0** |
| OKG950028\|001\|MGD (MO·MX) | 6/6/6/**6** | 3/1/1/**1** |
| OKG950028\|001\|null (MO·MX) | 66/45/45/**44** (수치 2/1/1/**1**) | 33/24/24/**24** (수치 0) |

→ dev 실험에 실제로 쓸 수 있는 수치 계열(label 후): **South STP MGD train 34 / val 25**,
Skull Creek gal/d 34/25(정보량 낮음), Greenfield 007·008 MGD 19/14, 나머지 불가.

### 2.7 이용 조건 — 분석 / 재배포 (분리)

- **분석(내부 연구):** EPA ECHO는 keyless 공개 REST(이 런 로컬 재사용). 공식 EPA 정책·ECHO
  데이터 페이지 2곳을 2026-09-11 확인(HTTP 200)했으나 재사용 문구를 페이지에서 확인하지
  못함 → **분석 사용 장벽은 관측되지 않음, 조건 text는 unverified**(M2 `reuse_verified=false` 유지).
- **재배포:** **미확인.** 공개 전 재배포·출판 조건 확인 필요. 원자료 JSON은 gitignored,
  이번 런도 공개 배포 없음.

## 3. 후보 B — SPP (RTBM LMP-by-bus)

### 3.1 실제 관측 vs 구조/합성

| 대상 | 정체 | 근거 |
| --- | --- | --- |
| SPP portal 파일브라우저 API | **실제 공개 소스(미수집)** | 공식 endpoint `portal.spp.org/file-browser-api/download`, RTBM-LMP-B 최신·일별 파일 |
| SPP v4 엔진(수신) | **합성** | `v4_benchmark_report.json`: `synthetic_rows 110880`, `live_spp_fetch_in_this_runtime: not executed` |
| SPP v3 엔진(수신) | **합성·스캐폴드** | 시나리오 주입 테스트, 실측 없음 |
| 이 런 표본 | **없음** | portal 접속 불가, 0바이트 |

### 3.2 확인한 약관 (URL·확인일·내용)

- `https://www.spp.org/terms-conditions/` (2026-09-11, HTTP 200, 68,249 B)
  - Copyright 절: 게시 자료의 복제·배포는 출처 표기 시 암묵 허용. 단 **“상업적 출판물·상업
    자료에 쓰이거나 SPP가 인용되는 경우” 사전 서면 허가 필요**, 접근이 라이선스를 주지 않음.
    사용 시 hold-harmless/면책 동의로 간주. SPP는 정확성·최신성을 보증하지 않음.
- `SPP External Systems Acceptable Use Policy` (v3.0, 2014-06-27 개정; 위 페이지에서 링크,
  2026-09-11 수령 175,296 B) — UI/API/공개 데이터 포함: 가용성·기능을 해치는 사용 금지,
  “기본 조정 이상 빈도의 폴링”은 **사전 SPP 승인** 필요, FERC Standards of Conduct·Tariff·
  Market Protocols의 기밀·전파 요건 준수, 위반 시 접근 제한.
- `https://www.spp.org/markets-operations/spp-portal/` · `.../user-guides-apis-integrations/`
  (2026-09-11, 200): 포털 안내와 Create Account/Login 존재 — **파일브라우저 API의 계정 필요
  여부는 portal 접속 불가로 확인 못 함.**

### 3.3 정확한 차단(blocker)과 시도 기록

- DNS: `portal.spp.org` → `portal.ha.spp.org` → 198.22.156.62.
- 시도 5회(2026-09-11T10:30Z–10:34Z, concurrency 1): HTTPS GET(30s)·HTTPS GET IPv4(25s)·
  HTTP GET IPv4(15s)·파일브라우저 HEAD(25s)·파일브라우저 GET + `--range 0-2047`(20s) —
  **전부 curl exit 28 TCP 타임아웃, HTTP 코드 000, 0바이트.** `www.spp.org`는 200.
- **우회하지 않음**(미러·대체 호스트·스크래핑 없음). 기록: `spp-access-terms.json`(시도·약관
  인용·해시) + `README.md`.
- fetch했다면 쓸 후보: 공식 패턴 `…/download/rtbm-lmp-by-bus?path=%2F<YYYY>%2F<MM>%2FBy_Day%2FRTBM-LMP-DAILY-B-<YYYYMMDD>.csv`
  (1일 ≤5 MB 선호). **미수집이므로 이 런은 어떤 이력·기간도 주장하지 않는다.**

### 3.4 역할·다음 개선

- 역할: **interest / proxy hypothesis(권역 전력)** — 혼잡(MCC)은 펌핑이 아니며, 유가와의
  관계는 실증 전까지 가설. 직접 원유 활동 지표로 승격 금지.
- 최소 다음 개선(1개): 이 네트워크에서 portal 접속 확보(또는 SPP에 비상업 연구 사용 문의) 후
  **1일 1파일 ≤5 MB** 수령 → 컬럼·타임스탬프·단위($/MWh) QC. 그 전까지 후속 작업 금지.

## 4. 공통 기간 요약 (TMAS·WTI와의 정렬)

| 후보 | DMR/SPP 실제 커버 | WTI 커버 | TMAS 커버 | 3자 공통 |
| --- | --- | --- | --- | --- |
| DMR South STP MGD | 2016-12..2026-07(월간) | 2015-01-02..2023-12-29 | 2023 일별(+2020-03 탐침) | **2023(월 12 obs)** |
| DMR Skull Creek gal/d | 2016-11..2026-07 | 동일 | 동일 | 2023(12 obs) |
| DMR Greenfield 007/008 MGD | 2017-02..2026-07(불연속) | 동일 | 동일 | 2023(5 obs) |
| SPP | 표본 0(미수집) | — | — | **없음** |

## 5. 바이트 회계·제약 준수

| 항목 | 값 |
| --- | ---: |
| TMAS 누적(기존) | 370,845,364 B |
| 이 런 SPP 시장데이터 | **0 B** |
| 누적 시장데이터 | **370,845,364 B** = 2 GiB 상한의 17.27% |
| 이 런 SPP 약관·웹문서(시장데이터 아님, /tmp 보관) | 385,286 B |

- commit/push 0건. pip install 0건. TMAS 재다운로드 0건. 아웃샘플(2024+) 미접촉.
- 금지 경로 무접촉: `app/`, `research/src/`, `research/tests/`, `docs/cai/tasks.json`,
  `docs/cai/ORCHESTRATOR_STATE.md`, 타 후보 폴더. (REGISTRY는 SPP 미수집으로 **미수정** —
  “수집 시 1행” 조건 불충족.)
- 재현: `python3 research/notebooks/091-candidates/dmr_series_build.py research/indexes/091-candidates/20260911T102736Z`
  (stdlib). 산출물 해시·입력 해시: `manifest.json`. SPP 기록: `spp-access-terms.json`.

## 6. 사람에게 보여줄 요약

**DMR:** 실제 관측이지만 규제 로그. 기계적으로 쓸 수 있는 월간 계열은 South STP MGD 하나
(train 34·val 25). 다음 최소 작업은 `ValueReceivedDate` 가용일 규칙 적용뿐. 원유 활동 직접
지표는 아니며 강수·I&I 교란을 통제해야 한다. **SPP:** 표본 0 — portal 접속 자체가 차단이고,
약관상 상업·재배포는 사전 서면 허가가 필요하다. 표본을 받기 전에는 이력·정렬·성과를 주장하지
않는다. **공통:** DMR·WTI·TMAS 3자 정렬 가능 구간은 2023뿐이다.
