# 2026-09-03 — 22개 실물 원유 아이디어 수집·병합·검증 장부

## 실행 원칙

- 무료·공개·장기 원시 시계열을 우선한다.
- 각 관측치는 실제 공개 이후에만 사용하며, 공통 타깃은 다음 5거래일 `CL=F` 실현변동성이다.
- 상업 AIS·Kpler·Braemar·Enverus·Primary Vision 데이터는 무료 재현 데이터가 아니다.
- 개인·고객·기지 인접 상점·군 작전 추론 데이터는 수집·분석하지 않는다. 이는 피자인덱스 여부와 관계없이 개인 활동을 통해 배치·작전을 추론하는 경계다.

## 원안별 처리

| 원안 # | 아이디어 | 처리 | 무료 공개 데이터 / 현재 상태 |
| ---: | --- | --- | --- |
| 1 | China VLCC wait time | HOLD | 항만 대기 집계 장기 공개 패널 미확보; Kpler/Braemar는 상용 |
| 2 + 18 | Permian crude-by-rail / railcar loadings | 병합 HOLD | AAR 주간 rail traffic 후보, 원유 화차 분리·공개시점 검증 전 |
| 3 | Gulf Coast coker run rate | 041로 프록시 테스트 | EIA 전국 가동률 OOS 미통과; coker 고유 데이터 미확보 |
| 4 | Permian rig count | HOLD | Baker Hughes 공개 rig count 후보; 수집·공개일 고정 전 |
| 5 | rig efficiency | HOLD | EIA DPR 공개 프록시 후보; Permian 생산성 정의·빈티지 필요 |
| 6 | Cushing draw surprise | 038 실측 | IS/OOS 모두 가설 반대, HOLD |
| 7 | U.S. gasoline demand | 039 실측 | IS/OOS 거의 0, SKIP |
| 8 | Pentagon flight surge | 분석 제외 | 군사 작전 조기추론 경계 |
| 9 | base barbershop | 분석 제외 | 기지 인접 고객 활동·작전 추론 경계 |
| 10 | PX coffee line | 분석 제외 | 기지 인접 고객 활동·작전 추론 경계 |
| 11 | uniform buzzcut | 분석 제외 | 개인 외모·기지 활동·작전 추론 경계 |
| 12 | near-base steakhouse | 분석 제외 | 기지 인접 고객 활동·작전 추론 경계 |
| 13 | offshore floater utilization | HOLD | 상용 집계 의존; 무료 장기 대체 시계열 미확보 |
| 14 | frac crew | HOLD | 상용 crew count 의존; 무료 장기 대체 시계열 미확보 |
| 15 | oilfield service billing | HOLD | 상장사 분기 공시는 가능하나 집계·공개일 패널 미구축 |
| 16 | Singapore bunker demand | HOLD | MPA 월간 집계 후보; 빈도·공개일·WTI 매칭 전 |
| 17 | Forties flow drop | HOLD | 공용 사건/운영 데이터의 장기 재현 패널 미확보 |
| 19 | refinery flaring | 기존 018로 병합 | NASA FIRMS는 가능하지만 flare/가동률 식별 패널 미구축 |
| 20 | Gulf tanker demurrage | 기존 017로 병합 | AIS/상용 데이터; 공개 집계 장기 패널 미확보 |
| 21 | oil worker overtime | HOLD | BLS 월간 산업 hours 후보; 빈도·공개일 패널 구축 전 |
| 22 | SPR injection | 040 실측 | IS/OOS 부호 반전, HOLD |

## 수집된 실제 원본

`research/gathering/raw/2026-09-03-eia-weekly-core-probe/` 아래에 EIA API 응답 두 개(Cushing·SPR, gasoline·refinery utilization)와 실행 코드·결과를 저장했다. 원본 응답은 라이선스·용량 관리를 위해 GitHub에는 올리지 않고 `.gitignore`로 제외한다. 이 장부와 각 카드에 식별자·수집일·산식·결과를 남긴다.

