# LS CRUDE — 무료 데이터 수집·검증 장부

## 공통 규칙

- 타깃은 사용자가 제공한 Yahoo `CL=F` 일봉이다.
- IS는 2015-01-01~2023-12-31, OOS는 사양 동결 뒤 2024-01-01 이후 한 번만 쓴다.
- 원본 응답·API 다운로드는 gitignored `research/gathering/raw/YYYY-MM-DD-<factor>/`에만 저장한다. 카드 폴더에는 `README.md`·`COLLECTION.md`·`sources.csv`와 결과 요약만 남긴다.
- `불가`는 실패를 숨긴 것이 아니라 개인정보·보안·라이선스·역사 부족 때문에 적법한 테스트 패널을 만들 수 없었다는 기록이다.

## 001–037 수집 상태

| # | 무료 후보 데이터 | 현재 상태 | IS/OOS 변동성 결과 또는 다음 막힘 | 원본·기록 위치 |
| ---: | --- | --- | --- | --- |
| 001 | Talabat 파트너 API | 불가 | 도시권 익명 주문 장기 집계가 공개되지 않음 | [소스](../data/factor-free-source-catalog.csv) |
| 002 | 거래소 OI | 보류 | 최근·단일 거래소뿐, 고래·MENA 귀속 불가 | 소스 카탈로그 |
| 003 | 공개 Trump 게시물 | 수집·검증 | IS `0.000`, OOS `+0.164`; 재현 통과 아님 | `gathering/raw/2026-09-03-trump-temper-probe/` |
| 004 | IEA EV API | 수집·검증 | IS `+0.157`, n=7; OOS n=2 | `gathering/raw/2026-09-03-ev-displacement-probe/` |
| 005 | SEC EDGAR | 보류 | 재무 공시가 독립 물리수요 신호가 아님 | 소스 카탈로그 |
| 006 | EIA WPSR | 보류 | 더 빠른 대체재지만 기존 물류 가설을 검증하는 고유 신호가 아님 | 소스 카탈로그 |
| 007 | UNHCR | 보류 | 강제이주는 부유층·이민법률 수요 프록시가 아님 | 소스 카탈로그 |
| 008 | Hyperliquid API | 보류 | 2023 이후, 역사 부족·MENA 귀속 불가 | 소스 카탈로그 |
| 009 | USD/IRR 공개 아카이브 | 수집·검증 | IS `-0.003`, OOS `-0.002` | `gathering/raw/2026-09-03-iran-fx-stress-probe/` |
| 010 | EIA 재고 | 수집·검증 | IS `-0.187`; OOS 유효 n=1 | `gathering/raw/2026-09-03-petroleum-buffer-probe/` |
| 011 | BLS Oil & Gas Extraction 고용 | 수집·검증 | IS `-0.223`, OOS `-0.047`; 원안 4성분이 아닌 단일 고용 프록시 | `gathering/raw/2026-09-03-public-series-completion-probe/` |
| 012 | CFTC COT | 보류 | 별도 pairs 전략; 계약 가격·비용 패널 미구축 | 소스 카탈로그 |
| 013 | OPEC 발표 | 보류 | 사건 라벨은 가능, 선행 텍스트 신호 아님 | 소스 카탈로그 |
| 014 | USGS 지진 | 부분 후보 | 사건 통제 가능; 파이프라인/제주 운영 신호는 아님 | 소스 카탈로그 |
| 015 | FHWA 전국 VMT | 수집·검증 | IS `+0.197`, OOS `-0.192`; 전체 VMT이며 원안 차종 미측정 | `gathering/raw/2026-09-03-public-series-completion-probe/` |
| 016 | NASA POWER | 수집·검증 | IS `-0.066`; 운영 차질 패널 없음 | `gathering/raw/2026-09-03-gulf-ac-panic-probe/` |
| 017 | IMF PortWatch | 보류 | 2019 이후·집계 해상 활동만, AIS 원시 사용 금지 | `gathering/raw/2026-09-02-portwatch/` |
| 018 | NASA FIRMS | 보류 | 열 이상은 가능; 가동률·공개시점 패널 미구축 | 소스 카탈로그 |
| 019 | 없음 | 불가 | 특정 건물·승하차 데이터는 개인정보 경계 밖 | 카드 019 |
| 020 | NASA POWER | 수집·검증 | IS `-0.066`; OOS 사양 미동결 | `gathering/raw/2026-09-03-gulf-ac-panic-probe/` |
| 021 | KAMIS | 보류 | API 키·연속 역사·빈티지 확인 전 | 카드 021 |
| 022 | Opinet·FRED | 수집·검증 | IS `-0.087`, OOS `-0.348` | `gathering/raw/2026-09-03-korea-us-fuel-spread-probe/` |
| 023 | 없음 | 불가 | 개별·실시간 AIS는 보안 경계 밖 | 카드 023 |
| 024 | 공항·도로공사 집계 | 보류 | 공개시점 포함 장기 surprise 패널 미구축 | 카드 024 |
| 025 | KNOC 월간 통계 | 보류 | true crack spread가 아닌 월간 프록시만 가능 | 카드 025 |
| 026 | 없음 | 불가 | 개인·은행 고객 FX 흐름 금지 | 카드 026 |
| 027 | 인천공항 공식 환승여객 집계 | 수집·검증·구성요소 반증 | 기본 IS `-0.332`, OOS `+0.530`; 5개 운영 구성요소도 반전/소멸 | `gathering/raw/2026-09-03-incheon-transit-surge-probe/`, `2026-09-03-rescue-diagnostics-027-042/` |
| 028 | 없음 | 불가 | 원안의 포항 S-Oil 정유소 전제가 성립하지 않음 | 카드 028 |
| 029 | 관세청 면세 집계 | 보류 | 외국인 매출이 관광·차량·디젤 소비를 식별하지 않음 | 카드 029 |
| 030 | 관세청 HS 무역통계 | 후보 | HS·국가 바스켓·공개시점 동결 후 IS 시험 가능 | 카드 030 |
| 031 | 없음 | 불가 | 주문·물류·플랫폼 판매 데이터 부적격 | 카드 031 |
| 032 | 황사 경보·KMA 기상 | 후보 | 경보 역사·운영차질 패널을 확보한 뒤 반증 가능 | 카드 032 |
| 033 | 없음 | 불가 | 이발소 고객·예약·결제 추적 없이 익명 도시권 장기 집계가 없음 | 카드 033 |
| 034 | 없음 | 불가 | 개인 외모·스타일·사진 데이터는 수집하지 않음 | 카드 034 |
| 035 | 없음 | 불가 | 식당 고객·예약·결제 추적 없이 익명 도시권 장기 집계가 없음 | 카드 035 |
| 036 | 공식 모집 집계 | 보류 | 저빈도·노동시장/예산 혼합, 공개시점 장기 패널 미확보 | 카드 036 |
| 037 | 공식 발표 | 보류 | 사건 태그만 가능, 기지 주변 감시·운영 추론은 제외 | 카드 037 |

