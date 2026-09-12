# 091 TMAS 실행 영수증 — run `20260911T075705Z`

## 실행 정보

| 항목 | 값 |
| --- | --- |
| Run ID / 시각 | `20260911T075705Z` / 2026-09-11 07:57–08:02 UTC (16:57–17:02 KST) |
| 작업 디렉터리 | `/Users/noah/orca/ls-crude` |
| Git revision | `b981cebe52e52a327ae7d34ad7844f5630b443e4` (main, dirty: 본 런 산출물은 미커밋) |
| Python | 3.13.15 (표준 라이브러리만, 설치 없음) |
| 동시성 / 재시도 | 1 / URL당 최대 3회 시도, 429 Retry-After 존중. 403은 재시도 없음 |
| 누적 다운로드 | 47,350,742 bytes (상한 2 GiB) |

## 입력 (원본)

| 입력 | 경로 | SHA-256 |
| --- | --- | --- |
| 2023 역 메타 zip | `research/gathering/raw/091-tmas/20260911T075705Z/zips/2023_station_data.zip` | `cff460a00e43134723b357737ba372f68bfc581dbb95d8a96298c2ef58501cda` |
| 2016-03 카운트 zip | `…/zips/mar_2016_ccs_data.zip` | `a601c66f7c3e30b620c300ca0889a36f1953406e1ef50e4398448734b714e19e` |
| 2023-03 카운트 zip | `…/zips/mar_2023_ccs_data.zip` | `017de6550a69674dbbc4030edcaf6231a32b70a2b572778b0b99f1fd7d6ce827` |
| OK 역 메타 (추출) | `…/extracted/2023_station/OK_2023 (TMAS).STA` | `9e6b394077f840d25a135b121c37fc8cd9b76291e9e64fe75d1e8d9a342d2532` |
| OK 2016-03 (추출) | `…/extracted/mar_2016/OK_MAR_2016 (TMAS).VOL` | `d55444cf924034ac4caeec487967be4d601fcf9f51b23c215d1ae0413a8c41ab` |
| OK 2023-03 (추출) | `…/extracted/mar_2023/OK_MAR_2023 (TMAS).VOL` | `269373638d5b069ca2f411cc966e8196bf2733f1eb404b0df82380ce170d06b4` |

## 코드

| 스크립트 | 경로 | SHA-256 |
| --- | --- | --- |
| 다운로더(한도 내장) | `research/notebooks/091-tmas/download.py` | `db318ebecbd9be38266a0f59e3436605fe3f02cb44b1d936563d6921dc4ece1c` |
| 역 스크리닝 | `research/notebooks/091-tmas/parse_stations.py` | `e3d7511d376036179732e5ebecbfbe145f3b769d6efe1911ee84cbe8af21c9da` |
| 월별 파서·품질 | `research/notebooks/091-tmas/parse_volume.py` | `4dc62c9350f30cc5b910c7073e45a1f0b53f6fd377c652b2c68f1b209f65e1ea` |

## 출력 (본 디렉터리)

| 출력 | SHA-256 | 내용 |
| --- | --- | --- |
| `station_screen_all.csv` | `86d2f44948c02a3047b7b3042a2d92e53b18fe7c0420743f284048de8d603b41` | OK 117개 역 거리순(9행 AVC040 최근접) |
| `station_screen_within40km.csv` | `2b2ad311502f0974f597bf8683a597d062b51cf33efb569fafd6d6658a138329` | 40 km 내 3개 역 |
| `avc040_mar2016_hourly.csv` | `8f29a5244ad2aa541cf679f580837641089d0944cfc39d730737b239be83db2a` | AVC040 1,392행 시간별(결측 시간 제외) |
| `avc040_mar2016_daily.csv` | `1975a5a944b066ec0eba9e37b09612564cae49a042aa705952cb2bcdbb0e6013` | 58행 일별 |
| `avc040_mar2016_quality.json` | `c821621f2fea44f2bde0daa6502545b576180d54b18cee30c44519683e7f7ced` | 품질 실측 |
| `avc040_mar2023_hourly.csv` | `1ca48b95aeb6e791c8414e810b31c5f554f34da5f1b7cbe6286bcff32ee63cc1` | AVC040 1,440행 시간별 |
| `avc040_mar2023_daily.csv` | `a3091dfaac47cd57ee71a16c08b225d4f1423cc4f51f87a826b6693d5a7190e7` | 60행 일별 |
| `avc040_mar2023_quality.json` | `aeb5aba7d01be45e639a83e20546a544d004a73ebd0e328a6bb64a48539ce673` | 품질 실측 |

## 스크리닝 요약 (2023 OK)

- S레코드 468 → 고유 역 117. 40 km 내 3개:
  1. **AVC040** — 9.16 km, Payne(119), SH-18(게시 필드)/SH-33(위치문), 4R, travel_dir 2개(3·7), 차선 1
  2. AVC047 — 31.27 km, Lincoln(081), SH-66, 5R, 차선 1
  3. AVC032 — 36.96 km, Payne(119), SH-51, 4U, 차선 1–2
- travel_dir 3/7의 방위 의미는 파일에 코드북이 없어 **미확인**(추정하지 않음).
- 거리만으로 쿠싱 활동 대표성을 주장하지 않는다. AVC040은 서측 접근축의 단일 차로 구간 카운트다.

## 파서 검증 (원문 대조)

- 2016-03-03 dir3: 원문 24시간 합 3,557 = 파싱 일합 3,557 (`hours_present=24`).
- 2023-03-01 dir3: 원문 24시간 합 3,328 = 파싱 일합 3,328 (`hours_present=24`).
- 2023 pipe 끝에 구분자만 있는 빈 필드 1개는 제거(실측: 전 레코드 해당) — hour_23은 데이터 있음.

## 주장할 수 있는 것 / 없는 것

- 가능: 2023 OK 메타에서 쿠싱 40 km 내 TMAS 등록 후보 3개 존재. AVC040이 2016-03·2023-03 두 달에 양 방향 일별 레코드를 가짐. 두 월 파일 전부에서 결측 0.
- 불가: AVC040 카운트가 쿠싱 터미널·파이프라인·물류 활동을 대표한다는 것(미검증). 사업소 제출일·최초 공표일(파일에서 확립 불가). 수집 파일의 재배포 권한(정책 페이지 403).
