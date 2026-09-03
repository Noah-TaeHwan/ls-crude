# 2026-09-03 — Korea–US Retail Fuel Spread (022) 초기 검증

## 정의

`한국 전국 B027 일반휘발유 원/L ÷ 월평균 USD/KRW × 3.785411784 − 미국 전국 regular gasoline USD/gal`을 Korea–US Retail Fuel Spread로 정의했다.

## 데이터와 범위

- 2015-01~2023-12 인샘플 108개월만 사용했다.
- Opinet 공식 CSV의 전국 월간 보통휘발유(B027), FRED/EIA `GASREGW`, FRED/Federal Reserve `DEXKOUS`를 사용했다.
- 원본·계산 패널은 gitignored `gathering/raw/2026-09-03-korea-us-fuel-spread-probe/`에만 있다.

## 결과

| 검사 | 결과 |
| --- | ---: |
| 스프레드 월간 변화 × USD/KRW 변화 | `r=-0.587` |
| 스프레드 월간 변화 × WTI 월간 변화 | `r=-0.100` |
| 12개월 스프레드 z-score × 다음 21거래일 WTI RV | `r=-0.087`, n=95 |
| z-score ≥ +1월의 미래 RV − 전체 | `+0.233%p`, n=17 |

## 해석

강한 환율 관계는 원화 가격을 USD/gal로 환산하는 식과 한국 내 환율 전가가 함께 만든 결과다. WTI 월간 변화와의 관계는 약하며, WTI 변동성과의 연속 상관은 음수다. 작은 고스프레드 사건군 차이는 연속 관계와 같은 방향이 아니므로 알파 근거가 아니다.

## 판정

022는 한국 소비자 연료비·환율·세금/마진 전가를 보여 주는 대시보드 후보로는 유효하다. 그러나 현재 역사 빈티지·공개시점이 불명확하고 IS 변동성 상관도 `-0.087`이므로 Oil Pizza `0.0`, **HOLD / dashboard only**다.
