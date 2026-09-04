# UAP Attention Shock — 1단계 Meme Discovery 기록

**완료일**: 2026-09-04  
**판정**: `MEME DISCOVERY ONLY` — 62개 자산을 훑어 선정한 인샘플 결과이며, OOS는 열지 않았다.

## 질문

UAP/UFO에 대한 공개 관심도가 급증한 날 뒤에, 넓은 자산 바스켓 가운데 어떤 자산의 단기 실현변동성이 가장 “이상하게” 움직이는가? 이 질문은 알파 검정이 아니라, 사용자가 요청한 넓은 밈 탐색이다.

## 고정한 입력과 방법

- 입력: Wikimedia Pageviews API의 영문 위키백과 `Unidentified_flying_object` 문서, user traffic의 일별 조회수.
- 신호: 당일 조회수의 90일 롤링 z-score. 관측 당일에는 최종 일별 조회수를 알 수 없다고 보고 다음 달력일부터만 사용할 수 있게 맞췄다.
- 기간: 2015-07-01~2023-12-22. 5거래일 후 타깃까지 인샘플에 남는 행만 사용했다.
- 바스켓: 광범위 ETF, 원자재, 크립토, 방산, 우주, 밈·AI·에너지 주식 62개. 스캔 전 코드에 고정했다.
- 타깃: Yahoo 일봉에서 계산한 이후 5거래일 실현변동성 `sqrt(sum(log-return^2))`.
- 순위: 자산별 `attention_z90`과 미래 실현변동성 간 Pearson 상관의 절댓값. 가격수익률은 참고용으로만 함께 기록했다.

## 상위 10개 발견값

| 순위 | 자산 | n | UAP 관심도 → 5일 실현변동성 r | UAP 관심도 → 5일 수익률 r |
| ---: | --- | ---: | ---: | ---: |
| 1= | BTC-USD | 3,037 | +0.081 | -0.032 |
| 1= | GME | 3,037 | +0.081 | +0.012 |
| 2 | ETH-USD | 3,037 | +0.073 | -0.023 |
| 3 | RIOT | 3,037 | +0.061 | -0.004 |
| 4 | UNG | 3,037 | +0.060 | +0.015 |
| 5 | URA | 3,037 | -0.052 | -0.002 |
| 6= | ACHR | 3,037 | +0.051 | +0.063 |
| 6= | USO | 3,037 | +0.051 | -0.035 |
| 7 | AMC | 3,037 | +0.046 | +0.067 |
| 8 | ARM | 3,037 | +0.045 | -0.068 |

## 결론

발견용 밈 문구는 가능하다: **“When UFO attention spikes, Bitcoin and GME get weird.”** 하지만 이 스캔은 62개의 후보를 본 뒤 최대값을 선택했다. `r=+0.081`은 약하고, 넓은 탐색에서는 이런 최댓값이 우연히 나올 수 있다. 그러므로 이것은 검증된 관계도, 유의한 보편 법칙도, 원유 신호도 아니다.

정식 검정으로 승격하려면 선택한 하나의 자산과 명세를 고정한 뒤 2024+ OOS를 단 한 번 평가해야 한다. 그 전까지 가중치는 `0.0`이다.

## 출처·보관

- Wikimedia Pageviews API: <https://wikimedia.org/api/rest_v1/>
- Wikimedia Analytics API 접근 정책: <https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/access-policy.html>
- Yahoo Finance 일봉은 원본 재배포 제한을 고려해 gitignored `research/gathering/raw/2026-09-04-uap-meme-discovery/`에만 보관했다.
- 재현 코드·원시 JSON·패널·전체 62개 결과도 같은 raw 경로에 보관했다. Git에는 요약·방법·판정만 남긴다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` / 해당 없음 |
| 뉴스 출처 | 해당 없음 — Wikimedia Pageviews (Investing.com 스크래핑 아님) |
| 라이선스 | «모름» |
| 발표 지연 | 당일 조회수는 당일 미확정 → 다음 달력일부터 |
| look-ahead | 없음(설계) — 다음 달력일부터 사용 |
| 본 기간 | 인샘플만. 본문이 OOS를 열지 않았다고 명시 |
| 아웃샘플을 봤나 | 아니오 |
| 성과 숫자 | 없음 (지어 내지 않음) |
