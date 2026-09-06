# Glassnode 무료 티어 적격성 스크린 — 폐기

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-06 |
| 상태 | 폐기 |
| 작성 | 에이전트 |
| 관련 출처 | Glassnode 공식 문서·약관·요금제 |

## 한 줄 가설

Glassnode 무료 티어(Standard Free)의 온체인 집계 지표가 WTI 변동성 연구의 후보 입력이 될 수 있는지 적격성만 본다. 무료 티어로는 2015–2023 일별 집계 시계열을 반출할 수 없고, 개인 전용·재배포 금지 라이선스와 불변 빈티지 부재가 겹쳐 후보 입력으로 쓸 수 없다는 가설이었다.

## 크립토의 뭐 × 뉴스의 무슨

| 쪽 | 내용 | 아직 없음 |
| --- | --- | --- |
| 크립토의 뭐 | 전 체인·집계된 대형 전송량/거래소 순유입/스테이블코인 유동성 후보 (002의 전제) | 아니오 |
| 뉴스의 무슨 | 사용자 제공 CSV에서만 공개 거시·원유 사건의 통제 맥락 | 아니오 |

둘 다 말해질 것처럼 보여도, 무료 티어 반출 경로가 막혀 있으므로 [`pizza-hunt.md`](../../notebooks/pizza-hunt.md)에 행을 만들지 않습니다.

## 본문

### 본 것 (링크, 확인일 2026-09-06)

- Glassnode Docs FAQ: Standard (Free) 계정은 Basic(T1) 메트릭을 24h 해상도로 본다. 전체 API는 Professional 전용, Advanced는 제한된 Light API만. 다운로드 가능한 JSON/CSV는 Professional 전용: [https://docs.glassnode.com/further-information/faq](https://docs.glassnode.com/further-information/faq)
- Glassnode Docs API Setup: Light API(Advanced 가입자용)는 14일 히스토리·일별(`1d`) 해상도·일 50콜 상한·bulk 미지원: [https://docs.glassnode.com/basic-api/api](https://docs.glassnode.com/basic-api/api)
- Glassnode Studio 약관(2026-05-21): strictly personal, revocable, non-transferable 라이선스. 배포·서브라이선스·재판매 금지, 상용 목적 사용 금지(명시적 허용 제외), 파생물·복제·스크래핑 금지. Advanced는 개인·비상업용, Professional은 사업용이며 재배포 권리는 별도 구매: [https://studio.glassnode.com/terms-and-conditions](https://studio.glassnode.com/terms-and-conditions)
- Glassnode Docs Point-in-Time Metrics: 일반 메트릭은 사후 변경 가능(클러스터링 재계산·지연 보고·수정). PIT는 append-only 불변 스냅샷이나 `computed_at` 추적은 2024-09부터, 전 메트릭 PIT 커버리지는 2025-07부터이며 추적 시작 전 과거의 PIT 히스토리는 없음. 요금표에서 Point-in-Time Metrics는 Advanced에 없음(Professional 기능): [https://docs.glassnode.com/data/point-in-time-metrics](https://docs.glassnode.com/data/point-in-time-metrics)

### 확인 결과

1. **무료 티어로 2015~2023 일별 집계 시계열을 가져갈 수 있는가**: 아니오. 무료 티어는 Studio 화면 조회용(Basic, 24h)이며, API 전체도 다운로드(JSON/CSV)도 Professional 전용이다. 유료 Advanced의 Light API조차 14일 히스토리·일 50콜이라 2015–2023 반출이 안 된다.
2. **라이선스·재배포·저장 조건**: 개인 전용·양도 불가·재배포 금지. 연구용 집계값 보관·팀 공유·재배포는 무료 티어 권리로 불가. 재배포 권리는 Professional 별도 구매 사항이다.
3. **공개시점·개정(vintage) 정책과 look-ahead 위험**: 일별 메트릭은 집계 구간 종료 뒤 수 분~수 시간 내 공개되나, 클러스터링 전체 재계산(매일 00:30 UTC 시작)으로 과거값이 사후 수정된다. 불변 PIT 빈티지는 Professional 전용 + 2024-09 이후 추적분만 있어, 무료 티어는 현재 개정값(current vintage)만 본다. look-ahead 위험 있음.
4. **WTI 공개신호로서의 메커니즘 한 줄**: 없음. 전 체인 집계 유동성 스트레스가 WTI 변동성에 선행한다는 검증된 공개 메커니즘은 확인되지 않았다. 기껏해야 동시점 위험선호 동조(risk-on/off 공조) 해석이 한계이며, 002·008 노트가 지적한 귀속 문제(국적·의도·제재 귀속 불가, 거래소 간 이동·마켓메이킹·보관 이동 혼입)가 그대로 남는다.

### 안 본 것

- 무료 Studio 화면에서 2015–2023 구간이 눈으로 보이는지(반출이 막혀 연구 입력 적격성과 무관하므로 확인하지 않음).
- Professional 요금·크레딧 단가 (유료 경로는 이 스크린 범위 밖).
- 개별 메트릭(Basic T1 목록)의 2015년 커버리지 (반출 불가이므로 확인하지 않음).
- Investing.com 사이트. 스크래핑하지 않음.

### 기존 Oil Slice(`000`)와 다른 점

Oil Slice는 사람이 받은 CSV 헤드라인 횟수로 매일 쌓이는 공개 신호 초안이다. 이 축은 외부 상용 집계 API 의존이며, 무료 티어에서는 반출·보관·빈티지 세 조건을 모두 못 넘는다. 실험 카드로 올리지 않는다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` (이 판정에서 받지 않음) |
| 뉴스 출처 | 사용자 제공 CSV만. Investing.com을 긁지 않음 |
| 라이선스 | Glassnode 약관: 개인 전용·양도 불가·재배포·상용·복제·스크래핑 금지. 무료 티어 저장·공유 불가. 재배포 권리는 Professional 별도 구매(«모름»: 별도 구매의 구체 조건은 미확인) |
| 발표 지연 | 일별 메트릭은 구간 종료 뒤 수 분~수 시간 내 공개이나, 클러스터링 재계산으로 사후 수정. 무료 티어의 정확한 최초 공개시각 로그는 «모름» |
| look-ahead | 있음. 무료 티어는 현재 개정값만 보며 불변 PIT 빈티지 없음. 발표 시점 이후 사용 원칙을 지킬 수단이 없음 |
| 본 기간 | 2015-01-01~2023-12-31 일별 집계 시계열을 무료 티어로 반출 불가 |
| 아웃샘플을 봤나 | 아니오. 2024-01-01 이후 구간으로 후보를 판단하지 않음 |
| 성과 숫자 | 없음 (지어 내지 않음) |

## 다음 한 가지

폐기를 유지한다. Glassnode 무료 티어는 후보 입력 경로에서 제외하고, 점수·가중치·실험 카드를 만들지 않는다. 유료 Professional 경로는 이 노트에서 판단하지 않는다.
