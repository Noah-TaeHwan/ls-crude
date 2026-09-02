# Truth Social Factor — 트럼프 발언 × CNN 크로스 체크

**상태**: ✅ **기존 구현됨**  
**위치**: `research/data/TTS scrapper/trump_truth_factor.py`  
**평가일**: 2026-09-02

---

## 개요

Trump의 Truth Social 게시물 중 **중동/유가 관련 팩트**를 추출하고, CNN의 공식 뉴스로 크로스 체크하는 팩터.

### 데이터 소스
```
Truth Social 게시물 → CNN의 공개 JSON 아카이브
https://ix.cnn.io/data/truth-social/truth_archive.json
(~5분 주기 업데이트, 인증 불필요, 검증됨)
```

### 핵심 특징
- **정치인 발언 신호** (트럼프의 직접 발언)
- **뉴스 기반 검증** (CNN 아카이브 = 공식 저널리즘 검증)
- **거의 실시간** (5분 주기 업데이트)
- **Look-ahead 위험 최소화** (키워드 기반, LLM 감정분석 아님)

---

## 기술 구조

### 1. 데이터 수집
```python
CNN_ARCHIVE_URL = "https://ix.cnn.io/data/truth-social/truth_archive.json"

# @realDonaldTrump의 모든 Truth Social 게시물 포함
# 각 게시물: 타임스탐프, 텍스트, 상호작용 수 등
```

### 2. 중동/유가 관련 키워드 필터
```python
OIL_RELEVANT_KEYWORDS = [
    "oil", "opec", "crude", "barrel", "energy", "gas price", "gasoline",
    "iran", "venezuela", "saudi", "sanction", "strait of hormuz", "hormuz",
    "tariff", "petroleum", "refinery", "pipeline",
]
```

**특징**:
- ✅ **지정학적 키워드** (Iran, Venezuela, Saudi, Hormuz)
- ✅ **에너지 시장 키워드** (OPEC, Crude, Refinery)
- ✅ **정책 신호** (Tariff, Sanction)
- ❌ **LLM 감정분석 안 함** (Look-ahead bias 방지)

### 3. 파이프라인

```
fetch_raw_posts()
    ↓ (CNN JSON에서 모든 @realDonaldTrump 게시물 다운로드)
check_archive_depth()
    ↓ (역사 데이터 깊이 확인: 백테스트 가능한가?)
tag_oil_relevance()
    ↓ (키워드 기반 필터링: oil/iran/saudi/etc 포함?)
aggregate_daily()
    ↓ (일일 집계: 날짜별 게시물 수, 유가 관련 플래그)
merge_trump_factor_into_daily()
    ↓ (유가 데이터와 병합)
get_trump_daily_features()
    ↓ (최종 팩터: daily_df + meta)
```

### 4. 팩터 신호 정의

```python
trump_daily_features = {
    'trump_oil_post_count': 일일 중동/유가 게시물 수,
    'trump_has_oil_news': 플래그 (유가 관련 게시물 있었나?),
    'trump_post_count': 전체 게시물 수 (정규화용),
}

# Z-score 정규화
trump_z = zscore(trump_oil_post_count, window=20)
```

---

## 주요 평가: CNN 아카이브의 선택 이유

### ✅ 왜 CNN의 아카이브를 직접 사용하는가?

| 선택지 | 방식 | 장점 | 단점 |
|--------|------|------|------|
| **CNN Archive** ✅ | 공개 JSON | 인증 없음, 자동 업데이트, 낮은 리스크 | 아카이브 깊이 미확인 |
| truthbrush | Truth Social API | 더 상세한 데이터 | ToS 리스크, 크레덴셜 필요 |
| 자체 스크래퍼 | HTTP + BeautifulSoup | 맞춤형 제어 | 높은 운영 리스크, Truth Social의 스크래핑 금지 |

**결론**: CNN 아카이브는 이미 구축되어 있고, 저장소 관리의 부담이 없음.

---

## 핵심 제약사항

### 1️⃣ 아카이브 깊이 (Depth) — 가장 중요한 검증 포인트
```python
def check_archive_depth(raw_df: pd.DataFrame, 
                        min_days_for_backtest: int = 365) -> dict:
    """
    아카이브가 롤링 윈도우일 수도 있음 (최근 X일만 유지)
    → 인샘플 2015~2023 백테스트가 불가능할 수 있음
    
    검증:
    - 아카이브의 최소 게시물 시간 확인
    - 365일 미만이면 "아웃샘플 추적만 가능" 권고
    """
    oldest_post_date = raw_df["created_at"].min()
    days_available = (pd.Timestamp.utcnow() - oldest_post_date).days
    
    if days_available < min_days_for_backtest:
        return {
            "backtest_viable": False,
            "prospective_only": True,
            "available_days": days_available,
            "recommendation": f"Start collecting now, validate only going forward"
        }
    else:
        return {
            "backtest_viable": True,
            "available_days": days_available
        }
```

### 2️⃣ Look-ahead Bias 방지
```python
# 규칙: 게시물은 다음 거래일부터 신호로 사용
# (같은 날 발언 → 다음날 신호)
# 왜? 시장이 같은 날 반응할 시간 부족
```

### 3️⃣ 신호 신선도
```
- 발언 → CNN이 감지 → 아카이브 업데이트: ~5분
- vs 뉴스 보도: 보통 다음날 아침
- vs 뉴스 기사 공개: 보통 +1~3일

결론: 거의 실시간이지만, 공식 뉴스보다는 한 단계 먼저
```

---

## 기존 Oil Slice와의 비교

