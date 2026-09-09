# ALT-20260907-02 (LA항 빈 컨테이너 반출) E1→E2 독립 검토

| 항목 | 값 |
| --- | --- |
| 검토자 | Reality Checker (제3자 독립 검토, 수정 없음) |
| 시각(UTC) | 2026-09-09T01:01:38Z |
| 브랜치 | Noah-TaeHwan/feat-sungchan-candidate-data |
| 작업 디렉터리 | /Users/noah/orca/workspaces/ls-crude/trout |
| 판정 요청 | 성찬 소유 후보 E1→E2 전진의 원본→계산→표/그림→설명→판정 연결 검증 |

## 1. 검토범위 (읽기 전용 + 본 보고서 1개만 작성)

- `research/notebooks/ALT-20260907-02/collect.py` (수집기; `--self-test`, `--run 20260909T003314Z`만 실행)
- `research/gathering/raw/ALT-20260907-02/20260909T003314Z/request.json` + `README.md` (+ `pola_*.html` 13건은 해시·크기·핵심 셀만 확인, 원본 불변)
- `research/indexes/ALT-20260907-02/20260909T003314Z/` (`README.md`, `quality.json`, `display.json`, `observation.svg`)
- `research/indexes/ALT-20260907-02/README.md`, `access-receipt.json`
- `research/data/processed/ALT-20260907-02/20260909T003314Z/monthly.csv` (`--run` 재생성 후 대조)
- `research/candidates/ALT-20260907-02.md`, `research/candidates/ledger.csv` (ALT-02 행)
- `research/gathering/notes/2026-09-09-la-port-empty-exports-access.md`, `research/gathering/sources/REGISTRY.md` (Port of Los Angeles 행)
- `app/app/lib/empties.ts`, `app/app/lib/empties.server.ts`, `app/app/components/empties-observation.tsx`, `app/app/routes/empties.tsx`, `app/app/routes/home.tsx`, `app/app/routes.ts`, `app/tests/empties.test.mjs`

금지 준수: 위 파일 외 수정·생성 없음. `--collect`·네트워크 수집·PR·배포·브라우저 조작 없음. 원본 HTML 불변.

## 2. 직접 실행한 명령과 결과

### 2.1 수집기 자가검사

```bash
python3 research/notebooks/ALT-20260907-02/collect.py --self-test
```

- 결과: `SELF-TEST PASS` (종료 0). 직전에 모의 403 중단 로그 `run 20260909T005852Z: aborted` 1줄 출력은 자가검사 내부 모의 수집(샌드박스 `tempfile`, 403 뒤 중단·영수증 보존 케이스)의 정상 출력이다.
- 부수효과 확인: `research/gathering/raw/ALT-20260907-02/20260909T005852Z` 미생성. 실제 run 폴더에 쓰기 없음.
- 자가검사覆盖(코드 독해 + 통과): 정상 1·음성 6(연간 총계표 거부·월 누락·월 중복·잘못된 날짜·빈값·잘못된 단위·부분공백·연도불일치·외래라벨·비격리 오염)·민감도 2(소수반올림·분모)·함정 1(총계만 맞고 분할 0.01 오류는 strict 분할 검사에서 실패해야 함)·모의중단 1. 노트 §검토와 완료의 “정상 1·음성 6·민감도 2·함정 1·모의중단 1” 서술과 일치.

### 2.2 파생물 재생 (`--run`, 결정적 재현 확인)

재생 전 해시:

- `monthly.csv` `3de4bdf2527c1a0973d8025a190f852ac8c730d88d56887920acda5f03609c25`
- `display.json` `d22ece552349bffc96eb7e13976eea45d07fdfd454764be8585ccf35f57be5d8`
- `observation.svg` `a4aa5704579fbcc14dd6e2b88a8f861038cc3f977dbacb6c64be7368c5054e51`
- 이상 3건은 재생 전 `quality.json`의 `output_sha256`과 일치했음.

