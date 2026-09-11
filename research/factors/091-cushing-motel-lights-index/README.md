# 091 — Cushing Field Activity Monitor (CFAM)

> “When the field stays active, the tanks may still be asleep.”

| | |
| --- | --- |
| **상태** | **HOLD** — 공개 자료가 “쿠싱이 지금 바쁜가”를 점수화할 만큼 측정되지 않음 |
| **가중치** | `0.0` |
| **질문** | 터미널·물류·외부 인력·로컬 서비스 강도가 달라졌는가 |
| **실시간** | **아님.** 주간·월간·연간 공개표 + 수동 QSR |
| **ML/DL** | 가중치 설명용. WTI 예측 금지 |
| **아닌 것** | WTI 가격 팩터, EIA 재고 대리변수, 모텔 불빛 = 탱크 활동 |
| **이전 이름** | Cushing Motel Lights Index — 이력명만 유지 |
| **갱신** | 2026-09-09 — EIA 주간 재고 hist XLS 실수집·그림 ([091-EIAZ](../../indexes/091-cushing-operations-nowcasting/20260909T091EIAZ/README.md)). API 키 경로는 403. 활동 점수로 쓰지 않음 |

091은 **하나의** 쿠싱 운영 관측 프로젝트다. `091-A`부터 `091-Z`까지는 새 팩터가 아니라 같은 질문을 다른 공개 관측으로 확인한 하위 작업이다. 새 번호로 복제하지 않는다.

```text
관찰 가설
  → 허용된 실제 자료가 있는가
    → 무엇을 실제로 측정하는가
      → 개별 시각화 · 미래 전용 검정
        → 같은 상태를 재고, 둘 다 통과할 때만 제한 조합
```

상세 가설·영수증·그림은 [workflow.md](workflow.md)가 정본이다. 이 카드는 **현재 지도**다.

쿠싱이 바쁜가 **대시 프로그램**은 팩터 카드가 아니다: [programs/cushing-busy](../../programs/cushing-busy/PROGRAM.md). 화면 경로 `/observations/cushing-busy`.

## 읽는 순서

1. 아래 **전체 하위 트랙 원장**에서 상태만 먼저 본다.
2. FORWARD_ONLY 트랙만 오늘 관측한다. PARK는 재개 조건이 열리기 전에 상관·점수를 만들지 않는다.
3. 증거는 각 링크의 run README / receipt를 연다. 이 카드의 한 줄은 요약이다.
4. 검정 규칙은 [validation battery](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md)를 따른다.

## 지금 할 수 있는 것 / 하면 안 되는 것

**할 수 있는 것**

- EIA Cushing 주간 재고를 **물리 시장 문맥**으로 읽기
- 091-S / U / Y / YD / Z / V 전향 패널을 고정 시각에 기록하기
- PARK 트랙의 출처·표본·차단 이유를 발표 재료로 쓰기

**하면 안 되는 것**

- CFAM 0–100 점수, ML/DL, 거래 지표
- 야간광·호텔세·펌프가를 재고/WTI 예측 입력으로 쓰기
- 결측을 0·가격·합성값으로 메우기
- mock 혼잡도, Popular Times 막대, 리뷰, 개인·기기 정보 수집
- 서로 다른 트랙 건수를 합산해 “후보 N개”로 부풀리기

## 상태 한눈에

| 묶음 | 트랙 | 의미 |
| --- | --- | --- |
| LIVE 문맥 | [091-EIA / CSSM](subtracks/cssm/README.md) | 연구 타깃·물리 재고. 활동 점수 입력 아님 |
| FORWARD_ONLY | S, U, Y, YD, Z, V/V2 | 고정 규칙 전향 기록 중. 90일·측정타당성 전 |
| RUN / 미통과 | B, C | 장기 패널은 있으나 사전 검정 실패. 정량 입력 폐기 |
| PARK | A, D, E, E2, F, G, GC, H, I, J, L, LM, M, N, O, P, Q, R, RAIL, WASTE, W, X, X2 | 경로·표본은 남김. 장기성·정의·직접성 미달 |
| BLOCKED | K | 통신·세밀 위치. 수집 안 함 |
| 제한 | Busy ML/DL | WTI 예측 금지. 가중치 설명만 허용 |

