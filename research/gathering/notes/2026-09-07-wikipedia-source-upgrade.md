# 2026-09-07 — Wikipedia Pageviews source upgrade

## 목적

Wikipedia pageviews는 실물 수요·선박·정유 운영을 대체하지 않는다. 대신 무료·일별·2015년 이후 재현 가능한 **공개 정보탐색** 입력으로, 기사량·Google Trends·광범위 소셜 대체재가 약한 팩터의 관심도 레그를 보강한다.

## 공통 규칙

1. 영문 Wikipedia 고정 문서 바스켓만 사용한다.
2. 각 문서의 90일 과거 z-score를 만들고 동일가중 평균과 `z≥1` 동시 급등 문서 수를 별도 열로 보관한다.
3. 최종 일별 pageviews는 D+1부터만 이용한다.
4. 문서명 변경·병합·redirect·과거 페이지 수정은 원시 응답·수집시각과 함께 gitignored raw에 저장한다.
5. Wikipedia 관심도는 사건의 원인·실제 주문량·실제 군사작전을 뜻하지 않는다. 가격 방향보다 향후 변동성 레짐만 우선 시험한다.

## 적용 우선순위

| 팩터 | Wikipedia 변형 | 우선 타깃 | 상태 |
| --- | --- | --- | --- |
| 049 | Chokepoint Attention | WTI/Brent 5일 RV | 설계 등록, 미검정 |
| 050 | Energy Security Attention | WTI/OVX 5일 RV | 기존 2문서 결과와 분리된 재검정 필요 |
| 052 | Household Panic Wiki | WTI/RBOB 20일 RV | Google Trends 대체 후보, 미검정 |

063의 음모론 바스켓 결과는 Wikipedia가 항상 좋은 알파라는 반증도 남긴다. Bitcoin OOS RV는 `+0.193`이었지만 IS `+0.016`으로 재현되지 않았고, GLD RV도 `+0.161/-0.026`으로 소멸했다.
