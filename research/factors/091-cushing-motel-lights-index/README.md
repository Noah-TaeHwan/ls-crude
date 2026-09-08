# 091 — Cushing Field Activity Monitor (CFAM)

## [091-A/B/C 전체 워크플로우 및 시각화 →](workflow.md)

## [5개 유망 트랙의 조합 게이트·검정 설계 →](../../reports/2026-09-08-cfam-five-track-combination-plan.md)

## [S×O·A×F 실제 겹침 검정 및 시각화 →](../../indexes/091-cushing-operations-nowcasting/20260908T091COMBOZ/README.md)

## [091 광범위 검증 배터리 결과 →](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md)

**상태**: ⏸️ **HOLD — 장기 공개 야간광 검정도 무효. 운영 nowcast 프로젝트만 보존**
**가중치**: 0.0

> “When the field stays active, the tanks may still be asleep.”

> 이전 밈 명칭은 *Cushing Motel Lights Index*였다. 현재 공식 명칭은 **Cushing Field Activity Monitor (CFAM)**이며, ‘모텔 불빛’은 실제 관측 범위를 과장하지 않기 위해 더 이상 팩터명으로 쓰지 않는다.

## 091 하위 연구 트랙

091은 하나의 쿠싱 운영 관측 프로젝트다. 새 번호로 복제하지 않고 아래 하위 작업으로 이력을 보존한다.