우승 지수 없음. KEEP은 “후속 연구 배정”이지 알파 인증이 아니다.

---

## 전체 하위 트랙 원장

링크가 없는 행은 [workflow.md](workflow.md) 해당 절이 상세다.

### 1. 전향 관측 — 지금 기록하는 것

| ID | 관측 | 상태 | 증거 | 쓰지 않는 해석 |
| --- | --- | --- | --- | --- |
| **091-S** | 고정 6개 QSR의 Maps **상대** busy label (07:30 / 12:30 / 18:30 CT) | FORWARD_ONLY / E1 | [프로토콜](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/091s-live-monitor-protocol.md) · [Q/R/S 감사](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/README.md) · [qsr_live 기록기](subtracks/qsr_live/README.md) | 주문량, 방문객 수, 0–100 혼잡, WTI 선행 |
| **091-U** | 터미널·파이프라인·산업 공고 (동결 키워드) | FORWARD_ONLY / E1 | [스냅샷](../../indexes/091-cushing-operations-nowcasting/20260908T091UZ/README.md) · [전향 패널](../../indexes/091-cushing-operations-nowcasting/forward-panel/README.md) | 검색 결과 수 = 작업량 |
| **091-Y** | 고정 주유소 Regular / Diesel 표시가 | FORWARD_ONLY / E1 | [펌프가 보드](../../indexes/091-cushing-operations-nowcasting/20260908T091YZ/README.md) · [지역 보정](../../indexes/091-cushing-operations-nowcasting/20260908T091YCALZ/README.md) | 펌프가 → 미래 WTI |
| **091-YD** | 같은 점포 Diesel − Regular | FORWARD_ONLY / E1 | [제품 차 보드](../../indexes/091-cushing-operations-nowcasting/20260908T091RWDTZ/README.md) · [장기 프록시](../../indexes/091-cushing-operations-nowcasting/20260908T091YDEEPZ/README.md) | 디젤 갤런, 트럭 대기, 처리량 |
| **091-Z** | KUSH / Google News / OK Energy Today 산업 큐 | FORWARD_ONLY / E1 | [뉴스 모니터](../../indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/README.md) · [OKET](subtracks/okenergytoday/README.md) | 헤드라인 수 = 바쁨 점수 |
| **091-V / V2** | DEQ 산업허가 상태 전이 (인간 검토) | FORWARD_ONLY / E1 | [허가 로그](../../indexes/091-cushing-operations-nowcasting/20260908T091PARKZ/README.md) · [V2 pulse](../../indexes/091-cushing-operations-nowcasting/20260908T091V2Z/README.md) | 월간 공사량, 도시 바쁨 |

### 1b. 커뮤니케이션 층 — 현장 활동과 같은 점수로 합치지 않음

| ID | 관측 | 상태 | 증거 | 쓰지 않는 해석 |
| --- | --- | --- | --- | --- |
| **091-EXEC** | Plains → Enbridge → ONEOK 경영진 공개 노출 | KEEP / FORWARD_ONLY / E1 | [exec](subtracks/exec/README.md) | 인터뷰 횟수 = 바쁨, CEO → WTI |
| **091-EXL** | 같은 행의 Cushing/storage/capacity/throughput/tightness 언급 | KEEP / FORWARD_ONLY / E1 | 같은 카드 | 키워드 수 = 처리량 |
| **091-EXE** | Actual_30d minus ExpectedScheduled_30d | KEEP / FORWARD_ONLY / E1 | 같은 카드 | 실적콜·AGM을 서프라이즈로 셈 |

VisibilityShock와 LanguageShift는 분리. ExecPressure 곱은 60일 금지, 90일 전향 기록이 기본. 타깃 순서: 트럭·허가·일자리·숙박 → EIA 재고 → 생존 시에만 WTI. 선호 경로: Executive Surprise → Permit/Job → Heavy truck.

전향 3종 묶음: [091-U/Y/Z forward panel](../../indexes/091-cushing-operations-nowcasting/forward-panel/README.md). 2026-09-08 값은 비정기 베이스라인이다.

### 2. 물리 문맥 — 활동 점수가 아님

