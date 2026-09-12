# 실행 결과 — DATA-01

```yaml
unit_id: DATA-01
parent_task_id: DATA-01
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: main
head_sha: b981cebe52e52a327ae7d34ad7844f5630b443e4
working_tree_diff_evidence: tracked clean. 본 작업의 쓰기는 본 파일 1개만.
pre_existing_changes:
  - "로컬 HEAD b981ceb < 원격 HEAD cecf1cf. 로컬 tracked 파일을 최신으로 가정하지 않음."
  - "로컬 untracked: 킷 ZIP·압축해제본·project-plan-cai 문서·raw 덤프·docs/cai/(BOOT-01 설치분). 수정·삭제·업로드 없음."
authorization_evidence:
  - "사용자 승인: DATA-01 읽기 전용 점검 + RESULT 기록. 신규 수집·학습·OOS 금지. 기존 파일·앱·원장 변경 금지."
changed_files:
  - "docs/cai/execution/runs/DATA-01/20260911T030713Z/RESULT.md (본 파일)"
acceptance:
  DATA-01-AC1: {status: PASS, evidence: "주문량 자료 부재 확인(ALT-08/34 KILL). 라벨을 주문수로 바꾸지 않음."}
  DATA-01-AC2: {status: PASS, evidence: "연간 AADT·월간 값을 주간으로 복제하지 않음. 아래 판정표의 주기 열 참조."}
  DATA-01-AC3: {status: PASS, evidence: "문서 존재와 원자료 확인을 구분. 각 행의 근거 열 참조."}
  DATA-01-AC4: {status: PASS, evidence: "노출 미확인 항목은 UNKNOWN/미확인으로 기록. UNSEEN 단정 없음."}
commands:
  - {command: "git ls-remote origin HEAD; git rev-parse HEAD", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "기준 SHA 고정(remote cecf1cf, local b981ceb)", classification: PASS}
  - {command: "make_packet.py --task DATA-01", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "작업 지시문 확인(179행)", classification: PASS}
  - {command: "gh api contents ... (원격 문서·원장·정의서·트리·소형CSV, 읽기만)", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "ledger 73행, PROGRAM, 091 workflow/README, engine README, INTAKE, testing-protocol, 트리 6종, 예시·소형CSV", classification: PASS}
  - {command: "ls research/gathering/raw/; sed heads of raw READMEs; ls research/data/processed/", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "로컬 덤프 목록·영수증 읽기(수정 없음)", classification: PASS}
not_run:
  - "브라우저 검사(ego) — 본 카드 불필요"
  - "app build/typecheck/테스트, research pytest — 본 카드 범위 밖"
  - "신규 수집·지수 계산·상관분석·학습 — 승인 범위 밖"
  - "OOS 성능표·WTI 정답·수익률 열람·계산 — 보호 규정에 따라 미수행"
blockers:
  - "팀 승인(방향·역할) 미확인 — 본 판정은 자료 사실관계만 다룸"
  - "main CI 실패는 결제/한도 차단(코드 검증 미실행)으로 구분"
next_unit: TOP3-후속확인카드(META_PROMPT_BUILDER로 생성 요청)
```

## 0. 조사 기준과 표기

- 조사 기준: 원격 main `cecf1cf` (2026-09-11 ls-remote 재확인). 로컬 tracked 파일(HEAD `b981ceb`)은 인용하지 않음.
- 근거 표기: `[R]` = 원격 @cecf1cf 읽기, `[L]` = 로컬 untracked 읽기(원격에 없음, 수정 없음), `[K]` = 설치된 킷 문서.
- `미확인` = 이번 조사에서 근거를 찾지 못함. 빈칸·추정 없음.

## 1. 연 파일 목록 (이번 작업에서 새로 연 것)

