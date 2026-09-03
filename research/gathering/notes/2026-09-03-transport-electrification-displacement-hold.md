# Transport Electrification Displacement (004B) — 초기 탐색

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-03 |
| 상태 | 보류 |
| 작성 | 에이전트 |
| 관련 출처 | IEA Global EV Data Explorer API; Yahoo Finance `CL=F` |

## 한 줄 가설

전기차가 실제 석유 사용을 더 많이 대체하면, 중기 석유 수요 성장과 다음 해 WTI 수익률에 하방 압력이 나타날 수 있다.

## 본문

- IEA 공개 API의 `World / Historical / Cars / EV`에서 `Oil displacement, Mbd`와 `EV sales`를 내려받았다. 원자료와 계산 스크립트는 `gathering/raw/2026-09-03-ev-displacement-probe/`에 gitignored로 보관했다.
- 후보 선정 기간은 2015-01-01~2023-12-31으로 제한했고, Yahoo `CL=F`의 연말 종가로 다음 해 수익률을 계산했다. 2024년 이후은 보지 않았다.
- 2015~2023 차(EV) 석유 대체량은 0.030에서 0.700 million barrels/day로 증가했다.
- 대체량 수준과 다음 해 WTI 수익률의 Pearson r은 -0.280 (n=8), 대체량 증가분은 -0.230 (n=7)이었다. EV 판매량 수준은 -0.267 (n=8), 판매 성장률은 +0.190 (n=7)이었다.
- 표본이 너무 작고, 현재 API 빈티지가 과거 값을 수정할 수 있으며, 각 연도 값의 당시 공개일을 확보하지 못했다. 따라서 위 숫자는 탐색적 기술값일 뿐 예측력·통계적 유의성·가중치의 증거가 아니다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` (`research/data/clf-daily-2015-2026.csv`) |
| 신호 출처 | IEA Global EV Data Explorer 공식 공개 API |
| 라이선스 | Explorer/API 원자료의 다운로드·재배포 범위 추가 확인 필요 |
| 발표 지연 | 연간. 역사 빈티지별 발표일·개정 이력은 모름 |
| look-ahead | 현재 빈티지의 과거 수정 가능성 때문에 아직 완화하지 못함 |
| 본 기간 | 2015-01-01~2023-12-31만 사용 |
| 아웃샘플을 봤나 | 아니오 |
| 성과 숫자 | Pearson 상관만. 통과 수치·샤프·적중률 없음 |

## 다음 한 가지

IEA의 release/vintage 또는 동등한 공개일 이력을 확보해, 값이 당시 실제로 알려졌던 시점 기준의 walk-forward 시계열을 만든다. 그 전에는 실험 카드·가중치·아웃샘플을 만들지 않는다.
