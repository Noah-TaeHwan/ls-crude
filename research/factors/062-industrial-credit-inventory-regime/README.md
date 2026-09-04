# 062 — Industrial Credit–Inventory Stress Regime (ICISR)

**상태**: ⏸️ **HOLD — 059·060 모두 실측 전인 월간 복합 레짐 후보**
**밈**: *“Orders stall, inventory sticks, credit sweats.”*  
**가중치**: `0.0`

## 가설

제조 주문·납기와 재고/판매 비율의 비정상적 조합은 실물 산업의 재고·수요 스트레스를 나타낼 수 있다. 같은 시점에 신용시장–원유 관계가 극단으로 벌어지면, 그 실물 스트레스가 위험회피로 번진 레짐일 수 있다.

```text
industrial inventory-velocity stress (059)
  AND extreme credit–oil dislocation (060)
  → industrial / energy-chain uncertainty
  → future RBOB and energy-equity realized-volatility candidate
```

## 고정 신호 규칙

1. 059의 실제 공개일 기준 월간 IIVF z-score를 `I`라 둔다.
2. 060 CODC의 가장 최근 공개가능 값의 절댓값을 `|C|`라 둔다.
3. 사후 방향 선택을 막기 위해 IS에서 `|I| ≥ 80백분위수` 및 `|C| ≥ 80백분위수`를 고정한다.
4. `ICISR=1`은 두 극단 조건이 모두 참일 때, `0`은 그 외다. 공개시점은 ISM·Census·FRED 규칙 중 가장 늦은 입력 뒤로 정렬한다.

이는 ‘강한 제조업이면 유가 상승’ 같은 방향 베팅이 아니다. 실물·신용 지표가 함께 **비정상적**인 월의 이후 변동성 레짐을 묻는다.

## 사전 고정 타깃과 검정

| 우선순위 | 타깃 | 창 | 이유 |
| ---: | --- | --- | --- |
| 1 | RBOB `RB=F` 다음 21거래일 실현변동성 | 21일 | 제조·재고의 월간 빈도와 정제품 수요 전달경로를 맞춤 |
| 2 | XLE 다음 21거래일 실현변동성 | 21일 | 단일 기업 선택을 피한 광범위 에너지 주식 체인 보조 타깃 |

- 월간 공개 이벤트 한 행만 쓴다. 일별 forward-fill·겹친 RV 행 증식은 금지한다.
- 사건 간 21거래일 간격을 둔 비중첩 표본과 월간 block bootstrap을 함께 보고한다.
- IS에서 임계값·주 타깃만 동결한 뒤 2024+ OOS를 한 번 연다. 두 타깃 중 더 좋은 것을 고르는 것은 금지한다.

## 현재 한계

059는 Census의 약 6주 지연을 반영한 실제 패널이 없고, 060은 HY OAS 공식 CSV 수집이 막혀 있다. 2026-09-04 5분 quick test에서도 060의 공식 FRED 직접 CSV는 연결 재설정, DBnomics 미러는 `404`였으므로 두 입력을 만들 수 없었다. 따라서 이 카드는 설계 등록일 뿐 상관·적중률·가중치 결과가 없다.

참조: [059 HIMI-IIVF](../059-himi-iivf/README.md), [060 CODC](../060-credit-oil-dynamic-cointegration/README.md), [등록 노트](../../gathering/notes/2026-09-04-icisr-intake.md), [quick test](../../gathering/notes/2026-09-04-composite-gates-quick-test.md).
