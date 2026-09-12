# 실행 결과 — DATA-02 (FHWA TMAS 쿠싱 소표본 실수집 시험)

```yaml
unit_id: DATA-02
status: COMPLETED
run_id: 20260911T075705Z
executed_at_utc: "2026-09-11T07:57:04Z .. 2026-09-11T08:02Z"
executed_at_kst: "2026-09-11 16:57 .. 17:02"
repo: /Users/noah/orca/ls-crude
git_head: b981cebe52e52a327ae7d34ad7844f5630b443e4   # 미커밋, 커밋·푸시 없음
limits_observed:
  max_total_bytes: 2147483648        # 실제 47,350,742 B (2.2%)
  concurrency: 1
  max_attempts_per_url: 3
  http_403: stop_no_retry_no_bypass
  no_2024_plus_data: true
  pip_installs: 0
  sudo: false
forbidden_paths_touched: none
```

## 1. 상태 요약

- **COMPLETED.** 쿠싱 40 km 내 TMAS 등록 역 3개 확인, 최근접 **AVC040**(9.16 km, Payne County)을 선택해 2016-03·2023-03 두 달 카운트를 파싱했다.
- 받은 것: 공식 권리·설명 페이지 1건(33 KB), 2023 역 메타 zip(835 KB), 2016-03·2023-03 월별 zip(46.5 MB). 합계 **47,350,742 B**.
- 받지 않은 것: 2024·2025 파일 전체(아웃샘플, 미접촉), 2011–2025 전체 세트, 다른 월·연도, **2024+ 월별 데이터**.
- 파생물: 역 스크린 CSV 2건, AVC040 시간별/일별 CSV 4건, 품질 JSON 2건, 코드 3건. 전부 해시 기록.

## 2. 권리·출처 근거 (2026-09-11 UTC)

| 확인 URL | 결과 | 말한 것 |
| --- | --- | --- |
| `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/` | 200, 33,254 B (`7322cf3e…`) | 공식 설명: 주 교통국이 상시 카운트를 월 단위로 FHWA에 보고. "2020 datasets부터 파이프 구분, 그 이전은 rigid fixed column". ©·이용제한 표기 없음. 페이지 수정일 March 10, 2026. 파일 링크 196개(연도별) |
| `https://www.fhwa.dot.gov/webpolicies/` | 200, **0 B** | 내용 없음 |
| `https://www.fhwa.dot.gov/webpolicies/publishschedule.cfm` (푸터 실제 링크) | 200, 19,725 B | 발행 일정. 재사용 조항 없음 |
| `https://www.transportation.gov/web-policies` | **403** Akamai Access Denied | 원문 보존 `rights/dot_web_policies.html.error.txt`. 재시도·우회 없음 |
| `https://highways.dot.gov/about/policies-notices` | **403** Akamai Access Denied | 원문 보존 `rights/fhwa_highways_policies_notices.html.error.txt`. 재시도·우회 없음 |

- 데이터는 미국 연방정부 공개물(TMAS). 원천 페이지에 제한 표기 없음.
- **명시적 재배포 라이선스 조항은 이 환경에서 확보 실패(403·빈 응답) → 재배포 조건 미확인.** 로컬 연구 분석용 보관만. 재배포 없음.

## 3. 스테이션 스크린 (40 km, 거리 = 1차 스크린일 뿐)

| 순위 | 역 | 거리 | county | route | f_system | 차선 | 관측 |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| 1 | **AVC040 (선택)** | **9.16 km** | Payne 119 | SH-18(게시)/SH-33(위치문) | 4R | 1 | 2016·2023 모두 존재 |
| 2 | AVC047 | 31.27 km | Lincoln 081 | SH-66 | 5R | 1 | 2016·2023 모두 존재 |
| 3 | AVC032 | 36.96 km | Payne 119 | SH-51 | 4U | 1–2 | 2016·2023 모두 존재 |

선택 이유: 40 km 내 최근접 + Payne County + 2016/2023 두 표본 월 모두 2방향 일별 레코드. **단, 거리만으로 쿠싱 활동(터미널·물류) 대표성을 주장하지 않는다 — 미검증.**
연결 근거(원천 필드): AVC040 = Payne County 119, LRS `000002HX0000`, 위치문 `H-33, 0.50 miles E of SH-18, W of Cushing`, 게시 경로 필드 `0018On S`(SH-18) — **게시 필드와 위치문 불일치 원문 그대로 기록**.

## 4. 수집·파싱 결과

