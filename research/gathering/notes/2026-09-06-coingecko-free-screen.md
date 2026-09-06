# CoinGecko 무료 API 적격성 스크린 — 폐기

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-06 |
| 상태 | 폐기 |
| 작성 | 에이전트 |
| 관련 출처 | CoinGecko 공식 문서·약관·요금제 |

## 한 줄 가설

CoinGecko 무료 API(Demo·Keyless)의 집계 시장지표(가격·시가총액·거래량)가 WTI 변동성 연구의 후보 입력이 될 수 있는지 적격성만 본다. 무료 티어의 일별 히스토리는 최근 365일로 막혀 2015–2023 일별 시계열을 반출할 수 없고, 보관·재배포 제한과 불변 빈티지 부재, 선행 메커니즘 부재가 겹쳐 후보 입력으로 쓸 수 없다는 가설이었다.

## 크립토의 뭐 × 뉴스의 무슨

| 쪽 | 내용 | 아직 없음 |
| --- | --- | --- |
| 크립토의 뭐 | 집계 시장지표 후보(코인별 가격·시가총액·거래량 일별. 온체인 아님) | 아니오 |
| 뉴스의 무슨 | 사용자 제공 CSV에서만 공개 거시·원유 사건의 통제 맥락 | 아니오 |

둘 다 말해질 것처럼 보여도, 무료 티어 반출 경로가 막히고 선행 메커니즘이 없으므로 [`pizza-hunt.md`](../../notebooks/pizza-hunt.md)에 행을 만들지 않습니다.

## 본문

### 본 것 (링크, 확인일 2026-09-06)

