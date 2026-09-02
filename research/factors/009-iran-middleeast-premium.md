# 009 — Iran & Middle East Crypto Premium Index (중동 현지 프리미엄 & 지정학 선행 신호)

**상태**: 📋 **평가 및 R&D 설계 중**  
**평가**: 창의성 9.5/10 | 구현 가능성 7.5/10  
**가중치**: 1.5 (중동 현지 실시간 민감도 높음)

---

## 🎯 가설 (Core Thesis)

1. **중동/이란 현지 프리미엄 (Middle East / Iran Premium) 현상**:
   - 지정학적 위기(미사일 발사, 전쟁 긴장감, 서방 제재 강화, 현지 금융 시스템 불안) 발생 시 이란 리알화(IRR) 등 현지 통화 가치가 급락.
   - 현지 주민 및 자산가들이 자산 방어 및 해외 이전을 위해 암호화폐(USDT, BTC)를 급격히 매수함에 따라 **이란 현지 거래소(Nobitex 등)의 USDT/BTC 가격이 글로벌 시세 대비 급격한 프리미엄(Nobitex Premium)**을 형성.

2. **유가와의 연동성 (Oil Price Correlation)**:
   - 뉴스 보도 전 현지 민간/금융 시장의 공포 심리가 거래소 프리미엄으로 실시간 반영됨.
   - **Nobitex USDT 프리미엄 급증 → 중동 지정학적 리스크 가중 → 원유(WTI/Brent) 공급 차질 우려로 유가 상승(↑) 선행 신호**.

---

## 📊 데이터 소스 및 API

### 1️⃣ Nobitex (이란 최대 암호화폐 거래소)
- **Public Ticker API**: `https://api.nobitex.ir/market/stats`
- **수집 페어**: `USDTIRT` (테더/리알), `BTCIRT` (비트코인/리알)
- **특이사항**: OFAC 제재 관련 이슈로 직접 접속 제한 시 프록시/중계 노드 활용 필요.

### 2️⃣ 글로벌 기준가 (Global Benchmark)
- **Binance / CoinGecko API**: `USDT/USD` 글로벌 시세 및 암시장/공식 환율 데이터.

---

## 💡 신호 생성 로직 (Signal Logic)

```python
# 1. Nobitex 현지 USDT 가격 (IRR) 및 글로벌 환율 비교
nobitex_usdt_irt = fetch_nobitex_price("USDTIRT")
global_usdt_usd = fetch_binance_price("USDTUSDT")
open_market_usd_irt = fetch_open_market_fx("USDIRT") # 암시장 환율 (Bonbast 등)

# 2. 이란 프리미엄 산출 (%)
iran_premium = ((nobitex_usdt_irt / open_market_usd_irt) - 1.0) * 100

# 3. 7일 이동평균 대비 z-score
iran_premium_z = zscore(iran_premium, window=7d)

# 4. 최종 신호 점수
iran_premium_signal = max(0, iran_premium_z)
```

---

## 🔬 선행성 검증 계획 (Granger Causality)

- **선행 타깃**: WTI / Brent 원유 선물 (1~3일 선행)
- **검증 시점**: 2024~2026년 주요 중동 미사일/지정학 이벤트 발생 직전 48시간 내 프리미엄 추이 백테스팅.
- **상관성 평가**: `iran_premium_z > 2.0` 이 유가 상승률과 의미 있는 Granger Causality(p < 0.05)를 가지는지 확인.

---

## ⚠️ 리스크 및 극복 과제

1. **제재(OFAC) 및 API 데이터 접근성**:
   - 이란 거래소 API 접근 차단 가능성이 존재하므로, P2P/OTC 데이터 Scraping 또는 제3자 지표(CoinGecko/CoinMarketCap 거래소 페어)로 우회 수집.
2. **현지 통화 초인플레이션 착시 효과 분리**:
   - 단순 리알화 인플레이션에 따른 프리미엄과 지정학적 쇼크로 인한 급등을 구별하기 위해 **단기 z-score(변화율)** 중심 분석.

---

## 🚀 구현 계획 (Phase 1)

- [ ] Nobitex 마켓 Ticker API 수집 모듈 작성 (`research/src/ls_crude/data/nobitex_collector.py`)
- [ ] 글로벌 USDT 시세 대비 이란 프리미엄 실시간 산출 파이프라인 구축
- [ ] 과거 중동 이벤트 시점(2024~2026) 프리미엄 스파이크 및 유가 선행성 검증

---

**작성일**: 2026-09-02  
**제안**: LS CRUDE 팀 (Iran & Middle East Crypto Premium Factor)