| 작업 | 핵심 관측 | 현재 상태 |
| --- | --- | --- |
| [091-A](workflow.md#091-a--숙박세--고정-도로구간-트럭) | 숙박세 × 고정 도로구간 트럭 | PARK / E1 — 숙박세 36개월 표·ODOT 실제 API 표본 확인; 60개월·장기 고정구간 패널 대기 |
| [091-B](workflow.md#091-b--도시권-야간광) | 도시권 야간광 | RUN / 미통과 |
| [091-C](workflow.md#091-c--외부-문맥-브리지) | 052W · 086 · 090 외부 문맥 | RUN / 조합 미통과 |
| [091-D](workflow.md#091-d--탱크-지붕-그림자-feasibility) | 대형 floating-roof 탱크의 Sentinel-2 그림자 | PARK / E1 — 실제 메타데이터 표본 확보, 무료 10m 픽셀 원본·탱크별 판독은 미검증 |
| [091-E](workflow.md#091-e--파이프라인-apportionment-공지) | Cushing 연결 파이프라인의 배정·감축 공지 | PARK / E1 — Keystone의 절차는 확인, 실제 월별 공지 이력은 미확보 |
| [091-F](workflow.md#091-f--salesuse-tax-도시활동-관측) | 판매세·사용세의 도시 소비/반입 활동 | PARK / E1 — 월별 공식 표본·보고월 확인; 60개월 원문·분리 패널 미확보 |
| [091-V](workflow.md#091-v--industrial-permit--construction-monitor) | 산업·상업·인프라 허가 | PARK / E1 — City/County 장기 발급대장은 미확보; [DEQ 실제 산업허가 1건은 이벤트 경로](../../indexes/091-cushing-operations-nowcasting/20260908T091FVZ/README.md)로만 보존 |
| [091-G](workflow.md#091-g--911경찰-calls-for-service-집계) | 911·경찰 call-for-service 집계 | PARK / E1 — 실제 월별 익명 집계 표본 확인; 장기 동일정의 패널 미확보 |
| [091-H](workflow.md#091-h--쿠싱-여행의도-검색-관측) | “how to get to cushing” 공개 검색 관심 | PARK / E1 — 실제 장기 월별 표본은 있으나 2015–23의 26.9%가 0이고, 방문·작업 목적을 관측하지 않음 |
| [091-I](workflow.md#091-i--공개-집계-이동-관측) | Census LODES 등 공개 집계 이동 경로 | PARK / E1 — 실제 2022 LODES OD를 [개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md) 완료; 연간 Payne County 고용구조라 현장 이동·footfall 미관측 |
| [091-J](workflow.md#091-j--허브-근접-활동-관측) | 주차·호텔·점심·심야·경로·이벤트 | PARK / E1 — 실제/부재 신호를 [게이트보드](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md)로 시각화; 장기 공개 관측은 아직 조합 불가 |
| [091-K](workflow.md#091-k--통신-신호-모빌리티-경로) | 통신 신호 기반 이동 | BLOCKED / E1 — 수집 금지 경계를 [게이트보드](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md)로 기록; 통신사·공급자 계약 데이터는 수집하지 않음 |
| [091-L](workflow.md#091-l--미국-대체에너지-정책의-장기-구조-경로) | 미국 대체에너지 정책·전동화 | PARK / E1 — Factor 004의 IEA 실제 엔드포인트를 [개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md) 완료; 정책 자체·쿠싱 현장활동을 측정하지 않음 |
| [091-M](workflow.md#091-m--쿠싱-시청-공개-구인공고) | City of Cushing 공개 구인공고 | PARK / E1 — 실제 3건 표본 [개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md) 완료; 시정부 공석일 뿐 장기 이력·현장 운영 측정 없음 |
| [091-N](workflow.md#091-n--쿠싱-시청-공개자료-지도) | 시청 공개자료·부서·회의문서 경로 | PARK / E1 — 실제 4개 공식 페이지/0개 신규 장기패널을 [게이트보드](../../indexes/091-cushing-operations-nowcasting/20260908T091INSZ/README.md)로 시각화 |
| [091-O](workflow.md#091-o--쿠싱-공항-활동-월간보고) | 공항 연료판매·ramp stay·응급비행 지원 | PARK / E1 — 실제 월간보고 4건의 직접 운영 수치를 [개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091OZ/README.md) 완료; 60개월·개별 기간 미확보 |
| [091-U](workflow.md#091-u--cushing-industrial-job-pulse) | 직접 산업직 공고의 전향 집계 | FORWARD_ONLY / E1 — [4개 고신뢰 공개 공고 스냅샷](../../indexes/091-cushing-operations-nowcasting/20260908T091UZ/README.md) 확보; 동결 규칙 90일 패널 대기 |
| [091-Y](workflow.md#091-y--cushing-pump-price-board) | 쿠싱 현지 휘발유·디젤 소매가격 | FORWARD_ONLY / E1 — [공식 Cushing 주유소 실제 가격 표본·시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091YZ/README.md) 확보; 현지 장기 패널이 없어 WTI 상관 검정은 아직 불가 |
| [091-X](workflow.md#091-x--cushing--houstonmidland-flow-pressure) | Cushing–Houston/Midland 위치 스프레드 | PARK / E1 — [Cushing 공개 EIA 원시 표본·Houston/Midland 접근성 감사](../../indexes/091-cushing-operations-nowcasting/20260908T091XZ/README.md) 완료; 무료·동일정의 장기 쌍 패널 미확보, 대체 스프레드 조작 금지 |
| [091-W](workflow.md#091-w--cushing-air-quality-now) | 독립 실시간 대기질 현황 + 연간 환경 발자국 | PARK / E1 — [실시간 경로 접근성 감사](../../indexes/091-cushing-operations-nowcasting/20260908T091WZ/README.md) 완료; **CFAM 점수와 분리**. [DEQ 2024 공식 연간 VOC/HAP 시설 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091WENVZ/README.md) 완료 |
| [091-P](workflow.md#091-p--지역-커뮤니티-발자국--운영-주의도) | 학교 등록학생·KUSH 지역 운영 보도 주의도 | PARK / E1 — 실제 공개 집계 두 개를 [개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091PZ/README.md) 완료; 전자는 연간 구조, 후자는 보도 주의도라 ‘현재 바쁨’의 정답을 측정하지 않음 |
| [091-Q/R/S](workflow.md#091-qrs--날씨행사빠른-외식-관측) | NOAA 날씨 · KUSH 행사 · Google Maps Quick Service | **S만 FORWARD_ONLY / E1** — [실제 표본·개별 시각화](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/README.md) 완료. 고정 6점포의 [live footfall protocol](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/091s-live-monitor-protocol.md)로 90일 전향 검증을 시작할 수 있음 |

개별 시각화·실제 입력 경계·재개 조건은 [091 workflow](workflow.md)에 모아 둔다.

## 가설

쿠싱 터미널 정비·파이프라인 작업·감사 또는 비상운영에 외부 인력이 늘면, 지역 모텔 숙박과 야간 소비가 높아질 수 있다. 이 관찰이 쿠싱 재고·WTI 또는 정제품 변동성의 선행 맥락이 될 수 있는지를 묻는다.

이는 실제 작업인력, 터미널 가동, 객실점유율 또는 주유량을 직접 측정하지 않는다.

## 무료 입력과 경계

- **후보 입력**: City of Cushing의 월별 Hotel/Motel Tax 비교표.
- **제도 지연**: 사업자는 선행 월의 숙박 총수입·세액을 다음 달 20일까지 신고한다. 월간·후행 입력이므로 일간 또는 주간 공급 충격을 선행한다고 가정하지 않는다.
- **제외**: Google 리뷰 수, 개별 모텔 주차장, 편의점 에너지드링크 판매는 장기·비식별·공개 집계가 없어 수치 입력으로 쓰지 않는다. 단, 고정 6개 점포의 **Google Maps live busy label**은 [091-S 전향 수동 관측](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/091s-live-monitor-protocol.md)으로만 보존한다.

## 탐색 파일럿 — 2026-09-08

공식 시 의제 패킷의 2024-07~2025-08 월별 호텔세 표를 **초기 전사**해, 제공된 `CL=F` 일봉으로 계산한 월별 WTI 실현변동성과 맞췄다. PDF 표 OCR 오류 가능성이 남아 있어 이 전사는 재현용 후보이며, 확정 원시 패널이 아니다.

| 신호 → WTI 결과 | r | p | n | 판정 |
| --- | ---: | ---: | ---: | --- |
| 호텔세 수준 → 같은 달 실현변동성 | +0.233 | .424 | 14 | 관계 없음 |
| 호텔세 수준 → 다음 달 실현변동성 | +0.235 | .440 | 13 | 관계 없음 |
| 호텔세 월간 변화 → 다음 달 실현변동성 | +0.457 | .135 | 12 | 표본 부족·비유의 |
| 호텔세 수준 → 다음 달 수익률 | +0.206 | .500 | 13 | 관계 없음 |

임의 분할 점검에서도 다음 달 변동성 상관은 IS(2024년 하반기) `+0.472`, n=6, OOS(2025년) `+0.264`, n=7이었다. 두 구간 모두 검정력이 없으며, 이를 OOS 재현이나 알파로 부르지 않는다.

## CFAM 장기 공개자료 검정 — 2026-09-08

‘모텔 조명’이라는 말은 밈으로만 남기고, 실제 측정값은 **Cushing Field Activity Monitor (CFAM)**로 좁혔다. 공개 World Bank Light Every Night 월간 VIIRS COG의 쿠싱 도심 5×5 격자 중앙값에서 고정 농촌 대조점 4개의 중앙값을 뺀 도시권 활동 이상치다. 모텔·근로자·주차장·객실점유율을 식별하지 않는다.

고정된 검정 계약은 다음과 같다.

- **입력 기간**: 2015-01~2023-12, Suomi-NPP만. 출처 처리본이 `rp2`(2015–17)에서 `ops`(2018–23)로 바뀌므로 원수준을 연결하지 않고 처리본별·월별로 따로 계절 정규화했다.
- **이용 가능 시점**: 관측 월말 +45일. 실제 과거 게시 빈티지를 복원하지 못했으므로 보수적 계약이다.
- **1차 타깃**: 그 뒤 28일의 공식 EIA 쿠싱 재고 순변화와 주간 재고변화 절대값. WTI·수익률은 이 단계의 타깃이 아니다.

| CFAM 이상치 → 이후 28일 EIA 쿠싱 재고 | r | p | Spearman | n | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| 순변화 (kbbl) | +0.053 | .607 | +0.096 | 96 | 관계 없음 |
| 주간 변화 절대값 평균 (kbbl) | +0.068 | .508 | +0.150 | 96 | 관계 없음 |

따라서 현재 야간광 단독 입력은 쿠싱 재고의 방향·불안정을 nowcast하지 못했다. 이는 ML/DL을 얹어서 해결할 문제가 아니다. 같은 96개월에 깊은 모델을 맞추면 과적합 위험만 커진다.

2026-09-08에는 Pearson·Spearman·Kendall, 윈저 민감도, HAC/HC3 회귀, 6개월 block bootstrap, 순열·순환시차 귀무분포, leave-one-year-out, 2015–19/2020–23 시간분할, expanding-window 교차검증, 원수준/계절정규화 민감도, ±6개월 탐색 시차까지 적용했다. [광범위 검증 결과](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md)는 모든 사전정의 핵심 검정에서 관계가 없음을 재확인했다. 이는 야간광 입력의 정량 CFAM 자격을 종료하는 근거이며, ‘쿠싱이 바쁨’이라는 실제 정답 라벨 검정 자체를 대체하지 않는다.

### 프로젝트로 남길 수 있는 부분

CFAM은 거래 모델이 아니라 공개 운영관측 실험으로 보존한다. 다음 입력은 **서로 독립적으로** 장기 공개시계열·실제 공개일을 확보했을 때만 추가한다.

1. City of Cushing Hotel/Motel Tax의 장기 원문과 Sales/Use Tax 대비 잔차
2. Payne County QCEW 숙박·음식업 고용 (분기 확인용)
3. ODOT 공개 교통량 (확인용)
4. 동일 야간광의 품질 플래그·고정 AOI 민감도
5. 사전고정한 여행 의도 검색어와 실제 집계 방문/운영 기준값의 측정타당성 검정
6. [091-P 지역 커뮤니티 자료](../../indexes/091-cushing-operations-nowcasting/20260908T091PZ/README.md)는 학교 연간 구조와 지역 보도 주의도를 실제로 확보했으나, 현장 바쁨의 대체값으로 승격하지 않는다. 민간 숙박·스카이다이빙·소매·치과 고객수와 환자·교인 개인 자료는 수집하지 않는다.

원 호텔세와 총세금의 비율을 별도 두 번 가중하지 않는다. 위 입력 중 어느 것도 아직 장기 패널·as-of 공개시점까지 갖추지 못했으므로 5성분 점수나 DL 모델은 만들지 않는다.

## 판정

**HOLD / meme monitor only.** 현 자료는 ‘쿠싱의 불이 켜지면 시장이 긴장한다’를 지지하지 않는다. 14개월 호텔세 파일럿과 96개월 공개 야간광 검정 모두 통과하지 못했다. 재고·WTI·HO 거래 신호에는 사용할 수 없다.

이 아이디어는 지역 운영 서사로 보존한다. 아래의 재개 조건이 충족되기 전까지 점수·경보·가중치를 만들지 않는다.

### 동결된 재개 조건

1. **City of Cushing 숙박세 원문 60개월 이상**을 확보한다. 월별 관측 기간·원문 URL·최초 공개/이용가능 시각을 보존하고, 도시 전체 숙박 과세수입으로만 부른다.
2. **쿠싱 근접의 고정 도로구간 장기 트럭 수치**를 확보한다. 고정된 구간·관측 단위·트럭 정의·발표 시점을 보존하며, 도시 전체 차량·임의 도로·추정 통행량으로 대체하지 않는다.
3. 두 입력을 **각각 먼저** 결측·계절성·공개시점과 함께 시각화하고, 미래 전용 재고/변동성 타깃과 독립 검정한다.
4. 두 독립 관측이 모두 측정 적합성과 사전 고정 검정 기준을 통과한 경우에만, 야간광을 포함해 최대 2~3개 관측을 제한적으로 조합한다. 한 입력의 결측을 0·가격·합성 변수로 메우지 않는다.

이 조건은 양의 결과나 자동 재개 승인이 아니다. 각 원문·시각화·독립 검정은 새 수집 빈티지와 별도 기록을 거쳐 사람이 검토한다.

## 4개 관측 조합 게이트 — 2026-09-08

사용자가 제안한 조합은 **도시권 야간광 · 숙박세 · 인근 대형차 통행 · EIA 쿠싱 재고**다. 각 관측은 먼저 독립적으로 확인했고, 모두가 같은 시간축의 실제 패널을 제공할 때만 조합한다.

| 관측 | 실제 공개 표본 | 의도한 관측 가능성 | 독립 검정 | 조합 입력 판정 |
| --- | --- | --- | --- | --- |
| 도시권 야간광 | ✅ 2015-01~2023-12 장기 월간 패널 | ⚠️ 도시권 밝기만 가능. 모텔·인력은 불가 | 완료. 이후 28일 재고변화와 `r=+.053`, `p=.607`, n=96 | **제외** — 관계 없음 |
| 호텔/모텔세 | ⚠️ 2023년 5~7월 공식 월별 표본과 2021~23 연간 실제치 | ✅ 도시 전체 숙박 과세수입의 후행 집계 | 장기 원문·공개시점 미확보. 기존 14개월 전사는 탐색용 | **보류** |
| 인근 대형차 통행 | ❌ 이 환경에서 쿠싱 인근 수치 표본 미확보 | ⚠️ ODOT는 AADT·트럭 비율 필드를 제공하지만 현재 보간 네트워크임 | 장기 고정 관측소/실제 공개일 미확보 | **보류** |
| EIA 쿠싱 재고 | ✅ 주간 장기 원문 | ✅ 공식 재고 상태 | 야간광 검정의 타깃으로 사용 | **문맥/타깃 전용** — 활동 프록시와 중복 합산 금지 |

따라서 4개를 합친 **Cushing Oil Stress Index는 실행하지 않았다.** 결측 입력을 0으로 처리하거나, WTI 가격·거래량·합성 변수를 대신 넣는 것은 이 조합의 검정이 아니다. 상세한 게이트 기록은 [`2026-09-08-cushing-observation-combination-gate.md`](../../reports/2026-09-08-cushing-observation-combination-gate.md)에 남긴다.

### 외부 맥락 후보 브리지 — 052W · 086 · 090

052W(전국 Wikipedia 불안 관심), 086(가을 수확), 090(겨울 결빙)을 실제 공개시점 기준으로 EIA 쿠싱 재고의 다음 28일 상태에 붙인 탐색도 완료했다. 각 신호의 순재고 변화 상관은 `+0.142` (n=101), `+0.229` (n=26), `-0.102` (n=91)로 모두 유의하지 않았다. 086과 090은 계절 창이 겹치지 않아 같은 날 조합이 0건이다. 이들은 쿠싱 활동 점수의 입력이 아니라 계절별 문맥 패널로만 보존한다. [검정 기록](../../reports/2026-09-08-cushing-context-bridge-test.md)

## 재현

- 파일럿 스크립트: [`cushing_motel_lights_pilot.py`](../../notebooks/cushing_motel_lights_pilot.py)
- CFAM 수집기: [`run_cfam.py`](../../notebooks/091-cushing-operations-nowcasting/run_cfam.py)
- CFAM 동결 IS 영수증: [`20260908T110000Z`](../../indexes/091-cushing-operations-nowcasting/20260908T110000Z/README.md)
- 실제 공개 관측값 표본: [`data-sample-2023.md`](data-sample-2023.md)
- 원유 입력: [`clf-daily-2015-2026.csv`](../../data/clf-daily-2015-2026.csv)

## 출처

- [City of Cushing City Manager Agenda, 2025-11-17](https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf)
- [Cushing Hotel/Motel Tax ordinance](https://ecode360.com/48283532)
- [World Bank Light Every Night](https://registry.opendata.aws/wb-light-every-night/)
- [EIA Cushing, OK ending stocks excluding SPR](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL)
