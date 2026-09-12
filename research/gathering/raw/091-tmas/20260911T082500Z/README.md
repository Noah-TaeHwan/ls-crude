# 091 TMAS — FHWA 연속교통 2023 12개월 확장 + 2020 경계 탐침 (DATA-03)

| 항목 | 값 |
| --- | --- |
| Run ID | `20260911T082500Z` |
| 수집 시각 | 2026-09-11 08:35:34–08:38:03 UTC (월별 러너) + 08:40:28 UTC (2020 역 메타 1건) |
| 작업 디렉터리 | `/Users/noah/orca/ls-crude` |
| 목적 | AVC040 기준 2023 12개월 카운트 패널 + 2020-03 형식 경계 실측 + 2020 역 메타 연속성 확인 |
| 상태 | 수집·파싱 완료 (`DONE 2026-09-11T08:38:03Z`). URL 실패 0건. 2024+ 미접촉 |
| 누적 다운로드 | 이 런 323,494,622 B + 앞 런 47,350,742 B = **370,845,364 B** (2 GiB 상한의 17.27%) |

## 권리·출처 근거

- 이 런에서 권리 페이지를 새로 받지 않았다. 앞 런 `../20260911T075705Z/rights/` 기록(2026-09-11 07:57–07:58 UTC)을 근거로 쓴다: 공식 페이지 <https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/> HTTP 200, ©·이용제한 표기 없음; `transportation.gov/web-policies`·`highways.dot.gov/about/policies-notices` 정책 페이지는 각각 403(원문 보존, 재시도·우회 없음) → **재배포 조건 미확인**. 미국 연방정부 공개물(TMAS). 로컬 연구 분석용 보관만, 재배포 없음.
- 페이지 원문(앞 런 저장분): "Starting with the 2020 datasets, the traffic monitoring data released is piped delimited … (the original data [prior to 2020] with the rigid fixed column format)." — **이 런에서 실측한 `mar_2020` OK 파일은 이 문장과 달리 고정폭이었다**(§형식 경계). 문장과 파일이 어긋나면 실측 파일을 기록한다.

## 다운로드 목록 (13건, 전부 HTTP 200)

| 파일 | URL | bytes | SHA-256 | Last-Modified | 수집(UTC) |
| --- | --- | ---: | --- | --- | --- |
| `zips/2020_station_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2020/2020_station_data.zip` | 1,192,245 | `7024400bb6b7bd3dd34fa9ee90d11b0542d458c05236aefd4db3df6e1b2ef8b3` | Wed, 06 Sep 2023 17:45:02 GMT | 08:40:28 |
| `zips/apr_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/apr_2023_ccs_data.zip` | 25,867,023 | `f9df202f8d387a57be7cf873303cf88cd92a39c14df94aeedbc083af97c6f435` | Wed, 03 Jul 2024 15:47:36 GMT | 08:35:57 |
| `zips/aug_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/aug_2023_ccs_data.zip` | 27,642,223 | `ac6bdecf1b1f7f67c1c10fa6169cbec39aed93093bbfbd1b3ac7c3b97d796732` | Wed, 03 Jul 2024 16:41:21 GMT | 08:37:04 |
| `zips/dec_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/dec_2023_ccs_data.zip` | 27,514,252 | `88a4446791a5e98aa9d0bdd3be02b969991bd19a7198368934f5ad170a187442` | Wed, 03 Jul 2024 17:15:07 GMT | 08:37:47 |
| `zips/feb_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/feb_2023_ccs_data.zip` | 24,109,855 | `83797bf8d592c3c8b006ba1a48a24444fd6d9d179ada55f8c79db4c5374e2552` | Wed, 03 Jul 2024 15:26:41 GMT | 08:35:52 |
| `zips/jan_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/jan_2023_ccs_data.zip` | 26,034,982 | `a1ac6438b9ee45bb3d9e35ff0334df01a5142d5655a9187510caa44801d0405e` | Wed, 03 Jul 2024 15:14:59 GMT | 08:35:48 |
| `zips/jul_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/jul_2023_ccs_data.zip` | 27,453,955 | `f38a221373681d1ccafdc4ca92ad47c7859da9fa4a02388484c73ae2792a08cd` | Wed, 03 Jul 2024 16:28:52 GMT | 08:36:49 |
| `zips/jun_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/jun_2023_ccs_data.zip` | 26,419,183 | `17eb68361f00f80f37077576dde47163ba3bce1859147b307b64906f0008af0e` | Wed, 03 Jul 2024 16:13:09 GMT | 08:36:32 |
| `zips/mar_2020_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2020/mar_2020_ccs_data.zip` | 28,429,778 | `5bcbffcc1833e89d2b9b7b7b0184f66b3f9ad4706825eca76cb7e7d5c432f15c` | Thu, 29 Apr 2021 15:40:29 GMT | 08:38:03 |
| `zips/may_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/may_2023_ccs_data.zip` | 27,096,886 | `16a33d806f0687b84363d658e711c7b8deb0484b4adce96b2636a06aace98bb0` | Wed, 03 Jul 2024 15:59:15 GMT | 08:36:19 |
| `zips/nov_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/nov_2023_ccs_data.zip` | 26,945,885 | `2a3a8501f80809031efa87257433b684dd1e2f07fdde2ff7124adf942d9d5688` | Wed, 03 Jul 2024 17:13:38 GMT | 08:37:31 |
| `zips/oct_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/oct_2023_ccs_data.zip` | 27,917,077 | `25ebb5e23acc72484bff96519ebd8f58a32a6ecb485859617fca081603ae8213` | Wed, 03 Jul 2024 17:09:56 GMT | 08:37:26 |
| `zips/sep_2023_ccs_data.zip` | `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2023/sep_2023_ccs_data.zip` | 26,871,278 | `48c9085c301500f4bc166b9b4cff23644cf56c993c5cb40559a83edf1c6e2e41` | Wed, 03 Jul 2024 17:00:12 GMT | 08:37:10 |

