# 연구 수집 — 짧은 안내

규칙의 정본은 [`research/INTAKE.md`](../research/INTAKE.md)다. 이 페이지는 그 입구다.

## 흐름

```text
gathering/raw     받은 그대로 (깃 안 올림)
      ↓
gathering/notes   한 장 정리
      ↓
sources 표        라이선스·지연·look-ahead
      ↓
pizza-hunt.md     크립토의 뭐 × 뉴스의 무슨 (없으면 표 비움)
      ↓
docs/experiments  살아남은 실험 카드 (001-…)
```

Oil Slice는 이미 `docs/experiments/000-…`에 있는 **부엌 초안**이다. 수집 파이프라인의 최종 피자가 아니다.

## 고정

- 가격: Yahoo `CL=F` (선물)
- 뉴스: Investing.com CSV. 스크래핑 금지
- 고르기: 인샘플 `2015-01-01`~`2023-12-31`만
- 아웃샘플 `2024-01-01`~ 는 후보를 언 뒤 한 번만
- 성과 숫자를 지어 내지 않음