| ID | 관측 | 상태 | 증거 | 쓰지 않는 해석 |
| --- | --- | --- | --- | --- |
| **091-EIA / CSSM** | 주간 ending stocks excl. SPR | LIVE 문맥 | [subtrack](subtracks/cssm/README.md) · [2026-09-09 pull](../../indexes/091-cushing-operations-nowcasting/20260909T091EIAZ/README.md) · 최신주 2026-08-28 = 22,508 kbbl (+80) | 파이프라인 유량, 탱커, CFAM 바쁨, OilPriceAPI 이중계산 |
| **091-CFSP** | 전국 휘발유÷임금 + UMCSENT | CONTEXT / PARK | [subtrack](subtracks/cfsp/README.md) · [2026-09-09 pull](../../indexes/091-cushing-operations-nowcasting/20260909T091CFSPZ/README.md) · 2026-07 CFSP +0.77 | 쿠싱 현장 바쁨, 091-Y 현지 펌프가, WTI 알파 |
| **091-YD deep** | OK 소매 프록시 vs Cushing WTI | 통과 = **전가**만 | `r(WTI→retail)=.680` 당월, `.340` 익월; `r(retail→future WTI)=.105` | 소매가 알파 |

OilPriceAPI Cushing Storage와 MacroMicro 차트는 **같은 EIA**의 표시층이다. 두 번째 신호가 아니다.

### 3. 이미 돌려서 버린 정량 입력

| ID | 검정 | 결과 | 판정 |
| --- | --- | --- | --- |
| **091-B** 야간광 | 계절정규화 VIIRS → 이후 28일 재고 순변화 | n=96, r=+.053, block-bootstrap CI [-.073,+.188], circular p=.625, CV R²=−.033 | **KILL as quantitative input** |
| **091-A 호텔세 파일럿** | 숙박세 수준 → 익월 WTI RV | n=13, r=+.235, p=.440 | 미검증. 수집 리드만 |
| **091-C** | 052W · 086 · 090 외부 문맥 브리지 | 사전 지정 관계 미통과 | 문맥만. CFAM 입력 아님 |
| **PADD 2/3** | 재고/가동률 vs 변동성 | IS/OOS 안정 관계 없음 | CONTEXT / PARK |
| Busy ML/DL | WTI·거래량 합성 타깃 | 쿠싱 관측 아님 | **무효** |

배터리 원문: [20260908T091VZ](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md).  
동결 IS 영수증: [20260908T110000Z](../../indexes/091-cushing-operations-nowcasting/20260908T110000Z/README.md).

### 4. PARK — 경로·표본은 남기고 조합하지 않는 것

