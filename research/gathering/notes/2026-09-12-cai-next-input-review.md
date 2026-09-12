# 다음 입력 검토: DMR 공개시점 근거 확인을 첫 후보로

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-12 / A 워커 (Trend Researcher) |
| 후보 ID / 카드 경로 | 미등록 (33행 정리표 검토, 카드 상태 변경 없음) |
| 상태 | 검토 중 (수집·채택 승인 아님) |
| 연결 출처 | ../sources/REGISTRY.md «FHWA TMAS 연속교통»·«Yahoo Finance CL=F»; ZIP v2 선별표(zipfile 열람, 로컬 복사 없음) |

## 활동과 WTI 가설

- **DMR South STP:** 시 하수처리장 신고 방류유량(OK0026701/001/MGD/DAILY MX)이 시설 가동 흔적의 대리 가설. 강수·유입수·신고 관행이 지배하므로 '쿠싱 원유 활동 직접 지표'가 아니다.
- **SPP:** RTBM LMP·혼잡(MCC)은 권역 전력 스트레스 간접 후보. 파이프라인 펌핑량이 아니다. 가격혼잡≠펌핑량.
- **CAAI/공항:** Cushing Municipal 월간보고의 Jet-A/AvGas·ramp stay·Survival Flight는 독립 물리활동 관측 후보. 날씨 관측을 운항량으로 쓰지 않는다.
- 피자 비유 한계: 셋 다 '바쁨'의 간접 흔적이며, WTI 연결은 실증 전까지 가설. 미실행 가설의 반증조건 예시: DMR 가용시점 정렬 뒤에도 시장정보 대비 추가 정보가 없으면 해당 대리 가설을 유지하지 않는다(전체 연구의 성패 판정이 아님).

## 33행 집계 대조 (ZIP JSON 실측)

`CAI_candidate_funnel.json`의 `stage2_and_3_candidate_units` 33행을 `collection_stage`·`retro_training`으로 직접 집계했다. 33은 독립 원천수가 아니다(상위 106개는 자료 경로 수, 재작성하지 않음).

- **실제 회고 입력(실험 사용) 2:** TMAS_AVC040, 091-DMR/OK0026701-001.
- **통제·문맥 별도(성분 아님) 8:** 091-EIA/038, Weather/091-Q, Library, Community parking, 091-KUSH/Z, 091-LAUE/QCEW, 091-Y/YD/X, 091-USGS/GW.
- **미사용 23:** 경로·엔진만 11(SPP/091-GC, CEPI, HSCI, CHAI, 091-D/E/E2, 091-LM/092, 091-N, 091-RAIL, 091-WASTE) · 표본만·확대 필요 5(CAAI/091-O, 091-A, 091-F/STAX, 091-M, 091-G) · 전향 이력 필요 6(CHHMI, CCEDI, CERSI, 091-U, 091-V/V2, 091-S) · 기각·보류 유지 1(091-B). 합 2+8+23=33.
- 기존 원장 상태를 임의 승격하지 않았다. 091-B KILL, CONTROL_ONLY, PARK/E1·E0을 유지한다.

## 공정 비교 (교통+DMR 외 포함)

| 후보 | 측정 대상·지역 관련성 | 기존 실측·역사 범위 | 공개·개정 시점 | 접근 근거 | 다음 최소 행동 |
| --- | --- | --- | --- | --- | --- |
| 091-DMR South STP | South STP 신고 유량, 쿠싱 시설 직접. 원유 전용 아님 | 116행 중 개발범위 85개(≤2023), 116개월 연속 수치 1계열뿐. 접수일 규칙은 구현 완료(아래 근거) | 접수일 확인, 외부공개일·개정 미확인 | ECHO effluent REST keyless, raw 18 JSON 보관 | ValueReceivedDate의 실제 외부공개시점·개정이력 근거 확인, 회고 전용/PIT 적격 구분 (다음 배치 추천, 이번 미실행) |
| SPP_LOCAL/091-GC | 권역 전력 혼잡, 지역 의미 미확정 | 표본 0 (portal 9/11 접속 실패 기록, 현재 미재확인) | 미확인 | www.spp.org 약관 확인됨(9/11 기록), portal 미확인 | portal 재접속+비상업 내부사용 범위+노드 지역 의미+최소 1표본 |
| CAAI/091-O | Cushing Municipal 월간보고 4건 실측 확보 | Jet-A/AvGas·ramp·응급비행, 60개월·지표별 기간 미확보 | 보고일 확인, metric-period 일부 추론 금지 | 시 공개 월간보고 경로 기록 | 동일정의 60개월+보고일·metric-period 복원 가능성 확인 |
| TMAS_AVC040 (참조) | Payne SH-33/18 주변 차량수, 원유트럭 아님 | 2015–2018+2020-03+2023(+2019 보강 완료) | 공개일 미확인 | FHWA TMAS, REGISTRY 등록 | 재수집 금지, 기존 입력 정의 검토만 |