## 후속 등록

| # | 무료 후보 데이터 | 현재 상태 | IS/OOS 변동성 결과 또는 다음 막힘 | 원본·기록 위치 |
| ---: | --- | --- | --- | --- |
| 044 | U.S. Census Data Center construction | 수집·검증 | IS `-0.181`, OOS `-0.041`; AI 구독은 미측정 | `gathering/raw/2026-09-03-ai-burn-rate-probe/` |
| 045 | SEC Starbucks Company Facts | 수집·검증 | IS `+0.512`, OOS `-0.511`; 전체 매출 프록시가 부호 반전 | `gathering/raw/2026-09-03-iced-americano-heat-index/` |
| 045 | 서울시 상권분석 커피·음료 업종 | 부분 후보 | 무료 발급키로 전체 행 집계 가능하나 2021년 이후만 제공·공개 sample 키는 5행 제한 | [045 카드](../factors/045-iced-americano-heat-index/README.md) |
| 047 | SEC Company Facts: Canada Goose·Columbia | 수집·표본 미달 | 연간 공통 YoY는 IS 3·OOS 0. Canada Goose의 구조화 분기 6-K 매출이 일관되지 않아 `r` 미보고 | `gathering/raw/2026-09-03-premium-value-outdoor-spread/` |
| 046 | Chicago CTA 일별 탑승 합계 | 수집·검증 | IS `-0.267`, OOS `+0.005`; 도시 이동 리듬 관계 소멸 | `gathering/raw/2026-09-03-urban-taxi-tempo-probe/` |
| 042A | MTA Wall Street 역군 월별 탑승량 | 수집·검증(설명적)·구성요소 반증 | 기본 IS `+0.044`, OOS `-0.350`; 4개 구성요소도 반전/소멸. 4도시 AFHP 패널은 미구축 | `gathering/raw/2026-09-03-wall-street-district-pulse-probe/`, `2026-09-03-rescue-diagnostics-027-042/` |
| 047 | Google Trends trade-down 관심도 바스켓 | 보류 | Temu 역사 부족. 공개 UI에는 안정적 연구 API·빈티지 계약이 없어 관심도를 판매로 바꾸지 않음 | [047 카드](../factors/047-conscience-compression-index/README.md) |
| 048 | YouTube 공개 에피소드 메타데이터 | MEME / monitor only | 2020년대 시작·주간 사후 논평·썸네일 변경 가능성. 공개 문화 주석만 허용 | [048 카드](../factors/048-all-in-tie-day-index/README.md) |

## 다음 실행 순서

1. 030의 HS·국가 바스켓과 공표일을 IS 안에서 고정한다.
2. 024·025·032의 공공 집계 장기 다운로드와 실제 공표시점을 확보한다. 027은 첫 직접 검증을 완료했으나 과거 빈티지 복원이 남아 있다.
3. 각 패널은 사양 동결 후에만 OOS를 한 번 실행하고, 결과를 [공유 매트릭스](2026-09-03-factor-validation-share.md)에 갱신한다.

현재 양쪽 구간에서 `|r| ≥ 0.10`으로 재현된 팩터는 없다. 이 장부는 그 결론을 뒤집기 위한 데이터 수집 목록이지, 없는 알파를 숫자로 채우는 문서가 아니다.

001–048의 수집 가능성·명시적 미수집 사유·이번 보완 시험은 [전 팩터 무료 데이터 완결 감사](2026-09-03-full-free-data-completeness-audit.md)에 기록한다.
