# 실행 전 계획 — Locks27 주별 빈도 robustness

2026-09-08, 기존 ALT-20260907-01 월별 결과를 알고 작성한 후속 탐색 계획이다. 독립 발견/확증 검정이 아니다. 이 파일을 작성한 다음 실행한다.

- 입력: 기존 허용 경로의 2015-2023 USDA Locks27 원문 및 Yahoo CL=F cache, manifest SHA256 일치 필수. 새 다운로드/원문 공개 없음. 로컬 파일 없으면 BLOCKED. 출처: https://www.ams.usda.gov/services/transportation-analysis/gtr-datasets 및 manifest rights_url.
- 계보: 불변 로컬 원문 → 주간 완전성 집계 → 관측주 기준 지수/관계표. 원문은 공개하지 않고 hash와 경로만 공유한다.
- 주기: 토요일 종료 주. 4곡물 품목 전부 수치가 있는 주만 합계 A_t 사용, 결측은 0 대체 금지. 2015-01-03..2023-12-30 전체 토요일로 재색인.
- 지수: I_t=100 ln(A_t/A_(t-52)); 분자/분모 양수인 경우만. 전년 같은 날짜가 아니라 364일 전이다. 52/53주 달력 차이 한계.
- WTI: 해당 주 실제 마지막 CL=F 종가. r_t=P_t/P_(t-1)-1. 이전 실제 주말 종가일부터 이번 실제 종가일까지 관측된 일별 가격 중 비양수/결측 있으면 제외. 거래소 캘린더 완전성 미검증.
- 주 검정 corr(I_t,r_(t+1)); 보조 k=-1,0,+2. +k는 관측기준 정렬이며 최초 공개시점 선행 아님.
- Placebo: I_(t-52)와 r_(t+1), split 내 signal origin부터 target까지 모두 포함. 실제 계절 autocorrelation도 남으므로 엄밀한 귀무분포 아님.
- robustness: 신호를 1주 더 지연; 2020에 걸리는 신호 분자·52주 분모·타깃 가격창 제외.
- 내부 split: 2015-2020 / 2021-2023. 주 검정은 원신호 관측주와 타깃 시작/끝이 split 내, YoY 역사분모는 과거 입력으로 허용(범위 표기). Placebo origin도 split 밖이면 제외.
- 모든 7변형 × 2split을 저장, n/일자/제외수/분모/합계/hash를 남긴다. n<24이면 부족 표시. OOS 2024+ 금지. p-value/성과/알파 없음.
- 최초 빈티지·available_at 없음: as-of-safe NOT_PROVEN. 관측기준 기술통계만.