```bash
python3 research/notebooks/ALT-20260907-02/collect.py --run 20260909T003314Z
# {"months": 138, "first": "2015-01", "last": "2026-07",
#  "mismatches": ["2020-07", "2022-11", "2025-03", "2025-10"], "yoy_mismatches": 0}
```

- 재생 후 3건 해시 동일(위와 바이트 일치). 결정적 재현 확인. `quality.json` 자체는 `output_sha256` 3건을 그대로 유지.
- `monthly.csv` 139줄(헤더+138행), `first=2015-01`, `last=2026-07`, 정렬·유일성 통과.

### 2.3 `monthly.csv` 독립 계산 대조 (수집기 로직 재사용 없이 `csv`+`Decimal`로 재계산)

| 주장 (quality.json / index README) | 독립 재계산 | 결과 |
| --- | --- | --- |
| 138개월, 2015-01~2026-07 | 138행, first 2015-01, last 2026-07, 정렬·유일 | 일치 |
| 2020-11 제외 | `2020-11` 없음, `2020-10`·`2020-12` 있음 | 일치 |
| IS(2015~2023) 107개월 | `2015-01`~`2023-12` 107행 | 일치 |
| 미래 미관측 2026-08~12 결측(0 미충전) | 패널에 없음, `quality.missing_months.2026=[August…December]` | 일치 |
| 수입 쪽 137/138 | `loaded+empty==total` 137 | 일치 |
| 수출 쪽 134/138 | 134 | 일치 |
| 총계 135/138 | 135 | 일치 |
| 불일치 4개월 | `2020-07, 2022-11, 2025-03, 2025-10` | 일치 |
| 비중식 `S_m=100·Empty/(Empty+Loaded)` 전행 | 전행 오차 <5e-7, 불일치 0 | 일치 |
| 비중 범위 44.42%~82.57% | min 44.42, max 82.57 | 일치 |
| 최소 분모 217,961 TEU (2020-03) | `2020-03` 217,961.00이 최소 | 일치 |
| 최신월 2026-07: Loaded 111,775.50 + Empty 348,691.25 = Total Exports 460,466.75, 비중 75.73% | CSV 동일, `empty_export_share_pct=75.725609` | 일치 |
| 제공 전년차 125/125 (허용오차 0.015%p) | compared 125, matched 125, mismatches [] | 일치 |
| 연간행 8/12 | compared 12, matched 8, mismatches 4 (`2020, 2022, 2025, 2026`) | 수치 일치, 단 §3-2 서술 누락 있음 |
| 메인 최신월 3/3 (ref 2026-07) | 독립 파싱으로 3/3 재확인(아래) | 일치 |
| `display.json` 138점·월별 일치 | `candidateId/runId/points=138`, 표본 3개월(`2015-01, 2022-11, 2026-07`) loaded/empty/share 전일치 | 일치 |

메인 교차대조 독립 확인(수집기 `parse_main_latest` 미사용, 별도 `HTMLParser`):

- `pola_main.html` 최신월 헤더 `July 2026 2025 Change % Change`.
- `Loaded Exports 111,775.50` = CSV `2026-07 loaded_exports`.
- `Total Empty 349,137.25` = CSV `446.00+348,691.25`.
- `Total 960,464.25` = CSV `total_teus`. 3/3 일치.
- 2020-11 격리 근거 원본 셀 직접 확인: `pola_2020.html` November행 Total 셀 `889.,748.15` 실재. 분할합 `466,067.40+423,678.75=889,746.15`와 숫자 자체가 불일치하므로 격리 사유(추정·수정 없이 제외) 타당. `quality.quarantined_months[0].bad_cell/error/clean_cells`와 일치.

개별 dust(제공값−분할합, TEU):