- **SPP 주의:** 현재 노드 ID·과거 유효기간·이름 변경·통제 노드·조회 가능 기간 모두 미확인. 이름 'CUSH'만으로 매핑 확정 금지. 168시간+독립활동 대조 조건을 유지한다.
- **수집 가능 vs 예측 적격 분리:** DMR은 입력·접수일 규칙 설정까지 완료이나 접수일≠공개일이므로, 규칙 설정만으로 공개일을 입증한 것이 아니다. 예측 적격(PIT)은 외부공개시점·개정이력 근거 확인 후 구분하며, 근거 부재면 회고 전용 유지로 종료한다. 월별 DAILY MX 해석·시설대표성은 별도 검토 질문이며 이 조사가 입증하지 않는다. SPP·공항은 수집 자체가 먼저이며 적격 판단은 그 다음이다.
- **접수일 규칙 구현 근거(기 완료):** `research/scripts/build_pilot_inputs.py:16`(`available_at=ValueReceivedDate`), `research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json:57-59`(`available_at_column`/`validity_days: 62`/`availability_basis`), sens31/0 설정·완료 run `docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS/RESULT.md`(A_62/B_31 DONE, C SKIPPED). 재적용이 다음 작업이 아니다.
- **2019 보강 대조:** 실제 완료. 원본 export 근거는 `research/data/processed/091-cai-exp-2019/20260912T013423Z/export/summary.json`. 서술은 노트/코드/export 대조이며 재학습이 아니다.

## 확인한 것 / 확인하지 못한 것

- 원문 URL·확인시각·접근법·라이선스/ToS/윤리 근거: ZIP v2 §5/§6/§17/§18·funnel MD/JSON·S1–S9를 zipfile로 열람(로컬 덮어쓰기 없음). SPP 약관은 로컬 노트 2026-09-11-091-candidates-dmr-spp.md(portal 5회 타임아웃, 상업사용 사전허가)에 기록. 브라우저 신규 조회 0페이지이며, 이를 최신 접근 성공/실패 검증으로 쓰지 않는다.
- 관측시각/이용가능시각/개정·역사 범위: DMR 접수일 중앙값 7–17일(위 노트), TMAS·DMR 공개일 미확인 유지.
- 수집 성공 raw 경로·hash: 신규 수집 없음. 기존 DMR raw `research/gathering/raw/091-cushing-dmr/`(위 노트 보고), 영수증 [indexes 영수증](../../indexes/091-candidates/20260911T102736Z/README.md).
- 검정 계획/실행 여부·OOS 노출: 미실행. OOS(2024+) 미열람.
- 실제 결과 보고서 경로: [DATA-04 RESULT](../../../docs/cai/execution/runs/DATA-04/RESULT.md), 공항 카드 [ALT-20260908-15](../../candidates/ALT-20260908-15.md).

## 판정과 다음 행동

- KEEP 후보 없음(신규 채택 아님). 기존 상태 각각 유지: 실측입력 2행 유지, 통제·문맥 8행 성분 제외 유지, 미사용 23행(PARK/E1·E0·표본·전향·기각) 유지, SPP BLOCKED(9/11 기록, 현재 미재확인) 유지.
- **단일 다음 작업 추천(다음 배치용, 이번 미실행): 기존 DMR ValueReceivedDate의 실제 외부공개시점·개정이력 근거를 확인하고 회고 전용/PIT 적격 가능성을 구분하는 문서 조사.** 공개·개정 과거 근거 부재면 회고 전용 유지로 종료한다.
- '선택 없음/기존 입력 검증 우선' 기준 충족: 3순위(SPP·공항)는 접근·이력 확인이 선행 조건이라 이번 작업으로 넘기지 않음.
- 다른 팀원 검토: 미요청. 후보는 새 원장 `research/candidates/ledger.csv`에 기록하지 않았음(상태 변경 없음).

후보 기록은 [새 원장](../../candidates/ledger.csv)과 [상세 카드 양식](../../candidates/_TEMPLATE.md)을 따르며, 노트는 카드를 대신하지 않는다. [INTAKE](../../INTAKE.md)와 검정 규약을 따른다.

## 후속 확인

이 노트에서 추천한 DMR 문서 조사는 [공개시점·개정 이력 검토](2026-09-12-dmr-publication-vintage-review.md)로 마쳤습니다. 접수일의 정의는 확인했으며, 과거 최초 공개일·수정 전 값의 근거는 확인하지 못해 회고 전용으로 유지합니다. 같은 문서 조사를 다시 시작하는 지시가 아닙니다.
