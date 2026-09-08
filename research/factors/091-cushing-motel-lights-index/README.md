# 091 — Cushing Motel Lights Index (CMLI)

**상태**: ⏸️ **HOLD — 장기 공개 야간광 검정도 무효. 운영 nowcast 프로젝트만 보존**
**가중치**: 0.0

> “When the motel lights stay on, the tanks may still be asleep.”

## 가설

쿠싱 터미널 정비·파이프라인 작업·감사 또는 비상운영에 외부 인력이 늘면, 지역 모텔 숙박과 야간 소비가 높아질 수 있다. 이 관찰이 쿠싱 재고·WTI 또는 정제품 변동성의 선행 맥락이 될 수 있는지를 묻는다.

이는 실제 작업인력, 터미널 가동, 객실점유율 또는 주유량을 직접 측정하지 않는다.

## 무료 입력과 경계

- **후보 입력**: City of Cushing의 월별 Hotel/Motel Tax 비교표.
- **제도 지연**: 사업자는 선행 월의 숙박 총수입·세액을 다음 달 20일까지 신고한다. 월간·후행 입력이므로 일간 또는 주간 공급 충격을 선행한다고 가정하지 않는다.
- **제외**: Google 인기시간, 리뷰 수, 개별 모텔 주차장, 편의점 에너지드링크 판매는 장기·비식별·공개 집계가 없어 수치 입력으로 쓰지 않는다.

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

### 프로젝트로 남길 수 있는 부분

CFAM은 거래 모델이 아니라 공개 운영관측 실험으로 보존한다. 다음 입력은 **서로 독립적으로** 장기 공개시계열·실제 공개일을 확보했을 때만 추가한다.

1. City of Cushing Hotel/Motel Tax의 장기 원문과 Sales/Use Tax 대비 잔차
2. Payne County QCEW 숙박·음식업 고용 (분기 확인용)
3. ODOT 공개 교통량 (확인용)
4. 동일 야간광의 품질 플래그·고정 AOI 민감도

원 호텔세와 총세금의 비율을 별도 두 번 가중하지 않는다. 위 입력 중 어느 것도 아직 장기 패널·as-of 공개시점까지 갖추지 못했으므로 5성분 점수나 DL 모델은 만들지 않는다.

## 판정

**HOLD / meme monitor only.** 현 자료는 ‘쿠싱의 불이 켜지면 시장이 긴장한다’를 지지하지 않는다. 14개월 호텔세 파일럿과 96개월 공개 야간광 검정 모두 통과하지 못했다. 재고·WTI·HO 거래 신호에는 사용할 수 없다.

이 아이디어는 지역 운영 서사로 보존한다. 장기 호텔세 원문과 실제 공개일을 복원하고, 사전에 고정한 월간 변동성 타깃으로 충분한 IS/OOS를 구성하기 전까지 점수·경보·가중치를 만들지 않는다.

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
