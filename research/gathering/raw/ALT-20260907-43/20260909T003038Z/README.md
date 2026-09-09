# ALT-20260907-43 20260909T003038Z

Immutable local snapshot pointer; payload bodies are ignored by Git.

- 수집 시작(UTC): receipts.json `initialized_at` 2026-09-09T00:30:38.428060+00:00
- STB 랜딩 GET 200: `https://www.stb.gov/reports-data/rail-service-data/`
- EP 724 통합표 GET 200: `https://www.stb.gov/wp-content/uploads/files/rsir/All%20Class%201%20Railroads/EP724%20Consolidated%20Data%20through%202026-09-02.xlsx` — 7,658,204 bytes, SHA-256 `0e103085f77052e9f03b03dcd9184a2e9db7b5e459d0a2f8d85814813b206d6f`, Last-Modified Thu, 03 Sep 2026 12:44:26 GMT, 로컬 `ep724-consolidated.xlsx`, 완료 2026-09-09T00:34:30.220975+00:00
- STB policies-and-notices GET 200. privacy-policy URL GET 404(실패로 기록, 403/429 아님)
- EIA 원유-철도 XLS GET 200은 월간 천 배럴 보조 측정. 표시 시계열과 섞지 않음
- AAR 주간 PDF는 HEAD만. 본문 미저장
- 권한: STB 공공 서비스 자료, 무보증. 원본 gitignored. AAR 숫자는 재생산 제한으로 표시에 쓰지 않음
- 재취득: 새 UTC run 폴더에 같은 URL을 다시 받는다. 기존 파일을 덮어쓰지 않음
- 파생·재현: `python3 research/notebooks/ALT-20260907-43/collect.py --run 20260909T003038Z`
