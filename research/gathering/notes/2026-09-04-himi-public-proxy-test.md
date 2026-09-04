# 057 HIMI — 무료 공개 프록시 수집·검정 기록

| 항목 | 값 |
| --- | --- |
| 실행일 | 2026-09-04 |
| 카드 | 057 Global Heavy Industrial & Maritime Infrastructure (HIMI) |
| 목표 | 공개 프록시가 다음 21거래일 WTI 실현변동성과 안정적으로 연결되는지 반증 |
| 가격 | 사용자가 제공한 `research/data/clf-daily-2015-2026.csv`의 `CL=F` |
| IS / OOS | 2015-01-01~2023-12-31 / 2024-01-01~2026-09-02 |

## 수집한 무료 자료

| 성분 | 공식 출처 | 빈도 | as-of 처리 | 한계 |
| --- | --- | --- | --- | --- |
| Machinery IP | [FRED `IPG333S`](https://fred.stlouisfed.org/series/IPG333S) | 월간 | 관측월 말 + 45일 | 미국 전체 기계 생산이며 telematics·조선·EPC가 아님. 현재 개정 계열이라 당시 빈티지 미복원 |
| Refinery utilization | [EIA v2 `WPULEUS3`](https://api.eia.gov/v2/petroleum/sum/sndw/data/) | 주간 | 보고 주 종료 + 5일 | 미국 전국 가동률이며 시설 보수 계획·지속기간을 직접 측정하지 않음 |

원시 응답, 계산 패널, 재현 스크립트는 gitignored `research/gathering/raw/2026-09-04-himi-public-proxy/`에 보관한다. GitHub에는 재배포하지 않는다.

## 사전 고정 산식

1. 각 성분 z-score는 현재 관측치를 기준 창에서 제외한다: `z_t=(x_t-mean(x_{t-36:t-1}))/sd(x_{t-36:t-1})`.
2. 월간 Machinery IP가 이용 가능해진 시점에 최신 이용 가능 EIA 값과 결합한다.
3. `HIMI_public = mean(z_machinery_ip, z_refinery_utilization)`; 결측 성분을 임의 대체하지 않는다.
4. 첫 `CL=F` 거래일이 공개일보다 엄격히 뒤일 때부터 21개 수익률로 RV를 계산한다.

## 결과

| 신호 | IS r (n) | OOS r (n) | 판정 |
| --- | ---: | ---: | --- |
| HIMI 공개 2성분 합성 | `-0.177` (107) | `+0.465` (31) | 부호 반전 |
| Machinery IP | `-0.178` (107) | `+0.712` (31) | 부호 반전·OOS 표본 작음 |
| Refinery utilization | `-0.090` (107) | `-0.023` (31) | 0 근처 |

**결론**: 수집·실행은 완료했으나 원안 HIMI는 검증되지 않았다. OOS 숫자가 큰 Machinery IP 단독 결과를 보고 사후 가중치로 합성을 조정하면 선택편향이 생기므로 하지 않는다. 057은 `HOLD`, 거래 가중치 `0.0`이다.