- `2020-07` 수입 0.00 / 수출 +0.05 / 총계 0.00.
- `2022-11` 수입 0.00 / 수출 +100.00 / 총계 −100.00.
- `2025-03` 수입 0.00 / 수출 +2.00 / 총계 −2.00.
- `2025-10` 수입 +3.00 / 수출 +4.00 / 총계 −7.00.
- run README 표의 부호(수입·수출 `Loaded+Empty−Total`, 총계 `Imports+Exports−TEUs`)와 반대 부호로 일치. 앱 `KNOWN_TOTAL_DUST` 4건(0.05/100/2/4)은 수출측 기준과 일치.

### 2.4 앱 테스트

```bash
node --test tests/empties.test.mjs   # app/ 디렉터리에서
# pass 2, fail 0
# - accepts the frozen 138-month panel and rejects damaged copies
# - fails closed on wrong vintage, gaps, and bad arithmetic
```

- `EMPTIES_RUN{candidateId ALT-20260907-02, runId 20260909T003314Z, months 138, first 2015-01, last 2026-07, quarantined [2020-11]}`은 패널과 일치.
- `empties.server.ts`의 상대 import `../../../research/indexes/.../display.json`, `quality.json`은 테스트 통과로 경로 유효성 확인. `readEmptiesView`는 `monthlyMismatches=4`(quality 불일치 월 수), `annualMatched/Compared=8/12`를 그대로 노출하므로 §3-2의 문서 누락과 달리 앱 숫자는 quality 정본과 일치.
- `routes.ts`에 `observations/empties` 등록, `home.tsx` loader가 `readEmptiesView()`를 포함하고 `<EmptiesObservation view={empties} />` 렌더. 컴포넌트는 격리월 null 삽입으로 선 단절, 분모 매월 변경 고지, TEU≠중량·금액 고지, Total 셀 먼지 한계 고지. 과장(WTI 방향 판단) 문구 없음.

### 2.5 카드↔원장↔노트↔REGISTRY↔index README 대조

| 축 | 값 | 일치 |
| --- | --- | --- |
| 카드 `collection_status/test_status/evidence_level/decision` | COLLECTED / NOT_RUN / E2 / PARK | 원장 행 동일, 노트 “실제 수집·관측 E2 / PARK / 가격 관계 NOT_RUN” 동일, index run README “관측 구성 E2 / PARK / WTI 관계 NOT_RUN” 동일 |
| coverage | 138개월 2015-01~2026-07, 2020-11 격리, 2026-08~12 결측 | 5곳 동일(원장 decision_reason “138개월…IS 107개월” 포함) |
| 대사 수치(수입137/수출134/총계135, 전년차125/125, 메인3/3) | 카드 §5 results·index run README·노트 동일 | 일치(연간행만 §3-2 누락) |
| owner/next | 손성찬 / 2026-09-16 | 카드·원장·노트(“손성찬(사람 배정 제안), 09-16”) 동일 |
| 수집 영수증(13/13 200, 2.5초 간격, UA, URL 패턴) | request.json 13건 전부 200, raw README 표 bytes·sha256 전건이 request.json과 일치, 앱·노트 서술과 일치 | 일치(단 총합 bytes만 §3-1 불일치) |
| REGISTRY Port of Los Angeles 행 | URL·무료+credit 조건·익월 후반/15일경·13/13 200·138개월·카드 링크 유효 | 일치 |
| 외부 링크 | `portoflosangeles.org` 2건 유효(접속 미시도, URL 패턴이 request.json과 일치) | 일치 |
| 로컬 링크 | 카드 6건 OK, 노트 3건 OK, index 상위 README 4건 OK, REGISTRY ALT-02 링크 OK / run README 2건 BROKEN(§3-3) | 2건 깨짐 |

`raw_path`·`derived_path`·`script_path`·`index_record` 4경로 실재 확인. `collection_command --collect`와 `retrieved_at 2026-09-09T00:33:14Z~00:33:57Z`는 request.json 시작·완료시각과 일치. 원본(`pola_*.html`)·파생(`monthly.csv`)은 `.gitignore`(`research/gathering/raw/**`, `research/data/processed/`)로 git 제외 확인(`git check-ignore` 일치). `__pycache__` 실행 부산물은 범위 외 기존 무시 규칙 내.

