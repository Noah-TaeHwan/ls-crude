# 수박 원보고서 대사 후속 — 접근 차단

- UTC run: `20260909T002929Z`; 요청 시작/완료는 [영수증](requests.json)의 실제 시각.
- 공식 USDA 정책 페이지 첫 요청 HTTP **403**. 후속 datasets 요청은 **NOT_RUN**, 우회·재시도 없음.
- 신규 원보고서·XLSX·관측값 **0개**. 응답 원문은 저장하지 않아 원본 응답 해시는 없음.
- 영수증 SHA-256: `b0a9318c80e376be4eaab17333f0d87f3803044d8f9ae05131e0f7c1826c2bac`.
- 기존 2026-09-08 표본과 COLLECTED/E2/PARK 판정은 보존. 이번 대사는 BLOCKED이며 수집 성공이 아님.
- 재개 조건: 공식 정상 접근이 회복되거나 제공기관이 허용하는 원보고서 경로 확인. 동일 조건 재시도 금지.
- [기존 원본·그림](../20260908T065043Z/README.md) · [이번 실행·검토](../../../gathering/notes/2026-09-09-watermelon-source-reconciliation.md).

## 재현

저장소 루트에서 `python3 research/notebooks/ALT-20260907-36/collect.py --self-test`로 첫 실패·부분 성공 후 중단을 네트워크 없이 검사한다. 실제 요청은 `collect_requests`에 정책 URL과 datasets URL을 이 순서로 전달했으며, 첫 403에서 함수가 종료되어 두 번째 요청은 발생하지 않았다. 새 수집은 정상 접근 회복 확인 후 새 UTC run에서만 수행한다.