- 실패·중단 없음: `logs/download.log`에 `FAIL` 0건. URL당 1회(manifest dedup), 동시 1개(순차).

## 추출 파일 (zip에서 꺼낸 원본)

| 파일 | SHA-256 | bytes | 행/기간 |
| --- | --- | ---: | --- |
| `extracted/OK_JAN_2023 (TMAS).VOL` | `9fe6c5cd5ce9d8f49ec3dfe4b5bfb6919fe51e2ed7c8c15df3e3ddd886ad47a1` | 1,098,695 | 9,325레코드 / 80역 / 2023-01 |
| `extracted/OK_FEB_2023 (TMAS).VOL` | `ffffeadcfd28c0b5f5767b61396439b7e866af56864fec72ca00b3df1a53741f` | 990,920 | 8,367레코드 / 80역 / 2023-02 |
| `extracted/OK_MAR_2023 (TMAS).VOL` | `269373638d5b069ca2f411cc966e8196bf2733f1eb404b0df82380ce170d06b4` | 1,065,987 | 8,926레코드 / 80역 / 2023-03 |
| `extracted/OK_APR_2023 (TMAS).VOL` | `5444d8d8741f3e7fcd2cbc347c78a64166e1f3a9c29c30161933c6d58c7f816e` | 1,031,824 | 8,659레코드 / 77역 / 2023-04 |
| `extracted/OK_MAY_2023 (TMAS).VOL` | `ad0b3d807af9c26febbc7b988cddef62db7b75914634acf831be83299bfe0e6e` | 1,094,171 | 9,143레코드 / 79역 / 2023-05 |
| `extracted/OK_JUN_2023 (TMAS).VOL` | `c7de826ebab72a51078f67f32e7656ec3f359ace89a1917042538fb3976fd969` | 1,043,836 | 8,714레코드 / 78역 / 2023-06 |
| `extracted/OK_JUL_2023 (TMAS).VOL` | `7b8e82ad74c8dc58b60e2a5445395e52738d81a9fa779fd80311599cc93e6d92` | 1,080,225 | 9,042레코드 / 78역 / 2023-07 |
| `extracted/OK_AUG_2023 (TMAS).VOL` | `bb6b28969f6e620bda1e8c210adc60aeb7a2390628706d1331837ca4ab978fe6` | 1,091,869 | 9,131레코드 / 78역 / 2023-08 |
| `extracted/OK_SEP_2023 (TMAS).VOL` | `79c81799812745bf3d69cad0b9c4707eaf6c3d962493aa15dada85dc340bb904` | 1,062,799 | 8,874레코드 / 78역 / 2023-09 |
| `extracted/OK_OCT_2023 (TMAS).VOL` | `e4d13d7bb4d30639bc458989e7e30961410073b499f272906637d5a81e570888` | 1,130,529 | 9,380레코드 / 80역 / 2023-10 |
| `extracted/OK_NOV_2023 (TMAS).VOL` | `9d52717353047fb42e5e23abde3e0758c695a104e9a373f82e6d54603185aacc` | 1,054,793 | 8,761레코드 / 80역 / 2023-11 |
| `extracted/OK_DEC_2023 (TMAS).VOL` | `55d7ced493cf9d1fb9ef3ef4e1d879a625f4a12fd0c531542a1a2c85a1ec241d` | 1,103,107 | 9,220레코드 / 78역 / 2023-12 |
| `extracted/OK_MAR_2020 (TMAS).VOL` | `f2284e1736496f3acd3b15ad150d97d95040107b34862009de70e15c73218c93` | 1,536,535 | 10,745레코드 / 90역 / 2020-03 |
| `extracted/Station_Data_Extract_Pipe_Delimited_CleanData_2020.txt` | `023ece374c4208a721d24964d6c4efd96c3137e4180da4d3640e32e37ff3015f` | 7,148,347 | 전국 역 메타 (파이프, 41필드) |

`OK_MAR_2023 (TMAS).VOL`은 앞 런 zip에서 추출된 파일을 이 런 `extracted/`로 복사한 것(sha256 동일 `269373…`)이다 — 12개월 파싱을 한 폴더에서 돌리기 위함이며 zip은 재다운로드하지 않았다.

## 정확한 명령

