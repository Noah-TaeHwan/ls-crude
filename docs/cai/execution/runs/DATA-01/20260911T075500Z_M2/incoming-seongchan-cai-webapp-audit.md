# 수신물 감사 — 성찬님 `cai-webapp` (2026-09-11)

수신: `/Users/noah/Downloads/cai-webapp` (2.3MB, git 아님, `.env`·키 없음). 원본은 수정·복사하지 않음.
성격: **별도 스택의 CAI 프로토타입 앱 + 연구 변형 스캐폴드 모음.** 우리 M1 앱의 대체물이 아니라
연구 입력·후보 자료로 평가한다.

## 1. 정체

- README: “CAI — Cushing Activity Index (all-in-one web app). Not a WTI forecast. Not alpha.”
- 스택: TanStack Start + Vite, PGlite/better-auth, PINCH/CFAM 엔진(`src/lib/cfam-*.ts`),
  standalone `public/cfam.html`(11.6KB), dev 명령 `vite dev --host 0.0.0.0 --port 8080`.
- 라이브 소스(cfam-field.ts): KUSH RSS, ADS-B(adsb.lol), SPP LMP, ODOT AADT ArcGIS,
  Open-Meteo AQI, EIA 주간 재고, 시의회 agenda, Yahoo CL=F.

## 2. 실제 데이터 vs 스캐폴드 (감사 결과)

| 산출물 | 실체 | 실측 시계열? | 판단 |
|---|---|---|---|
| `src/lib/*` 엔진 | 라이브 보드 로직(PINCH, echo cap 3%) | 런타임 fetch(동결 패널 없음) | **참고용** — 병합 안 함 |
| `public/cfam.html` | 독립 보드 | 라이브 | 참고용 |
| parking / waste / childcare / lodging / salon / laundry / equipment / airport / SPP / alt-proxy / CCEDI / HSCI / CMCI / CPSRTI / CAAI / CEPI / CERSI / CHAI / CHHMI / CLGI | `.py` 엔진 + 자기 테스트 리포트(“FINAL”) | **없음** — 자기 테스트·합성 중심 | 전방 수집 스캐폴드 |
| `childcare-real/…registry_2026-09-11.csv` | 시설 6곳 레지스트리 | 아님(명부) | 참고용 |
| `childcare…pickup_log_template.csv` | 빈 템플릿(0행) | 아님 | 전방 수집용 |
| `cushing-alt-proxy-v4-daily_factor.csv` | 70행(2026-01~03) | 경계: 초기 행이 **0.0 채움** | **사용 보류** — “missing≠0” 규칙 위반 소지 |
| `spp-cushing-v4/v4_benchmark_report.json` | synthetic_rows 110,880 명시 | 합성 | 성능 해석 금지 |
| `crbi-v5/FHWA_TMAS_2011_2025_manifest.csv` | FHWA URL 195개(다운로드 계획) | 아님 | **유망 후보**: 획득 승인 시 자료원 |
| crew-lodging `sample_snapshot.json` | 샘플 | 아님 | 참고용 |

## 3. 우리 작업과의 관계·충돌

- **제품 앞단**: 우리 M1 React Router 앱(승인·검수 완료)을 유지한다. 이 앱으로 교체하는 것은
  아키텍처·제품 결정이며 이번 승인 범위 밖.
- **이름 충돌**: 이 앱의 `src/lib/cai-view.ts`는 우리 PUBLIC_VIEW v1과 다른 자체 분류(관심/재고/…).
  병합 시 혼동 위험.
- **역할 정합**: 이 앱의 분류는 우리 CAI 공개 역할(활동/관심/통제)과 유사하나, 우리 계약·문서로
  재정의하기 전에는 채택하지 않는다.
- **M2 결정에 미치는 영향**: M2의 “물리 활동 계열 없음” 결론은 유지된다(실측 시계열 부재).
  다만 옵션 B(물리 활동 유지)의 첫 실행이 구체화된다 → **TMAS 교통량 획득·파싱**(공식 FHWA,
  2011–2025 URL 목록 제공). 다운로드·엔진 실행은 신규 수집이라 별도 승인 필요.
- **금지 준수**: 이 앱을 설치·실행하지 않았고(`npm install`·dev 금지), 다운로드·계산·성능 해석 없음.

## 4. 이어서 하는 방법 (권고)

1. **제품 유지**: M1 로컬 앱·5173 프리뷰 그대로. 이 수신물은 리서치 입력으로만.
2. **M2 결정 갱신**: 옵션 B에 “1단계: FHWA TMAS Cushing 인근 연속교통 획득·파싱(월/일 시계열)”을
   명시. 옵션 A(고용 기준선)는 그대로.
3. **선별 반입(승인 후)**: 실측·권리 검증이 끝난 항목만 `research/`로 옮긴다(예: TMAS manifest·
   파서). 성찬님께 각 엔진의 실제 관측 데이터 유무와 라이선스 확인 내역을 요청.
4. **하지 않을 것**: 스택 병합, 0-채움 CSV 사용, 자기 테스트 리포트를 검증 완료로 표기,
   synthetic 벤치마크 성능 해석, 원본 복사·커밋.

## 5. 성찬님께 확인할 것 (발송 전 사용자 승인)

> 받은 `cai-webapp`는 앱보다 연구 스캐폴드 성격이 강해서, 우리 쪽은 (1) 제품은 기존 검수된
> React Router 앱 유지, (2) 연구는 실제 관측 데이터가 있는 항목만 선별 반입, (3) 물리 활동
> 옵션의 첫 단계로 FHWA TMAS 교통량을 검토하는 방향입니다. 질문: ① parking/waste/childcare 등
> 중 실제 관측 데이터가 이미 쌓인 엔진이 있나요? ② FHWA·SPP 등 각 소스의 이용·재배포 조건을
> 확인한 범위가 있나요? ③ 라이브 `cfam.html` 보드를 공개 화면에 쓸 계획인지, 연구 샌드박스로
> 둘지 알려주세요.
