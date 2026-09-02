# 010 — Official Petroleum Buffer Disclosure Index

**상태**: ⏸️ **HOLD** (공개 비축 완충여력 후보; WTI 방향성 팩터가 아님)
**평가**: 공개성 7/10 | 구현 가능성 6/10 | 방향 선행성 3/10 | 변동성 레짐 가능성 7/10

## 가설

IEA 회원국의 공개 석유 재고 완충여력이 낮을수록, 이후 공급 차질이 발생할 때 시장이 흡수할 여지가 작다. 따라서 낮은 완충여력은 WTI `CL=F`의 미래 실현변동성과 상방 꼬리위험을 높일 수 있다.

이 팩터의 대상은 **중앙은행 외환보유액이 아니다**. 중앙은행·IMF의 준비자산 공시는 외화, 증권, SDR, IMF 포지션, 금 같은 금융자산을 다루며 석유 비축분을 공시하지 않는다.

## 데이터 전략

| 구성 | 공개 데이터 후보 | 빈도 | 사용 방식 |
| --- | --- | --- | --- |
| A. IEA 회원국 총 석유 재고 | IEA `Oil Stocks of IEA Countries` | 월간 | 완충여력의 핵심 수준 신호 |
| B. 긴급 비축 의무 | IEA의 순수입 90일 기준 | 제도/월간 | 수준 해석·국가별 비교 |
| C. 국가 비축 방출 발표 | IEA·정부 공식 발표 | 비정기 | 예측 피처가 아니라 정책 반응 더미 |
| D. 중앙은행·IMF 준비자산 | IMF IRFCL/COFER | 월간/분기 | 이 팩터에서 제외; 별도 FX 취약성 후보 |

IEA 재고는 비상 전용 비축과 상업용 재고가 섞일 수 있으므로, “전략비축유만의 순변화”로 과장하지 않는다.

## 신호 생성 로직 (검증 전 초안)

```python
# 월별 발표 자료는 실제 기준일이 아니라 발표일 이후에만 사용한다.
buffer_days = iea_oil_stocks_days_of_net_imports
buffer_tightness = -zscore(buffer_days, 36)

# 방출 발표는 이미 발생한 공급 충격에 대한 대응일 수 있으므로 통제변수다.
policy_release_dummy = iea_or_national_release_announcement

# 방향 수익률이 아닌 위험 레짐을 우선 타깃으로 둔다.
target = future_20d_or_60d_wti_realized_volatility  # Yahoo CL=F
```

## 인과성과 look-ahead

- 재고가 줄어서 유가가 오를 수 있지만, 유가 급등·전쟁 뒤에 정부가 재고를 방출할 수도 있다. 후자는 **역인과**다.
- 공개 재고는 월간이며 발표 지연이 있다. 관측 기준일 값으로 같은 달 가격을 예측하면 look-ahead가 된다.
- 공동 비축 방출은 공급 충격을 미리 안 신호가 아니라 충격에 대한 정책 대응이므로, 방향성 알파로 사용하지 않는다.

## 검증 기준

| 판정 | 기준 |
| --- | --- |
| Pass | 발표일 기준으로 정렬한 인샘플에서 낮은 완충여력이 이후 20~60일 WTI 변동성과 일관되게 연결됨 |
| Hold | 역사 시계열·발표일·국가 구성의 재현성이 부족함 |
| Fail | 효과가 정책 방출·이미 알려진 공급 충격의 사후 반응으로만 설명됨 |

## 현재 결론

**HOLD.** 공개 데이터는 비교적 명확하지만 저빈도·후행성이 강하다. Oil Pizza의 양/음 방향 가중치에는 아직 넣지 않고, 공급충격 취약성을 설명하는 보조 변동성 레짐 후보로만 유지한다.

## 다음 단계

1. IEA 재고 자료의 역사 범위, 개정 정책, 발표일을 확인한다.
2. 발표일로 시프트한 인샘플(2015-01-01~2023-12-31)에서 WTI 변동성만 검증한다.
3. 정책 방출 이벤트를 제외·통제한 뒤에도 효과가 남을 때만 승격한다.

## 참고 출처

- [IEA — Oil Stocks of IEA Countries](https://www.iea.org/data-and-statistics/data-tools/oil-stocks-of-iea-countries) — 월간 재고 완충여력, CC BY 4.0.
- [IMF — International Reserves and Foreign Currency Liquidity](https://data.imf.org/en/Datasets/IRFCL) — 중앙은행/정부 준비자산 공시의 범위.
- [IMF — COFER](https://data.imf.org/en/datasets/IMF.STA%3ACOFER) — 외환보유액 통화구성 자료; 석유 비축 자료가 아님.
