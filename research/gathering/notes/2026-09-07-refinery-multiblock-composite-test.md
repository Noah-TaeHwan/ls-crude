# 2026-09-07 — 041 정유 가동률 다중 블록 복합 반증

## 목적

041 정유 가동률과 후보 10개를 모두 한 모델에 넣을 수 있는지 검정했다. 수출/수입 및 COT 세부 항목은 같은 전달경로의 중복 측정치이므로, 장기 공식 자료가 있는 네 블록으로 사전 축약했다. 이 문서는 탐색적 반증이며 새 거래 모델의 사전등록이 아니다.

## 입력과 공개시점

| 블록 | 자료 | 기간 | 공개시점 가정 |
| --- | --- | --- | --- |
| 운영 | EIA `WPULEUS3` | 2015–2026 | 보고주 종료 +5일 |
| 물리 | EIA `W_EPM0F_EEX_NUS-Z00_MBBLD` − `W_EPM0F_IM0_NUS-Z00_MBBLD` | 2015–2026 | 보고주 종료 +5일 |
| 금융 | CFTC annual Disaggregated Futures-Only RBOB archives | 2015–2025 | 화요일 포지션 +3일 |
| 마진 | 이미 보관된 Yahoo `RB=F`, `CL=F` 일봉 | 2015–2026 | 신호일 마감 뒤 |

모든 z-score는 해당 시점보다 앞선 52개 관측만으로 계산했다. CFTC의 계약명 변경(`GASOLINE BLENDSTOCK (RBOB)` → `GASOLINE RBOB`)은 같은 NYMEX RBOB Futures-Only 계약으로 연결했다. HURDAT2는 실제 경보 시점이 아닌 사후 best-track이므로 제외했다.

## 고정 산식

```text
operation = -z52(utilization)
physical  =  z52(finished gasoline exports - imports)
finance   = mean(z52(abs(managed-money net/OI)),
                 z52(abs(managed-money net/OI - producer/merchant net/OI)))
margin    =  z52(RBOB*42 - WTI)
RFC       = mean(clip(operation, physical, finance, margin; -3, +3))
```

타깃: 공개 가능일 뒤 다음 5 거래일 Yahoo `MPC` 수익률의 제곱합 제곱근. IS는 2015–2023, OOS는 2024–2025(CFTC 수집 범위 종료)다. 상위 20% 임계값은 IS RFC 80백분위 `0.5986`만 사용했다. 통제 회귀는 직전 MPC RV20과 월 더미, HAC(4)를 썼다.

## 결과

| 구간 | n | 운영 r | 물리 r | 금융 r | 마진 r | RFC r | RFC 통제 HAC p |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IS | 416 | `+0.311` | `-0.084` | `-0.190` | `-0.018` | **`-0.006`** | `.2304` |
| OOS | 139 | `+0.266` | `-0.072` | `+0.070` | `+0.188` | `+0.197` | `.2190` |

| 구간 | RFC 상위 20% 사건 수 | 사건−비사건 MPC RV5 | Mann–Whitney p |
| --- | ---: | ---: | ---: |
| IS | 84 | `+0.012%p` | `.3994` |
| OOS | 26 | `+0.181%p` | `.2294` |

## 판정

IS RFC 상관은 0이고 사건 검정도 유의하지 않다. OOS에서만 `+0.197`이 보이나, 통제 회귀와 사건 검정은 모두 통과하지 못한다. 그러므로 이는 **10개 후보를 한 지수에 넣어 알파를 만든 결과가 아니라, 동가중 결합이 작동하지 않았다는 결과**다. `074`는 REJECTED, 거래 가중치 `0.0`이다.
