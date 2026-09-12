# 성찬님 전달 초안 (2026-09-13 갱신, 미발송 — 발송 전 확인용)

태환입니다. 최신 공통 연구 결과를 공유드립니다. 아래 수치는 로컬 export와
웹 요약에서 함께 확인한 2023년 회고 평가이며, 실시간 예측·공식 CAI·최종 OOS가
아닙니다. 교통+DMR 두 성분은 파일럿이며 최종 성분 결정이 아닙니다.

## 1) 기준 (삭제된 share 브랜치 대신 main 기준)

- 기준: 현재 `main`의 실험 코드 fingerprint와 아래 고정 config/참조 hash를 대조합니다. 기존 share 브랜치는 삭제됐습니다.
- 대표 재현: `research/experiments/cai/REPRODUCE_2019.md` → `reference/2019plus_20260912T013423Z/` → `research/indexes/091-cai-reproduction-20260913/verification.json`.
- 한 장 설명과 5분 발표 순서: `docs/cai/RESEARCH_BRIEF.md`, 웹 오프라인 요약 다운로드.
- 재현 안내: `research/experiments/cai/REPRODUCE_SENS.md`,
  `research/experiments/cai/REPRODUCE_PILOT.md` (프로젝트 상대경로).
- 참조 결과: `research/experiments/cai/reference/`의
  `pilot_20260911T130235Z`(교통 단독), `pilot_20260911T130219Z`(교통+DMR),
  `sens_20260911T132949Z`(A_62), `sens_20260911T132951Z`(B_31).
- 웹 요약: `app/app/data/cai-experiment-summary.json`.
- 코드 fingerprint: `79aff9062f62`.

## 2) 결과 (파일럿·2019 보강: 2023 평가 n=245 동일 / 민감도는 표본 별도)

- 교통 단독 파일럿: train 905행, 평가 245행(2023-01-03..12-21).
  시장 대비 CAI(동일가중) Δlog_loss +0.000022.
- 교통+DMR 파일럿: train 507행, 평가 동일 245행.
  동일가중 Δ +0.005668, 학습가중 Δ +0.013792.
- 민감도 A_62(train 507/val 245), B_31(train 476/val 232), 공통 232일 비교.
  C_0(당일)은 train 24/val 12로 사전 기준 미달·미학습입니다.
- 2019 보강(교통 12개월 추가): train 507→753행, 평가 245행 동일.
  동일가중 Δ +0.005668→+0.002401, 학습가중 Δ +0.013792→+0.004177.
  격차는 줄었으나 여전히 양수이며, CAI 추가 이득은 확인되지 않았습니다.
  (학습가중치는 DMR 쪽에 몰림 [0, 1]. 학습 표본이 달라 인과로 해석하지 않음.)

## 3) 지금 / 나중

- 지금: 코드·설정·아래 질문 3개의 방법 검토.
- 입력 확보 후: 두 파일럿과 62/31일 run/compare 수치 재현.
- 입력 CSV 2종은 미포함입니다(FHWA/EPA 재배포 문구 미확인 — 원출처 직접 취득).
- 2019 보강의 기존 로컬 ZIP 73개·DMR JSON 18개에서 입력을 재생성했고,
  두 입력 바이트와 모델 6종의 지표·가중치·계수·예측 해시가 일치했습니다.
  같은 환경 재현 run `20260912T233055Z`, 통합 안내 `REPRODUCE_2019.md`.
  성찬님 독립 재현·외부 원출처 재취득은 아직 확인되지 않았습니다.
  관련 경로: `research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json`.
- 가용일은 접수일(ECHO ValueReceivedDate) 기준이며 외부 공개일과
  동일시하지 않습니다. DMR 원관측은 월별 85건, 표본이 작습니다.
- 운영 반영 기록(회고 v0)과 독립 재현(대기 중)은 별개입니다.

## 4) 검토 질문 3개

1. 측정 의미: TMAS AVC040 전체차량 통행이 쿠싱 원유 활동의 무엇에 대응하는지,
   DMR DAILY MX(특정 시설 신고 유량)를 무엇의 대리변수로 볼 수 있는지.
2. 시점·반복사용: 접수일 기준 정렬과 validity 62/31일 재사용 해석이 타당한지.
3. 다음 가설: 2019 보강 후에도 격차가 양수인데, 다른 연도 보강·새 성분보다
   먼저 확인할 가설(예: 계절성·대표성 진단)이 무엇인지. 대표 재현 안내를 따라 실행했을 때
   환경·입력 해시·run_id·검증 helper 결과와 차이가 있었는지도 알려 주세요.