| 파일 | 용도 | bytes | 관측 | 레코드 |
| --- | --- | ---: | --- | ---: |
| `zips/2023_station_data.zip` | 역 메타 | 835,077 | year_record=23 | OK 468 (117역) |
| `zips/mar_2016_ccs_data.zip` | 구형 카운트 | 19,946,970 | 2016-03 | OK 10,012 (88역) |
| `zips/mar_2023_ccs_data.zip` | 신형 카운트 | 26,515,716 | 2023-03 | OK 8,926 (80역) |

- 두 형식 차이 실측: 2016 = 141자 고정폭 `[13:15]=YY, [15:17]=MM, [17:19]=DD, [19]=dow, [20:140]=24×5자`; 2023 = 파이프 헤더(`hour_00..hour_23`).
- **주의: source ZIP의 CRBI v5 엔진이 가정한 2013-style 고정폭([13:17]=4자리 연도)은 실제 2016 파일과 다르다.** 엔진 파서를 그대로 쓰면 날짜가 틀어짐(예: '1603'을 연도로 읽음). 본 런은 실측 바이트 기준 파서를 새로 작성해 검증했다.

## 5. 품질 실측 (요약, 전체 표는 `quality_table.md`)

| 항목 | 2016-03 | 2023-03 |
| --- | --- | --- |
| 관측일 | 2016-03-01..31, dir별 29일 (결측 13, 28) | 2023-03-01..31, dir별 30일 (결측 12) |
| 방향/차선 | dir 3·7, lane 1 | dir 3·7, lane 1 |
| 단위 | vehicles/hour (필드 그대로) | vehicles/hour (필드 그대로) |
| 결측 시간 셀 | 0 / 1,392 | 0 / 1,440 |
| 0값 셀 | 0 | 0 |
| 중복 키 | 0 | 0 |
| lane0+lane별 공존(파일 전체) | 0 | 0 |
| 일합 원문 대조 | 3,557 = 3,557 | 3,328 = 3,328 |

- 두 해 모두 DST 시작 일요일(2016-03-13, 2023-03-12)이 결측. 파일만으로 원인 확립 불가 → **원인 unknown**.
- 공표 시점: 기관 제출일 **unknown**, 최초 공표일 **unknown**. 아티팩트 갱신 근거만 기록(2016 zip mtime 2019-03-05/Last-Modified 2019-03-20; 2023 월 zip mtime 2024-05-28/Last-Modified 2024-07-03; 2023 역 zip mtime 2024-05-21/Last-Modified 2024-07-02). 지연을 추정하지 않음.

## 6. 재현·증거 경로

- 원본·영수증: `research/gathering/raw/091-tmas/20260911T075705Z/` — README, `download_manifest.json`, `rights/*`, `zips/*`, `extracted/*`.
- 파생·영수증: `research/indexes/091-tmas/20260911T075705Z/` — README(입력→코드→출력 해시), 스크린/품질 CSV·JSON.
- 코드: `research/notebooks/091-tmas/download.py`, `parse_stations.py`, `parse_volume.py` (표준 라이브러리만).
- 이 런 폴더: [`receipts.json`](receipts.json) (URL·상태·해시·한도), [`quality_table.md`](quality_table.md).

## 7. 차단·한계

- 데이터 경로 차단 없음(모든 데이터 URL 200).
- 정책 페이지 2건 403(Akamai WAF) — 우회 없이 기록. 재배포 조건 미확인.
- AVC040의 쿠싱 활동 대표성 **미검증**. 방향 코드(3/7) 방위 의미 **미확인**(코드북 없음).
- 최초 공표일·기관 제출일 unknown → look-ahead 확정 전 검정 입력으로 승격 금지.

## 8. 다음 경로 1개 (권고)

**AVC040 인샘플 월별 패널 확장(예: 2023년 12개월 OK 파일만, ≤2 GB 내) 후 일별 시계열 품질·결측·계절성 검정.**
이유: 40 km 내 역이 실재하고 두 형식 파싱이 검증됐으므로 CRBI v5 프록시의 최소 입력을 만들 수 있는 유일한 다음 단계. SPP v4/CHAI v3 전환은 "40 km 내 역 없음" 분기이며 해당 없음. 단 신호 승격 전 대표성·공표시점 검증 필요.

## 9. 금지 경로 준수

- 쓰기: 위 `.../091-tmas/**`(raw·index), `research/notebooks/091-tmas/**`, `research/gathering/notes/2026-09-11-fhwa-tmas-cushing-trial.md`, `research/gathering/sources/REGISTRY.md`(행 1개 append), `docs/cai/execution/runs/DATA-02/**`만.
- `app/`, `research/src/`, `research/tests/`, `docs/cai/tasks.json`, `docs/cai/ORCHESTRATOR_STATE.md`, 타 후보 폴더 미접촉. git commit/push 없음.