원격[R]: `ledger.csv`(73행 메타), `PROGRAM.md`, `091 workflow.md`, `091 README.md`(상태·가드레일 부분만),
`engine/README.md`, `qsr_observer.example.json`, `meme/091a/` 3종(hotel/avc40/README),
`INTAKE.md`(상단), `testing-protocol.md`, 트리 6종(cushing-busy/data/indexes/candidates/engine/meme),
`meme/wiki.csv`·`stocks.csv` 앞뒤 3행(기간만), `cushing-context.ts` 상단 30행(인터페이스 정의만).
로컬[L]: `raw/` 전체 목록, CAI 관련 raw README 약 40종 상단부, `data/processed/` 목록.
킷[K]: DATA-01 카드, SPEC 06·09절, TASK_MAP, packet.

## 2. 열지 않은 파일 (OOS·결과 보호)

- `meme/README.md`의 WTI 검정 부분, `cfam_ml.json`, `now.json`, `cfam_wti_panel.csv`, 모든 `*.png`
- `research/indexes/*/` 이하 결과·그림, `HUNT-*-stats.csv`·`robustness.csv`류
- `research/data/clf-daily-2015-2026.csv`(존재만 기록), 로컬 `WTI-CLF*/` CSV 내용, `meme` 외 노트북 결과물
- 노출 기록: 원장 메타를 읽는 과정에서 ALT-30·ALT-32행의 OOS 수치 문구를 우연히 접함.
  선택에 사용하지 않았고, 본 판정표에 수치 인용 없음. 두 후보는 CAI 구성과 무관(KILL/PARK).

## 3. 후보 판정표

판정 코드: `구성후보` / `통제` / `관심` / `추가확인` / `보류`. 역할이 둘이면 `주+부`로 표기.

