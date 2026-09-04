# 061 — Refinery–Credit Stress Gate (RCSG)

**상태**: ⏸️ **HOLD — 041의 MPC 변동성 재현 후보 위에, 아직 미검증인 060을 조건으로 더한 사전 등록 복합 팩터**
**밈**: *“When the refinery slows and credit flinches, the crack gets nervous.”*  
**가중치**: `0.0`

## 가설

정유 가동률이 낮다는 것은 제품 공급 완충이 약하거나 운영 레짐이 불안정하다는 뜻일 수 있다. 동시에 HY 신용시장과 원유의 관계가 극단적으로 벌어지면, 물리 운영 불안과 금융 위험회피가 겹쳐 정유사·휘발유 변동성이 커질 수 있다.

```text
low refinery utilization (041)
  AND extreme credit–oil dislocation (060)
  → refinery / gasoline risk regime
  → future MPC, then RBOB realized-volatility candidate
```

## 고정 신호 규칙

이 카드는 평균 점수가 아니라 **동시 게이트**다.

1. 041의 EIA 전국 정유 가동률 52주 z-score를 `U`라 둔다. `U`가 IS에서 고정한 20백분위수 이하일 때만 `low_utilization=1`이다.
2. 060의 point-in-time CODC를 `C`라 둔다. 방향을 사후 선택하지 않기 위해 `|C|`가 IS에서 고정한 80백분위수 이상일 때만 `extreme_dislocation=1`이다.
3. `RCSG = 1`은 두 조건이 같은 공개 가능 시점에 모두 참일 때뿐이다. 그 외에는 `0`이다.
4. 041 주간 공개시점과 060의 보수적 다음-거래일 이용 규칙 중 **더 늦은** 시점부터 신호를 사용한다.

## 사전 고정 타깃과 검정

| 우선순위 | 타깃 | 창 | 이유 |
| ---: | --- | --- | --- |
| 1 | MPC 다음 5거래일 실현변동성 | 5일 | 041이 IS `-0.301`, OOS `-0.273`으로 재현 후보를 보인 직접 정유사 타깃 |
| 2 | RBOB `RB=F` 다음 5거래일 실현변동성 | 5일 | 정유 가동률과 더 직접적인 제품 체인 검정 |

- 임계값, 부호, 타깃 우선순위는 2015–2023 IS에서만 동결한다.
- `RCSG=1` 사건은 5거래일 이상 떨어뜨려 비중첩 표본으로 평가한다.
- 2024+ OOS에서는 빈도, 평균 RV 차이, permutation/블록 부트스트랩 신뢰구간만 한 번 기록한다.
- 041 단독보다 좋아야 채택하는 것이 아니라, **독립적인 조건부 개선**이 있어야 한다.

## 현재 근거와 한계

041→MPC는 단독으로 양 구간 음의 상관을 보였지만, 가격수익률 신호는 아니며 2015–2019에서는 약했다. 060은 FRED HY OAS 원시자료를 현재 환경에서 아직 수집하지 못했다. 2026-09-04 5분 quick test에서도 공식 FRED 직접 CSV 2회 연결 재설정 뒤 DBnomics 미러가 `404`여서 게이트를 계산하지 못했다. 그러므로 이 카드의 조합 성과는 **아직 0건**이며, 041의 결과를 061의 결과처럼 쓰지 않는다.

참조: [041 교차 타깃 검정](../../reports/2026-09-04-refinery-utilization-equity-cross-target.md), [060 CODC](../060-credit-oil-dynamic-cointegration/README.md), [등록 노트](../../gathering/notes/2026-09-04-rcsg-intake.md), [quick test](../../gathering/notes/2026-09-04-composite-gates-quick-test.md).
