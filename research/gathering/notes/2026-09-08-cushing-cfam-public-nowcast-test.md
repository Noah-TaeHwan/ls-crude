# 091 CFAM 공개 nowcast 검정

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-08 / Codex |
| 후보 ID / 카드 경로 | 091 / `research/factors/091-cushing-motel-lights-index/` |
| 상태 | HOLD — 장기 공개 입력 검정 완료, 관계 없음 |
| 연결 출처 | World Bank Light Every Night / EIA Cushing ending stocks |

## 활동과 가설

쿠싱 도심의 월간 야간광이 주변 농촌 대조점보다 비정상적으로 밝으면, 터미널·정비·물류 등 도시권 활동이 높다는 아주 넓은 가설을 검정한다. 이는 특정 모텔·근로자·운영계획을 측정하지 않는다. 1차 질문은 WTI가 아니라 이후 공식 쿠싱 재고 변화와 연결되는지다.

## 수집·시점·검정

- 입력: World Bank Light Every Night 공개 S3 COG의 Suomi-NPP 월합성. 2015–17 `rp2`, 2018–23 `ops` 처리본을 별도 계절 정규화했다. 5×5 도심 격자와 고정 농촌 대조점 4개만 읽었다.
- 타깃: 공식 EIA 주간 `W_EPC0_SAX_YCUOK_MBBL` 표. 관측월 말 +45일 이후의 28일 재고 순변화와 주간변화 절대값 평균만 사용했다.
- 결과: 유효 96개월. `r=+0.053, p=.607` (재고 순변화), `r=+0.068, p=.508` (변화폭). 관계 없음.
- 원문·정제 패널: `research/gathering/raw/091-cushing-cfam/` 및 `research/data/processed/091-cushing-cfam/`에 저장되고 Git에서는 제외된다. 실행 영수증은 [`091 인덱스`](../indexes/091-cushing-operations-nowcasting/20260908T110000Z/README.md)에 남긴다.

## 판정과 다음 행동

- **HOLD**: 현 야간광 단독 신호는 운영 nowcast에도 지지되지 않는다. WTI·HO 거래 검정은 열지 않는다.
- 재개 조건: 장기·as-of 가능한 City Hotel/Motel Tax와 Sales/Use Tax, 그리고 추가 독립적 운영 대리값이 갖춰진 뒤 사전 등록한 조합으로 재검정한다.
- DL 금지: 96개월 월간 표본으로 딥러닝을 쓰지 않는다. 픽셀 수준 장기 일간 패널과 독립 라벨이 확보되기 전까지 과적합 위험이 더 크다.
