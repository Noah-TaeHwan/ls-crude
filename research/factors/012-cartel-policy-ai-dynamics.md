# 012 — Policy-Cartel Synergy & AI Market Dynamics Index

**상태**: 📋 **평가 및 R&D 설계 완료**  
**평가**: 창의성 10/10 | 구현 가능성 8.5/10  
**가중치**: 1.5 (매크로 수급 하단 방어 & AI 트레이딩 패러다임 결합)

---

## 🎯 가설 (Core Thesis)

### 1️⃣ 소비국 정책의 역설: 어떻게 소비국 정책이 카르텔을 지원하는가?
- **IEA/미국 비축유(SPR)의 하방 지지 (The SPR Floor Paradox)**:
  - 미국 및 IEA 회원국의 90일 수입분 전략적 비축유(SPR)는 유가 급등 시 수급을 안정시키지만, 유가 하락 시 미국 DOE의 재매입 정책($70~$79/bbl 하단 목표)과 맞물려 **카르텔의 감산 부담을 줄여주는 역설적 가격 하단(IEA/OPEC Put) 역할**을 수행함.
- **NOPEC 입법의 입법적 좌절 (Sovereign Immunity Protection)**:
  - OPEC 카르텔의 반독점면제(주권면제)를 박탈하려는 미국 NOPEC(No Oil Producing and Exporting Cartels) 법안은 사우디의 미 국채 매각 및 페트로달러 이탈 우려로 매번 유보됨으로써 **카르텔의 구조적 가격 통제권을 유지**시킴.
- **수입 의존국(인도, 영국, 동아시아)의 에너지 안보 인질화**:
  - 수입 의존도가 높은 국가들은 에너지 안보를 위해 고유가 상태에서도 비탄력적인 원유 매수를 지속할 수밖에 없어, OPEC+에 지속적인 가격 결정권(Leverage)을 제공함.

---

### 2️⃣ AI가 재작성하는 시장 동학 (AI Market Transformation & Edge Shift)
- **데이터 소유(Data Ownership)에서 해석 속도(Interpretation Velocity)로의 이동**:
  - 현대 원유 시장의 우위는 더 이상 단순 데이터 보유가 아닌, **위성 영상(원유 탱크 플로팅 루프 잔량 분석), 실시간 물류/기상, 멀티모달 뉴스 감성 데이터를 얼마나 빠르게 해석하고 시그널화(Execution Speed)**하느냐에 달림.
- **초고속 알골(HFT)과 공급망 사전 포착**:
  - AI 알고리즘이 파업, 기상 변화, 물류 병목 현상을 인간 트레이더보다 먼저 포착하여 즉각적 트레이딩 반응 실행.
- **미래 시장 트렌드 (Autonomous Risk Management & Instant Settlement)**:
  - 자율 포트폴리오 관리, 지정학적 몽테카를로 시뮬레이션, 온체인 즉시 결제(Blockchain Settlement) 통합으로 시장은 점차 초고효율화되고 조작하기 어려워짐.

> *"AI isn’t just changing the game — it’s rewriting the rules. And the edge? It’s no longer about who has the best data, but who can interpret it fastest."*

---

## 💡 정량적 신호 생성 로직 (Quant Signal Logic)

```python
# 1. 미국 DOE SPR 재매입 가격 하단(Floor) 대비 현재 유가 갭
spr_floor_support = max(0, 1.0 - ((wti_price - spr_refill_target) / spr_refill_target))

# 2. 위성 데이터 기반 원유 재고 서프라이즈 (Satellite Inventory Surprise)
satellite_storage_z = zscore(satellite_crude_inventory, window=30d)

# 3. AI 멀티모달 실시간 반응 속도 지수 (Interpretation Velocity Index)
ai_velocity_signal = (0.5 * spr_floor_support) + (0.3 * satellite_storage_z) + (0.2 * opec_policy_hesitation_score)
```

---

## 📊 팩터 매트릭스 및 비교

| 요소 | 과거 시장 (Traditional Era) | 현대/미래 AI 시장 (AI & Policy Era) |
|---|---|---|
| **카르텔 대응** | 단순 감산/증산 발표 대응 | SPR 재매입가(Floor) + 지정학적 협상력 결합 |
| **정보 우위** | 딜러/브로커의 프라이빗 제보 | 위성 레이다 + 멀티모달 AI 실시간 파싱 |
| **결제/체결** | 수동 지점/서면 계약 | AI HFT + 온체인 블록체인 즉시 결제 |
| **핵심 경쟁력** | 데이터 독점 (Data Access) | **해석 속도 및 execution (Interpretation Velocity)** |

---

## 🚀 구현 계획 (Phase 1)

- [ ] EIA 주간 SPR 재고 및 미국 DOE 재매입 목표가 트래킹 파이프라인 구축 (`research/src/ls_crude/data/spr_tracker.py`)
- [ ] 위성 데이터(Planet/Ursa 기반) 및 뉴스 감성 분석 알골 연동 모듈 개발
- [ ] Ultimate Oil Pizza 팩터 라인업에 `cartel_policy_ai_dynamics` 통합

---

**작성일**: 2026-09-02  
**제안**: LS CRUDE 팀 (Policy-Cartel Synergy & AI Market Dynamics Index)
