# 010 — Elite Haven Index (부자들의 탈출구 수요)

**상태**: ⏸️ **HOLD** (가설은 흥미롭지만, 공개·재현 가능한 선행 데이터가 부족함)
**평가**: 창의성 8/10 | 구현 가능성 3/10 | WTI 선행성 2/10 | 변동성 레짐 가능성 5/10

## 가설

초고액 자산가가 뉴질랜드·하와이·피지처럼 멀리 떨어진 안전 자산 지역의 거주권, 고가 주택, 안전실을 찾는 수요가 급증하면, 지정학·정치·기후의 **꼬리위험(tail risk)** 인식이 높아졌다는 뜻일 수 있다.

그 위험 인식은 원유 공급 충격의 위험 프리미엄과 함께 움직일 수 있다. 따라서 이 신호가 유효하다면 WTI 가격의 방향성보다 향후 20영업일의 변동성 또는 급등 위험을 설명해야 한다.

## 중요한 구분

이 팩터는 “부자들이 미래 사건을 알고 있다”는 주장에 의존하지 않는다.

- **측정하려는 것**: 공개적으로 드러난 안전자산·거주권 수요의 변화
- **설명하려는 것**: WTI `CL=F`의 지정학 위험 레짐 또는 변동성
- **설명하지 않는 것**: 개별 전쟁·재난의 발생 확률, 혹은 비공개 로펌 고객의 의도

## 데이터 전략

| 구성 | 공개 데이터 후보 | 빈도 | 판정 |
| --- | --- | --- | --- |
| A. 뉴질랜드 고액 투자 거주권 | Active Investor Plus(AIP) 신청·승인 건수 (Immigration NZ / MBIE) | 월간 또는 발표 시점 | 사용 가능성 검토 |
| B. 해외 고액 투자 | Overseas Investment Office의 공개 승인·결정 자료 | 비정기 | 보조 신호만 |
| C. 안전 피난처 뉴스 강도 | 사람이 받은 뉴스 CSV에서 `bunker`, `safe haven`, `New Zealand`, `Hawaii`, `Fiji`의 결합 태그 | 일간 | 데이터 라이선스 확인 후 검토 |
| D. 벙커·보안 시설 건축 | 건축허가 자료 | 지역별·불명 | 공개 분류가 없어 현재 제외 |
| E. 고급 이민 로펌 문의 | 로펌 내부 리드 데이터 | 비공개 | **제외** |

## 규제 교란요인

뉴질랜드 AIP 신청 수는 위험 인식만으로 읽으면 안 된다. 2025년 4월 비자 제도 변경 뒤 신청이 크게 늘었고, 외국인의 주거용 토지 취득도 원칙적으로 제한된다. 따라서 아래 더미를 반드시 분리한다.

```text
haven_residual = AIP_applications
                 - policy_change_effect
                 - known_marketing_or_processing_backlog_effect
```

- 2025년 4월 AIP 제도 변경
- 고가 주택 매입 예외 등 해외투자 규정 변경
- 심사 적체 해소·정부 홍보·프로그램 마케팅

이 보정이 불가능하면 AIP 수치는 팩터가 아니라 정책변화의 기록이다.

## 신호 생성 로직 (검증 전 초안)

```python
# 모든 구성 요소는 발표시점 이후에만 사용한다.
elite_haven = (
    1.0 * zscore(aip_application_residual, 12) +
    0.5 * zscore(oio_high_value_decision_count, 12) +
    1.0 * zscore(haven_news_intensity, 20)
)

# 아직 WTI 방향성 점수에 넣지 않는다.
target = future_20d_wti_realized_volatility  # Yahoo CL=F
```

가중치와 기간은 사전등록한 뒤, 인샘플(2015-01-01~2023-12-31)에서만 검토한다. 아웃샘플(2024년 이후)은 후보 확정 뒤 한 번만 연다.

## 검증 기준 (Pass / Hold / Fail)

| 판정 | 기준 |
| --- | --- |
| Pass | 공개·재현 가능한 시계열 2개 이상, 발표지연 기록, 정책 더미 반영 후에도 변동성 예측력이 남음 |
| Hold | AIP/OIO 공개 빈도·역사 길이·라이선스 중 하나라도 부족함 |
| Fail | 신호가 규제 변경 또는 언론 보도량만 반영하거나, WTI 공개 신호와 인과 메커니즘이 확인되지 않음 |

## 현재 결론

**HOLD.** 벙커 건설과 고급 이민 로펌 리드는 매력적인 밈이지만 공개 시계열이 아니므로 구현 데이터가 될 수 없다. AIP와 OIO 자료도 정책 변경의 영향을 크게 받으므로, 우선은 방향성 팩터가 아닌 저빈도 위험 레짐 후보로만 유지한다.

## 다음 단계

1. Immigration NZ가 AIP 신청·승인 시계열을 어떤 빈도와 시차로 공개하는지 확인한다.
2. OIO 공개 결정 자료에서 고가 주거·투자 관련 결정의 역사와 재사용 조건을 확인한다.
3. 두 출처가 모두 충분하지 않으면 이 팩터를 **SKIP**으로 전환한다.
4. 충분할 때만 Yahoo `CL=F`의 향후 변동성을 타깃으로 인샘플 검증한다.

## 참고 출처

- [MBIE — Promoting Global Trade and Investment](https://www.mbie.govt.nz/business-and-employment/economic-growth/going-for-growth/promoting-global-trade-and-investment) — 2025년 AIP 제도 변경 뒤 신청 증가 언급.
- [LINZ — Discretionary exemptions](https://www.linz.govt.nz/guidance/overseas-investment/apply-consent-variation-or-exemption/application-forms-and-information-sheets/exemptions-need-consent/discretionary-exemptions) — 해외인의 주거용 토지 취득 제한.
- [LINZ — Investor visa holders and residential property](https://www.linz.govt.nz/sites/default/files/2025-12/Guidance%20-%20Investor%20visa%20holders%20-%20release%20v2.pdf) — 투자비자 보유자 대상 고가 주택 예외 안내.
- [TIME — Hawaii and New Zealand bunker reporting](https://time.com/6551188/mark-zuckerberg-underground-bunker-hawaii-report-reaction/) — 사례 보도. 집계 시계열 근거로는 사용하지 않음.
