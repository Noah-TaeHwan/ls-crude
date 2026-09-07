# 원본 영수증 — ALT-20260907-10 (FRED GASREGW, 미국 소매 휘발유 주간 가격)

- 출처 URL: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GASREGW&cosd=2015-01-01`
- 수집시각: 2026-09-07 06:49 UTC (2026-09-07 15:49 KST)
- 파일: `GASREGW.csv` (609행, 관측 2015-01-05~2026-08-31, 월요일 관측 주간 계열, 단위 USD/gal)
- SHA-256: `7886faf7473f96b2815d78f48eeb752db10acb739e5d5263425e3344fa871f12`
- 범위 주의: 파일에 2024-01 이후 행이 포함돼 있음. 분석 스크립트는 2015–2023만 읽고
  2024+ 통계는 계산하지 않음. 따라서 이 후보의 `oos_exposure=SEEN`(파일 수준 열람)이며,
  OOS 성과 주장은 없음.
- 명령: `research/.venv/bin/python` + `urllib` 직접 GET.
  분석 재현: `research/.venv/bin/python research/notebooks/ALT-20260907-10/run_gasregw.py`
- 권한: FRED 공개 계열(원천 EIA). 원본 CSV는 Git에 올리지 않음. 시리즈별 저작권·재사용 조건은 FRED 안내를 따름.
- 재취득: 위 URL 재호출. FRED `observation_start` 고정이므로 동일 요청은 동일 시작일을 반환.