| # | 후보(이름·기존ID) | 실제 측정값 | 지역·주기 | 확인된 기간 | 실제 파일·기록 경로 | 무료·권한 근거 | 공개시점·결측·정렬 | 판정 | 이유와 다음 행동 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | EIA 주간 재고 (091-EIA) | 주별 기말 재고 kbbl. **활동 아님**(탱크 수준) | Cushing 허브·주간 | 2004-04-09..2026-09-04 [R stocks.csv 1171행 상당] + hist XLS 2026-09-09 수집 [R 091 README] | `meme/stocks.csv`(원격 committed) | EIA 공개(무료). API 키 경로 403 기록 [R] | 주간 공개시각·개정 이력 **미확인** | 통제 | 문맥용. 활동 지수 성분 아님. 다음: 수요일 공개시각·개정 이력 확인 |
| 2 | 위키 Cushing 조회 (meme) | 일별 조회수. **관심**(활동 아님) | `Cushing, Oklahoma` 페이지·일간 | 2025-04-29..2026-09-09, 500행 [R wiki.csv] | `meme/wiki.csv`(원격 committed) | Wikimedia 공개 API(무료). Cushing 장기 이력은 **미확인** | 일별 as-of. 결측 **미확인** | 관심+추가확인 | 2015-2023 일별이 없으면 IS 학습 불가. 다음: Pageviews 장기 이력 존재 여부만 확인(수집 아님) |
| 3 | KUSH 월별 (091-KUSH) | 라디오 메타데이터 고정키워드 월별 집계. **관심** | 지역 라디오·월별 | **미확인** (원장: 5,200건 집계 [R ledger]) | 파일 경로 **미확인** | 공개 메타데이터(무료 추정, 권리 미확인) | **미확인** | 관심+추가확인 | **TOP3-1**: 실제 파일·기간 확인이 월간 CAI의 관건 |
| 4 | QSR 식당 라벨 (091-S) | 6점포 Maps 혼잡 라벨, **사람 입력** (주문수 아님) | Cushing Main St·부정기 | **0행** (observer 파일 없음 [R engine 트리], 예시만 [R]) | `record_qsr.py`+예시 존재, 실측 파일 없음 | Maps 열람은 공개이나 역사 API 없음(수집 안 함 [R]) | 전향 수집 | 추가수집(핵심) | **TOP3-2**: recorder로 수집 개시. 90일 룰과 별개로 시작해야 함 |
| 5 | 091-U 산업공고 | 공고 목록 (현장 인원 아님) | Cushing·스냅샷 | 2026-09-08 4건 [R ledger] | 수집 기록(원장). 파일 경로 미확인 | 공개 목록 열람(무료, 재배포 미확인) | 패널 없음 | 추가수집 | 주별/월별 패널화 가능 여부 확인 |
| 6 | 091-Y 펌프가격 | 게시 가격 (**판매량 아님**) | 1개 주유소·1회 | one-shot 2026-09-08 [R ledger] | 수집 기록(원장) | 공개 게시(무료) | 패널 없음 | 보류 | 판매량 자료 없으면 종료 |
| 7 | 091-Z 뉴스 | 헤드라인 1건 (**관심**) | Cushing+산업·부정기 | 2026-09-07 1건 [R ledger] | 수집 기록(원장) | 공개 기사(무료, 재배포 미확인) | 패널 없음 | 관심+추가수집 | 계수 대상 아님. 패널화 여부 확인 |
| 8 | 091-V 허가 | DEQ 인허가 상태 3사건 | Cushing 시설·사건별 | 3건 [R ledger] | 수집 기록(원장) | DEQ 공개(무료) | 월별 패널 없음 | 보류 | 월별 패널 없으면 종료 |
| 9 | 091-M 시청공고 | 공석 수 | Cushing 시청·스냅샷 | 1회분(상세 미확인) [R engine pinch 목록] | 경로 미확인 | 공개 목록(무료 추정) | 패널 없음 | 추가확인 | 실제 파일·기간 확인 |
| 10 | 091-A 숙박세 | 월별 숙박세 USD 12개월 | Cushing 시·월별 | 2023-07..2024-06, stale [R 091a] | `meme/091a/hotel_tax_fy2024.csv`(원격) | 시의회 공개 packet(무료, 재배포 미확인) | 수령지연 약1개월 [R] | 추가수집 | 60개월 패널 없음. 다음: 최신 packet 존재 여부 확인 |
| 11 | AVC40 AADT | 2018 AADT 6,336 (**연간 1점**) | ODOT AVC40·연간 | 2018 1점 [R 091a] | `meme/091a/avc40_aadt.csv`(원격) | ODOT 공개지도(무료) | 2년째 없음 [R] | 보류 | 1점으로 percentile 불가. 원칙 선언대로 종료 |
| 12 | East Main AADT | 연간 AADT+트럭(트럭은 2025만 [R lib]) | East Main·연간 | **미확인** (원본 영수증 없음. 앱 표시만) | 원본 경로 미확인. 코드 참조만 [R lib] | 미확인 | 미확인 | 추가확인 | 원본 경로·영수증 확인. **연간이라 주간 불가 확정적** |
| 13 | 대형차 통행량 | 연간 트럭 대수 | 동·연간 | 미확인 | 동上 | 미확인 | 미확인 | 보류 | 연간이라 주간·월간 불가 |
| 14 | 화물열차 통과 | 쿠싱 화물열차 계수 **없음**. STB EP724=전국 석유차종 주간 [L raw 영수증]. FRA/PHMSA=사고 로그 | — | STB: through 2026-09-02 주간 [L] | STB 공개 XLSX(무료)이나 쿠싱 아님 | — | 추가수집/보류 | 쿠싱 계수 공개원천 미발견. 다음: ODOT/철도 공개 계수 존재 여부만 확인 |
| 15 | 야간조명 밝기·면적 | VIIRS DNB (**정량 폐기**) | 쿠싱 박스·야간 | 스냅샷 2026-09-09のみ [R 091b, 이전 세션에서 경로만 확인·이번 미열람] | look-board (점수 없음) | Worldview 공개(무료) | — | 보류 | RUN/미통과 유지. 지수 성분 금지 [R PROGRAM] |
| 16 | 시설주차·구역출입·산업전력 | 자료 없음 | — | — | 없음 | ERCOT 403 [R ledger ALT-29]. EIA-930 키 필요 [R ledger ALT-46]. OWRB 연간만 [L] | — | 보류/추가확인 | 전력 키 발급은 사람 판단 필요. 주차/출입 공개원천 미발견 |
| 17 | 공항 Jet-A | report-date 4점, metric period 미확인 | KCUH·부정기 | 4점 [R ledger, L jeta 영수증] | [L] 091-jeta-monthly (연료판매표 없음 확인됨) | 시 공개 packet(무료) | 월별 패널 없음 | 추가수집 | **TOP3-3**: metric-period 복원 가능 여부 확인 |
| 18 | 공항 운영 | FAA 5010 연간 추정치만 | KCUH·연간 | 1점 수준 [L ops 영수증] | [L] 091-ops-monthly | FAA 공개(무료) | 월별 없음 | 보류 | 월별 itinerant 없음 확인됨 |
| 19 | LAUS 3종 | 월별 실업률/취업자/경활 (**카운티**) | Payne County·월별 | 2015-01..2026-07, 138+결측1 [L laus 영수증 3종] | [L] 091-laus-* (BLS keyless) | BLS 공개 API keyless(무료) | 2025-10 미공개 기록됨 | 통제/구조 | 쿠싱 아님. 구조·노동 문맥용 |
| 20 | QCEW 분기 | 분기 커버 고용 (**카운티**) | Payne 40119·분기 | 2015-Q1..2026-Q1 [L qcew 영수증]. 2026-Q2 404 | BLS 공개 keyless(무료) | 분기 as-of | 통제/구조 | 쿠싱 아님 |
| 21 | KCUH 기온 일별 | 일 최고/최저 (**기상 통제**) | KCUH·일별 | 2015-01-01..2026-09-10, 4271행 [L kcuh 영수증] | [L] KCUH-20260910 (IEM keyless) | IEM 공개(무료) | 일별 as-of | 통제 | — |
| 22 | Mesonet OILT | 기온/강수/지온/습도/풍속/기압 일별 (**기상 통제**) | Oilton 24.3km·일별 | 2015-01..2026-09, 141파일 [L mesonet 영수증] | [L] 091-mesonet-oilt (keyless) | Mesonet 공개(무료) | 일별 | 통제 | — |
| 23 | USGS 유량/수위 | 일평균 유량/수위 (**수문 통제**) | Payne·일별 | 유량 1987-2026-09-09(14224행), 수위 2017-2018(481행) [L usgs 영수증 3종] | [L] 091-usgs-* (NWIS keyless) | USGS 공개(무료) | 일별 | 통제 | — |
| 24 | 가뭄 주간 | D0+ 면적% (**기상 통제**) | Payne·주간 | 2015-2026, 610행 [L drought 영수증] | [L] 091-drought-payne (USDM keyless) | 공개(무료) | 주간 | 통제 | — |
| 25 | EIA 월별 재고 | 월말 재고 (문맥) | Cushing·월별 | **미확인** (보드 정의のみ [R PROGRAM]) | 원본 경로 미확인 | EIA 공개(무료 추정) | 미확인 | 통제+추가확인 | 주간과 별개 축. 기간·공개시각 확인 필요 |
| 26 | 판매세 STAX | 월별 판매세 분배액 | Cushing 시·월별 | 4 sparse points [R PROGRAM] | [L] STAX-20260910 (OTC 공개 PDF) | OTC 공개(무료) | 분배월. 60개월 패널 없음 | 보류 | 패널 없으면 종료 |
| 27 | 학교 재적 | 연간 재적 (**구조**) | Cushing HS·연간 | 5개 표본, 연도 미확인 [R ledger] | 경로 미확인 | 공식(무료 추정) | 연도 미확인 | 구조+추가확인 | 실제 연도·파일 확인 |
| 28 | 인구/주택/소득/세금/고용구조 | 연간 구조 지표 | Cushing/카운티/ZIP·연간 | PROGRAM 기간 명시(POP/HUC/COC/INC/SOI/LODES) [R]. 로컬 영수증 일부 [L pop CSVs·housing lists·BEA probe] | 정의서+일부 영수증 | Census/BEA/IRS 공개(무료) | 빈티지 단절 기록됨 [R] | 구조 | CAI 구성 아님 |
| 29 | 규제·사고 로그군 | 점검·사고·배출·재해 건수 (**규제/안전 로그**) | Cushing/Payne·연간 희소 | raw 영수증별 확인(ECHO/CWA/DMR/RCRA/SDWIS/TRI/VOC/GHG/PHMSA/FRA/NHTSA/OSHA/NFIP/FEMA/STM/NBI/AQS/PRCP) [L+R] | [L] 각 raw 폴더 (keyless). NHTSA 136행 vs PROGRAM 129건 — 수치 대조 아님, 양쪽 기록 유지 | 공개(무료) | 사건 로그, 월별 패널 아님 | 보류 | 활동 아님. 문맥 참고만 |
| 30 | WTI 가격 입력 | Yahoo CL=F 일봉 OHLCV | WTI·일별 | IS용 2015-2023 2262행 영수증 [L]. committed `clf-daily-2015-2026.csv` 존재(미개봉) | [L] WTI-CLF-IS 영수증 | Yahoo(무료) | IS/OOS 분리 영수증 존재 | 타깃 입력 | OOS 구간 파일 미개봉. 선택에 사용 안 함 |

