# Public Confirmation Lag Index — 접근성·시간 감사

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 상태 | HOLD — as-of 역사자료 부재 |
| 관련 팩터 | 051 (018·049의 교차 검증 층) |
| 타깃 | Guardian/공식 확인 이후 다음 5거래일 Yahoo `CL=F` 실현변동성 |

## 가설을 측정 가능한 문장으로 바꾸기

`lag = 최초 독립 뉴스·공식 확인 시각 − 당시 일반인에게 공개된 위성 이상 시각`이다. 위성의 **관측** 시간이 아니라 과거에 실제 접근 가능했던 **공개** 시간이 필요하다. 긴 lag는 은폐의 증거가 아니라 관측·처리·구름·검증·사건 관련성의 불확실성을 모두 포함한다.

## 무료 소스 감사

- NASA FIRMS는 VIIRS S-NPP 자료가 2012-01-20부터 있다고 안내하며, 탐지의 날짜·시간을 제공한다.
- FIRMS의 오래된 자료 Archive Download는 Earthdata 로그인/이메일 요청 방식이다.
- NASA는 NRT 제품이 2–5개월 후 과학품질 자료로 교체될 수 있다고 설명한다. 따라서 오늘 내려받는 과거 표준 자료의 탐지시각은 당시의 NRT 공개시각·가용 상태를 뜻하지 않는다.
- Guardian Content API는 제목·UTC 게시시각·URL의 조건부 공개 후보지만, 그것만으로 위성 측 `t_available` 공백을 메우지 못한다.

## 판정

2015–2023 IS 및 2024+ OOS 수치 **미계산**. 탐지시각을 고정 3시간 지연 같은 임의 규칙으로 대체하면, 그 규칙이 당시의 실제 데이터 가용성을 대표한다는 증거가 없고 look-ahead가 된다. PCLI는 현재 새 알파가 아니라 향후 NRT 빈티지 로그가 생겼을 때 018과 049를 연결할 사전 등록 프로토콜이다.

## 출처

- https://firms.modaps.eosdis.nasa.gov/active_fire/
- https://firms.modaps.eosdis.nasa.gov/download/
- https://open-platform.theguardian.com/documentation/search
