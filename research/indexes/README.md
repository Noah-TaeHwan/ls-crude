# 지수 정의와 실행 영수증

2026-09-07 피자급 헌트가 `ALT-20260907-18`…`25` 중 데이터가 있는 후보의 명세·IS 표·그림을 이 폴더에 남겼다. 활동 proxy 01(곡물 바지선)과 번호를 섞지 않는다. 원본 CSV/JSON은 여기 두지 않는다. 기존 Oil Slice·팩터 결과를 신규 지수로 복사하지 않는다. 요약: [HUNT-20260907-is-stats.csv](HUNT-20260907-is-stats.csv).

후보의 적격 자료가 확보되면 _TEMPLATE.md를 <candidate_id>/README.md로 복사합니다. 산식·공개시각·시간 분할을 고정한 뒤 실행하고, 재실행은 별도 run 기록으로 남깁니다.

| 내용 | 위치 |
| --- | --- |
| 원본 | research/gathering/raw/<candidate_id>/<수집시각>/ · 받은 그대로 |
| 정제·지수 출력 | research/data/processed/<candidate_id>/<run>/ · 원본으로부터 재생성 |
| 코드·노트북 | research/notebooks/<candidate_id>/ · 해당 실행의 revision/환경 명시 |
| 정의·manifest·영수증 | 이 폴더의 <candidate_id>/README.md 및 run별 작은 Markdown |
| 동료 검토·판정 | research/candidates/<candidate_id>.md와 ledger.csv |

이 폴더에는 원본/대용량 CSV를 넣지 않습니다. 현재 ignore 규칙은 raw·processed에 적용됩니다. 공개 가능한 작은 결과표·그림만 허가 확인 뒤 run 폴더에 둘 수 있습니다. 지수의 단위·빈도·지역·집계·공개 가능 시각을 이름만으로 추정하지 않습니다.

[방법론](../../docs/research-methodology.md) · [검정 규약](../../docs/testing-protocol.md) · [기록 규약](../../docs/recording-standard.md)
