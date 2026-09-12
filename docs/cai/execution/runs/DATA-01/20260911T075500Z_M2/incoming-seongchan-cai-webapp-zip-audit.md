# 수신물 감사 (후속) — `cai-webapp-all-in-one.zip` (2026-09-11)

## 0. ZIP 확인

- 경로: `/Users/noah/Downloads/cai-webapp-all-in-one.zip`
- SHA-256: `68d0175af3106a53e8612025544271acb5de3ac88cab801c018e38215d77a64e` — **전달 해시와 일치**
- 무결성: `unzip -t` OK · 236 files · 심볼릭 링크 0 · 경로 이탈 0
- 안전 추출: `/tmp/cai-webapp-intake-68d0175a/` (원본 ZIP 미수정)
- **기존 수신 디렉터리와 동일 버전**: `diff -rq /Users/noah/Downloads/cai-webapp …` → 차이 0
  → 이전 감사(`incoming-seongchan-cai-webapp-audit.md`)를 그대로 유효한 것으로 재사용.
- README/INSTALL 명령·npm/dev/build/migrate/startup.sh·크롤러/다운로더 **미실행**.

## 1. 외부 리뷰어 지적 재확인 (통합 판단에 필요한 코드만)

| 항목 | 재확인 결과 | 근거 |
|---|---|---|
| B. echo 상수 | 실측 없음 상태의 상수/echo 확인: S42·ALT42·P22·WASTE28·HSCI30·CPSRTI28·CAAI30·CEPI28·CHAI36·ADSB22, 전부 `echo: true`(“관찰 파일 없음·실측 없음”) | `src/lib/cfam-engine.ts:84–108` |
| B. fallbackBoard | 기본 경로가 점수(예: 39.4)와 적용 항목 수를 반환 — **진단 경로**이며 실제 쿠싱 점수 아님 | `get-cfam-board.ts` 경로(코드 판독) |
| D. eiaWeekly 상한 | `last.t - p.t <= 5년`만 있어 **미래 행이 통과** (상한 조건 부재) | `cfam-engine.ts:258,280` |
| D. history | 날짜 키 없이 최근 n개 + 현재 pinches/explain 재사용 → 과거 검증 재사용 금지 | `cfam-engine.ts` history 경로 |
| D. ADS-B | 36회 호출 평균(`ADSB_AVG_N=36`), 라벨 “지난달 평균” — 관측시각·집계창 불일치 | `cfam-field.ts:94,108` |
| C. ML 목표 | y = 자동 성분 z평균, Ridge+MLP로 잔여 비중 — **WTI 학습 아님** | `cfam-ml.ts` `explainWeights` |
| E. 방향 카드 | `oneShotWti`는 최근 1주·4주 부호 규칙(“학습 아님. CAI→유가 아님”) | `src/lib/wti-oneshot.ts` |
| A. 원문 의도 | “0–100 Cushing activity observer. Not a WTI forecast. Not alpha.” | `CAI-v1-README.txt` |

## 2. 연구 자산 분류 (18개 폴더 — 18개 실측 시계열 아님)

| 유형 | 자산 | 실측 시계열? |
|---|---|---|
| 실제 원자료 | **없음** | — |
| 정적 구조 | CERSI 정적 카탈로그(`verified_static_catalog_2026-09-11.csv`, 지점·서비스 지역), childcare 시설 명부(6곳) | 아님 |
| 수집 경로·다운로더·파서 | **CRBI v5**(FHWA TMAS 매니페스트 195행=URL 목록 + downloader/legacy 13-class 파서), SPP v4(포털 file-browser API), CERSI snapshot recorder, CHAI v3(DMR) | 아님(경로만) |
| 입력 템플릿 | CAAI flight-history template, CERSI rental snapshot template, childcare pickup log(0행), crew lodging `sample_snapshot.json` | 아님 |
| 합성/데모 | CCEDI sample(README “synthetic/demo” 명시, 625행), SPP v4 benchmark(`synthetic_rows 110,880`), alt-proxy daily CSV 70행(초기 0-채움) | 아님 |
| 계산 엔진 | `src/lib/cfam-*`(PINCH·field·ML), 각 `.py` | 엔진 |
| 테스트·결과 | `*_test_report.json`/validation(PASS) — 엔진 단위 테스트 | 검증 주장 아님 |
| 중복 표시 | SPP v3/v4(같은 계열 버전), CMCI는 하위 성분 합성(구성 중복), alt-proxy v4(버전) | — |

특기: CRBI 매니페스트는 URL 목록, CERSI 카탈로그는 정적·“catalog≠live inventory” 명시,
childcare 명부는 하원 관측 아님, 공항·굴착·세탁 템플릿은 EXAMPLE/빈 입력.
`REAL/FINAL/PASS` 라벨만으로 실증 상태를 확정하지 않음.

## 3. 우선순위 (실제 자료 확보 가능성 기준)

1. **CRBI v5 / FHWA TMAS** — 쿠싱 인근 연속교통(2011–2025, 공식 URL 195개). 물리 활동의 첫 실측 경로.
2. **CHAI v3 / DMR** — 기존 우리 DMR JSON과 입력 계약 비교가 다운로드 없이 가능(감사만, 점수 계산 금지).
3. **SPP v4** — 지역 전력 혼잡 역사 자료 경로(노드·기간·약관 확인 필요).
4. 기존 M2 후보(LAUE)는 여전히 **즉시 계산 가능한 유일한 로컬 월간 계열**(단일지표).

기존 성과·OOS·benchmark 숫자는 우선순위에 사용하지 않음(합성 자기 테스트).

## 4. 재사용/비재사용 결정

- **스펙·계약 수준 즉시 참고**: TMAS 매니페스트+파서 설계, CHAI↔DMR 입력 매핑 개념.
- **수정 후에만**: eiaWeekly 상한, history 날짜키, ADS-B 창/라벨 — 우리 쪽 이식 시 필수.
- **데모/별도 실험으로만**: CFAM 라이브 보드, parking/waste/childcare/lodging 등 수집 스캐폴드.
- **사용 금지(화면·검증)**: echo/seed 상수(산출 대기 대체 금지), `oneShotWti`(방향 카드 대체 금지),
  alt-proxy 0-채움, synthetic benchmark 수치, seed 문구의 기관 발표 인증.

## 5. 추천 갱신 (M2 후속)

**NEED_TARGETED_DATA** — 첫 실제 데이터 작업: **FHWA TMAS 쿠싱 인근 연속교통 획득·파싱 run**
- 대상: TMAS 연속교통 관측소 중 쿠싱 반경 내(예: ≤40km) 최소 1곳의 2015–2025 월/일 교통량.
- 출처: 매니페스트의 공식 `fhwa.dot.gov` ZIP URL(2011–2025). 이용 조건을 run 첫 단계에서 확인.
- 산출물: 정제 시계열(일/월) + 수집·파싱 receipt + 결측·단위 노트. 앱 미연결.
- 중단 조건: 공식 URL 비공개·약관 불명, 반경 내 유효 관측소 0곳, 2015+ 연속성 미달.
- 동봉(다운로드 없음): CHAI v3 ↔ 기존 DMR 입력 계약 감사(단위·통계기준·시설 매핑 표).
- 성찬님 확인 3건: ① ZIP 밖 실제 수집 파일·공개시점 기록 보유 여부, ② echo/seed 점수의 원관측·날짜,
  ③ 관측 지수와 향후 WTI 검증의 관계·해당 Git 커밋/브랜치.
