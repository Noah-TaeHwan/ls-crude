# 057 — Global Heavy Industrial & Maritime Infrastructure Factor (HIMI)

**상태**: ⏸️ **HOLD — 공개 프록시를 실제 검정했지만, 합성 결과가 재현되지 않음**  
**밈**: *“When the heavy world moves, oil volatility listens — but the public proxy is not the heavy world.”*  
**가중치**: `0.0`

## 무엇을 검정했나

원안 HIMI는 정유 보수(RMCI)·장비 telematics(DTDI)·조선 병목(FEVI)·EPC/건설(HIC)를 묶은 글로벌 운영 스트레스 가설이다. 이 네 입력의 무료·장기·공개시점 안전 패널은 아직 없다. 따라서 057은 원안을 **대체하거나 성공으로 포장하지 않는**, 두 개의 공개 미국 프록시 반증 시험이다.

| 공개 프록시 | 원안에서 겨냥한 부분 | 시점 처리 |
| --- | --- | --- |
| FRED `IPG333S` (Industrial Production: Machinery) | 중장비·산업 활동의 매우 넓은 대리값 | 관측월 말 + 45일 후 사용 (보수적 발표시점 프록시) |
| EIA `WPULEUS3` (U.S. refinery utilization) | 정유 운영 강도 | 보고 주 종료 + 5일 후 사용 |

매월 두 성분의 **직전 관측치까지만** 사용한 z-score를 동일가중 평균했다. 가격은 제공된 `CL=F`이며, 타깃은 신호가 실제 이용 가능해진 뒤의 **다음 21거래일 WTI 실현변동성**이다. 현재 개정본을 사용했으므로 과거 빈티지는 복원하지 못했다.

## 실제 결과

| 신호 → 다음 21거래일 WTI RV | IS (2015–2023) | OOS (2024–2026) | 판정 |
| --- | ---: | ---: | --- |
| HIMI 공개 2성분 합성 | `r=-0.177`, n=107 | `r=+0.465`, n=31 | **부호 반전 — 기각** |
| Machinery IP 단독 | `r=-0.178`, n=107 | `r=+0.712`, n=31 | 큰 OOS 수치는 작고 단일한 월간 표본이며 IS와 반전 |
| Refinery utilization 단독 | `r=-0.090`, n=107 | `r=-0.023`, n=31 | 관계 없음 |

따라서 `+0.465` 또는 `+0.712`를 HIMI 알파라고 부르지 않는다. 합성은 사전에 동일가중으로 고정했지만 IS/OOS 부호가 반대이며, OOS는 31개 월간 관측치뿐이다. 더 중요하게는 Machinery IP가 RMCI·DTDI·FEVI·HIC를 측정하지 않는다. 041의 주간 정유 가동률 단독 검정도 이미 OOS `r=-0.011`로 소멸했다.

## 다음 단계

1. 선박·정유 보수·중장비·건설의 **집계형** 장기 자료를 각 성분별로 라이선스와 실제 공개시점까지 확보한다.
2. 원래 네 성분이 채워질 때까지 057의 가중치·임계값을 조정하지 않는다.
3. 새 사양은 2015–2023에서 한 번만 동결하고 2024+를 다시 열기 전에 별도 기록한다.

출처와 재현 기록: [공개 프록시 검정 노트](../../gathering/notes/2026-09-04-himi-public-proxy-test.md), [상관 매트릭스](../../reports/2026-09-03-factor-validation-share.md).
