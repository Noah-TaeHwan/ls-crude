# 실행 결과 — DATA-01 R1 (REVISION 보완)

```yaml
unit_id: DATA-01
revision: R1
parent_task_id: DATA-01
status: REVIEW
review_mode: SELF_CHECK
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
branch: main
head_sha: b981cebe52e52a327ae7d34ad7844f5630b443e4
working_tree_diff_evidence: tracked clean. 본 작업의 쓰기는 본 파일 1개만.
pre_existing_changes:
  - "원격 main 현재 SHA = cecf1cf (ls-remote 재확인). 정정 근거는 cecf1cf에만 둠."
  - "로컬 HEAD b981ceb. 조상관계 확정(아래 명령): 로컬이 원격보다 뒤처짐."
authorization_evidence:
  - "사용자 승인: REVISION R1 단일 패스. 두 파일 정의·기간·스키마·행수 점검만. 신규 수집·학습·OOS·기존 파일 변경 금지."
changed_files:
  - "docs/cai/execution/runs/DATA-01/20260911T032255Z_R1/RESULT.md (본 파일)"
acceptance:
  DATA-01-AC1: {status: PASS, evidence: "주문량 자료 없음 유지. 라벨 대체 없음."}
  DATA-01-AC2: {status: PASS, evidence: "연간·월간 복제 없음. 아래 KUSH·DMR 행 참조."}
  DATA-01-AC3: {status: PASS, evidence: "§2에서 파일확인/메타기재/행검사/영수증주장/미확인 구분."}
  DATA-01-AC4: {status: PASS, evidence: "미확인 항목 미확인 표기. UNSEEN 단정 없음."}
commands:
  - {command: "date -u +%Y%m%dT%H%M%SZ; git rev-parse HEAD; git branch --show-current; git ls-remote origin HEAD", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "run_id 20260911T032255Z. local b981ceb, remote cecf1cf", classification: PASS}
  - {command: "git merge-base --is-ancestor b981cebe52e52a327ae7d34ad7844f5630b443e4 cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "ANCESTOR_YES. 뒤처짐 확정(단순 SHA 상이가 아님)", classification: PASS}
  - {command: "gh api repos/Noah-TaeHwan/ls-crude/contents/<KUSHZ json>?ref=cecf1cf --jq metadata", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "blob 120c49d5, size 12739", classification: PASS}
  - {command: "gh api repos/Noah-TaeHwan/ls-crude/contents/<DMRZ json>?ref=cecf1cf --jq metadata", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "blob aa14663e, size 776374", classification: PASS}
  - {command: "gh api repos/.../git/trees/cecf1cf:<KUSHZ|DMRZ dir> (이름만)", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "각 README.md·csv·json·receipt.json 존재 확인", classification: PASS}
  - {command: "gh api ... --jq '.content | @base64d' > /tmp/kush.json, /tmp/dmr.json", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "12740 / 776375 bytes 수신", classification: PASS}
  - {command: "gh api .../receipt.json (KUSHZ, DMRZ)", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "영수증 주장 확보(아래 §2)", classification: PASS}
  - {command: "python3 -c (KUSH 집계: 행수·범위·합·0의개수·정렬)", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "221행, 2008-02-01..2026-06-01, 합101, 0이 144개월, 오름차순", classification: PASS}
  - {command: "python3 -c (DMR 집계: 행수·기간·단위분포·통계기준·permit수)", cwd: "/Users/noah/orca/ls-crude", exit_code: 0, summary: "1722행, 2015-01-31..2026-07-31, 단위 None/gal/d/MGD, MO AVG/DAILY MX 혼합, permit 6개", classification: PASS}
not_run:
  - "run 폴더 README.md 열람 — 결과물 포함 가능성에 따라 미개봉"
  - "run 폴더 csv 교차확인 — JSON 실측으로 충분하여 미수행"
  - "OOS·WTI·모델평가 열람·계산 — 보호 규정에 따라 미수행"
  - "신규 수집·QSR 입력·지수 계산·학습 — 승인 범위 밖"
blockers: []
next_unit: TOP3-후속확인카드 생성·실행 승인 요청 (아래 §6)
```