```bash
# 1) 2023 11개월 + mar_2020 + 추출 (백그라운드 러너가 실행)
bash research/notebooks/091-tmas/expand_2023.sh
#   -> 2023/{jan,feb,apr..dec}_2023_ccs_data.zip, 2020/mar_2020_ccs_data.zip 을
#      같은 downloader·같은 download_manifest.json 으로 순차 수집, *OK_*.VOL 추출

# 2) 2020 역 메타 1건 (동일 downloader, 동일 manifest)
python3 research/notebooks/091-tmas/download.py \
  "https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/2020/2020_station_data.zip" \
  --out research/gathering/raw/091-tmas/20260911T082500Z/zips \
  --manifest research/gathering/raw/091-tmas/20260911T082500Z/download_manifest.json
unzip -o -j research/gathering/raw/091-tmas/20260911T082500Z/zips/2020_station_data.zip \
  -d research/gathering/raw/091-tmas/20260911T082500Z/extracted

# 3) 월별 파싱 (12개월 각각; 예: jan 2023)
python3 research/notebooks/091-tmas/parse_volume.py \
  --vol "research/gathering/raw/091-tmas/20260911T082500Z/extracted/OK_JAN_2023 (TMAS).VOL" \
  --year 2023 --station AVC040 \
  --out-hourly research/indexes/091-tmas/20260911T082500Z/avc040_jan2023_hourly.csv \
  --out-daily  research/indexes/091-tmas/20260911T082500Z/avc040_jan2023_daily.csv \
  --out-quality research/indexes/091-tmas/20260911T082500Z/avc040_jan2023_quality.json

# 4) 통합 월별 품질 표 (2016-03·2023-03은 앞 런 품질 JSON에서)
python3 research/notebooks/091-tmas/monthly_quality.py \
  research/indexes/091-tmas/20260911T082500Z \
  research/indexes/091-tmas/20260911T075705Z \
  research/indexes/091-tmas/20260911T082500Z/monthly_quality

# 5) 역 연속성 (2020 STA ↔ 2023 STA ↔ 2016 VOL)
python3 research/notebooks/091-tmas/check_station_continuity.py \
  --vol-2016 "research/gathering/raw/091-tmas/20260911T075705Z/extracted/mar_2016/OK_MAR_2016 (TMAS).VOL" \
  --station-2020 "research/gathering/raw/091-tmas/20260911T082500Z/extracted/Station_Data_Extract_Pipe_Delimited_CleanData_2020.txt" \
  --screen-2023 "research/indexes/091-tmas/20260911T075705Z/station_screen_within40km.csv" \
  --out-json research/indexes/091-tmas/20260911T082500Z/station_avc040_continuity.json \
  --out-csv  research/indexes/091-tmas/20260911T082500Z/station_avc040_continuity.csv
```

## 형식 경계 (실측)

| 파일 | 형식 | 근거 (실측) |
| --- | --- | --- |
| `OK_MAR_2016 (TMAS).VOL` | legacy 고정폭 | 143 B/행(141자+CRLF), 파이프 없음, [0]='3' |
| `OK_MAR_2020 (TMAS).VOL` | legacy 고정폭 (2016과 동일 레이아웃) | 143 B/행, 파이프 없음. 샘플 디코드 [1:3]state=40, [3:5]f_sys=1R/4R, [5:11]station, [11]dir, [12]lane, [13:15]YY=20, [15:17]MM=03, [17:19]DD, [19]dow(2020-03-01=일 ✓). 10,745행×143 B=1,536,535 B 정확 일치 |
| `OK_*_2023.VOL` | 파이프 | 헤더 1행 35필드(`record_type|state_code|…|hour_00..23`), 레코드 `V|…`, CRLF |

`parse_volume.py`는 두 형식을 모두 처리한다(형식 자동 판별: 첫 줄이 `record_type|`이면 파이프, 아니면 고정폭). 이 런 품질 JSON의 `format` 필드에 형식이 기록된다.

## 앞 런(20260911T075705Z)과의 관계

- 공유 manifest로 URL dedup: mar_2023 zip·2023 역 메타·2016 zip은 재다운로드하지 않았다.
- 2016-03 카운트·`.VOL` 원본과 권리 기록은 앞 런 폴더에 그대로 있다(이 런에서 수정 없음).
- 이 런의 2020 역 메타는 앞 런 2023 역 메타와 동일한 방법(같은 downloader·manifest)으로 받은 1건이다.
- 통합 월별 품질 표(2016-03 포함 14행)는 `research/indexes/091-tmas/20260911T082500Z/monthly_quality.csv`·`.json`.

## 수집하지 않은 것

- 2024·2025 파일 전체(아웃샘플) — 미접촉.
- `mar_2023_ccs_data.zip` 재다운로드 — dedup으로 생략(앞 런 zip 사용).
- 다른 주·다른 연도 월별 세트 — 미접촉. 각 zip에서 `OK_*.VOL`만 추출(원본 zip 보존).
- 2016·2020 역 메타 추가 수집(2016 STA 등) — 이 런 범위 아님.
- 패키지 설치 없음, sudo 없음, git commit/push 없음.
