# ALT-20260907-45 원본 — NOAA CPC 월별 도일 2015-2023

- 원천: NOAA Climate Prediction Center, population-weighted degree days, statesCONUS 월별 파일.
  - 랜딩: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/
  - 월별 디렉터리: https://ftp.cpc.ncep.noaa.gov/htdocs/degree_days/weighted/legacy_files/{heating,cooling}/statesCONUS/YYYY/Month.txt
- 수집시각(UTC): 첫 요청 2026-09-08T12:05:46Z, 216개 파일 순차 취득, 실패 0.
- 명령: `python3 research/notebooks/ALT-20260907-45/collect.py --collect --run 20260908T120546Z`
- 범위: 원본 전체는 1985~현재 월별 + 주간·일별. 선택 표본은 2015-01~2023-12 월별 216개 파일(heating·cooling 각 108).
- 용량: 216개 파일 합계 1,648,944 bytes. 개별 SHA-256과 HTTP Last-Modified는 `requests.json`에 전수 기록.
- 예시: `files/heating/2015/January.txt` SHA-256 `f58f76533504760271a45592448154ac1726deb403f7de3ce30086b60af8a12e`, 10,796 bytes.
- 관측월 ≠ 공개월. 대부분 파일의 Last-Modified는 관측월 다음 달 3일 17:00 UTC(예: 2023-01 파일 → 2023-02-03). 월별 최초 공개일 복원은 아니며 개별 값의 당시 공개 빈티지도 아니다.
- 권리: 미국 정부 공개 자료. 저장·재배포 조건은 미확인이라 원본은 Git에 올리지 않고 이 폴더는 gitignored다.
- 재취득: 위 명령을 새 UTC run으로 실행하면 같은 URL에서 다시 받는다. 기존 run 폴더는 덮어쓰지 않는다.
