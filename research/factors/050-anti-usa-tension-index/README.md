# 050 — Anti-USA Geopolitical Tension Index (AUTI)

**상태**: 🌐 **ALTERNATIVE NLP / GEOPOLITICAL RISK CANDIDATE** — 공개 대안 데이터 기반 지정학적 대미(對美) 긴장도 및 변동성 모니터 후보  
**별칭**: *Global Anti-US Friction & Energy Chokepoint Risk*  
**Oil Pizza 가중치**: `0.0` (인샘플/아웃샘플 변동성 검증 전 미포함)  
**공통 타깃**: 신호 공개 뒤 다음 5거래일 WTI 실현변동성 (`CL=F`) 및 OVX 꼬리위험

---

## 🎯 가설 및 질문

미국은 호르무즈 해협, 바브엘만데브(홍해) 등 핵심 에너지 해상 수송로의 안보 보증자이자 페트로달러(Petrodollar) 체제의 중심축이다.

산유국(MENA, 페르시아만, 홍해 권역) 및 글로벌 공개 소셜 미디어/뉴스에서 대미(對美) 군사·외교적 적대 수사학 및 마찰 이벤트 빈도가 평소 기준치를 넘어 급증할 때, 미군 기지 타격, 유조선 나포, 공급 차질 리스크 프리미엄이 사전에 시장에 반영되며 **WTI 실현변동성 및 상방 꼬리위험이 유의미하게 확대되는가?**

```text
공개 GDELT / Reddit / Telegram / 위키미디어 데이터
  → 대미(Actor=USA) 갈등 이벤트 및 적대 톤(Negative Tone) 추출
  → 군사/제재/초크포인트 키워드 필터링 + MENA 산유국 지리 가중치
  → 20일 롤링 중앙값 대비 스파이크(Spike) 감지
  → 이후 5거래일 WTI 실현변동성 및 지정학 리스크 레짐 검증
```

---

## 📊 공개 데이터 전략 (100% Public & Free Sources)

| 데이터 소스 | 유형 / 엔드포인트 | 빈도 | 활용 방식 |
|---|---|---|---|
| **GDELT Project** | 글로벌 이벤트/톤 데이터베이스 (`Actor1=USA`, Goldstein Conflict Scale) | 일간 / 15분 | 전 세계 다국어 미디어의 대미 갈등 강도 및 부정적 톤 집계 |
| **Wikimedia Pageviews** | `United_States_Central_Command`, `United_States_Fifth_Fleet`, `U.S._sanctions_against_Iran` | 일간 | 대중 및 분석가의 미국 군사/제재 관심도 급증 포착 |
| **Reddit Public Feeds** | `r/geopolitics`, `r/worldnews`, `r/MiddleEast` 공개 API | 일간 | 소셜 미디어 내 대미 긴장도 및 여론 가속도 측정 |
| **Telegram 공개 채널** | MENA 현지 공개 뉴스/군사 브로드캐스트 채널 | 실시간 | 아랍어/파르시어 원문 기반 대미 적대 담론 스파이크 감지 |

---

## 🧠 3단계 노이즈 필터링 (Noise Reduction Filter)

단순한 문화적/정치적 불만은 원유 시장에 잡음(Noise)만을 제공하므로, **3단계 엄격한 필터링**을 적용한다:

1. **1단계 (일반 반미 여론 제거)**: 일반적인 문화/정치적 불만 텍스트는 분석 대상에서 제외.
2. **2단계 (물리적 안보/에너지 연계 필터)**: `sanctions`, `military base`, `5th fleet`, `strait of hormuz`, `tanker`, `retaliation`, `drone strike`, `embargo` 등 에너지 수송 및 군사적 마찰 키워드 동시 출현 시에만 집계.
3. **3단계 (지리적 가중치 부여)**: MENA, 걸프만, 홍해, 이란 인접 지역 발신 신호에 3.0배 가중치 부여.

---

## 💡 신호 생성 로직 (초안)

```python
# 1. 일별 대미 군사/에너지 갈등 지수 집계
daily_anti_us_intensity = (
    0.50 * gdelt_us_conflict_zscore
    + 0.25 * wiki_us_military_pageviews_spike
    + 0.25 * social_geopolitical_tension_score
)

# 2. 20일 이동 중앙값 대비 스파이크 여부 산출 (당일 제외 과거 20일 기준)
baseline_median = daily_anti_us_intensity.shift(1).rolling(20, min_periods=20).median()
anti_us_spike = daily_anti_us_intensity > (2.0 * baseline_median)

# 3. 타깃: 다음 5거래일 WTI 실현변동성
target = future_5d_wti_realized_volatility  # Yahoo CL=F
```

---

## ⚠️ 데이터 윤리 및 안전 경계 (Safety & Compliance)

- **100% 공개 데이터(Public Data Only)**: 정부/기관 공식 발표, 공개 뉴스, 공개 포럼 데이터만 사용하며, 비공개 메신저 대화나 사적 통신은 일체 수집하지 않는다.
- **룩어헤드 편향(Look-Ahead Bias) 엄격 배제**: $T$일의 신호는 $T-1$ 달력일 기준 집계치만을 사용하여 정렬한다.
- **단독 매매 신호 사용 금지**: 대미 긴장도 신호는 단독 방향성 알파가 아니며, 실물 수송 데이터(AIS 집계, 위성 재고) 및 타 팩터와의 교차 검증용 위험 레짐 지표로만 검토한다.

---

## 🔬 검증 계획

1. **인샘플 검증 (`2015-01-01` ~ `2023-12-31`)**:
   - GDELT 및 위키미디어 장기 시계열을 바탕으로 대미 긴장 스파이크 날짜 추출.
   - 스파이크 발생 이후 5거래일 WTI 실현변동성과의 상관계수($r$) 및 유의성 검정.
2. **아웃샘플 검증 (`2024-01-01` ~ 현재)**:
   - 인샘플에서 기준과 가중치를 동결한 뒤 단 1회 아웃샘플 검정 수행.
3. **판정 기준**:
   - $|r| \ge 0.10$이면서 IS와 OOS의 부호가 동일하고 일관된 변동성 예측력이 증명될 때만 `HOLD`에서 승격 검토.

---

**작성일**: 2026-09-04  
**연구 분류**: `research/factors/050-anti-usa-tension-index/`
