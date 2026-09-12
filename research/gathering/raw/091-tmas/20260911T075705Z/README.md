# 091 TMAS — FHWA 연속교통 소표본 수집 (DATA-02)

| 항목 | 값 |
| --- | --- |
| Run ID | `20260911T075705Z` |
| 수집 시각 | 2026-09-11 07:57–08:02 UTC (2026-09-11 16:57–17:02 KST) |
| 작업 디렉터리 | `/Users/noah/orca/ls-crude` |
| 목적 | 쿠싱(OK) 반경 40 km 내 FHWA TMAS 등록 역 스크리닝(후보 3개) + 2016/2023 각 1개월 카운트 파싱 (인샘플 2015–2023만) |
| 상태 | 수집·파싱 완료. 2024+ 미접촉 |

## 권리·출처 근거 (2026-09-11 UTC 확인)

- 공식 페이지: <https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/> — `rights/tmasdata_index.html` (33,254 bytes, sha256 `7322cf3e…`), HTTP 200, 페이지 표기 "Page last modified on March 10, 2026".
  - 페이지 설명(원문): "State highway agencies collect traffic volume data through both temporary traffic counting and continuous traffic counting programs and report their continuous counting data to FHWA on a monthly basis." + "Starting with the 2020 datasets, the traffic monitoring data released is piped delimited … (the original data [prior to 2020] with the rigid fixed column format)."
  - 페이지에 ©·Copyright·이용제한 표기 없음(원문 grep 결과 0건). 파일 링크 전체는 페이지 원문에서 추출.
- 정책 페이지 확인 시도(우회 없음):
  - <https://www.fhwa.dot.gov/webpolicies/> → HTTP 200, **0 bytes** (`rights/fhwa_webpolicies.html`).
  - 페이지 푸터 "Web Policies & Notices"의 실제 링크 → `/webpolicies/publishschedule.cfm` (발행 일정 페이지, 재사용 조항 없음).
  - <https://www.transportation.gov/web-policies> → **HTTP 403** Akamai Access Denied, 원문 `rights/dot_web_policies.html.error.txt`. 규칙에 따라 재시도·우회 없이 중단.
  - <https://highways.dot.gov/about/policies-notices> → **HTTP 403** Akamai Access Denied, 원문 `rights/fhwa_highways_policies_notices.html.error.txt`. 중단.
- 판단: 데이터는 미국 연방정부 공개물(TMAS). 원천 페이지에 제한 표기 없음. 단, 명시적 재배포 라이선스 조항은 이 환경에서 확보 실패(403/빈 응답) → **재배포 조건 미확인**. 이 런은 로컬 연구 분석용으로만 보관하며, 재배포하지 않는다.

## 다운로드 목록 (성공)

| 파일 | URL | bytes | SHA-256 | HTTP | Last-Modified | 수집(UTC) |
| --- | --- | ---: | --- | --- | --- | --- |
| `rights/tmasdata_index.html` | `.../tmasdata/` | 33,254 | `7322cf3e8c50b898367637d2d79ad0d8b8e58db7597fac3d525759b35ee093c3` | 200 | – | 07:57:24 |
| `rights/fhwa_webpolicies.html` | `.../webpolicies/` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | 200 | – | 07:57:42 |
| `rights/fhwa_webpolicies_footer_target.html` | `.../webpolicies/publishschedule.cfm` | 19,725 | `1d645146c07d9abcda21f4036e0dddffc9c67eea1fd180f75abe2e305a01d48e` | 200 | – | 07:58:17 |
| `zips/2023_station_data.zip` | `.../2023/2023_station_data.zip` | 835,077 | `cff460a00e43134723b357737ba372f68bfc581dbb95d8a96298c2ef58501cda` | 200 | 2024-07-02 20:19:20 GMT | 07:58:54 |
| `zips/mar_2016_ccs_data.zip` | `.../2016/mar_2016_ccs_data.zip` | 19,946,970 | `a601c66f7c3e30b620c300ca0889a36f1953406e1ef50e4398448734b714e19e` | 200 | 2019-03-20 14:01:21 GMT | 08:01:14 |
| `zips/mar_2023_ccs_data.zip` | `.../2023/mar_2023_ccs_data.zip` | 26,515,716 | `017de6550a69674dbbc4030edcaf6231a32b70a2b572778b0b99f1fd7d6ce827` | 200 | 2024-07-03 15:37:35 GMT | 08:01:37 |

