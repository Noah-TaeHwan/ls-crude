# 002 — Whale Network Index (고래 포지셔닝)

**상태**: 📋 **평가 중**  
**평가**: 창의성 9/10 | 구현 가능성 6/10  
**가중치**: 1.5

## 가설

암호화폐 고래(대규모 보유자)의 거래 활동 → 미래 유가 방향성 선행 신호

## 데이터 소스

### Option A: CoinEx (권장) ✅
```
API: https://api.coinex.com/v1/
심볼: ETHUSDT (이더리움)
신호: 고래 주소(>1,000 ETH) 거래량 & 방향

- 장점: 공개 API, 실시간
- 단점: 하나의 거래소만 데이터
```

### Option B: Glassnode / CryptoQuant
```
API: Glassnode (유료), CryptoQuant (유료 + 무료 제한)
신호: 온체인 활동 (whale tx, exchange flow)

- 장점: 신뢰성 높음, 전체 체인 데이터
- 단점: 구독료 필요 ($200-1000/월)
```

### Option C: Nobitex (이란 거래소)
```
심볼: ETHUSDT, XRPUSDT
신호: 이란 고래 포지셔닝

- 장점: 이란 데이터 (지정학 신호)
- 단점: OFAC 제한, 데이터 접근 어려움
```

## 신호 생성 로직

```python
whale_count = (
    eth_whale_addresses(>1000 ETH) 
    * eth_whale_txvolume / total_volume
)
whale_direction = (
    exchange_inflow - exchange_outflow  # (+) 팔려는 고래
)
whale_score = whale_direction * whale_count
whale_z = zscore(whale_score, 7d)
```

## 선행성 검증

**가설**: Whale 거래 → 5-10일 후 유가 변화

```python
from statsmodels.tsa.stattools import grangercausalitytests

# Granger Causality Test
granger_result = grangercausalitytests(
    data[['whale_z', 'oil_price_future']],
    maxlag=10
)
# p-value < 0.05 → 선행성 있음
```

## 상관성 기준 (Pass/Fail)

- [x] CoinEx API 접근 가능
- [ ] Whale 신호 생성 (ETH, BTC)
- [ ] 유가와의 상관성 r > 0.3?
- [ ] Granger p-value < 0.05?
- [ ] 5-10일 lag에서 의미있는 신호?

## 구현 단계

### Phase 1: CoinEx 데이터 수집 (1주)
```python
# research/src/ls_crude/data/whale_index.py
import requests

COINEX_URL = "https://api.coinex.com/v1/order"
def get_whale_trades(pair='ETHUSDT', limit=100):
    # CoinEx 고래 거래 조회
    pass
```

### Phase 2: Whale 신호 생성 (3일)
```python
# research/src/ls_crude/features/whale_signal.py
def generate_whale_signal(trades_df):
    # 고래 포지셔닝 점수 계산
    pass
```

### Phase 3: Granger 테스트 (3일)
```python
# research/src/ls_crude/backtest/whale_validator.py
def test_whale_causality(whale_signal, oil_price):
    # 선행성 검증
    pass
```

## 최종 가중치

만약 r > 0.3 & p < 0.05:  **가중치 1.5** ✅
만약 r > 0.2 & p < 0.1:   **가중치 0.8** (약함)
만약 r < 0.2:             **가중치 0** (사용 X)

## 참고

- Glassnode: https://glassnode.com/
- CryptoQuant: https://www.cryptoquant.com/
- Nansen: https://www.nansen.ai/

---

**상태**: CoinEx로 시작, Glassnode는 나중에
