# DMR ValueReceivedDate: 규제기관 접수일 vs 최초 외부 공개일

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-12 / Evidence Collector (Grok Build), 감독자 원문 대조·독립 검수 완료 |
| 후보 ID / 카드 경로 | 미등록 (091-DMR South STP `OK0026701`/001, MGD, DAILY MX; 카드 상태 변경 없음) |
| 상태 | 문서 검토 완료 — 기존 입력은 회고 전용 유지. PIT 승인 아님 |
| 연결 출처 | [REGISTRY 2026-09-12 ECHO DMR](../sources/REGISTRY.md#2026-09-12-echo-dmr-publication-vintage) |

이번은 공식 문서 조회만. 재정렬·재학습·DMR 관측 다운로드·OOS(2024+) 열람·기관 문의 발송 없음. 조회시각(2026-09-12T13:13Z~13:17Z)은 과거 공개일 증거가 아니다.

## 활동과 WTI 가설

South STP 신고 방류유량은 시설 가동 흔적의 대리 가설이다. 강수·유입수·신고 관행이 지배하므로 원유 활동 직접 지표가 아니다. 이번 질문은 그 가설의 검정이 아니라, 기존 `available_at=ValueReceivedDate`가 역사적 PIT(당시 외부에 보였던 값)를 입증하는가다.

## 시점 증거표 (직접확인 / 추론 / 미확인)

| 시점 | 공식 정의·근거 | 판정 |
| --- | --- | --- |
| 관측(모니터링 종료)일 | `MONITORING_PERIOD_END_DATE` = DMR 값이 덮는 기간의 종료일. [DMR 사전](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary) | 직접확인. 이용가능일이 아님 |
| 접수/제출일 | `VALUE_RECEIVED_DATE` / `value_received_date` = "The date the DMR value was received by the regulatory authority." 같은 문장: [DMR 사전](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary), [Effluent Charts Help Table 2](https://echo.epa.gov/help/reports/effluent-charts-help), [ICIS-NPDES 사전](https://echo.epa.gov/tools/data-downloads/icis-npdes-download-summary). `DAYS_LATE` = Value Received Date − DMR Due Date | **직접확인: (a) 규제기관 접수일.** 제출 시각과 접수 시각의 세분은 미확인 |
| 최초 외부 공개일 | 세 사전 어디에도 "first public" / ECHO 게시일 필드 없음. Effluent Charts 컬럼명은 `Date Received` | **직접확인: (b)가 아님.** 행별 최초공개일 필드는 이 범위에서 **미확인** |
| 포털 적재일 | ICIS-NPDES는 주간 추출. 조회 당시 표: Extracted 9/5/2026, Next 9/12/2026. "snapshots of the original source databases… as they existed when the data were extracted." 적재 지연 "anywhere from a week up to three months". [About the Data](https://echo.epa.gov/resources/echo-data/about-the-data). DMR FY2011+ zip은 주간, FY2010 이전은 월간 ([Data Downloads](https://echo.epa.gov/tools/data-downloads)) | 직접확인: **포털 갱신 주기 ≠ 행별 최초공개/빈티지** |
| 수정/대체일 | ICIS는 요구·실적 데이터가 "entered or edited"되면 위반을 재생성 ([ICIS-NPDES 사전](https://echo.epa.gov/tools/data-downloads/icis-npdes-download-summary)). NODI는 "new or updated DMR submissions" ([DMR 사전](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary)). `VERSION_NMBR`는 **허가 버전**(현재=0), DMR 값 개정 번호가 아님. 하수도 overflow는 "all versions" 이력 zip이 있으나 DMR에는 동등 표기가 없음 ([Data Downloads](https://echo.epa.gov/tools/data-downloads)). NC는 단위 업로드 시 ICIS 기록이 "overwritten and lost"될 수 있음 ([Known Data Problems](https://echo.epa.gov/resources/echo-data/known-data-problems), NC 행). Oklahoma CWA 경보 **이 페이지에 없음** | 수정 가능은 직접확인. **수정 전 값 보존·행별 수정시각은 미확인.** OK0026701 이슈 부재를 무이슈로 단정하지 않음 |
| 조회일 | 2026-09-12 UTC, Ego TaskSpace 2 / p1 | 현재 문서 조회. 2015–2023 당시 화면이 아님 |

## 확인한 것 / 확인하지 못한 것

- 원문 URL·UTC·접근: Ego Browser 단일 TaskSpace `spaceId=2`, page `p1`. 지정 URL `…/water-download-summary`는 404(1회 재시도 동일). 관측 ZIP·Download All Data 미클릭. 검색 결과 페이지 0. 공식 문서 6.
- 라이선스: ECHO "made available to the public… informational purposes only. No warranty…" ([About the Data](https://echo.epa.gov/resources/echo-data/about-the-data)). 재배포 세부는 미확인.
- raw: [091-dmr-availability/20260912T131104Z/README.md](../raw/091-dmr-availability/20260912T131104Z/README.md) — snapshot/extract/meta·hash. 스냅샷은 gitignored.
- 기존 입력 구현(이번 미재실행): `available_at=ValueReceivedDate`, validity 62/31/0. 접수일 규칙은 구현됨. 접수일≠공개일.
- 검정·OOS: 미실행. 2024+ 관측 미열람.

짧은 인용 (원문, 2026-09-12 UTC):

1. "VALUE_RECEIVED_DATE - The date the DMR value was received by the regulatory authority." — [icis-npdes-dmr-summary](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary) · [02 snapshot](../raw/091-dmr-availability/20260912T131104Z/02-icis-npdes-dmr-summary.snapshot.txt)
2. "value_received_date / Date Received / The date the DMR value was received by the regulatory authority." — [effluent-charts-help](https://echo.epa.gov/help/reports/effluent-charts-help) · [03 snapshot](../raw/091-dmr-availability/20260912T131104Z/03-effluent-charts-help.snapshot.txt)
3. "ECHO data represent “snapshots” … a lag time exists (anywhere from a week up to three months) between when data are entered into the source database and when they appear in ECHO." — [about-the-data](https://echo.epa.gov/resources/echo-data/about-the-data) · [04 snapshot](../raw/091-dmr-availability/20260912T131104Z/04-about-the-data.snapshot.txt)

## 판정과 다음 행동

- **기존 DMR 입력은 회고 전용 유지.** ValueReceivedDate는 규제기관 접수일이다. 주간 추출·1주~3개월 적재 지연은 행별 최초공개일을 대체하지 않는다. 미확인 지연을 며칠 더해 PIT를 승인하지 않는다.
- PIT를 검토하려면 추가로 필요한 원자료(이번 미확인, 발송하지 않음): (1) 행별 최초 외부공개 시각 또는 2015–2023 ECHO/ICIS 추출 빈티지 아카이브, (2) 수정 전 값의 보존 여부(DMR "all versions" 동등물), (3) 규제기관 접수 → ECHO 공개 지연의 시설·기간별 기록. 질문 초안만: 접수일과 별도 first-public 필드가 있는가; 주간 DMR zip이 불변 빈티지로 보관되는가; effluent REST는 현재 스냅샷만인가.
- KEEP/KILL 후보 없음. SPP·공항 추가조사 없음. 다른 팀원 검토는 부모 대조.

후보는 원장에 올리지 않았다. [INTAKE](../../INTAKE.md)를 따른다.
