# 042A Wall Street District Pulse 첫 검증

| 항목 | 결과 |
| --- | --- |
| 공식 입력 | MTA 월별 역별 탑승량, 2017-02~2026-07 |
| 고정 역군 | Broad St, WTC/Cortlandt, Fulton St, Rector St, Wall St |
| 신호 | 월별 탑승량 YoY 변화의 36개월 z-score |
| 타깃 | 보수적 45일 지연 뒤 다음 21거래일 Yahoo `CL=F` 실현변동성 |
| IS | `r=+0.044`, n=46 |
| OOS | `r=-0.350`, n=31 |
| 결론 | 부호 반전. 042A 및 042의 Oil Pizza 가중치 `0.0` 유지 |

MTA는 익명 역군 집계만 제공하며 개인·직업·금융활동을 식별하지 않는다. 과거 실제 공개시점 빈티지를 복원하지 못했으므로 이 결과는 설명적 반증이다. 원본과 재실행 패널은 gitignored `../raw/2026-09-03-wall-street-district-pulse-probe/`에 있다.

네 도시 AFHP 합성은 SingStat API 접근 거절과 Hong Kong 포털 DNS 제한, 도시별 동질 definition·release vintage 부재 때문에 계속 HOLD다. 단일도시 결과를 4도시 결과처럼 해석하지 않는다.