## 3. 발견한 문제 (수정하지 않고 기록만, 심각도 포함)

### 3.1 [중] 원본 총 bytes 과대 기재 — 1,693,874 ≠ 실측 1,671,875

- 위치: `research/indexes/ALT-20260907-02/20260909T003314Z/README.md` “수집 원본 13 파일·1,693,874 bytes”, `research/gathering/notes/2026-09-09-la-port-empty-exports-access.md` “원본 13 파일·1,693,874 bytes”.
- 실측: `request.json` 13건 bytes 합 = 1,671,875. 항목별 파일 크기(`pola_main.html` 129,203 … `pola_2026.html` 134,240)가 request.json과 전건 일치하므로 개별치는 정확하고 총합만 +21,999 과대.
- 영향: 패널·대사 자체는 무영향(개별 해시·행수 유효). 다만 “원본→표” 증거 체인의 총량 서술이 재계산과 어긋나므로 정본 수치로 정정 필요.

### 3.2 [중] 연간행 2026 불일치 누락 — quality는 4건인데 문서는 3건만 설명

- 정본: `quality.json annual_total_check compared 12 matched 8 mismatches [2020, 2022, 2025, 2026]`. 2026 내역: 관측 7개월 합 `loaded_imports 3,175,443.00` vs 제공 연간행 `3,175,433.00`(차이 10.00), 나머지 6열 일치.
- 문서: run README 표는 “2015~2019, 2021, 2023, 2024 8개년 일치 + 2020·2022·2025 불일치”로 11개년만 설명하고 2026행을 빠뜨림. 카드 §5 `results`도 “연간행 8/12 일치(2020 비교불가·2022 100·2025 3.00/6.00 불일치)”로 2026 미언급. 8/12라는 분수 자체는 맞지만 내역이 1건 부족.
- 영향: 연도별 대사 커버리지가 11/12로 보임. 2026이 YTD 7개월 vs 제공 연간행(부분합 성격) 비교라는 성격注記와 함께 4번째 불일치로 추가되어야 함. 앱 `annualMatched/Compared`는 quality를 그대로 쓰므로 앱 숫자는 정확.

### 3.3 [하~중] 깨진 로컬 링크 2건 (동일 파일)

- 파일: `research/indexes/ALT-20260907-02/20260909T003314Z/README.md`.
- (a) 12행 `[월별 수치](monthly.csv는 processed에만 있으며 Git 제외; 표시 사본 display.json)` — 링크 target에 공백·서술문이 들어가 `monthly.csv는`이라는 없는 경로를 가리킴. 의도는 `display.json`(동일 폴더, 실재) 또는 git 제외인 processed 경로의 설명이었을 것으로 보이나 현 형태는 렌더러에서 깨짐.
- (b) 98행 `[원본 안내](../../gathering/raw/ALT-20260907-02/20260909T003314Z/README.md)` — 현재 폴더 깊이(`research/indexes/ALT-20260907-02/20260909T003314Z/`)에서 `../../`는 `research/indexes/`이므로 불일치. 정경로는 `../../../gathering/raw/ALT-20260907-02/20260909T003314Z/README.md`. 같은 파일 4행 `[후보 카드](../../../candidates/...)`는 깊이가 맞아 OK이므로 (b)만 한 단계 부족.
- 영향: 증거 체인 내비게이션 단절. 데이터 무결성과 무관.

### 3.4 [하] 앱 검증이 수출측 dust만 확인 — 수입측(+3.00)·총계 미검증

- 위치: `app/app/lib/empties.ts KNOWN_TOTAL_DUST` + `readEmpties` dust 검사(`totalExports−(loaded+empty)`만 대조).
- 실측: `2025-10` 수입측 dust +3.00(§2.3)이 앱 검사 밖에 있음. 수입측이 변조·오입력되어도 `readEmpties`는 통과 가능. `S_m`이 수출 분할만 쓰므로 관측치 자체는 영향 없으나, “검증에 실패하면 빈 화면”이라는 fail-closed 서술의 범위가 수출측에 한정됨.
- 영향: 현 빈티지 표시 무결성에는 무영향(수출측 4건은 전부 가드됨, 테스트의 `dustShift/cleanShift`도 수출측). 장부상 한계로 명시하거나 수입측 가드를 추가할지 결정 필요.