## 1. 기준

- 정정 근거 커밋: 원격 main `cecf1cf` (본 세션 ls-remote 재확인, 변동 없음).
- 로컬 HEAD `b981ceb`. `merge-base --is-ancestor` 확정 → **로컬이 원격보다 뒤처짐(확정)**.
  D項 정정: SHA 상이만으로 단정하지 않고 조상관계를 확인했으므로 "뒤처짐" 표현 유지.
- 원 보고서의 판정 중 아래 정정표에 없는 행은 변경 없음.

## 2. 파일 확인 — 증거 구분표

### KUSH: `research/indexes/091-cushing-operations-nowcasting/20260910T091KUSHZ/kush_operational_attention_monthly.json`

| 구분 | 내용 |
|---|---|
| 파일 확인 | 존재. blob `120c49d5`, 12,739 bytes @cecf1cf |
| 메타데이터 기재 | monthCount 221, range 2008-02-01..2026-06-01, articleSum 101, label "KUSH local operational-attention count, not activity", unit "matching public titles per calendar month; 0 is observed", source "KUSH Radio 1600 AM public WordPress post titles" |
| 행 검사(직접) | rows 221행. 키 `month`·`articleCount`. 첫달 2008-02-01, 끝달 2026-06-01, 오름차순. 합 101, 0인 달 144, 최대 3, 양수 달 77. **메타 기재와 전부 일치** |
| 영수증 주장 | receipt.json: 동일 4값 + zeroMonthCount 144 + maxMonthly 3 + zerosAreObserved + notJoined [WTI, busy score, workers, trucks, footfall] + sourceCsv(20260908T091PZ) + sourceReceipt(ALT-20260908-17 raw README). **일치** |
| 미확인 | 원장 "약 5,200건"과 articleSum 101의 정의 연결 근거 없음 → **미확인 유지** (5,200=수집 universe 추정이나 인용 근거 없어 단정 금지) |
| 역할 | **관심 자료 유지. 현장 활동으로 승격 금지** (label이 "not activity"로 명시) |

A항 정정: 원 보고서 "KUSH 기간 미확인" → **"2008-02-01..2026-06-01, 221개월 (파일 실측)"** 로 정정. 단, 공개시각·결측 정합(월별 공개일·개정)은 여전히 미확인.

### DMR: `research/indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/cushing_echo_dmr_flow.json`

| 구분 | 내용 |
|---|---|
| 파일 확인 | 존재. blob `aa14663e`, 776,374 bytes @cecf1cf |
| 메타데이터 기재 | rowCount 1722, numericCount 880, nullCount 842, dateRange 2015-01-31..2026-07-31, parameterCode 50050 "Flow, in conduit or thru treatment plant", geography Cushing city, perPermit 6개 항목(합 1722) |
| 행 검사(직접) | rows 1722행. 키 15종(permitId·facilityName·city·outfall·parameterCode·monitoringLocation·valueType·statisticalBase·monitoringPeriodEnd·value·unit·qualifier·nodiCode·nodiDesc·receivedDate). 전부 dated(2015-01-31..2026-07-31). 값은 문자열 880 / null 842. **첫 행 unit null 확인**(값 ".86", NODI null — filed 그대로). 단위 분포: null 1004 / gal/d 230 / MGD 488. **유값 중 단위 null 162행**. 통계기준 MO AVG 861 / DAILY MX 861 혼합. permitId 6개 |
| 영수증 주장 | receipt.json: 위 수치와 일치 + null 규칙(NODI null 유지, 0 금지) + 단위 filed 유지(MGD·gal/d·null) + windowingNote. **일치**. 단, receipt `permitsWithFlow: 5` vs perPermit 6항목·파일 6개 — **불일치(미확인으로 기록, 합계 1722는 일치)** |
| 미확인 | 시설별 유량 비교 가능성, 통계기준 혼합 시 집계 규칙, null-unit 유값 162행의 해석. 권한(재배포)은 미확인 |
| 역할 | **규제 방류 로그(수질). 활동·바쁨 측정 아님**. 파일 존재는 학습 가능·도시 바쁨 확정 아님 |

