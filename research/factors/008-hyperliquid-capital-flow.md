# 008 — Hyperliquid PerpDEX Capital Flow (중동 자금 이탈 & 지정학적 선행 신호)

**상태**: 📋 **평가 및 R&D 설계 중**  
**평가**: 창의성 10/10 | 구현 가능성 8/10  
**가중치**: 2.0 (지정학 리스크 선행성 높음)

---

## 🎯 가설 (Core Thesis)

1. **Hyperliquid(HyperEVM / PerpDEX)의 특성**:
   - 중앙화 거래소(CEX)와 달리 비인가/무KYC(Non-KYC) 기반의 온체인 오더북 PerpDEX.
   - 엄청난 깊이의 유동성(Liquidity)과 높은 레버리지를 제공하여 **자금 은닉, 자산 도피(Capital Flight), 익명 대규모 포지셔닝**에 최적화됨.

2. **중동 지정학 리스크와의 연동성**:
   - 중동 분쟁/미사일 발사/제재 등 대형 지정학적 이벤트 직전, 정보 우위에 있는 중동 자산가, OTC 데스크, 연계 고래 주소들이 자산을 온체인(Hyperliquid L1 Bridge)으로 대량 이체 또는 USDC 입금.
   - **Hyperliquid 브릿지 대규모 입금 및 비정상적 고래 포지셔닝 → 중동 위기 고조 → 유가(WTI/Brent) 급등(↑) 선행 신호**.

---

## 📊 데이터 소스 및 API

### 1️⃣ Hyperliquid Info API (공개 & 무료)
- **Endpoint**: `https://api.hyperliquid.xyz/info`
- **수집 데이터**:
  - `userState`: 특정 고래/신규 주소의 예치금(USDC Margin) 및 레버리지 포지션.
  - `clearinghouseState`: 전체 미청산 약정(Open Interest, OI) 및 펀딩비.
  - `historicalOrders` / `userFills`: 대형 체결 내역.

### 2️⃣ Arbitrum / HyperL1 Bridge 온체인 이벤트
- **Arbitrum Deposit Bridge Contract**: Hyperliquid L1으로 들어가는 USDC 입금 트랜잭션 실시간 감지.
- **Tornado Cash / OTC Desk 필터링**: 입금 출처 주소가 Tornado Cash, FixedFloat, 또는 알려진 CEX/OTC 출구인지 추적 (Nansen / Etherscan / Arbiscan API 연동).

---

## 💡 신호 생성 로직 (Signal Logic)

```python
# 1. Hyperliquid L1 1시간/일간 순입금량 (USDC Net Inflow)
bridge_inflow_z = zscore(hyperliquid_bridge_usdc_inflow_24h, window=14d)

# 2. 익명/신규 대형 주소(> $1M) 예치 비율
anonymous_whale_deposit = sum(
    tx.value for tx in bridge_txs 
    if tx.value > 1_000_000 and is_offshore_or_privacy_source(tx.from_address)
)

# 3. Hyperliquid 원유/지정학 관련 asset (또는 BTC/ETH Oil Proxy) long 포지션 우위
oil_proxy_long_oi_ratio = hyperliquid_oil_long_oi / hyperliquid_total_oi

# 4. 최종 Hyperliquid Capital Flight Score
hyperliquid_signal = (0.5 * bridge_inflow_z) + (0.3 * anonymous_whale_deposit) + (0.2 * oil_proxy_long_oi_ratio)
```

---

## 🔬 선행성 검증 계획 (Granger Causality)

- **선행 타깃**: WTI / Brent 원유 선물 (1~5일 선행)
- **검증 변수**: Hyperliquid USDC Net Inflow Spike vs 유가 변동률
- **특이사항**: 중동 군사적 긴장감 고조 시 뉴스 보도(12~48시간) 전 온체인 자금 이체 반응 속도 확인.

---

## ⚠️ 리스크 및 극복 과제

1. **일반 암호화폐 시장 변동성 분리**:
   - BTC/ETH 자체 강세장으로 인한 자금 유입과 지정학적 자산 도피(Offshore Flight)를 구별하기 위해 **Tornado Cash / 특정 OTC 출처 입금 가중치** 별도 부여.
2. **데이터 파이프라인 지속성**:
   - Hyperliquid WebSocket 및 Info API 모니터링 노드 구축 필요.

---

## 🚀 구현 계획 (Phase 1)

- [ ] Hyperliquid Info API `userState` 및 Arbitrum Bridge 이벤트 파이썬 수집기 작성 (`research/src/ls_crude/data/hyperliquid_collector.py`)
- [ ] 최근 3개월 중동 분쟁 이슈 시점(지정학 이벤트 발생일) 전후 Hyperliquid 자금 유입 백테스트
- [ ] `z-score > 2.5` 발생 시 유가 상승 확률 산출

---

**작성일**: 2026-09-02  
**제안**: LS CRUDE 팀 (Hyperliquid PerpDEX Capital Flight Factor)
