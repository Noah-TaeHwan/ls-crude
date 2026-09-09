# 2026-09-09 — Oil–Helix 괴리 관측을 홈 그래프로 넣을 수 있는가

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-09 / 에이전트(Codex 세션 인계 후 확인) |
| 후보 ID / 카드 경로 | [ALT-20260909-02](../../candidates/ALT-20260909-02.md) · [095](../../factors/095-oil-helix-dislocation/README.md) |
| 상태 | 검토 중 — 기존 판정 PARK 유지. 홈 자료 탐색에 관측 그래프 추가. 매매 시그널 아님 |
| 연결 출처 | Yahoo 일봉 HLX·CL=F 런 [20260909T095HLXZ](../../indexes/095-oil-helix-dislocation/20260909T095HLXZ/README.md) |

## 활동과 WTI 가설

전문 용어로 다시 쓰면 이렇다. **오일서비스 주식(HLX)과 WTI 선물(CL=F)의 같은 날 움직임이 어긋날 때, 그 잔차(OHD)가 줄어드는 방향이 어느 시장이 틀렸는지를 가리키는가.** 흔히 말하는 “벌어지면 수렴할 것을 기대하고 들어가는 것”은 페어의 평균회귀가 아니라, **제3시장(Brent 또는 오일서비스 바스켓 OSB)이 틀린 쪽을 지목하는가**라는 삼각형 가설이다. 동시 상관은 알파가 아니다.

반증은 카드에 이미 있다. 리드랙 실패 + 피어(OIH·SLB·HAL)와 같은 잔차회귀 + 삼각형 캐치업이 약 50%이면 PARK. 임계값 재탐색으로 살리지 않는다.

## 확인한 것 / 확인하지 못한 것

- 원문: [ALT-20260909-02](../../candidates/ALT-20260909-02.md). 판정 **PARK**. 이유: `A 리드랙 FAIL. B 캐치업 HLX 91.5% vs OIH 92.3%. C 삼각형 ~50%. 트레이딩 미개방`. 다음 행동: `HOS 단독 전향만`.
- 가격 원본: Yahoo v8. 파일 `hlx_wti_spy_xle_20160909_20260901.csv` 컬럼 `date,hlx,cl,spy,xle`. 관측 2481행, 2016-09-09 ~ 2026-09-01. sha256 `62d1c1f2124e2b7d8a829c354dad255d0813d6f79a424b32297f2bbe859b3c7c`. 2024-01-01 이후 644행은 이미 연 아웃샘플이다.
- 배터리 A [HLXZ](../../indexes/095-oil-helix-dislocation/20260909T095HLXZ/README.md): 레벨·60일 롤링상관·리드랙 그림이 있다. “Protocol remainder … is unopened.”
- 배터리 B [OHDBZ](../../indexes/095-oil-helix-dislocation/20260909T095OHDBZ/README.md): `HLX = α + β1 WTI + β2 OIH + β3 SPY + ε`, k=20 캐치업 HLX 91.5% / OIH 92.3%. **“HLX is not above the oil-service placebos. Residual mean reversion is the regression error coming home, not Helix-specific information. WTI reversal is a coin flip.”**
- 배터리 C [TRIZ](../../indexes/095-oil-helix-dislocation/20260909T095TRIZ/README.md): HLX 단독 캐치업 인샘플 51.8%. **“OOS HLX-isolated catch-up T1 55.9% / T2 56.6% — coin-flip noise, not a frozen edge.”**
- 구조 단절: 2026-09-01 마지막 HLX, 2026-09-02부터 HOS. HLX+HOS 접합 금지.
- UI: 홈 자료 탐색에 `helix` 버튼을 추가했다. 첫 관측일=100 지수로 HLX와 CL=F를 겹친다. 2020-04-20 CL `-37.63`은 유지한다. 그리드는 `grid-cols-2 md:grid-cols-3`이라 9개가 3×3으로 늘어난다. 카드는 PARK·트레이딩 미개방을 먼저 쓰고 P&L은 그리지 않는다.
- 확인하지 못한 것: HOS 단독 전향 패널, 거래비용, 블록 부트스트랩, Granger/FDR. 성과를 새로 계산하지 않았다. 아웃샘플 숫자를 후보 선정에 다시 쓰지 않는다.

## 판정과 다음 행동

- **PARK 유지.** 홈 `helix` 샘플은 관측 그래프이지 매매 신호·Helix 고유 캐치업·WTI 반전이 아니다.
- 다음 화면 추가는 같은 자료 탐색 버튼 줄에 이어 붙인다. 8개 상한은 없다.
- 담당 제안: 연구 원문 유지 오태환. HOS 전향 패널이 쌓이기 전에 잔차 임계값을 바꾸지 않는다.
- 재검토: 후보 카드의 2026-12-01. HOS 전향이 쌓이기 전에 잔차 임계값을 바꾸지 않는다.
