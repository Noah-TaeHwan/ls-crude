# Loop handoff: 쿠싱 시계열 + 자료 탐색 원문

## State
- state: in_progress
- previous_state: in_progress
- approved_by: 노아
- approved_at: 2026-09-09 15:50 UTC
- mode: orchestrated because 사용자가 opencode 워커·orca orchestration·중간 질문 금지를 유지했고 계약을 다시 잡아 계속하라고 했다

## Outcome and non-goals
- Outcome: (1) 쿠싱 관련 무료 공개 자료를 모아 **날짜가 있는 시계열 차트**로 보드에 붙인다. (2) 홈 자료 탐색 버튼(HLX, 수박, 제주, 미국 도일, LA항, 미국 철도, 갤버스턴, 싱가포르, 쿠싱)을 누르면 성찬 가설의 고정 시계열·깃허브 연구 기록이 보이게 한다.
- Non-goals: 0–100 바쁨 점수, 합성 지수, 창작 상관, 호텔세·나이트라이트·Maps mock·AirNav 스크랩·Genscape/Kpler, 일별 트럭 보간, docs/experiments 승격, main 직접 커밋, 시리즈 개수로 루프 종료.

## Authority and action boundary
- Sources and precedence: `research/programs/cushing-busy/PROGRAM.md`, then 091 원장, then 보드 JSON/리더, then 자료 탐색 고정 런(HLX 095, ALT-36 수박 등).
- Allowed: 피처 브랜치에서 리더·시험·보드·홈 샘플 UI, 무료 공개 시계열 수집, opencode 워커, ego-browser 검증, 단위 시험과 typecheck.
- Approval required: 점수/WTI를 켜는 것, PROGRAM 밖 자료, 외부 게시, 커밋·푸시·PR, 범위가 트레이딩 신호로 바뀌는 것.
- Conflict policy: PROGRAM이 보드 JSON보다 앞선다. 날짜·정의를 지어 내지 않는다. 접수 원장 파싱 실패로 시계열을 숨기지 않는다.
- Decision split: 후보 순서, 차트 축, 카피, fail-closed 체크섬, 워커 배치는 루프가 결정한다. 사용자에게 중간 질문을 하지 않는다.

## Execution tier
- coordinator: deep / medium
- workers: standard / medium (opencode via `orca orchestration worker-start --agent opencode`)
- grounds: 사용자가 opencode 워커와 orca orchestration을 유지했다. 수집·리더·시험·보드 연결은 워커. 코디네이터는 스펙·검수·ack/release·다음 파동만 한다.

## Assumptions
- 「시계열」은 한 시점 표가 아니라 날짜 순 관측을 차트로 보여주는 것이다. QCEW 2025-Q1 한 표는 문맥이고, 분기 이력이 시계열이다.
- 루프 상한은 없다. 안전한 다음 시계열이 있으면 붙인다.
- 사용자는 2026-09-09에 이 재작성 계약을 실행 지시로 승인했다 (“다시 잡고 계속 반복해”).

## Goal
쿠싱 보드에 날짜 있는 문맥 시계열을 계속 붙이고, 홈 샘플 버튼이 성찬 깃허브 연구 시계열을 보여 주며, INSUFFICIENT 판정을 지킨다.

## Current state
브랜치 `ux/cushing-eia-monthly-context`. 쿠싱 차트 48개(`cushing-mesonet-wind-plot` 포함). 판정 INSUFFICIENT. OILT PAVG 기압 동결 검수됨. 07161450 일평균 수위 fail-closed. ATOT 일사량 수집 중. HUD USPS 74023 fail-closed.

