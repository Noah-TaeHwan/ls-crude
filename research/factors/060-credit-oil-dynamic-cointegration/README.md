# 060 — CODC: Credit–Oil Dynamic Cointegration & Elasticity

**상태**: ⏸️ **HOLD — 공식 FRED 원시자료 직접 수집이 현재 환경 전송 오류로 막혔고, 제공 엔진도 공적분·공개시점·표본 독립성 검사를 충족하지 않아 미실행**  
**밈**: *“When credit stops believing the barrel, volatility hears the disagreement.”*  
**가중치**: `0.0`

## 가설

하이일드 신용스프레드와 WTI는 위험선호·성장·에너지 발행사의 공통 충격을 공유한다. 이 관계에서 신용이 원유보다 비정상적으로 넓어지거나 좁아지고, 그 민감도 자체가 바뀌면 이후 에너지 체인 변동성이 높아질 수 있다.

```text
HY option-adjusted spread ↔ WTI
  → rolling residual / elasticity change
  → credit–oil disagreement
  → future WTI · RBOB · energy-equity volatility candidate
```

이는 **WTI 방향**이나 인과적 선행을 주장하는 모델이 아니다. 신용과 원유가 같은 위험 충격에 동시 반응할 수 있으므로, 먼저 `미래 변동성` 레짐 후보로만 시험한다.

## 무료 공개 입력 후보와 시간 규칙

| 입력 | 후보 | 보수적 이용 규칙 |
| --- | --- | --- |
| 고수익 채권 스트레스 | FRED ICE BofA US High Yield Index OAS `BAMLH0A0HYM2` | FRED가 표시하는 관측일의 종가/발표 시각 빈티지를 확인할 때까지 **다음 거래일**부터만 이용 |
| 원유 | 제공 `CL=F` 일봉 | 해당 일봉 종가 확정 뒤, 결과는 **그 다음 거래일**부터 계산 |
| 타깃 | 다음 5·21·63 거래일 WTI 실현변동성 | 신호일 수익률을 제외하고 엄격히 미래 수익률만 사용 |

## 제공 CODC v25 엔진 감사

| 점검 | 판정 | 이유 |
| --- | --- | --- |
| rolling OLS 수준 회귀 | **수정 필요** | 이름과 달리 Engle–Granger/ADF 공적분·정상성 검정이 없다. 두 비정상 가격 수준의 회귀 잔차는 가짜 관계일 수 있다. |
| residual + beta z-score | 후보로 유지 | 단, 각 시점 직전 창만 쓰고 월별/일별 중 실제 신호 빈도를 고정해야 한다. |
| 양쪽 `lag_days=1` forward-fill | 수정 필요 | WTI를 신용 달력에 forward-fill하면 휴장일 0수익률·중복 행을 만든다. 원유 거래일 달력만 타깃으로 쓴다. |
| 일별 반복과 겹친 미래 RV | 수정 필요 | RV5/21/63은 중첩된다. 이벤트 간격을 horizon 이상으로 두거나 block bootstrap/HAC lag ≥ horizon으로 보정한다. |
| OOS R² | 보조 지표 | IS에서 추정한 절편·기울기로 OOS만 채점한다. 동일 구간 재추정·사후 horizon 선택은 금지한다. |

## 사전 고정 검정

1. FRED 원시 응답의 관측일·개정·공개가능시점을 기록하고 `BAMLH0A0HYM2`와 제공 WTI를 **WTI 거래일**에만 정렬한다.
2. IS(2015–2023)에서 (a) 로그 수준 공적분 검정, (b) 변화율/스프레드 기반 비공적분 대안 모델을 분리한다. 공적분이 기각되면 이 팩터의 이름·해석을 `Credit–Oil Dislocation`으로 바꾼다.
3. 사전 지정 252거래일 창의 잔차 z와 beta z를 계산한다. 신호는 다음 거래일에만 실행 가능하도록 한 칸 지연한다.
4. 비중첩 이벤트 표본으로 RV5·21·63을 시험하고, IS에서 하나의 horizon·부호만 고정한다.
5. 2024+ OOS는 한 번만 열어 상관, HAC/블록 부트스트랩 신뢰구간, 기준선 대비 OOS R²를 기록한다.

## 현재 결론

가설 자체는 기존 심리 밈보다 경제적으로 훨씬 직접적이며 무료 장기 데이터도 있다. 그러나 HY–WTI 동시충격과 수준 회귀의 가짜 관계를 제거하지 않으면 `CODC`라는 이름으로 알파를 주장할 수 없다. 2026-09-04 공식 FRED CSV를 두 방식으로 수집 시도했으나 모두 전송 연결 재설정으로 실패했다. 합성 데이터로 대체하지 않는다. 실제 원시 자료 수집과 위 사전 등록 검정을 마치기 전까지 HOLD다.

수집·엔진 감사: [060 등록 노트](../../gathering/notes/2026-09-04-codc-intake.md). [수집 시도 로그](../../gathering/notes/2026-09-04-codc-collection-attempt.md).
