# 2026-09-04 — 060 CODC intake & engine audit

## 받은 제안

`CODC_Engine`은 252거래일 rolling OLS로 HY credit spread를 WTI 수준에 회귀하고, 잔차 z와 beta z의 평균을 `Factor_CODC`로 만들어 이후 5·21·63일 WTI 실현변동성과 상관·Newey–West t·OOS R²를 계산한다.

## 판정

등록: **060 CODC**. 상태: **HOLD**, 가중치 `0.0`, 실제 IS/OOS 결과 없음.

## 왜 즉시 실행하지 않는가

1. `cointegration`이라는 이름과 달리 코드에 Engle–Granger, ADF, 잔차 정상성 검정이 없다. HY OAS와 WTI 가격수준의 rolling OLS는 스푸리어스 회귀가 될 수 있다.
2. `align_to_trading_calendar()`은 두 입력의 날짜 합집합에서 원유를 forward-fill한다. 서로 다른 휴장일에 오래된 WTI가 재사용되어 0수익률·중복 일별 상태를 만든다.
3. 5·21·63일 미래 RV 창은 겹친다. 코드의 자동 HAC lag는 horizon보다 짧을 수 있어 유효 표본 수와 t-stat을 과대평가할 수 있다.
4. 제공 `create_demo_data()`는 난수 데모다. 이 출력은 실데이터 검증결과가 아니며 매트릭스에 숫자로 기록하지 않는다.

## 최소 실행 패널

- FRED `BAMLH0A0HYM2` (ICE BofA US High Yield Index Option-Adjusted Spread) 일별 원시 응답·빈티지/이용가능시점 기록
- 사용자 제공 `research/data/clf-daily-2015-2026.csv`의 `Close`
- WTI 거래일만 남긴 point-in-time 패널, 신호 1거래일 지연
- IS 2015–2023 사전선택 → 2024+ OOS 단 1회

## 출력 규칙

공적분이 통과하면 잔차 기반 error-correction 후보로, 통과하지 않으면 변화율·z-score 기반 **credit–oil dislocation** 후보로 별도 기록한다. 어느 쪽도 동시상관만으로 선행성·거래 알파를 주장하지 않는다.