- CoinGecko Demo Docs `market_chart/range`: Demo API의 히스토리는 최근 365일로 제한, 전체 범위는 Analyst 이상. 일별 자동 granularity는 90일 초과 구간에 적용(00:00 UTC). 완성된 UTC 일봉은 익일 00:35 UTC에 공개, 캐시 만료 00:40 UTC. 구간별 캐시 1일 30초 / 2–90일 30분 / 90일 초과 12시간: [https://docs.coingecko.com/demo/reference/coins-id-market-chart-range](https://docs.coingecko.com/demo/reference/coins-id-market-chart-range)
- CoinGecko API Pricing: Demo 월 10k 콜 크레딧·분당 100콜. 코인 일별/시간별 히스토리 Demo 1년, Basic 2년, Analyst 이상 2013부터. Demo 데이터 프레시니스 60초부터. 상용 이용은 가능하나 API 접근의 판매·재배포·신디케이션은 금지이며, 재배포·화이트라벨이 필요하면 Enterprise 별도 라이선스: [https://www.coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
- CoinGecko API Terms of Service(2026-09-06 확인, 최신판 표기 2025-09-05): 제한적·비독점·양도 불가 라이선스. API 접근의 판매·임대·서브라이선스·재배포·신디케이션 금지(별도 체결 계약 제외). 캐싱·저장은 비권장이며 저장 시 24시간마다 갱신·암호화·종료 시 전량 삭제. `Powered by CoinGecko` 표시 의무. 데이터는 제3자 출처이며 정확성·최신성을 보증하지 않음: [https://www.coingecko.com/en/api_terms](https://www.coingecko.com/en/api_terms)
- CoinGecko Data License: 재배포·화이트라벨·리셀러 라이선스는 Enterprise 맞춤형 계약 사항: [https://www.coingecko.com/en/api/enterprise/data-license](https://www.coingecko.com/en/api/enterprise/data-license)
- CoinGecko Methodology: 가격·거래량·유동성은 전 거래소 티커를 모은 VWAP 집계(시장 데이터)이며 이상치 제외·운영팀 수동 제외가 있다. 온체인 지표가 아니다: [https://www.coingecko.com/en/methodology](https://www.coingecko.com/en/methodology)
- CoinGecko Keyless Public API Docs: 키 없이 IP 기준 분당 약 10–30콜, 빠른 프로토타이핑·오픈소스·교육용. 프로덕션·정기 폴링에 부적합: [https://docs.coingecko.com/docs/keyless-public-api](https://docs.coingecko.com/docs/keyless-public-api)
- CoinGecko Demo Auth Docs: Demo 키는 무료 가입 후 Developer Dashboard 발급, `x-cg-demo-api-key` 헤더. 성공 요청당 1 크레딧 차감: [https://docs.coingecko.com/demo/reference/authentication](https://docs.coingecko.com/demo/reference/authentication)

### 확인 결과

1. **무료 티어로 2015~2023 일별 집계 시계열을 가져갈 수 있는가**: 아니오. Demo `market_chart/range` 일별 히스토리는 최근 365일 상한이라 2015–2023 반출이 안 된다. 쿼터(월 10k 크레딧·분당 100콜, 키리스는 IP 기준 분당 약 10–30콜)와 무료 Demo 키 발급 조건은 365일 상한 앞에서 무의미하다. 2013부터 전체 범위는 Analyst 이상 유료 경로다.
2. **라이선스·재배포·저장 조건**: API 접근의 판매·재배포·신디케이션 금지(별도 계약 제외). 캐싱·저장은 비권장이며 24시간마다 갱신·종료 시 전량 삭제 조건이다. 연구용 패널 보관·팀 공유·재배포는 무료 티어 권리로 불가하며, 재배포·화이트라벨은 Enterprise 별도 라이선스 사항이다.
3. **공개시점·개정(vintage) 정책과 look-ahead 위험**: 일별 완성분은 익일 00:35 UTC 공개이므로 같은 UTC 일자 봉에 당일 마감이 불가하다. 개정·빈티지 정책은 공식 문서에 불변 스냅샷 제도가 없으며, 집계 방식 변경·이상치 제외·거래소 커버리지 변화가 사후 값에 스며들 수 있다(약관도 정확성·최신성 무보증). 무료 티어는 현재 개정값(current vintage)만 본다. look-ahead 위험 있음. 크립토 24/7 UTC일과 `CL=F` 거래일 달력도 달라 다음 거래일 시프트가 필요하다.
4. **WTI 공개신호로서의 메커니즘 한 줄**: 없음. CoinGecko는 거래소 시세 집계(VWAP) 시장 데이터라 온체인 유동성 스트레스도 아니다. WTI와의 동시점 위험선호 동조(risk-on/off)는 통제 전 상관이라 알파가 아니며, 이를 넘는 선행 메커니즘은 확인되지 않았다.

### 안 본 것

- 실제 API 호출(Demo 키를 발급하지 않았고 데이터를 받지 않음. 이 판정은 문서·약관만으로 충분).
- 유료 Analyst 이상 요금제의 2013부터 범위·크레딧 단가 (유료 경로는 이 스크린 범위 밖).
- 개별 코인(BTC·ETH·USDT 등)의 2015년 커버리지 (반출 상한이 먼저 막히므로 확인하지 않음).
- 과거 집계값의 개정 로그 (공식 문서에 불변 빈티지 제도가 없어 «모름»).
- Investing.com 사이트. 스크래핑하지 않음.

### 기존 Oil Slice(`000`)와 다른 점

Oil Slice는 사람이 받은 CSV 헤드라인 횟수로 매일 쌓이는 공개 신호 초안이다. 이 축은 외부 상용 집계 API 의존이며, 무료 티어에서는 반출·보관·메커니즘 세 조건을 모두 못 넘는다. 온체인 축도 아니므로 002의 전제(전 체인 집계 유동성 스트레스)에도 닿지 않는다. 실험 카드로 올리지 않는다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` (이 판정에서 받지 않음) |
| 뉴스 출처 | 사용자 제공 CSV만. Investing.com을 긁지 않음 |
| 라이선스 | CoinGecko API 약관: 제한적·양도 불가 라이선스. API 접근 판매·재배포·신디케이션 금지(별도 계약 제외). 캐싱 비권장·24h 갱신·종료 시 삭제. `Powered by CoinGecko` 표시 의무. 재배포·화이트라벨은 Enterprise 별도(«모름»: 별도 계약의 구체 조건은 미확인) |
| 발표 지연 | 일별 완성분은 익일 00:35 UTC 공개, 캐시 00:40 UTC 만료. Demo 프레시니스 60초부터. 개정 로그·불변 빈티지는 «모름» |
| look-ahead | 있음. 무료 티어는 현재 개정값만 보며 불변 빈티지 없음. 크립토 UTC일과 `CL=F` 거래일 불일치도 있어 발표 시점 이후·다음 거래일 원칙을 지킬 수단이 없음 |
| 본 기간 | 2015-01-01~2023-12-31 일별 집계 시계열을 무료 티어로 반출 불가(Demo 365일 상한) |
| 아웃샘플을 봤나 | 아니오. 2024-01-01 이후 구간으로 후보를 판단하지 않음 |
| 성과 숫자 | 없음 (지어 내지 않음) |

## 다음 한 가지

폐기를 유지한다. CoinGecko 무료 API는 후보 입력 경로에서 제외하고, 점수·가중치·실험 카드를 만들지 않는다. Glassnode에 이은 두 번째이자 마지막 단일 제공자 스크린으로, 무료 티어 단일 제공자 경로는 여기서 닫는다. 유료 Analyst 이상·Enterprise 경로는 이 노트에서 판단하지 않는다.
