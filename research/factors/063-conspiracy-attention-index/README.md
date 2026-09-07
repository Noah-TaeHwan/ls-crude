# 063 — Conspiracy Attention Index (CAI)

**상태**: 🕵️ **MEME / MONITOR ONLY — Bitcoin·금 어느 쪽도 IS/OOS에서 안정된 관계를 보이지 않음**
**밈**: *“When conspiracy pages light up, watch the safe havens—but don’t call it a signal.”*
**가중치**: `0.0`

## 가설

대중의 음모론 관심 급등은 제도 불신·불확실성·대안 자산 탐색과 겹칠 수 있다. 그때 Bitcoin 또는 금의 가격 방향보다 단기 변동성이 평소보다 커지는지를 묻는다.

```text
conspiracy-attention shock
  → uncertainty / distrust narrative
  → Bitcoin or gold “weirdness” candidate
  → future 5-session realized volatility, not a direction call
```

## 고정 입력과 시간 규칙

무료 Wikimedia Pageviews API의 영문 위키백과 여섯 문서 `Conspiracy theory`, `QAnon`, `Deep state in the United States`, `New World Order (conspiracy theory)`, `Flat Earth`, `Chemtrail conspiracy theory`를 동일가중으로 묶었다. 각 문서의 직전 90일 z-score 평균이 CAI다.

- 일별 최종 조회수는 확정 뒤에만 안다고 보고 **다음 달력일**부터 사용했다.
- 주말 등 여러 관심일이 같은 GLD 거래일에 붙는 것을 막기 위해, 해당 시장일에 이용 가능한 마지막 신호 하나만 남겼다.
- 극단 사건은 `CAI z ≥ 2`의 첫 진입일만 쓰고 최소 5거래일 간격을 뒀다.
- 가격은 공개 Yahoo Finance `BTC-USD`, `GLD`; 타깃은 신호 뒤 다음 5거래일 실현변동성과 5일 수익률이다.

## 실제 스크린 결과

| 자산·타깃 | IS 2015-07~2023 | OOS 2024-01~2026-09 | 판정 |
| --- | --- | --- | --- |
| Bitcoin 5일 RV | `r=+0.016`, n=3,046; 18 독립 극단사건, 사건 차이 `+0.004`, permutation p=.743 | `r=+0.193`, n=974; 5 사건, 차이 `+0.054`, permutation p<.0002 | IS 관계 없음. OOS 5사건만의 후반 발견값이라 채택 불가 |
| Bitcoin 5일 수익률 | `r=+0.009`; 사건 p=.741 | `r=+0.049`; 사건 p=.749 | 방향성 없음 |
| GLD 5일 RV | `r=+0.161`, n=2,098; 16 사건, p=.451 | `r=-0.026`, n=667; 5 사건, p=.101 | 부호·사건 결과가 재현되지 않음 |
| GLD 5일 수익률 | `r=+0.044`, p=.671 | `r=+0.110`, p=.168 | 방향성 없음 |

## 결론

CAI는 금·Bitcoin의 거래 또는 위험관리 가중치가 아니다. Bitcoin OOS 변동성의 `+0.193`은 재미있는 **후반 구간 밈 재료**지만, IS `+0.016`과 5개의 OOS 사건만으로 보편 관계라고 말할 수 없다. 금은 IS에서 보인 약한 관계가 OOS에서 사라졌다.

콘텐츠 문구는 허용한다: **“Conspiracy attention is up. Bitcoin may get weird; it is not a buy signal.”**

재현 스크립트·원시 페이지뷰·가격 패널은 gitignored `research/gathering/raw/2026-09-07-conspiracy-attention-probe/`에 보관한다. 상세: [검정 노트](../../gathering/notes/2026-09-07-conspiracy-attention-test.md).
