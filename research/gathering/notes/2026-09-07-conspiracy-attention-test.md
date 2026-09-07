# 2026-09-07 — 063 Conspiracy Attention Index 검정

## 설계

여섯 Wikimedia 문서의 일별 pageviews를 각각 90일 z-score로 만들고, 그 평균을 CAI로 썼다. 문서·분할·자산·5거래일 타깃은 자산 결과를 읽기 전에 raw 재현 스크립트에 고정했다.

| 문서 |
| --- |
| `Conspiracy_theory` |
| `QAnon` |
| `Deep_state_in_the_United_States` |
| `New_World_Order_(conspiracy_theory)` |
| `Flat_Earth` |
| `Chemtrail_conspiracy_theory` |

Wikimedia 조회수는 D+1부터 이용 가능하다고 처리했다. `BTC-USD`는 24/7이지만, `GLD`는 다음 거래일로 정렬했다. 같은 거래일에 여러 달력일 신호가 붙으면 마지막 이용가능 신호만 남겼다.

## 결과

| 자산 | 구간 | CAI → 5일 RV r | CAI → 5일 수익률 r | 독립 극단사건 수 | RV 사건−비사건 차이 | permutation p |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| BTC-USD | IS | +0.016 | +0.009 | 18 | +0.004 | .743 |
| BTC-USD | OOS | +0.193 | +0.049 | 5 | +0.054 | <.0002 |
| GLD | IS | +0.161 | +0.044 | 16 | +0.002 | .451 |
| GLD | OOS | -0.026 | +0.110 | 5 | +0.011 | .101 |

Permutation은 같은 표본 크기의 무작위 사건일을 5,000회 뽑아 양측 사건 차이를 비교했다. `p<.0002`는 5,000회 중 그보다 큰 절대 차이가 없었다는 뜻이지, 5건 OOS 이벤트의 일반화 가능성을 뜻하지 않는다.

## 판정

- **Bitcoin**: OOS 변동성 수치는 흥미롭지만 IS는 0에 가깝다. 선택된 여섯 문서·후반 레짐·5개 사건이라는 한계 때문에 MEME/MONITOR ONLY.
- **금(GLD)**: IS의 `+0.161`이 OOS `-0.026`으로 사라졌다. 안전자산 신호로 기각.
- **가격 방향**: BTC·GLD 모두 양 구간에서 일관된 수익률 관계 없음.

원시 Wikimedia JSON, Yahoo 가격 패널, 결과 CSV, 실행 코드는 gitignored `research/gathering/raw/2026-09-07-conspiracy-attention-probe/`에 있다. Yahoo 가격 원본은 재배포하지 않는다.
