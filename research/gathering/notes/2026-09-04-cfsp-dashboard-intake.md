# 022B — Consumer Fuel Stress Proxy (CFSP) 대시보드 등록

| 항목 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 상태 | Dashboard candidate / WTI 알파 미검정 |
| 관계 | 022 KGPI의 미국 소비자 체감 레이어 |
| 입력 | 미국 전국 regular gasoline 소매가격, 평균 시간당 임금, Michigan 소비자심리 |

## 목표 산식

```text
hours_to_fill_50L = (50 × USD per liter) / USD hourly wage
sentiment_stress  = 1 - (sentiment / 기준값)
CFSP              = dashboard display of both components
```

두 단위(노동시간과 심리)를 임의 `0.7/0.3`으로 합친 값은 상대 비교용 UI라면 가능하지만, 경제적·거래적 의미가 있는 단일 점수라고 부르지 않는다. 기본 화면은 `50L 비용`, `채우기까지 필요한 노동시간`, `최신 심리`, `출처별 공개일`을 분리 표시한다.

## 제공 코드 감사

| 항목 | 판정 | 이유 |
| --- | --- | --- |
| EIA 가격 | 수정 필요 | `/v2/series/`가 아니라 실제 v2 `/data` 경로·series facet·정렬을 사용해야 한다. 최신 행을 가정하지 않는다. |
| FRED 심리 | 입력 가능 | UMCSENT 조회에는 등록된 FRED API 키가 필요하다. 키·응답 오류에 `90.0`을 넣지 않는다. |
| BLS 임금 | 미구현 | `$30.0`은 placeholder다. BLS CES 평균 시간당 임금 계열을 실제로 받아 관측월·공개일을 함께 표시해야 한다. |
| 오류 처리 | 수정 필요 | `1.50`, `90.0`, `$30.0` 같은 fallback은 실제값처럼 보이므로 반환 금지. 소스별 상태와 마지막 성공 시각을 API 응답에 명시한다. |
| API 키 | 안전 | `.env`는 Git에 넣지 않고 `.env.example`만 커밋한다. 프론트엔드에 키를 전달하지 않는다. |

## 데이터·검정 경계

CFSP는 미국 가계의 연료 부담을 설명하는 대시보드다. 주간 연료가격·월간 임금·월간 심리를 섞으므로 “실시간 소비자 스트레스”나 WTI 선행 팩터로 부르지 않는다. 022의 기존 WTI 변동성 결과를 대체하거나 새 상관계수를 생성하지 않았다.
