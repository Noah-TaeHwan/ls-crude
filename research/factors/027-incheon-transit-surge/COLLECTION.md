# 027 — 수집 명세

인천공항 공식 집계의 월간 공표시점을 먼저 기록한다. 관측월 값은 다음 달 첫 영업일 + 5영업일 뒤에만 신호로 쓴다. KTO의 국가별 방한객 통계는 인천 환승객과 섞지 않으며, 각 자료의 정의·공개일·개정 이력을 별도로 보관한다. 원본은 gitignored `research/gathering/raw/`에만 저장한다.

## 2026-09-03 실제 수집·검증

| 항목 | 내용 |
| --- | --- |
| 공식 원본 | 인천공항 Time Series Statistics, `pas=TRANSIT_PSNGER`, 2015-01~2026-07 |
| 원본 보관 | `gathering/raw/2026-09-03-incheon-transit-surge-probe/incheon_transit_passengers_2015_2026.html` 및 `.xls` |
| 신호 | 환승여객 전년동월 변화의 36개월 z-score |
| 결과 | IS `r=-0.332`, n=72; OOS `r=+0.530`, n=31. 부호 반전으로 Oil Pizza 미통과 |
| 재현 | 같은 raw 폴더의 `run_027_transit_test.py`, 추출 CSV·패널·`summary.json` |

현재 공개 페이지가 제공하는 것은 current-vintage 표이며, 과거 시점의 개정 전 빈티지는 복원하지 않았다. 따라서 결과는 보수적으로 기록하되, 재현 가능한 반증 결과일 뿐 실거래 신호가 아니다.