| ID | 질문 | 지금 있는 것 | 재개 최소 조건 | 상세 |
| --- | --- | --- | --- | --- |
| **091-A** | 외부 인력·트럭이 늘었나 | City 숙박세 표본, ODOT AVC 40 연간 AADT | 숙박세 60개월 + 고정 구간 일/월 차종 이력 | [workflow A](workflow.md#091-a--숙박세--고정-도로구간-트럭) |
| **091-D** | 탱크 빈/참을 영상으로 읽나 | Sentinel-2 10m 메타데이터 | 탱크별 판독 검증 + 반복 관측 | workflow D |
| **091-E** | 배관 배정·감축 공지가 공개되나 | 운영사 절차 | 구조화된 월별 공지 이력 | [FPATSI](subtracks/fpatsi/README.md) |
| **091-E2** | 일별 crude EBB가 있나 | 파서만 | Plains/Enbridge/Enterprise 일별 capacity·flow | [PEBB-FCI](subtracks/pebb_fci/README.md) |
| **091-F** | 도시 소비·반입이 달라졌나 | sales/use tax 월 표본 | 분리 60개월 + 세금월·수령일·게시일 | workflow F · [091-AG](../../indexes/091-cushing-operations-nowcasting/20260908T091AGZ/README.md) |
| **091-G** | 공공안전 요청량이 달라졌나 | 제한된 월 집계 표본 | 반복 가능한 익명 월 시계열 | workflow G |
| **091-GC** | SPP 혼잡이 운영 문맥인가 | 수집기, archive timeout | 검증 PNode + 연속 168시간 | [GCPSI](subtracks/gcpsi/README.md) |
| **091-H** | 방문 의도가 바뀌었나 | 공개 검색 관심 표본 | 목적 구분된 장기 패널 | [091-HG](../../indexes/091-cushing-operations-nowcasting/20260908T091HGZ/README.md) |
| **091-I** | 집계 이동이 현장을 재나 | Census LODES 연간 OD | 일/주 실시간 이동이 아님 → 연간 구조만 | workflow I |
| **091-J** | 주차·점심·심야 7종이 관측되나 | 접근성 감사 | 장기 익명 집계 없음 | workflow J |
| **091-L** | 대체에너지 정책이 현장을 바꾸나 | 연간 정책·보급 | 정책 빈티지 + 현장 정답 시계열 | workflow L |
| **091-LM** | last-mile이 변했나 | 희소 permit | 검증된 서비스 지역 + 허용된 일별 집계 | [CALMF](subtracks/calmf/README.md) |
| **091-M** | 시청 채용이 늘었나 | 현재 공고 3건 | 게시일·마감일 아카이브 | workflow M |
| **091-N** | 시청 문서에 월별 활동 원장이 있나 | 페이지 4개 원문 | agenda packet 60개월 집계 시계열 | workflow N |
| **091-O** | 공항이 바쁜가 | Jet-A/AvGas·ramp 월보 4건 | 연속 장기 월보 | [091-O](../../indexes/091-cushing-operations-nowcasting/20260908T091OZ/README.md) |
| **091-P** | 커뮤니티 발자국이 운영을 보나 | 공개 커뮤니티 경로 감사 | 쿠싱 한정 구조화 이벤트 | [091-P](../../indexes/091-cushing-operations-nowcasting/20260908T091PZ/README.md) |
| **091-Q** | 날씨가 교란 요인인가 | NOAA KCUH 24h 표본 | 독립 활동 시계열이 생긴 뒤 통제로만 | [Q/R/S](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/README.md) |
| **091-R** | 지역 행사가 부하인가 | KUSH After Dark | Cushing-only 날짜 필드 | 같은 Q/R/S |
| **091-RAIL** | 철도 탱크차가 흐름인가 | Stroud 문맥 | 날짜별 탱크차·편성 패널 | [RWDT](../../indexes/091-cushing-operations-nowcasting/20260908T091RWDTZ/README.md) |
| **091-WASTE** | 산업폐기물 반입이 작업인가 | DEQ 양식 | 시설별 월 톤수 이력 | 같은 RWDT |
| **091-W** | 공기가 지금 어떤가 | AirCasting 접근 실패 + DEQ 연간 VOC | 연속 공개 측정소 | [W](../../indexes/091-cushing-operations-nowcasting/20260908T091WZ/README.md) · [WENV](../../indexes/091-cushing-operations-nowcasting/20260908T091WENVZ/README.md) |
| **091-X** | Cushing vs Houston/Midland 압력 | EIA Cushing 레그 | 동일정의 무료 장기 쌍 | [091-X](../../indexes/091-cushing-operations-nowcasting/20260908T091XZ/README.md) · [MCBI](subtracks/mcbi/README.md) |
| **091-X2** | WTI M1–M2 prompt 압력 | 계산기만 | 검증된 일별 M1/M2 결제 패널. `CL=F`로 M2 만들지 않음 | [WMCSI](subtracks/wmcsi/README.md) |

### 5. BLOCKED

| ID | 이유 |
| --- | --- |
| **091-K** 통신 신호 | CDR·기지국·세밀 기기 위치. 이 프로젝트에서 수집하지 않음 |

### 6. Factor-local 재시도 디렉터리

코드와 영수증은 `subtracks/` 안에만 둔다. 여기 출력이 CFAM 입력이 되려면 각 트랙의 소스 게이트를 통과해야 한다.

| 디렉터리 | 트랙 | 상태 |
| --- | --- | --- |
| [subtracks/README.md](subtracks/README.md) | 재시도 원장 | — |
| [fpatsi](subtracks/fpatsi/README.md) | 091-E 배정 공지 | PARK / E1 |
| [pebb_fci](subtracks/pebb_fci/README.md) | 091-E2 EBB | PARK / E1 |
| [wmcsi](subtracks/wmcsi/README.md) | 091-X2 M1–M2 | PARK / E1 |
| [mcbi](subtracks/mcbi/README.md) | 091-X WTT | SOURCE-PASS / SERIES-PARK |
| [gcpsi](subtracks/gcpsi/README.md) | 091-GC SPP | PARK / E1 |
| [calmf](subtracks/calmf/README.md) | 091-LM last-mile | PARK / E0 |
| [okenergytoday](subtracks/okenergytoday/README.md) | 091-Z 보조 출처 | FORWARD_ONLY / source-pass |
| [qsr_live](subtracks/qsr_live/README.md) | 091-S 기록기 | FORWARD_ONLY / E1 |

---

## 2026-09-09 연구 기록 — 제출 모니터

제출된 `LIVE BUSYNESS MONITOR`(5분 루프, Maps 링크, mock 0–100)는 091-S에 **기록 셸**로만 남긴다.

- mock 시간대 점수와 미사용 API 키 경로는 관측이 아니다. `--mock`은 화면만 찍고 CSV에 쓰지 않는다.
- 본선 바스켓은 Wendy's, Taco Bell, Sonic Drive-In, Golden Chick, Pizza Hut, Boomarang Diner.
- 헬스장·커뮤니티 링크는 watchlist이며 091-S 분모에 넣지 않는다.
- 허용 필드: Popular-times 표시 여부, 상대 라벨, 영업, delivery, drive-through.
- 실행:

```text
python research/factors/091-cushing-motel-lights-index/subtracks/qsr_live/busyness_monitor.py --once
python research/notebooks/091-cushing-operations-nowcasting/manual_busy_label_recorder.py --venue "Wendy's" --maps-url "https://maps.app.goo.gl/g8bMaDQDnoMc9roT8" --label usual --open yes --delivery shown --drive-through shown
```

90일·예정 슬롯 80% 이전에는 WTI/EIA 검정을 열지 않는다. 먼저 공항·고정 도로 트럭·숙박세(월) 같은 **독립 운영 집계**와 측정타당성부터 본다.

## HOLD를 푸는 관문

다음이 **동시에** 필요하면 그때만 상태를 다시 논의한다.

1. 독립적으로 관측·타임스탬프된 운영 시계열 **둘 이상** (예: 고정 도로 트럭 + 숙박세 60개월, 또는 공항 월보 장기 + 091-S 90일).
2. 각 시계열의 측정타당성이 활동 정답과 맞는지 통과.
3. 그 뒤에만 최대 2–3개 조합. [five-track plan](../../reports/2026-09-08-cfam-five-track-combination-plan.md)은 계획이지 실행 허가가 아니다.

당장 우선:

1. 091-S / U / Y 90일 전향 완결
2. ODOT AVC 40 고정 구간 **일/월** 이력
3. City 숙박세·sales/use tax **60개월** 원문

## 재현

| 무엇 | 어디 |
| --- | --- |
| 워크플로·가설·재개 조건 | [workflow.md](workflow.md) |
| 수집기 | [run_cfam.py](../../notebooks/091-cushing-operations-nowcasting/run_cfam.py) |
| 소스 감사 (ODOT·FAA·OilPriceAPI·MacroMicro·DeFlock) | [20260908T091SOURCEZ](../../indexes/091-cushing-operations-nowcasting/20260908T091SOURCEZ/README.md) |
| 관측판 그림 | [20260908T030000Z](../../indexes/091-cushing-operations-nowcasting/20260908T030000Z/README.md) |
| 호텔세 초기 표본 | [data-sample-2023.md](data-sample-2023.md) |
| PADD / 캘린더 스프레드 | [20260908T091PADZ](../../indexes/091-cushing-operations-nowcasting/20260908T091PADZ/README.md) |
| 조합 준비 보드 | [20260908T091COMBOZ](../../indexes/091-cushing-operations-nowcasting/20260908T091COMBOZ/README.md) |

원본 dump는 `research/gathering/raw/` (gitignore). 공개 문서는 범위, 해시/영수증, 코드, 결과만 적는다.
