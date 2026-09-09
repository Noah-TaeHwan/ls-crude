# ALT-20260907-45 — 인구가중 월별 도일 관측 영수증

- 후보: [ALT-20260907-45](../../../candidates/ALT-20260907-45.md). 형제 카드 [ALT-20260907-14](../../../candidates/ALT-20260907-14.md)는 같은 원천족이며 별도 발견으로 세지 않는다.
- 결론: **COLLECTED / NOT_RUN / KEEP 제안(E2 관측 구성)**. 2015-2023 월별 패널 108개월과 원단위 그림 2개를 확보했으며 WTI 관계·예측력은 미검증이다.
- 수집: `python3 research/notebooks/ALT-20260907-45/collect.py --collect --run 20260908T120546Z` (216 파일, 실패 0).
- 재현: `python3 research/notebooks/ALT-20260907-45/collect.py --self-test` 후 `--run 20260908T120546Z` (원본 SHA 대조·파싱·대사·그림 재생).
- 원본: `research/gathering/raw/ALT-20260907-45/20260908T120546Z/` (gitignored). [원본 안내](../../../gathering/raw/ALT-20260907-45/20260908T120546Z/README.md).

## 시점과 관측의 한계

- observed_at: 2015-01~2023-12 달력월 집계. 일별·주별로 복제하지 않는다.
- available_at: **미복원**. 파일별 Last-Modified는 관측월 다음 달 3일 전후이나 각 월의 최초 공표일·개정 이력이 아니다. 현재 빈티지 소표본이며 as-of-safe가 아니다.
- 도일은 연료 소비량이 아니다. 전국 인구가중값과 지역 한파·폭염·전력믹스를 구분한다.
- WTI 다운로드·결합·상관·lag·placebo 모두 NOT_RUN. 2024+ 파일은 수집하지 않았고 열람한 것은 접근 확인용 4개 파일뿐이다.

## 구성과 품질 (repo empirical only)

원단위 A_m = 해당 월 파일의 POPULATION WEIGHTED 구간 내 유일 UNITED STATES 행 MONTH TOTAL(제목행 HEATING/COOLING 종류 검증, 다음 가중구간 경계 밖 US행 제외). 파일 내부 `MONTHLY DATA FOR <MON> <YYYY>` 표기와 경로 월을 전수 대조했다. 월토큰은 전체 이름·표준 3자 약어만 허용한다. -999는 결측으로 기록하고 0으로 채우지 않으며, 소수·음수 월합계는 거부한다. 카드 계획 I_m = 전년동월차는 관측 구성으로만 계산했다. (파서 정정: v1 코드는 POPULATION 이후 첫 US행을 무조건 수락했으나 v2 코드에서 종류·구간경계·월토큰 검증을 강화. v1 출력값은 v2에서 전수 재대조해 동일함을 확인.)

| 항목 | 결과 |
| --- | --- |
| 수집 범위 | 2015-01~2023-12, 108개월 |
| raw 파일 / 파싱 행 | 216 / 108 |
| 경로·표기 불일치 / MONTH TOTAL 결측(-999) | 0 / 0 |
| HDD 0개월 (전부 7·8월) / CDD 0개월 | 11 / 3 |
| HDD 범위 / CDD 범위 | 0~913 (2022-01) / 0~386 (2020-07) |
| 2023-12 HDD YoY -166 (12월 HDD 전년 대비 -166, 원시값 일치) | 관측 기록이며 원인 귀속 아님 |
| 자체 vs 공급자 전년차 (본문 MON DEV FROM L YR) | 20개 비교값(14개월) 불일치, 원인 미확인·보정 없음 → [v2](v2/README.md) |

[기계 판독 대사](quality.json) · [월별 원단위 그림](degree-days-monthly.svg) · [전년동월차 그림](degree-days-yoy.svg)

## v2 정정·추가

- [v2 패널·대사](v2/README.md): 같은 원본으로 공급자 전년차 열을 파싱해 자체 차분과 대사했다. v2 CSV 계약 month,hdd,cdd,hdd_yoy,cdd_yoy,provider_hdd_yoy,provider_cdd_yoy. v1 CSV·quality·SVG 바이트는 변경하지 않았다.
- 단위 표기 정정: degree days = °F·day, 65°F 기준, CONUS(확인 표본의 주 목록에 AK·HI 없음). 정의 참고는 [CPC 설명](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/ddayexp.shtml)이나 옛 문서라 인구가중 기준연도를 2015-2023 전체에 추정 적용하지 않는다. 본 checkout에서 해당 설명 페이지는 미열람이며 참고 URL·주의는 coordinator 제공이다.
- 권리 근거: CPC 자료는 NWS 정책(https://www.weather.gov/disclaimer, coordinator 확인)상 공공영역이 기본이나 예외·출처표시·공식승인 오인금지 조항이 있어, 원본 gitignore 보관(재배포 아님)과 출처 표기를 유지한다. 권리 미확인을 gitignore로 대체하지 않는다.

출력 CSV: `research/data/processed/ALT-20260907-45/20260908T120546Z/degree-days.csv` (gitignored), SHA-256 `70ce530dd5c0529a184545a780ac26a85f99361e9a49d08f858412888ec210d8`.

시나리오: (1) 같은 HDD라도 지역 분포·연료믹스가 다르면 연료 수요는 다를 수 있다(가설적 측정 한계). (2) 월 파일이 수정되면 새 UTC raw 빈티지를 만들고 대사를 다시 한다. (3) 가중 방식 변경·관측소망 변경 시 UNITED STATES 행의 정의가 바뀌므로 파일 헤더를 먼저 확인한다. 이들은 계산된 수익률 시나리오가 아니다.

## 다음 행동

오태환(Noah): 월별 최초 공표일·개정 안내를 확인해 관측 카드의 갱신 안내 범위를 결정(담당 제안, 수락 미확인). 손성찬: 도일 월합계가 보여주려는 냉난방 수요 활동을 설명하는지 판단(제안). 데이터 담당 v2 검증(파서 강화·공급자 대사·그림 재생) 완료. coordinator 독립 리뷰는 pending. 웹 연결은 coordinator 범위이며 본인 미실행. WTI 검정은 미실행. 월간 관측 후보이며 실시간 신호가 아니다.
