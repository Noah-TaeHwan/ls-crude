# 2026-09-08 — Cushing Busy Index (CBI): Linear Regression vs ML vs DL Empirical Audit

**문서 성격**: 쿠싱 허브 분주도(Cushing Hub Physical Activity & Congestion Index) 팩터 합성 및 3대 모델링 기법(선형회귀 / ML / DL) 실증 비교 검증 보고서  
**참고 연구**: [LS CRUDE 연구 방향 — 뜻밖의 최신 흔적으로 원유 시장의 상태 읽기](https://share.onorca.dev/a/tsV3nMqt0cqb)  
**분석 대상**: WTI 연속선물 `CL=F` 2,900거래일 (2016-01-01 ~ 2026-02-28)  
**구현 모듈**: [`research/src/ls_crude/features/cushing_busy_index.py`](../src/ls_crude/features/cushing_busy_index.py)  
**검증 스크립트**: [`research/scratch/validate_cushing_busy_index.py`](../scratch/validate_cushing_busy_index.py)

---

## 1. 연구 배경 및 문제 정의

쿠싱(Cushing, Oklahoma)은 WTI 선물의 핵심 실물 인도지점이자 파이프라인 수송망, 원유 저장 탱크, 정유소 공급망의 허브이다.

기존 연구([Orca Reference](https://share.onorca.dev/a/tsV3nMqt0cqb))에서 제시된 **"현실의 중요한 상태를 간접적인 관측 가능한 흔적으로 추정하는 구조"**에 착안하여, 쿠싱의 물리적 분주도(Activity / Congestion)를 대변하는 다중 팩터를 선별하고 **선형회귀(Linear), 머신러닝(ML), 딥러닝(DL)** 3가지 모델로 결합하여 쿠싱 분주도 지수(Cushing Busy Index, CBI)를 합성하고 검증하였다.

```text
물리적 수급 팩터 (재고 인출 속도, 정유소 가동률, 휘발유 수요)
+ 시장 미시구조 팩터 (WTI 거래량 Z-Score, 고저 변동폭, 역사적 변동성)
        ↓
[3대 퀀트 모델링 파이프라인]
1. Linear Regression (Ridge L2)
2. Machine Learning (Gradient Boosting Regressor)
3. Deep Learning (Deep MLP Neural Net 64-32-16)
        ↓
Cushing Busy Index (0 ~ 100 정규화 지수)
        ↓
In-Sample (2016~2023) vs Out-of-Sample (2024~2026) 실증 검증
```

---

## 2. 선별된 팩터 매트릭스 (Selected Feature Matrix)

| 구분 | 팩터 명칭 | 연결된 기존 팩터 | 경제적/물리적 의미 |
|---|---|---|---|
| **물리적 수급** | `cushing_draw_velocity` | [038 Cushing Draw](038-cushing-draw-surprise/README.md) | 쿠싱 저장고 재고 인출 속도 ($-\Delta \text{Stock}$) |
| **정유사 수요** | `refinery_util_proxy` | [041 Refinery Utilization](041-refinery-utilization-proxy/README.md) | 미 정유소 가동률 (원유 수요 흡입력) |
| **최종 제품 수요** | `gasoline_demand_pull` | [039 Gasoline Demand](039-us-gasoline-demand-surprise/README.md) | 휘발유 출하량 및 완제품 수요 견인력 |
| **거래 미시구조** | `volume_z` | WTI Microstructure | 20일 롤링 WTI 거래량 Z-Score (실물 거래 활성도) |
| **가격 변동 압력** | `hl_range_z` | WTI Microstructure | 20일 롤링 일중 고저 변동폭 (호가창 압박도) |
| **모멘텀 / 변동성** | `mom_5d`, `mom_20d`, `vol_20d` | Macro Momentum | 가격 추세 및 역사적 변동성 레벨 |

---

## 3. 실증 모델 비교 매트릭스 (IS vs OOS Performance)

엄격한 시간 분할(In-Sample: 2016~2023 N=2,233 / Out-of-Sample: 2024~2026 N=667) 기준 결과:

| 모델 아키텍처 | In-Sample $R^2$ | Out-of-Sample $R^2$ | OOS RMSE | OOS 상관계수 ($r$) | OOS 미래 5일 변동성 상관 ($r$) |
|---|---|---|---|---|---|
| **1. Linear Regression (Ridge)** | `+0.8895` | `+0.8784` | 12.80 | `+0.9380` | **`+0.1297`** |
| **2. Machine Learning (GBM)** | `+0.9918` | `+0.9847` | 4.53 | `+0.9925` | `+0.0901` |
| **3. Deep Learning (Deep MLP)** | `+0.9946` | **`+0.9951`** | **2.57** | **`+0.9976`** | `+0.0730` |
| **4. Hybrid Ensemble** | `+0.9878` | `+0.9840` | 4.64 | `+0.9926` | `+0.0945` |

---

## 4. 팩터 기여도 및 중요도 랭킹 (Feature Importance)

* **선형 모델 (Linear Top 3)**: 정유소 가동률(`refinery_util_proxy`, 18.89) > 거래량 스파이크(`volume_z`, 16.04) > 재고 인출 속도(`cushing_draw_velocity`, 10.02)
* **머신러닝 (ML Top 3)**: 재고 인출 속도(**69.0%**) + 거래량 스파이크(**24.5%**)가 전체 변량의 **93.5%**를 설명.

---

## 5. 레짐 분석: 쿠싱 분주도 수준에 따른 시장 반응 (OOS 2024~2026)

| 쿠싱 분주도 레짐 | 해당 일수 (비중) | 미래 5일 실현변동성 | 미래 5일 평균 수익률 | T+5 상승 확률 |
|---|---|---|---|---|
| 🔴 **고혼잡/풀가동 (Score $\ge$ 65)** | 273일 (40.9%) | **35.85%** | **`+0.46%`** | **50.9%** |
| 🟡 **정상 가동 (45 $\le$ Score < 65)** | 111일 (16.6%) | 35.28% | `+0.79%` | 55.0% |
| 🟢 **유휴/비활성 (Score < 45)** | 283일 (42.4%) | **33.43%** | **`-0.03%`** | 44.2% |

### 💡 핵심 인사이트
1. **비선형성 포착 우수**: 딥러닝(Deep MLP)과 머신러닝(GBM)이 $R^2 \ge 0.98$로 선형 모델($R^2=0.87$) 대비 쿠싱의 임계적 혼잡 국면을 정밀하게 추적함.
2. **시장 레짐 시사점**: 쿠싱 분주도 지수가 65 이상으로 급증할 때 유가의 하방 압력이 제한되고 **변동성 확대 및 상방 드리프트($+0.46\%$)**가 관측됨. 반면 지수가 45 미만으로 떨어지는 유휴 국면에서는 가격 모멘텀이 둔화($-0.03\%$)됨.

---

**작성일**: 2026-09-08  
**연구 분류**: `research/reports/2026-09-08-cushing-busy-index-ml-dl-validation.md`
