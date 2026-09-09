# ALT-20260907-02 원본 20260909T003314Z

Port of Los Angeles 공식 컨테이너 통계: 메인 페이지 1 + 연도별 월표 2015~2026.
원본 HTML은 이 폴더에 로컬 보존하며 Git에는 올리지 않는다(해시·행수만 기록).

## 요청 영수증 요약 (request.json 정본)

- 수집 시작(UTC): 2026-09-09T00:33:14.287191+00:00, 완료(UTC): 2026-09-09T00:33:57.062789+00:00
- 방법: `python3 research/notebooks/ALT-20260907-02/collect.py --collect`
- User-Agent: `ls-crude-research/1.0 (+https://github.com/Noah-TaeHwan/ls-crude)`
- 요청 간격 2.5초, 타임아웃 25초. 403/429 시 남은 요청 중단(이번 run은 해당 없음).
- 상태: complete, 요청 13/13 HTTP 200, 실패 0.

| 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| pola_main.html | 129203 | 1ff1148e499615232a29a249a18415629a96027a85e29c13cdf5459296144bcd |
| pola_2015.html | 121721 | 7d8a2356c4cd82a0ac8782f6c97bb56d7535268628a17e354dee44a5fe0fe15e |
| pola_2016.html | 122062 | eaa6813c4a8a5fafdc54f7c359406b61d631b518513c28963542a5488845933f |
| pola_2017.html | 120089 | 4602b7182fe2190997bba1a96f96a6f5531a198566d727eda0fa22810a4647ea |
| pola_2018.html | 120220 | ec1103684615ba65ce6765a915ac13eb44b87d5b2b47aaeaff0cea096fb99490 |
| pola_2019.html | 120286 | c9fdb013a36c7dbca7d64894ee2e363d2b45da0d9fba8e6988524d4ab0fce1fe |
| pola_2020.html | 132185 | e4cc876f99f2485a3da5332ce1dab9a20cc56b023f6027dbb966acf1aaf9f0eb |
| pola_2021.html | 131981 | c8ef635d273f13ab7cb57956b42c33923717bf1908d225fe186fe523674aab5e |
| pola_2022.html | 131940 | ac9543e4d2ea2d830f1e4b4e0b39fdb65e42cb71ad39ded10dc633eed59bb2f8 |
| pola_2023.html | 133677 | c2c10f9bffcc253cdcf2ec3967ff8435fd6ba7b04ed40b020adf5f2c97bf3b4b |
| pola_2024.html | 135830 | 2af8ac0519fbbda674d1f9e617ff594b3e810a499200e8fce4b624a7a6f005de |
| pola_2025.html | 138441 | 4a44dc5977e2ff5c208823b3f362ab177e19895d937048ab5ab50dc5e9228ff9 |
| pola_2026.html | 134240 | 95c29f1f0fd0b73f93eb7a3106d9c1b1c661f3c8bb3df6576ae3838451257865 |

URL 패턴: 메인 `https://portoflosangeles.org/business/statistics/container-statistics`,
연도별 `…/historical-teu-statistics-YYYY`. 요청별 시작·완료시각은 request.json 정본에 있다.

## 이용 조건 (2026-09-09 페이지 문구 확인)

- "The information presented on this website is provided free of charge.
  When sourcing this data, please credit the Port of Los Angeles."
- "Container statistics for the prior month are published during the second half
  of the following month." / 최신월 표에 "released on or around the 15th day of
  the following month" 병기. 월별 최초 공표일·개정 이력의 복원은 아니다.
- 자동 대량 수집을 허가로 확대 해석하지 않는다. 이번 13건은 2.5초 간격 단일 run이다.

## 재취득

같은 명령을 다시 실행하면 새 UTC 폴더에 수집한다. 기존 폴더를 덮어쓰지 않는다.
`--run 20260909T003314Z`는 이 폴더 원본으로 파생물을 재생한다.