### 3.5 [하] 상세 화면의 GitHub `main` 링크 2건은 머지 전 404

- 위치: `app/app/components/empties-observation.tsx` 상세 하단 “후보 카드”“수집·대사 기록” 링크(`.../blob/main/research/...`).
- 현 브랜치(`Noah-TaeHwan/feat-sungchan-candidate-data`) 미머지 상태에서는 `main`에 해당 파일이 없어 404. 머지 후 해소되는 일시적 문제이나, 검토 시점 기준으로는 외부 증거 링크 단절.
- 영향: 로컬 증거와 무관. 브랜치 고정 링크 또는 상대 경로 안내가 있으면 해소.

없음으로 확정할 수 없었던 항목: 없음. 위 5건이 전부이며, 이 밖에 수치 위조·표본 부풀리기·WTI 관계 과장·원본 수정 흔적은 발견하지 못했음(원본 Total 오타는 격리되었고 S_m 계산에 Total 셀을 쓰지 않음).

## 4. 남은 제약 (E2의 경계, 이번 검토가 해제하지 않음)

- 월별 최초 공표일·개정 빈티지 미복원: `available_at`은 “익월 후반·15일경” 안내 수준. as-of-safe 미입증이므로 WTI 검정 NOT_RUN·PARK 유지 타당. 2024년 이후 열람분은 SEEN이며 미열람 OOS 소급 불가(카드·노트·README 일관되게 고지).
- 분할 셀 자체 오류의 잔여 위험: Total 셀 대사는 통과해도 Loaded/Empty 분할 셀 자체의 오기는 이 대사로 잡히지 않음. 문서는 이를 명시하고 있음.
- 사람 팀원의 동일 빈티지 인계·재현 미검증: `--run` 재현은 동일 원본 폴더 기준 결정적 재현까지만 보증. 공식 페이지 변경 시 동일 URL 재다운로드가 같은 빈티지를 보장하지 않음(README에 명시).
- 검정 명세 미동결: IS 107개월 확보는 관측 확보이지 검정 근거가 아님. 손성찬의 공표일·개정 확인 또는 허용 인계 경로 확정 후 2015~2023 별도 명세 동결이 다음 관문(next_review 2026-09-16).

## 5. 결론

- 핵심(E1→E2 실체): 138개월 패널·2020-11 격리·3식 대사·전년차 125/125·메인 3/3·그림·앱 fail-closed 표시의 연결이 끊기지 않고 독립 재계산과 일치함을 확인. `SELF-TEST PASS`, `--run` 결정적 재현, `node --test` 2/2 통과.
- 문서 정합: 총 bytes·연간 2026 내역·로컬 링크 2건의 정정 필요(§3.1~3.3). 앱 가드 범위(§3.4)와 머지 전 외부 링크(§3.5)는 하위 이슈로 기록.
- E2/PARK/NOT_RUN 유지에 동의. PARK 해제는 §4 관문 충족 후 별도 검정 명세 동결이 조건.

REVIEW_ISSUES

## 6. 사후 수정 확인 부기 (2026-09-09 UTC, 메인 작성 — 검토자 원문 불변)

§3.1~§3.4 수정 완료, §3.5 병합 후 해소 확인. 검증: 수집기 self-test PASS·`--run`
결정적 재생·원장 68카드 check PASS·깨진 로컬 링크 0건(4개 문서 전수 검사)·
앱 empties 테스트 2/2·main 브랜치 링크 2건 SHA 해석 확인.
검토자의 REVIEW_ISSUES 판정은 유지한다. E2/PARK/NOT_RUN 유지에 변동 없음.