## Done
- [x] 이전 계약의 EIA 월간 재고 차트
- [x] QCEW 2025-Q1 카운티 표 (문맥)
- [x] 091-Z 날짜 큐 1건 (문맥)
- [x] 홈 샘플 버튼이 접수 원장과 독립적으로 고정 시계열을 그림
- [x] Payne QCEW 분기 고용 시계열 2015-Q1..2026-Q1 (45분기)
- [x] Cushing High School 연간 재적 2019-20..2024-25 (2023-24 결측, checksum 2532)
- [x] KUSH 월간 운영-관심 2008-02..2026-06 (221개월, sum 101, 0은 관측)
- [x] 091-P·KUSH 보드 차트 (`cushing-enrollment-plot`, `cushing-kush-plot`)
- [x] KCUH/CUH 일별 기상 2015-01-01..2026-09-08 (4269일, maxTempSum 307313)
- [x] KCUH 일별 기온 차트 (`cushing-kcuh-plot`)
- [x] Cushing city Census 인구 2010..2024 (checksum 119988, 2024=8444) + 차트
- [x] OCC Payne 월간 생산 fail-closed (날짜 행 0)
- [x] DEQ layer8 VOC fail-closed (2024 한 점)
- [x] DEQ 연층 VOC 2020–2024 (checksum 6470.934, 2024=1206.389) + 차트
- [x] Cushing city TRI on-site lb 1989–2003+2024 (checksum 924142; 2004–2023 결측) + 차트
- [x] PHMSA Cushing HL 사고 141건 2010-01-11..2025-12-08 + 연간 건수 차트
- [x] Cushing city 연간 주택 호수 fail-closed (PEP place HU 파일 없음, ACS 1년 키 필요, 5년 접합 금지)
- [x] Payne County 연간 주택 호수 2010..2024 (checksum 539269, 2024=37437) + 차트
- [x] EIA Cushing 탱크 작업 저장 용량 23점 2011-03-31..2024-03-01 (sum 1642412, 2024-03=78410) + 차트
- [x] Payne County 월간 LAUS 실업률 139개월 2015-01..2026-07 (tenths 4731, 2025-10 null, 2026-07=4.5 P) + 차트
- [x] Cushing GHCN 월 강수 2017-05..2021-11 (55개월, 47 공개, tenths 44838) + 차트
- [x] Cushing city OTC 월간 판매세 분배 4점 2025-08..2026-09 (cents 229231800, last 577814.84) + 차트
- [x] Jet-A 월간 갤런 fail-closed (091-JETAZ, 2026 reports dropped airport fuel, no extra months)
- [x] KCUH 월간 ops fail-closed (091-OPSZ, CUH absent from OPSNET)
- [x] Payne LAUS 월간 취업자수 139개월 2015-01..2026-07 (sum 5154289, 2026-07=38543 P) + 차트
- [x] Payne LAUS 월간 노동력 139개월 2015-01..2026-07 (sum 5336427, 2026-07=40352 P) + 차트
- [x] FRA Form 57 쿠싱 건널목 사고 3건 1976/1980/1982 (killed 0 injured 1) + 연간 건수 차트
- [x] FMCSA Cushing 시 신고 상용차 사고 129건 1993-01-27..2025-10-06 (fatal 5, inj 99; 결측연 1994-96/1998/2004) + 차트 28년
- [x] OSHA IMIS ZIP 74023 점검 162건 1973-04-25..2026-08-14 (viol 86 disclosed sum 354, 11 missing years) + 차트 43년
- [x] Payne County NOAA Storm Events 112건 2024-01-13..2026-05-08 (inj 10, deaths 0, mag 44; Cushing 입지 3건) + 월간 차트 22개월
- [x] Cushing city EPA ECHO CAA 시설 44곳, last FCE 29점 1998-11-19..2026-05-05 (FCE sum 33, eval sum 167) + 차트 11년
- [x] 시 수도/전력 월간 물량 fail-closed (091-UTILZ, 날짜 있는 행 0)
- [x] USGS 07161450 Cimarron near Ripley 일평균 유량 14224일 1987-10-01..2026-09-09 (thousandths 24894472300) + 차트
- [x] FEMA Payne 재난선포 39건 1974-06-10..2025-05-21 (DR 24 / EM 8 / FM 7) + 차트 25년
- [x] Payne Stillwater AQS PM2.5 연평균 5년 1999..2003 (sum 46.525954, 모니터 40-119-0614, 쿠싱 시 아님) + 차트
- [x] Payne County PEP 인구변동 2010..2024 (15년, births 11379, deaths 8193, net 3807, 2024 pop 84199, FIPS 40119) + 차트 (`cushing-pep-plot`)
- [x] Payne County BEA CAINC1 개인소득 1969..2024 (56년, thousands of dollars, checksum 85834209, 2024=4121797, FIPS 40119) + 차트 (`cushing-bea-income-plot`)
- [x] HUD USPS ZIP 74023 공실 fail-closed (키 없는 ZIP 시계열 없음, dated rows 0)
- [x] USGS Payne 우물 360339096450201 일평균 지하수위 481일 2017-06-29..2018-10-22 (hundredths 347450, 8.7 km, 유량 아님) + 차트 (`cushing-usgs-gw-plot`)
- [x] Payne County NFIP 청구 100건 1980-06-19..2021-06-27 (countyCode 40119, paid-building cents 107090889, 21 paid null) + 차트 (`cushing-nfip-plot`, 20 sparse years)
- [x] Cushing city SDWIS PWS OK2006061 위반 23건 2017-01-01..2024-10-17 (enforcement sum 4, 주 전체 아님) + 차트 (`cushing-sdwis-plot`, 2017=21 / 2024=2)
- [x] Cushing city RCRA 취급자 51곳, 최근 점검 17점 1985-08-28..2021-07-15 (전부 city CUSHING) + 차트 (`cushing-rcra-plot`, 11 sparse years, 34 null off chart)
- [x] Cushing city ECHO CWA/NPDES 18허가, 최근 점검 4점 2025-04-10..2026-01-06 (count sum 19, CRUSHING 제외) + 차트 (`cushing-echo-cwa-plot`, 2025=3 / 2026=1)
- [x] Cushing city GHGRP CO2e Battle Ridge Plant 2016..2019 (4년, checksum 165176.638 t, 2020–2023 결측) + 차트 (`cushing-ghg-plot`)
- [x] ZIP 74023 IRS SOI 연간 2016..2022 (7년, returns 29330, AGI thousands 1634370, 2022 N1=4190) + 차트 (`cushing-irs-soi-plot`)
- [x] Payne County NFIP 증권 4039건 2009-01..2026-10 (214개월, censusGeoid 40119, 40109=0) + 차트 (`cushing-nfip-policies-plot`)
- [x] Payne County NBI 교량 384곳 점검 2022-03..2024-01 (2022=27 / 2023=283 / 2024=74, county 119, Cushing place 0) + 차트 (`cushing-nbi-plot`)
- [x] Mesonet OILT Oilton 일별 기상 2015-01-01..2026-09-08 (4269일, 24.3 km, tmaxSum100 30206129, 110 temp null) + 일최고기온 차트 (`cushing-mesonet-plot`) + 일강수 차트 (`cushing-mesonet-rain-plot`, 4142일 공개, 127 결측, 건조 0.00 유지)
- [x] Cushing city ECHO DMR 유량 1722행 2015-01-31..2026-07-31 (6허가, 880 수치/842 NODI null, checksum 7487398621) + 월간 건수 차트 (`cushing-echo-dmr-plot`, 139개월)
- [x] Payne County LODES 연간 직장 일자리 2002..2023 (22년, FIPS 40119, sum 713340, 2023=35589) + 차트 (`cushing-lodes-plot`)
- [x] Payne County USDM 주간 가뭄 2014-12-30..2026-09-01 (610주, FIPS 40119, d0Sum100 3342984) + 차트 (`cushing-drought-plot`)
- [x] Mesonet OILT 10cm 잔디 밑 지온 2015-01-01..2026-09-08 (4081일 공개, savgSum100 25436779, 188 결측) + 차트 (`cushing-mesonet-soil-plot`)
- [x] Cushing/Payne WQP Sand1 pH 시료 2005-09-01..2021-09-17 (366행/283일, hundredths 297220, 16.71 km, 유량 아님) + 차트 (`cushing-wqp-plot`)
- [x] Mesonet OILT 일평균 상대습도 HAVG 2015-01-01..2026-09-08 (4155일 공개, havgSum100 29276766, 114 결측) + 차트 (`cushing-mesonet-humidity-plot`)
- [x] Mesonet OILT 일평균 풍속 WSPD 2015-01-01..2026-09-08 (3997일 공개, wspdSum100 2573065, 272 결측) + 차트 (`cushing-mesonet-wind-plot`)
- [x] Mesonet OILT 일평균 정지기압 PAVG 2015-01-01..2026-09-08 (4165일 공개, pavgSum100 12127694, 104 결측; UI 대기)
- [x] USGS 07161450 일평균 수위 fail-closed (DV 00065 없음, IV 한 점은 일평균이 아님)

