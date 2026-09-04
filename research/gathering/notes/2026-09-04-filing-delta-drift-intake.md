# Filing Delta Drift v1.2 — 등록 메모

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 상태 | 보류 — 구현 명세 등록, 원시 수집·IS/OOS 미실행 |
| 작성 | 에이전트 (사용자 제공 v1.2 명세 검토) |
| 관련 출처 | SEC EDGAR XBRL / submissions API, Yahoo Finance |

## 한 줄 가설

에너지 기업의 같은 종류 MD&A 공시가 과거 공시 대비 이례적으로 달라지면 → 공개 위험·운영 서사가 바뀌었다는 신호일 수 있고 → 이후 해당 기업의 단기 변동성 후보가 된다.

## 검토 결과

제공 명세의 강점은 cosine와 Jaccard를 분리하고, 각 ticker의 과거 공시 대비 z-score를 만들며, 현재 값을 롤링 기준에서 제외하려는 점이다. 다만 전체 코퍼스에 한 번 `fit_transform`하는 TF-IDF 단계는 미래 문서의 IDF를 과거 점수에 넣는다. 이는 look-ahead이므로 그대로는 인증된 walk-forward 팩터가 아니다.

따라서 055는 아래 조건으로만 보존한다.

- 접수시각 이전 공시만 써서 문서마다 expanding/rolling TF-IDF를 새로 fit한다.
- 10-Q↔10-Q, 10-K↔10-K만 비교한다.
- 실제 MD&A Item 2/Item 7만 파싱하고, 전문 HTML·목차·안전항구 문구 혼입을 감사한다.
- 2015–2023에서 고정한 사양을 2024+에서 한 번만 확인한다.

## 체크

| 항목 | 값 |
| --- | --- |
| 가격 출처 | Yahoo Finance 개별 에너지 주식·`XLE`; WTI `CL=F`는 비교용일 뿐 주 타깃 아님 |
| 텍스트 출처 | SEC EDGAR 공개 제출 HTML·submissions API |
| 라이선스 | 미국 정부 공개 API. SEC 자동 접근 정책·식별 User-Agent·속도 제한은 실제 수집 전에 재확인 |
| 발표 지연 | 실제 EDGAR 접수·공개시각 뒤 첫 거래일부터만 타깃 계산 |
| look-ahead | 원안에는 있음(전체 코퍼스 TF-IDF). walk-forward 재구현 전 숫자 생성 금지 |
| 본 기간 | 아직 미실행; 실행 시 IS 2015-01-01~2023-12-31만으로 사양 확정 |
| 아웃샘플을 봤나 | 아니오 |
| 성과 숫자 | 없음 |

## 제공된 CECF T+1 엔진 실행 기록

제공된 코드는 Filing Delta Drift의 MD&A 추출기가 아니라, 이미 생성된 `CECF_Composite_Score` 패널을 받는 장기/단기 포트폴리오 엔진이다. 실제 score/returns/sectors 파일은 레포에 없으므로 내장 난수 데모만 실행했다.

| 실행 | 결과 | 기록 |
| --- | --- | --- |
| 2026-09-04 synthetic verification demo | 실패 | `ValueError: left keys must be sorted` at `pd.merge_asof` |

원인은 `merge_asof`의 `on='date'`를 쓰면서 데이터가 ticker 우선으로 정렬된 것이다. `by='ticker'`가 있어도 `date`가 전역적으로 정렬돼야 하므로, 반환/신호 모두 `sort_values(['date', 'ticker'])`로 정렬해야 한다.

또한 “월간 리밸런싱”이라는 설명과 달리 엔진은 매일 목표 weight를 재계산하고 비용은 월초에만 부과한다. 이는 공짜 중간 리밸런싱을 만드는 구조다. 실제 실행 전에 월초 target 생성 → T+1 실행 → 다음 월초까지 forward-fill → 모든 체결 weight 변화에 비용 부과로 바꿔야 한다.

### 수정판 재실행

수정판의 25종목·5섹터·3개월 합성 기계 테스트는 실행됐다(64 일별 행, 1/5/10/20일 decay 행 생성). 다만 다음 두 결함을 확인했다.

1. 월말만 index인 `target_w`에서 `shift(1)`을 먼저 해 2023-01-31 신호가 다음 거래일인 2월 1일이 아니라 2월 28일에 실행됐다. 일별 index로 확장·forward-fill 후 T+1 shift해야 한다.
2. `shift(-1).rolling(h).sum()`은 h>1에서 forward h일 수익률이 아니다. `rolling(h).sum().shift(-h)` 등 명시적인 forward window로 바꿔야 한다.

따라서 수정판도 실제 CECF 검정에는 사용하지 않았다. 난수 데모의 수익률·Sharpe·IC는 보고하지 않는다.

### 확장판 stress-test 실행 기록

정렬·forward sum·비용·CV·out-of-core 보조기능을 추가한 확장판의 내장 stress-test를 실행했으나, `KeyError: 'target_weight'`로 실패했다. fixture가 Tech 2·Fin 2·Energy 1종목뿐인데 `quantile_bins=5`여서 모든 sector가 분위 계산에서 제외되고, 빈 패널에 pivot을 시도했기 때문이다.

이번 판의 명시적 `_forward_sum`은 h일 후방이 아니라 `t+1...t+h`를 합하도록 고쳐졌다. 그러나 월말-only `target_w.shift(1)`의 한 달 지연, 결과 날짜 존재만으로 same-day leakage를 선언하는 검사, timestamp 없는 `allow_exact_matches=True`, test-fold에서 파라미터를 고르는 CV, chunk 간 보유상태가 단절된 out-of-core 처리는 아직 부적격이다.

실제 CECF 수치·백테스트는 만들지 않았다.

## 다음 한 가지

실제 CECF 신호 패널·반환·시점 섹터 매핑을 확보하거나, 우선 SEC 제출목록에서 고정 에너지 바스켓의 10-Q·10-K accession, filing time, MD&A 구간 추출 가능성을 감사한 뒤 walk-forward 파이프라인을 만든다.
