# ALT-20260907-23 20260907T070846Z

Immutable local snapshot pointer; payload bodies are ignored by Git.

- URL: `https://www.mpa.gov.sg/port-marine-ops/marine-services/bunkering/bunkering-statistics` — HTTP 200, 247173 bytes, SHA256 `9ba1bff5432a221949a675ce97b4f4a5e2c2fe8614b748144284786125503b89` (`mpa_stats.body`)
- URL: `https://data.gov.sg/api/action/package_show?id=d_89d2874dad74a273270369334f1e7d28` — Cloudflare 도전 페이지 4545 bytes (`datagovsg_api.body`), 자동 API 취득 차단
- Method: `curl -sS -L --max-time 30 -A "ls-crude-research/1.0"` — 통계 페이지는 가독, API 자동 호출은 도전에 막힘, 우회 안 함
- Note: data.gov.sg 데이터셋 페이지는 월간 벙커 판매 CSV (1995-01~2026-05 표기)를 안내. 브라우저 수동 다운로드 인계가 남음
- License: MPA 공개 통계이나 저장·재배포 조건 미확인
- Handoff: 허용 수동 다운로드와 잠정치 개정 확인 (오태환, 2026-09-08 제안)