합계 47,350,742 bytes (상한 2 GiB 대비 2.2%). URL당 1회 수집(재다운로드 없음). 동시 1개(순차).

실패·중단(다운로드 아님, 기록만): `rights/dot_web_policies.html.error.txt`, `rights/fhwa_highways_policies_notices.html.error.txt` (둘 다 HTTP 403).

## 추출 파일 (zip에서 꺼낸 원본)

| 파일 | SHA-256 | bytes | 행/기간 |
| --- | --- | ---: | --- |
| `extracted/2023_station/OK_2023 (TMAS).STA` | `9e6b394077f840d25a135b121c37fc8cd9b76291e9e64fe75d1e8d9a342d2532` | 98,369 | 468 S레코드 / 117개 역, year_record=23 |
| `extracted/mar_2016/OK_MAR_2016 (TMAS).VOL` | `d55444cf924034ac4caeec487967be4d601fcf9f51b23c215d1ae0413a8c41ab` | 1,431,716 | 10,012레코드 / 관측 2016-03 |
| `extracted/mar_2023/OK_MAR_2023 (TMAS).VOL` | `269373638d5b069ca2f411cc966e8196bf2733f1eb404b0df82380ce170d06b4` | 1,065,987 | 8,926레코드 / 관측 2023-03 |

zip 내부 멤버 mtime(참고, 공표일 아님): 2016 파일 2019-03-05, 2023 파일 2024-05-28, 역 메타 2024-05-21.

## 정확한 명령

```bash
# 권리 페이지
python3 research/notebooks/091-tmas/download.py \
  "https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/" \
  --out research/gathering/raw/091-tmas/20260911T075705Z/rights \
  --manifest research/gathering/raw/091-tmas/20260911T075705Z/download_manifest.json \
  --expected-name tmasdata_index.html
# (webpolicies, publishschedule도 동일 방식)

# 데이터 3건
python3 research/notebooks/091-tmas/download.py \
  "https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/2023_station_data.zip" \
  --out research/gathering/raw/091-tmas/20260911T075705Z/zips --manifest …/download_manifest.json
# mar_2016_ccs_data.zip, mar_2023_ccs_data.zip 도 동일

unzip -o -j zips/2023_station_data.zip "OK_2023 (TMAS).STA" -d extracted/2023_station
unzip -o -j zips/mar_2016_ccs_data.zip "3. MAR/OK_MAR_2016 (TMAS).VOL" -d extracted/mar_2016
unzip -o -j zips/mar_2023_ccs_data.zip "OK_MAR_2023 (TMAS).VOL" -d extracted/mar_2023

# 스크리닝·파싱
python3 research/notebooks/091-tmas/parse_stations.py --sta "…/OK_2023 (TMAS).STA" \
  --radius-km 40 --out-all research/indexes/091-tmas/20260911T075705Z/station_screen_all.csv \
  --out-within research/indexes/091-tmas/20260911T075705Z/station_screen_within40km.csv
python3 research/notebooks/091-tmas/parse_volume.py --vol "…/OK_MAR_2016 (TMAS).VOL" --year 2016 \
  --station AVC040 --out-hourly …/avc040_mar2016_hourly.csv --out-daily …/avc040_mar2016_daily.csv \
  --out-quality …/avc040_mar2016_quality.json
# mar_2023 도 동일 (--year 2023)
```

## 재취득 방법

1. `download_manifest.json`의 URL을 `download.py`로 재요청한다(같은 URL이 성공 기록에 있으면 파일 해시 확인 후 재사용).
2. 파일 해시가 위 표와 같으면 동일 빈티지다. 다르면 FHWA가 아티팩트를 갱신한 것이므로 Last-Modified·해시를 새로 기록한다.
3. 파생물은 `research/notebooks/091-tmas/parse_stations.py`, `parse_volume.py`로 재생성한다(의존성: Python 3 표준 라이브러리만).

## 수집하지 않은 것

- 2024·2025 스테이션/월별 파일(아웃샘플) — 미접촉.
- 2011–2025 전체 세트, 다른 월·다른 연도 — 미접촉.
- `.STA` 51개 주 전체 추출 — OK만 추출(원본은 zip에 보존).
- 패키지 설치 없음, sudo 없음, git commit/push 없음.
