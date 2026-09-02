# 003 — Truth Social Factor (트럼프 발언)

**상태**: ✅ **이미 구현됨**  
**위치**: `research/data/TTS scrapper/trump_truth_factor.py`  
**가중치**: 1.0

## 개요

트럼프 Truth Social 발언 중 유가 관련 키워드 언급 빈도 → 정치적 영향력 신호

## 데이터 소스

**CNN JSON Archive** (공개, 실시간)
```
URL: https://ix.cnn.io/data/truth-social/truth_archive.json
업데이트: ~5분마다
데이터: 트럼프 모든 Truth Social 포스트
```

## 기존 구현 코드

### 함수: `get_trump_daily_features()`

```python
from research.data.TTS_scrapper.trump_truth_factor import get_trump_daily_features

trump_daily, meta = get_trump_daily_features()
print(meta)  # {'archive_days': 1500, 'start_date': '2021-05-XX'}
```

### 반환값

```python
trump_daily = pd.DataFrame({
    'date': ['2026-09-01', '2026-09-02', ...],
    'oil_mention_count': [2, 5, 1, ...],  # "oil", "opec", "crude" 등
    'geopolitical_mention': [0, 1, 0, ...],  # "iran", "hormuz", "sanction"
    'energy_mention': [1, 2, 0, ...],  # "energy", "gas", "renewable"
    'trump_sentiment_z': [0.5, 1.2, -0.3, ...],
    'truth_daily_feature': [0.8, 1.5, 0.2, ...]  # 최종 신호 (z-score)
})
```

## 신호 생성 로직

```python
OIL_RELEVANT_KEYWORDS = [
    'oil', 'opec', 'crude', 'iran', 'venezuela', 'saudi',
    'sanction', 'hormuz', 'russia', 'energy', 'gas', 'wti'
]

def tag_oil_relevance(posts):
    """포스트를 유가 관련성으로 분류"""
    oil_posts = [
        p for p in posts 
        if any(k in p['text'].lower() for k in OIL_RELEVANT_KEYWORDS)
    ]
    return len(oil_posts)

def aggregate_daily(posts_by_day):
    """일별 신호 생성"""
    daily_count = {d: tag_oil_relevance(posts) for d, posts in posts_by_day.items()}
    daily_z = zscore(daily_count, window=30)  # 30일 이동 표준화
    return daily_z
```

## ⚠️ 중요 주의사항

### 1. 아카이브 깊이 확인 필수

```python
def check_archive_depth():
    """CNN 아카이브가 얼마나 오래된 데이터를 가지고 있는지 확인"""
    raw = fetch_raw_posts()
    dates = [p['posted_at'] for p in raw]
    start_date = min(dates)
    end_date = max(dates)
    return {
        'start_date': start_date,
        'end_date': end_date,
        'days_available': (end_date - start_date).days
    }
```

**문제**: CNN 아카이브가 rolling window일 수 있음 (최근 2년만)
→ 2015-2023 backtest 불가능할 수 있음

**해결책**:
- 아카이브가 2018+ 이상이면 OK
- 2015-2017은 "prospective only" (2024+ 전망만 사용)

### 2. 선행성 가정

트럼프 발언 → 시장 반응 (lag 0-3일)

```python
# Granger test: Truth Social 신호가 유가를 선행하는가?
granger_result = grangercausalitytests(
    data[['trump_z', 'oil_return']],
    maxlag=3
)
```

## 신호 강도 해석

| 신호값 (z-score) | 의미 | 해석 |
|-----------------|------|------|
| z > 2 | Trump이 유가 관련 강한 발언 | 🔴 주의 (변동성 ↑) |
| 1 < z < 2 | Trump 발언 빈도 증가 | 🟡 경고 |
| -1 < z < 1 | 중립 | 🔵 중립 |
| -2 < z < -1 | Trump 발언 빈도 감소 | 🟢 약세 신호 |
| z < -2 | Trump이 유가 관련 약한 발언 | 🟢 강한 약세 |

## 검증 (Pass/Fail)

- [x] CNN API 접근 가능
- [x] Trump 포스트 추출 가능
- [ ] 아카이브 깊이 확인 (check_archive_depth() 실행)
- [ ] Granger p-value < 0.05?
- [ ] Oil Slice와 독립적인가? (상관성 r < 0.4)

## 다음 단계

### 이번 주
```bash
# 아카이브 깊이 확인
python -c "
from research.data.TTS_scrapper.trump_truth_factor import check_archive_depth
meta = check_archive_depth()
print(f'Available: {meta[\"start_date\"]} to {meta[\"end_date\"]}')
print(f'Total days: {meta[\"days_available\"]}')
"
```

### 다음 주
- Granger Causality 테스트
- Oil Slice와의 상관성 분석
- 최종 가중치 결정 (1.0 유지 or 조정)

---

**기존 구현 작동 확인 필요**: `check_archive_depth()`
