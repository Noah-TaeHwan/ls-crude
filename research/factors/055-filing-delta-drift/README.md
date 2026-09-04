# 055 — Filing Delta Drift

**상태**: ⏸️ **HOLD — 무료 SEC 공시로 구현 가능, 아직 숫자·OOS 결과 없음**  
**밈**: *“When the filing suddenly speaks differently, the stock may start moving differently.”*  
**가중치**: `0.0`

## 가설

한 에너지 기업의 MD&A가 직전 같은 종류의 정기 공시보다 비정상적으로 많이 바뀌면, 경영진이 새 위험·수요·비용·법적 문제를 강조하기 시작했을 가능성이 있다. 이 변화는 **개별 에너지 주식의 이후 변동성** 후보이지, WTI 방향 예측이나 원유 수급 신호가 아니다.

우선 바스켓은 `XOM, CVX, OXY, SLB, HAL, MPC, VLO, PSX`로 고정한다. 개별 종목의 다음 5·20거래일 실현변동성과 섹터 ETF `XLE` 대비 초과변동성을 따로 본다.

## 고정할 입력

| 입력 | 정의 |
| --- | --- |
| 원문 | SEC EDGAR의 10-Q Item 2(MD&A), 10-K Item 7(MD&A) 공개 HTML |
| `raw_cosine_drift` | 과거 공시만으로 fit한 TF-IDF 공간에서 `1 - cosine similarity` |
| `jaccard_token_drift` | 정규화한 unigram token set의 `1 - Jaccard similarity` |
| 주 신호 | 종목별 직전 8개 **과거** 비교값으로 표준화한 cosine drift z-score |
| 보조 신호 | 같은 방식의 Jaccard drift z-score |
| 극단 플래그 | 주 신호 `z ≥ 2.0`; 임계값은 IS에서 고정 후 변경 금지 |

## 반드시 지킬 구현 규칙

1. **walk-forward TF-IDF**: 각 공시의 TF-IDF vocabulary·IDF는 그 공시의 실제 접수시각 이전 문서만으로 fit한다. 전체 코퍼스를 한 번에 `fit_transform`하면 미래 단어 빈도가 과거 피처에 들어가므로 금지한다.
2. **공개시각 정렬**: 분기말·회계일이 아니라 EDGAR `filingDate`와 가능하면 접수시각 이후의 첫 Yahoo 거래일부터 타깃을 잰다.
3. **동종 비교**: 10-Q는 이전 10-Q, 10-K는 이전 10-K와만 비교한다. 문서 길이·구조가 다른 10-Q↔10-K 비교는 신호가 아니다.
4. **실제 MD&A 추출**: 전문 HTML이 아니라 Item 2/Item 7 경계를 파싱한다. 추출 실패·짧은 문서는 결측으로 남긴다.
5. **보일러플레이트 로그**: safe-harbor 삭제 regex, 문서 길이, 추출 구간, accession number를 원시 감사 로그에 보관한다. regex가 내용을 과하게 지우면 결과를 신뢰하지 않는다.
6. **표준화**: 현재 공시를 과거 평균·표준편차에 넣지 않는다(`shift(1)`). 종목별 공시 습관 차이를 섞지 않는다.

## 검정 명세

- IS: 2015-01-01~2023-12-31에서 표본·창·타깃·임계값을 확정한다.
- OOS: 2024-01-01 이후는 사양 동결 후 한 번만 연다.
- 1차 타깃: 개별 종목 다음 5·20거래일 실현변동성.
- 2차 타깃: 같은 기간 종목 실현변동성에서 `XLE` 실현변동성을 뺀 값.
- 부차 결과: 다음 5·20일 수익률. 변동성 결과를 방향 알파로 바꾸지 않는다.
- 보고: 종목별·풀드 결과, 공시 종류별 결과, 표본 수, 다중검정 보정, 결측·추출 실패 비율을 모두 남긴다.

## 현재 판정

제공된 v1.2 코드는 cosine/Jaccard 이중 측정, ticker별 `shift(1)` 표준화, 위치 매핑이라는 좋은 출발점이다. 그러나 전체 문서로 TF-IDF를 fit하는 부분은 미래 정보 누출이므로, 이 카드의 walk-forward 조건을 만족하도록 고치기 전에는 어떤 수치도 보고하지 않는다.

이 카드는 공시 텍스트와 기업 주가의 관계를 보는 연구다. 경영진의 비공개 의도, 내부정보, 원유 가격 방향을 추론하지 않으며 투자 판단에 쓰지 않는다.

## 자료·보관

- SEC EDGAR 공개 API 및 회사별 제출 목록만 사용한다. SEC 자동 접근 정책·User-Agent·속도 제한을 준수한다.
- Yahoo 일봉은 가격 타깃용이며 원본 파일은 gitignored `research/gathering/raw/`에만 보관한다.
- 상세 연구 메모: [2026-09-04 filing delta drift note](../../gathering/notes/2026-09-04-filing-delta-drift-intake.md)