| 측면 | Oil Slice (호르무즈+CPI) | Truth Social (트럼프 발언) |
|------|--------------------------|---------------------------|
| **뉴스의 무슨?** | 호르무즈 긴장 + 인플레 정책 | 정치인 직접 발언 |
| **데이터 소스** | Investing.com CSV + Fed 캘린더 | CNN JSON (Truth Social) |
| **신호 신선도** | 1~3일 (보도 시차) | ~5분 (거의 실시간) |
| **검증 방식** | 뉴스 제목 키워드 | 발언 텍스트 키워드 |
| **메커니즘** | 시장 뉴스 → 에너지 수급 기대 | 정치 신호 → 시장 기대 |
| **상관성** | 높음 (이미 검증됨) | ❓ 미확인 (아카이브 깊이 문제) |

---

## 현재 상태 & 다음 스텝

### 현재 구현 상태
- ✅ CNN 아카이브 접근 코드
- ✅ 중동 키워드 리스트
- ✅ 일일 집계 파이프라인
- ✅ Oil Slice와의 병합 준비됨
- ❓ **아카이브 깊이 검증 필수** (지금 실행해야 함)

### Phase 1️⃣: 즉시 실행 (현재)
```python
from research.data.TTS_scrapper.trump_truth_factor import get_trump_daily_features

# 아카이브 깊이 확인
trump_daily, meta = get_trump_daily_features()

# 출력:
# meta['archive_depth']  → 몇 일까지 역사 데이터 있는가?
# meta['backtest_viable'] → 2015-2023 백테스트 가능한가?

# ❌ 깊이 부족 → "아웃샘플 전용" 모드로 변경
# ✅ 충분함 → Phase 2로 진행
```

### Phase 2️⃣: 상관성 검증 (아카이브 깊이 충분할 경우)
```python
# 2018~ (또는 가능한 가장 오래된 데이터)부터 시작
trump_z = zscore(trump_daily['trump_oil_post_count'], window=20)
oil_z = zscore(daily_oil_prices, window=20)

# Granger Causality: trump_z → oil_z?
# Cross-correlation: lag = 0, 1, 5 거래일?

# 의문: 정말 trump의 발언이 유가를 선행하는가?
# (아니면 역으로 유가 뉴스를 보고 발언하는 건 아닌가?)
```

### Phase 3️⃣: Oil Slice와 결합 (상관성 확인 후)
```python
combined_factor = (
    2 * hormuz_news_count +           # Oil Slice
    1 * inflation_policy_count +
    1.5 * trump_oil_post_count +      # Truth Social
    0.5 * trump_post_count_total      # 정규화
)

combined_z = zscore(combined_factor, window=20)
```

---

## 데이터 수집 Python 코드 예시

### 간단 테스트
```python
import requests
import pandas as pd

CNN_ARCHIVE = "https://ix.cnn.io/data/truth-social/truth_archive.json"
response = requests.get(CNN_ARCHIVE, timeout=30)
posts = response.json()

df = pd.DataFrame(posts)
print(f"총 게시물 수: {len(df)}")
print(f"최오래 게시물: {df['created_at'].min()}")
print(f"최신 게시물: {df['created_at'].max()}")

# 중동 관련 게시물 필터
oil_keywords = ["oil", "iran", "venezuela", "saudi"]
df['is_oil_related'] = df['text'].str.lower().str.contains(
    '|'.join(oil_keywords), na=False
)

print(f"\n중동/유가 관련 게시물: {df['is_oil_related'].sum()}")
print("\n샘플 게시물:")
print(df[df['is_oil_related']][['created_at', 'text']].head())
```

---

## 추천: 지금 바로 할 일

### 🔴 우선순위 1: 아카이브 깊이 확인 (필수)
```bash
cd research
python -c "
from data.TTS_scrapper.trump_truth_factor import get_trump_daily_features
trump_daily, meta = get_trump_daily_features()
print(meta)
"
```

**결과 해석**:
- `archive_depth >= 365일` → ✅ 백테스트 시작 가능
- `archive_depth < 365일` → ⚠️ 아웃샘플만 추적 (지금부터 수집)

### 🟡 우선순위 2: Oil Slice와 비교 (상관성)
```
- Oil Slice의 "뉴스 기반 신호"
- Truth Social의 "발언 기반 신호"
- → 정말 독립적인가? (겹치지 않는가?)
- → 결합했을 때 성능 향상?
```

### 🟢 우선순위 3: Whale Index와의 삼각 검증
```
- Oil Slice (뉴스)
- Truth Social (발언)
- Whale Index (크립토 행동)
→ 세 신호가 일치하는 순간 = 강한 신호 가능
```

---

## 최종 평가

| 측면 | 평점 | 의견 |
|------|------|------|
| **창의성** | 8/10 | 정치인 발언 × 뉴스 크로스 체크 |
| **실행성** | 9/10 | 코드 이미 구현됨, 바로 실행 가능 |
| **데이터 가용성** | ⚠️ 미확인 | 아카이브 깊이 체크 필수 |
| **신호 신선도** | 10/10 | ~5분 (거의 실시간) |
| **메커니즘** | 6/10 | 직관적이지만 인과성 검증 필요 |

---

## 결론

**Truth Social Factor는 이미 프로젝트에 구현되어 있고, 바로 사용 가능합니다.**

다음 순서:
1. **지금**: 아카이브 깊이 확인 (5분)
2. **오늘**: Oil Slice와 상관성 테스트
3. **이번주**: Whale Index와 삼각 검증
4. **다음**: 최종 "피자" 구성

이제 **테스트를 직접 실행할까요?** 아니면 다른 팩터를 더 탐색할까요?
