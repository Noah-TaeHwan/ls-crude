# 052 Search Desperation Index — 수집·검정 보류

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-04 |
| 상태 | HOLD — 원본 Google Trends CSV 없음, 숫자 미생성 |
| 관련 팩터 | 052 Search Desperation Index |
| 관련 출처 | Google Trends 공개 UI, Yahoo Finance |

## 한 줄 가설

소비자 에너지·생활비 절약 검색의 동시 급등은 원유 가격 방향이 아니라 이후 WTI·RBOB 변동성 확대의 보조 신호일 수 있다.

## 확인한 것

- 제공된 V3 설계는 합성 fallback을 제거했고, 7일 공개 지연·IS 전용 PCA/표준화·주간 신호 정렬을 도입했다.
- 저장소에는 다섯 키워드의 통합 장기 Google Trends CSV가 없었다. 임의 데이터·PyTrends 재수집·랜덤 fallback으로 결과를 만들지 않았다.
- Google Trends 공개 UI는 현재 상대 관심도를 제공하지만, 과거 당시의 값·표본·재추출 오차를 복원하는 안정적 공식 연구 API와 재배포 조건은 이 조사에서 확인하지 못했다.

## V3에서 고정할 수정점

- 20거래일 미래 변동성은 매주 평가하면 미래 창이 겹친다. 4주 간격 비중첩 표본 또는 HAC/블록 부트스트랩을 사용한다.
- 표준편차가 아니라 `sqrt(sum(next log-return²))`를 실현변동성 정의로 쓴다.
- IS 임계값 선택 타깃은 WTI 20일 변동성 하나로 고정하고, 5일·RBOB 결과는 확인용으로 분리한다. 각 칸에 n·고스트레스 발생 횟수·p값을 기록한다.
- 2014년부터의 CSV가 있어야 2015년 초 52주 기준창이 가능하다.

## 다음 한 가지

사람이 Google Trends UI에서 내려받은 US 주간 통합 CSV(다섯 키워드, 2014년 이후, 조회일 메모 포함)를 제공하면, 원본은 gitignored raw에 보관하고 사양 동결 뒤 IS/OOS를 한 번 실행한다.
