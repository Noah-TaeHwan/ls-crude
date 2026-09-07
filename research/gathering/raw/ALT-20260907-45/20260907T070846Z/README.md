# ALT-20260907-24 20260907T070846Z

Immutable local snapshot pointer; payload bodies are ignored by Git.

- URL: `https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/` — HTTP 200, 18362 bytes, SHA256 `28be7309a22b0870237b96a066ed16954f22bfbe8ab471e8a7a61b09792b49e0` (`noaa_dd.body`)
- Method: `curl -sS -L --max-time 25 -A "ls-crude-research/1.0"` — 랜딩 페이지만 확인
- Note: `weighted/legacy_files/` 아래 heating/·cooling/·statesCONUS/ 구조 확인. 전국 인구가중 월별 시계열 파일 미분리
- License: NOAA 정부 공개이나 저장·재배포 조건 미확인
- Handoff: 전국 월별 HDD·CDD 파일 경로와 발표 지연 확인 (오태환, 2026-09-08 제안)