v4 목업 10개 매핑: 01→#12, 02→#13, 03→#14, 04·05→#15, 06·07→#16(자료 없음), 08→#16, 09→#4(방문 아님·라벨만), 10→#4·#10(주문수 없음·라벨/세금만).
후보 수 강제 없음. WTI 성능으로 고른 후보 없음.

## 4. 결론

- **지금 확보가 확인된 자료**: 주간 EIA 재고(2004+), 일별 위키(2025-04+), 일별 기상(KCUH·Mesonet, 2015+), 일별 수문(유량 1987+), 주간 가뭄(2015+), 월별 LAUS 3종·QCEW(2015+), 월별 숙박세 12개월(stale), 연간 구조군(POP/HUC/COC/INC/SOI/LODES), 규제·사고 로그군(연간 희소). 전부 무료 공개원천, 로컬 영수증 또는 원격 committed 파일로 확인.
- **현재 상태로 학습에 사용할 수 있다고 판단할 근거가 있는 자료**: **없음(활동 변수 기준)**. IS(2015-2023) 내 주간 활동 변수가 EIA(문맥) 외에 없고, 위키는 2025-04부터라 IS 학습 불가. 월간도 활동 패널(QSR 0행·KUSH 기간 미확인·숙박세 stale)이 미비.
- **우선 확인할 후보 최대 3개**: ① KUSH 월별 집계의 실제 파일·기간(관심, 장기면 월간 학습의 한 축). ② QSR 라벨 수집 개시(핵심 활동, 전향). ③ Jet-A 월별 metric-period 복원 가능 여부(월간 활동 다리).
- **주간 CAI 조건**: 미충족. 부족분 = 주간 활동 변수(IS 이력 포함) 3개. 월간 CAI도 위 3개 확인 전에는 조건 미충족.
- **다음 작업 하나**: TOP3 후속확인을 META_PROMPT_BUILDER로 카드화하여 실행. 승인 범위 = 읽기(KUSH 파일·기간, Jet-A/AADT 가능 여부 문서 확인) + QSR 수동 라벨 기록 개시 1건(신규 수집, 사람 입력) + RESULT 기록. 학습·OOS·앱 변경 없음. (병렬 가능 대안: OPS-01·REP-01은 TASK_MAP상 대기 가능.)

## 5. 사람에게 보여줄 요약

**작업·상태:** DATA-01 / REVIEW(SELF_CHECK).
**변경:** 본 파일 1개. 기존 파일·앱·원장 무변경.
**수용 조건:** AC1–AC4 PASS(§상단 yaml). OOS 수치 미인용, 미확인 항목 미확인 표기, 후보 수 강제 없음.
**검사:** 원격 읽기 10여 건 + 로컬 영수증 읽기, 전건 exit 0. CI·앱 테스트·브라우저는 범위 밖으로 NOT_RUN.
**남은 것:** TOP3 확인(위 §4), 팀 승인, CI 차단(별도).
**다음:** TOP3 후속확인 카드 생성·실행(승인 범위 §4).
