# 결합 팩터 1–4 검정 결과

## 고정 기준

- 가격: 사용자가 제공한 Yahoo `CL=F` 일봉
- IS: 2015-01-01~2023-12-31 / OOS: 2024-01-01 이후
- OOS를 보기 전에 조합의 입력·방향·가중치·타깃을 [사전 등록](../gathering/notes/2026-09-03-combo-stacks-preregistration.md)했다.
- 이 표는 개별 팩터를 중복 가중하는 성과표가 아니라, 서로 다른 전달경로가 동시에 확인되는지에 대한 반증 기록이다.

| # | 고정 결합 | 실제 입력 | IS | OOS | 결과 |
| ---: | --- | --- | --- | --- | --- |
| 1 | US Petroleum Balance Stress | 010 buffer + 038 Cushing draw + 040 SPR non-injection + 041 refinery utilization | `r=-0.218`, n=418 | `r=+0.134`, n=139 | **REJECTED** — 부호 반전. 상위 10% IS 변동성도 전체보다 `-0.795%p`. |
| 2 | Gulf Physical Disruption Stack 최소 반증 | 016 Gulf heat anomaly × 009 Iran FX stress | `r=-0.015`, n=1,508 | `r=-0.034`, n=666 | **NO RELATION** — 실제 017 항만·018 열 이상 입력이 없으므로 완전 스택은 여전히 미검정. |
| 3 | Korea Aviation–Refining Stress 최소 반증 | 024 Chuseok month × 027 Incheon transit surprise | `r=-0.039`, 활성 n=6 | 활성 n=2 | **INSUFFICIENT** — 025 정제마진·032 운영차질 시계열 부재, 유효 사건 수 부족. |
| 4 | Public Policy Credibility Stress | 003 strict public oil-policy event × positive Combo-1 stress | `r=-0.004`, 활성 n=16 | `r=+0.098`, 활성 n=61 | **REJECTED** — IS 관계 없음. |
| 5 | Refinery–Credit Stress Gate (061) | 041 low utilization × 060 extreme credit–oil dislocation | — | — | **UNTESTED** — 060에 필요한 공식 장기 HY OAS 원시계열을 현재 환경에서 확보하지 못함. 제3자 미러로 대체하지 않음. |
| 6 | Refinery Household-Panic Gate | 041 low utilization × 052W high household-panic attention | 사건 4/97, RV20 차이 `+1.800%p` | 사건 1/32, RV20 차이 `-1.279%p` | **REJECTED** — 단독 저가동률보다 IS 효과가 작고 OOS 반대; 사건 수 부족. |

## 해석

1번과 4번은 원시 공개 데이터로 완전 검정했으나 통과하지 못했다. 2번은 ‘열+FX’라는 약한 대체물로 017·018을 흉내 내지 않았으며, 그 최소 반증도 0 근처다. 3번은 추석·공항만으로는 사건 수가 6개여서 통계적 결론을 낼 수 없다.

따라서 현재 결합으로 새 WTI·정제품 변동성 가중치가 되는 것은 **0개**다. 061은 적법하고 재현 가능한 공식 장기 HY OAS 원시계열을 먼저 확보해야 한다. 041×052W는 실제 반증에서 탈락했다. 다음에 유효한 작업은 017·018의 집계형 장기 관측 패널, 그리고 025·032의 실제 공개시점 패널을 수집해 2·3을 새 사전 등록으로 다시 여는 것이다.
