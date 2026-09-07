# ALT-20260907-25 20260907T070846Z

Immutable local snapshot pointer; payload bodies are ignored by Git.

- URL: `https://www.eia.gov/electricity/gridmonitor/` — HTTP 200, 43504 bytes, SHA256 `65417b4453e24ada146fe7474d3b8f74e8b179f0a8894ad82cdb4eb40b29066e` (`eia_grid.body`)
- Method: `curl -sS -L --max-time 25 -A "ls-crude-research/1.0"` — 모니터 페이지만 확인, API 미호출
- Note: 시간별 실측은 EIA API v2 키가 필요 (needs_key). 키 발급 전 수집 보류
- License: EIA 정부 공개이나 API 키 조건·저장·재배포 조건 미확인
- Handoff: EIA API 키 발급과 연료별 발전량 분해 범위 확인 (오태환, 2026-09-08 제안, 사람 판단 필요)
