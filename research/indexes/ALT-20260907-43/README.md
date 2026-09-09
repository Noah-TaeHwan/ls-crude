# ALT-20260907-43 — STB 석유 철도 적재 관측

[후보 카드](../../candidates/ALT-20260907-43.md) · [이번 수집 노트](../../gathering/notes/2026-09-09-stb-petroleum-rail-access.md). **E2 / KEEP / 검정 NOT_RUN**. KEEP은 효과 인증이 아니다.

표시 정본은 STB EP 724다. AAR 주간 숫자는 라이선스 때문에 사이트에 올리지 않는다.

## 구성 명세

- **활동/WTI 가설**: 철도 석유 수송 활동의 변화가 원유 물류와 연결될 수 있다는 가설
- **이번 관측**: 미국 4사(BNSF, UP, CSX, NS) Petroleum Products originated 주간 차종. 산업 합계와 I_m=100×ln(A_m/A_(m-12))는 NOT_CONSTRUCTED
- **단위**: carloads originated. 원유 배럴이 아님
- **지역**: 표시는 미국 4사. CN·CP/KCS/CPKC는 보고 주체 변경 때문에 합치지 않음
- **집계**: 주간 헤더 열. 파이프라인·수상·EIA 원유-철도 배럴과 혼합 금지
- **결측**: 공백·하이픈은 결측. 0으로 채우지 않음
- **관측/공개**: 헤더 수요일. Last-Modified는 파일 수정 시각. 최초 공표일 미복원
- **빈티지**: 현재값. as-of-safe 아님
- **기간**: 헤더 2017-03-29~2026-09-02. 2024+ 140주는 SEEN
- **WTI**: 계획만. Yahoo CL=F. 이번 run NOT_RUN
- **검정/강건성**: NOT_RUN

## 접근 증거

| UTC | 방법 / HTTP | URL | 로컬 원본 포인터 |
| --- | --- | --- | --- |
| 2026-09-07T07:08:47+00:00 | GET / 200, 314032 bytes | [AAR 랜딩](https://www.aar.org/data-center/rail-traffic-data/) | `research/gathering/raw/ALT-20260907-43/20260907T070846Z/aar_rail.body` · [당시 영수증](access-receipt.json)의 candidate_id는 ALT-20260907-22로 남아 있음(덮어쓰지 않음) |
| 2026-09-09T00:34:30+00:00 | GET / 200, 7658204 bytes | [EP 724 통합표](https://www.stb.gov/wp-content/uploads/files/rsir/All%20Class%201%20Railroads/EP724%20Consolidated%20Data%20through%202026-09-02.xlsx) | `research/gathering/raw/ALT-20260907-43/20260909T003038Z/ep724-consolidated.xlsx` |

[2026-09-09 실제 수집·그림·대사·재현](20260909T003038Z/README.md).

## 판단과 재개

주간 파일 경로·유종 정의는 해소. 최초 공표일·개정 패널이 없으면 WTI 검정은 부적격. 손성찬이 공표일을 복원 — 손성찬, 2026-09-15 (담당 제안, 수락 미확인).
