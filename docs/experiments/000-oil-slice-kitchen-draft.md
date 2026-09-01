# 000 — Oil Slice (부엌 초안)

상태: **비교군**. 최종 피자가 아니다.

## 가설

호르무즈 헤드라인이 붐비면 원유 부엌이 바빠진 것이고, 연준/CPI는 점심 수요다.

## 식

```text
slice_score = 2 * hormuz_count + 1 * inflation_count
slice_z     = 20일 롤링 z
```

코드: `ls_crude.features.slice_index.oil_slice`

## 체크

| 항목 | 값 |
| --- | --- |
| 크립토의 뭐 | 없음 (뉴스만) |
| 뉴스의 무슨 | 호르무즈 · 인플레/정책 |
| 출처 | Investing.com CSV + `research/data/event_calendar.csv` |
| look-ahead | 주말 뉴스는 다음 거래일 |
| 인샘플만 선택 | 예. 가중치 재튜닝 금지 |
| 아웃샘플 | 열지 않음 |
| 판정 | 부엌을 깔아 둔 초안. 피자가 생기면 이 장과 비교한다 |
