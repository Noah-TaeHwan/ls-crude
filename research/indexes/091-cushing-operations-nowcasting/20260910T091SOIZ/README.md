# 091-SOIZ — ZIP 74023 연간 IRS SOI 개인소득세, 2016..2022 (2026-09-10)

**이것은 무엇인가:** 키 없는 IRS SOI Individual Income Tax ZIP Code Data
연간 파일(`YYzpallagi.csv`)에서 뽑은 **ZIP 74023(Cushing) 연간 시계열**이다.
과세연도마다 6개 공개 `agi_stub` 행(STATE `OK`, zipcode `74023`)의
신고 건수(`N1`, number of returns)와 조정 총소득(`A00100`, AGI)을 합산했다.
7개 연도 모두 결측·억제 셀 없이 공개됐다. 현장 바쁨을 묻지 않으며
WTI·EIA 재고·다른 CFAM 트랙과 검정하지 않는다.

**이것이 아닌 것:** 카운티 BEA 소득(CAINC1 40119, 별도 091-INCZ),
Cushing 시 인구·주택·고용, 카운티 SOI 대용, 주간 바쁨 시계열,
0–100 점수, WTI 오버레이. ZIP 합산이므로 카운티 합계와 비교하지 않는다.

| 필드 | 값 |
| --- | --- |
| 수집 | 2026-09-10T00:00:00Z |
| 출처 | `https://www.irs.gov/pub/irs-soi/YYzpallagi.csv` (2016..2022, `STATE=OK`, `zipcode=74023`, `agi_stub` 1..6 전부 공개) |
| 원시 | `research/gathering/raw/091-irs-soi-74023/` (gitignore된 연도별 CSV + `22zpdoc.docx` 정의서; sha256은 `receipt.json`) |
| 범위 | 2016..2022 — 7행, 결측 연도 없음, 억제 셀 0 |
| 단위 | 신고 건수는 filed count 그대로, AGI는 파일 표기 그대로 **수천 달러** (절대 변환 금지) |
| 합계 | 신고 건수 2016=4200 … 2022=4190 (7년 합 29330), AGI 2016=221534 … 2022=250763 (7년 합 1634370, `receipt.json` 참고) |
| 교차 확인 | 2022년 stub 신고 건수는 Oklahoma 주 엑셀(`22zp37ok.xlsx`, ZIP 합계 4190)과 일치 |

리더는 `app/app/lib/cushing-irs-soi.ts`이며, 0으로 채운 연도,
연도 뒤바뀜, 직전값 복사, Cushing 시/바쁨 재라벨, BEA CAINC1 복사,
카운티 SOI 대용, 달러 단위 뒤바뀜에는 fail-closed한다.