B항 정정: 원 보고서 29행(규제 로그군 뭉뚱그림)에서 **DMR 독립 행 분리**. 단위 불명·이종 시설·이종 통계기준 합산 금지 명시. receipt `valueSumThousandths` 필드 존재하나 단위 혼합이므로 **사용하지 않음**.

## 3. 정정표 C–D

- **C. 위키**: "#2 위키" 행의 기간 표현을 **"2025-04-29..2026-09-09 — 이번 CSV의 확보 범위"** 로 정정. "제공기관 전체에 과거 자료가 없다"는 단정 없음(원 보고서에도 없음). 장기 이력 **미확인 유지**, 신규 수집 안 함.
- **D-1. QCEW**: 후보 표(#20)는 분기가 맞음. 원 보고서 §4 "월별 LAUS 3종·QCEW" 문구를 **"월별 LAUS 3종(2015+)·분기 QCEW(2015-Q1+)"** 로 정정. 표와 결론 일치.
- **D-2. 권리 3분법**: 원 보고서 각 행의 "무료" 표기는 **무료 접근(keyless 공개) 확인**으로 한정. **이용·분석 권한, 재배포 권한은 근거 있는 항목 외 전부 미확인**으로 정정. 예외 없음(CAI 후보 행 기준).
- **D-3. stale/학습 분리**: 숙박세(마지막 2024-06 stale)는 운영 최신성 판단, 60개월 패널 부재는 학습 적격성 판단으로 **별도 표기**. AQS(2003 종료)·PRCP(2021 종료)·GW(2018 종료)도 동일 구분 적용.
- **D-4. 없음/미확정 구분**: QSR "0행"→"observer 파일 없음(사실). 적격 패널 수집 가능성은 열려 있음". AADT 원본→"영수증 미확인". "없음"은 파일·자료 부재 사실에만 사용.
- **D-5. 주3조건 출처**: "주간 성분 최소 3개"는 **DATA-01 작성자 제안(D1 게이트·§4 결론), 승인된 규칙 아님**으로 표기. PROGRAM의 "최대 3개"는 합성 상한 규칙으로 별개임을 명시. 혼동 금지.

## 4. 보호 준수

- 새로 연 OOS·WTI·모델평가 결과 없음. 노출 추가 없음(§2 외 수치 인용 없음).
- run README·csv 미개봉. /tmp 수신 파일은 기록 후 삭제 예정(레포 밖).
- 신규 수집·QSR 입력·계산·학습 없음. 기존 파일 변경 없음.

## 5. 사람에게 보여줄 요약

**작업·상태:** DATA-01 R1 / REVIEW(SELF_CHECK).
**수정한 결론:** KUSH 기간 확정(2008-02..2026-06, 221개월·합101·0이 144개월, 관심 유지). DMR 독립 행 분리(1722행·유값 880·단위 혼합·통계기준 혼합, 합산 금지, 활동 아님). QCEW 분기 표기 일치. 권리는 접근만 확인·이용/재배포 미확인으로 하향. stale/학습 분리. 주3조건은 제안 표기.
**실제 근거:** blob SHA·크기·receipt·직접 집계(§2). 조상관계 확정으로 뒤처짐 표현 유지.
**미확인:** 5,200↔101 정의 연결, DMR permitsWithFlow 5vs6 불일치, KUSH·AADT 등의 공개시각·권리, DMR 162 null-unit 해석.
**변경 파일:** 본 파일 1개.
**다음 작업 하나:** TOP3 후속확인 카드 생성·실행 승인 요청 — 범위: KUSH 공개시각 확인(읽기) + QSR 수동 라벨 기록 개시 1건(사람 입력) + Jet-A 복원 가능 여부 확인(읽기) + RESULT 기록. 학습·OOS·앱 변경 없음.
