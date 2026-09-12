# 수신물 인수 기록 — `CUSHING_LIBRARY_ACTIVITY_CONTROL_V2_ROBUST_bundle.zip` (2026-09-11)

## 확인 (최소 대조, 전체 감사 아님)

- 경로: `/Users/noah/Downloads/CUSHING_LIBRARY_ACTIVITY_CONTROL_V2_ROBUST_bundle.zip`
- SHA-256: `003ec8c11e04090832cc5865b504e131936840469ab372aba65de896e9f7902c` — **전달 해시와 일치**
- 구성: 11개 파일(엔진 py 1, README 2, test report 2, CSV 5, template 1)
- 스키마 대조: `CUSHING_LIBRARY_SOURCE_MANIFEST_FINAL.csv`에 **available_at 열 없음**
  (source_id·tier·publisher·title·url·verified_on·effective_from/to·use·reliability 10열, 5행).
  `CUSHING_LIBRARY_CONTROL_V2_sep2026.csv` 30행, `point_in_time_usable` 전부 **False**.
- 외부 리뷰: 일정 기반 COMMUNITY CONTROL/CONTROL_ONLY, 2026년 이벤트·반복 규칙이며
  실제 방문객 관측이 아님. self-test·무작위 조건 2000회 PASS는 **코드 테스트**이지
  예측력 검증이 아님(재실행하지 않음).

## 역할·처리 규칙 (고정)

- CAI 산업활동 성분에 **가중치 부여 금지**.
- 2015–2023 입력에 2026년 일정 **소급 적용 금지**.
- 연간 방문객 수를 일별로 나누어 만들지 않음.
- confidence 점수를 통계적 확률·모델 정확도로 해석하지 않음.
- "지역 행사 때문인 활동일 수도 있다"는 **반증·통제 사례**로 보존.
- 실제 기간·시점이 호환될 때만 통제 입력 활용을 별도 검토.
- 프로그램·config에 pin하지 않음(현재 연구 모드: RETROSPECTIVE_RESEARCH에서도 입력 아님).

원본 ZIP·추출물 미수정, 코드 미실행. 전체 감사 없음(중복 감사 금지 준수).