## Blocked
- reason: none
- owner: none
- decision_needed: none

## Changed files
- `research/programs/cushing-busy/loop-contract.md`
- `research/programs/cushing-busy/loop-log.jsonl`
- `research/programs/cushing-busy/loop-lessons.md`
- `app/app/components/research-sample.tsx`
- `app/app/lib/research-intake.server.ts`
- `app/vite.config.ts`
- `app/app/lib/cushing-qcew-quarterly.ts`
- `app/tests/cushing-qcew-quarterly.test.mjs`
- `research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/`

## Acceptance evidence
- Structural: 샘플 버튼 SSR/클라이언트에 해당 사례 차트 id가 있고 `해당 후보 정본을 확인하지 못했습니다`로 시계열을 대체하지 않음; 새 쿠싱 시계열 리더는 결측을 0으로 채우지 않음.
- Semantic: 쿠싱 카피가 바쁨/점수가 아니고 `verdict=INSUFFICIENT`; 샘플은 성찬 가설·고정 런을 가리킴; WTI 관계를 새로 증명하지 않음.
- Operational: ego-browser로 각 샘플 버튼을 눌러 차트·깃허브 링크 확인; 배포를 증명하지 않음.
- Success: 위 세 면이 샘플 전부에 대해 참이고, 쿠싱에 날짜 순 차트가 추가로 붙음. 시리즈 개수는 성공 조건이 아님.

## Verification
- command: `loopuccino check research/programs/cushing-busy/loop-contract.md --contract`
- result: passed

## Next action
OILT PAVG 기압 차트와 ATOT 일사량 동결을 검수한다. TUI 주입 워커의 worker_done은 preamble에 dispatch-capability가 없으면 거절되므로 코디네이터가 파일·시험·curl로 검수한 뒤 정산한다. 결측 0 채움 금지.

## Resume command
`loopuccino status research/programs/cushing-busy/loop-contract.md`

## Bounds, stopping, and handoff
- Bounds: 없음. 다음 안전한 시계열이 있으면 계속한다.
- No progress: 두 라운드 연속으로 새 시계열 차트 또는 샘플 버튼 증거가 없다.
- Stop without success: 날짜를 지어 내야 하거나 승인이 필요한 범위 변경, 또는 사용자가 커밋/중지를 요청.
- Escalation: 노아에게 정확한 질문과 후보 ID를 남기고 BLOCKED. 중간 운영 질문은 하지 않는다.
- Handoff: 이 파일과 `loop-log.jsonl`, `loop-lessons.md`, PROGRAM.md, 보드 JSON.
