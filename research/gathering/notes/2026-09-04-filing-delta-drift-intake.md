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

## 다음 한 가지

SEC 제출목록에서 고정 에너지 바스켓의 10-Q·10-K accession, filing time, MD&A 구간 추출 가능성을 감사한 뒤 walk-forward 파이프라인을 만든다.

