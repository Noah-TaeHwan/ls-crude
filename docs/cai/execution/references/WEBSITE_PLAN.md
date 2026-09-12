# 쿠싱 액티비티 인덱스 — 웹사이트·대시보드 개편 기획서

**v0.5 · 2026-09-11 · 성찬님/태환님/구현 AI 검토용**  
**상태: 제안서 · 원격 반영/배포/팀 승인 미실행**  
기준 코드: `cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef` (조회 시 main)  
이 문서의 AS-IS는 최신 코드와 배포 메타데이터 기준입니다. 운영 화면 직접 확인은 성공하지 못했습니다.

## 01. 개편의 결론과 범위

**여러 연구 자료를 전시하는 사이트에서, CAI의 현재 값과 검증 근거를 보여주는 제품으로 전환한다.**

> 권고안: 기존 React Router 앱을 유지한다. 홈은 CAI 중심으로 바꾸고, 기존 자료 탐색과 CFAM 실험은 히스토리로 연결한다. 가상 목업을 운영 데이터로 교체한 것처럼 배포하지 않는다.

### 이번 기획의 기준

기준 버전은 main cecf1cf이다. 직전 기획이 본 73ea274 이후 CFAM 고정 가중치 화면이 별도 연구 폴더에 추가되었다. 이번 문서는 그 차이를 반영한 v0.5 개편 제안이다. UI v4는 화면 참고이고, 제품 운영·모델 성과의 근거는 아니다. [R01, R08]

| 확인 구분 | 결과 |
| --- | --- |
| 현재 코드 | 홈·헤더·라우트·리서치·쿠싱 관측·CFAM·WTI 조회·CI·AGENTS를 조회했다. 전체 레포 실행/감사는 아니다. |
| 배포 상태 | 확인 커밋의 Vercel 배포 차단과 CI 실패를 확인했다. 운영 alias가 가리키는 실제 build SHA는 미확인이다. |
| 직접 화면 | 운영 URL·Vercel 관리 URL은 웹 조회 실패, 컨테이너 HTTP는 DNS 실패였다. 사이트 장애라고 단정하지 않는다. 새 운영 캡처는 없다. |
| 문서 효력 | 팀 검토용 제안. 코드·README·AGENTS·배포·작업 원장의 원격 상태는 변경하지 않는다. |

### 완료 목표

방문자는 CAI의 값/기준일/산출 상태, WTI 가격과 예측 대상 기간을 먼저 읽고, 필요할 때 데이터와 검증 기록으로 이동한다. 팀은 동일한 문서와 작업 원장을 사용하고, 과거 연구를 삭제하지 않는다.

발표 목표는 기존 README의 2026-09-15 09:00 KST다. 구현·연구·배포 완료는 별도 상태로 관리하며, 마감 때문에 숫자나 독립 검증 구간을 만들지 않는다. [R17]

## 02. AS-IS 진단

**현재 상태는 운영 화면, 레포의 앱, 별도 연구 실험, 대화 목업을 구분해서 읽어야 한다.**

| 대상 | 코드에서 확인한 구조 | 개편 판단 |
| --- | --- | --- |
| 홈 / | 긴 연구 소개·보관/진행/통과 현황 → WTI → 다양한 연구 사례 [R02] | 소개·건수는 축소하고 CAI를 첫 정보로 승격 |
| 헤더 | 메인 / 리서치, 연구 데스크 브랜딩 [R03] | 대시보드 / 연구·검증 / 히스토리로 정리 |
| /research | 진행 후보와 접힌 과거 장부가 함께 존재 [R05] | 현재 CAI 연구와 과거 탐색을 분리 |
| 쿠싱 상세 | 점수 없음·판단 보류·다수 배경 자료 [R06–R07] | 기존 연구로 보존하고 새 CAI와 구별 |
| 별도 CFAM | WIKI·EIA·수동 점수, 고정 비중·결측 성분 재배분 [R08–R09] | 탐색 실험으로 보존. 학습 CAI로 자동 승격 금지 |
| 배포 파이프라인 | cecf1cf의 CI 실패 / Vercel blocked [R12–R13] | 운영 코드와 최신 main 일치 여부를 먼저 확인 |

### 핵심 문제는 정보의 소속이 불명확한 것

제품으로 보여줄 CAI, 시도 중인 후보, 과거 실험, 시장·기상 문맥이 같은 영역에 들어가면 방문자가 무엇을 만든 프로젝트인지 판단하기 어렵다. 디자인의 문제만이 아니라 데이터와 문서의 책임 구분 문제다.

### 새로 발견한 통합 이슈

앱은 여전히 점수 없음인데, 별도 CFAM 문서는 적용 가중치를 설명한다. 후자의 문서 변경만으로 앱 배포나 학습 완료가 되지 않는다. 전환 계획에서는 앱의 현행 상태와 CFAM 실험 상태를 따로 적고, 성찬님과 재사용 범위를 결정해야 한다. [R06, R08]

## 03. 개편 전략과 이동 원칙

**다시 만드는 것이 아니라, 기존 자산을 보존하면서 홈의 역할을 바꾼다.**

| 안 | 장점 | 한계 / 판단 |
| --- | --- | --- |
| A. 홈에 CAI 카드만 추가 | 변경량이 적음 | 탐색형 콘텐츠와 새 제품이 계속 섞임. 비권고 |
| B. 기존 앱의 IA를 점진 개편 | WTI·파서·원장·테스트 재사용, 한 제품 유지 | 호환 URL과 상태 계약 필요. 권고 |
| C. 별도 CAI 사이트 신설 | 화면 실험이 빠름 | CFAM/기존 앱/CAI 사이트 세 갈래가 고착. 발표 전 비권고 |

| 현재 자산 | 새 위치 / 처리 |
| --- | --- |
| WTI 일봉·서버 캐시 | 홈에서 유지. 모형 타깃용 완료 가격과 화면 마지막 봉을 구별한다. |
| ResearchSample의 수박·제주·도일·항만·철도·HLX·시정 등 | 히스토리의 과거 연구/관측 탐색으로 옮겨 연결한다. CAI 구성이라고 표시하지 않는다. |
| 쿠싱 기존 Busy Board·CFAM | 히스토리에서 버전·작성일·계산 방식·제한과 함께 연결한다. 원본 경로 유지. |
| 진행 후보 원장 | 원장은 하나로 유지. 현재 CAI 선택 목록만 연구·검증 기본 뷰에 노출한다. |
| v4 게이지·접기·날짜·히스토리 | UI 구조만 React 컴포넌트로 이식. 가상 값·독립 HTML 스크립트는 운영 로직으로 복제하지 않는다. |
| 모든 장문의 기본 설명 | CAI란? 또는 상세 근거로 이동. 해당 숫자의 데이터 상태는 항상 보인다. |

메뉴 이동은 원자료 폐기가 아니다. 히스토리는 날짜·결정·근거를 찾아가는 인덱스다. 현재도 갱신되는 비CAI 관측을 히스토리에서 보여줄 때는 “과거 연구 주제 / 현재 갱신 관측”을 구분한다. [R10–R11]

## 04. TO-BE 정보구조와 방문 흐름

**최상위 메뉴는 세 개로 고정한다. 공개 제품과 내부 작업 보드는 분리한다.**

| 경로 제안 | 방문 목적 | 기본 내용 |
| --- | --- | --- |
| / | 지금 무엇을 보여주나? | CAI 계기판·추이 → WTI 방향 → WTI 가격 |
| /research | 무엇으로 만들고 검증했나? | 현재 CAI 데이터 → 산식/버전 → 검증 결과 |
| /history | 어떻게 이 방향에 왔나? | 방향 전환 타임라인 → 과거 연구 검색 → 원문 |
| /observations/* | 기존 상세 관측 열기 | 기존 링크 유지. 현재 CAI 비구성 여부 안내 |
| /backtest | 기존 도구 접근 | 기존 경로 보존, 새 CAI 검증 성과와 혼용 금지 |

### 대표 사용자 경로

일반 방문자: 홈 → CAI란? → 필요한 경우 원천 데이터. 발표 평가자: 홈 → 검증 상태 보기 → 평가 기간·기준 모델·근거. 팀/AI: README → 현행 기획 → 작업 원장 → 정확한 태스크와 증거.

### 현재와 과거의 경계

현재 연구는 명시적인 CAI candidate ID 목록/manifest로 구분한다. “Cushing”이라는 키워드가 포함됐다는 이유만으로 모두 편입하지 않는다. 기각·보류·기존 모델 결과는 히스토리에서 보존하고 원래 판정을 유지한다.

### 헤더와 문구

제품명: “쿠싱 액티비티 인덱스”. 한 줄 설명: “쿠싱의 활동에서, WTI의 다음 움직임을 살펴봅니다.” LS CRUDE는 작은 팀 표기만 유지한다. 메뉴·h1·문서 제목에서 Desk를 제품명으로 사용하지 않는다.

> 내부 작업 관리 화면을 네 번째 공개 탭으로 추가하지 않는다. 작업 보드는 팀 운영 도구이고, 공개 히스토리는 근거와 의사결정을 보여주는 화면이다.

## 05. 화면 명세 — 대시보드

**첫 화면의 핵심은 점수, 기간, 가격이다. 설명은 접고 상태는 숨기지 않는다.**

| 모듈 | 기본 노출 | 세부 동작 / 상태 |
| --- | --- | --- |
| CAI 계기판 | 0–100 점수·눈금·바늘, 기준일, 전기 대비 변화, 산식 버전 | 반원형. 활동 척도이며 수익/공포탐욕 등급 아님. 결측이면 —·바늘 숨김; 실제 0이면 바늘 0. |
| CAI 추이 | 실제 이용 가능한 시계열·기간 | 같은 정의/버전의 과거 값만 연결. 소급 재계산은 별도 표시. 결측 구간은 끊는다. |
| CAI란? | 접힌 제목만 | 정의 → 관측 영역 → 동일/학습 비중 → 현재 검증 상태 → 상세 근거 링크. 코멘트 1·2 통합. |
| 다음 기간 WTI 방향 | 상승 / 하락·보합, 대상 날짜·주차, 모델·평가 상태 | 2분류 기본. 예측 미실행은 —. 확률 50%는 보합이 아니라 방향 불확실. |
| WTI 가격 흐름 | 가격·원단위·기준시각·전기 대비·차트 | 기존 WTI 컴포넌트 유지. 기간 전환·터치/키보드 값 확인. 실패는 마지막 정상 기준일을 보존. |

### 날짜와 화면 배치

표시 형태: 기준 YYYY년 M월 D일(Wn) → 평가 YYYY년 M월 D일(Wn), 대상 기간 별도. 실제 날짜는 확정한 거래일 배열에서 생성한다. 미국 시장일·ISO 주차와 조회 시각 KST를 섞지 않는다.

PC: 상단 CAI를 넓게, 예측을 좁게 배치하고 아래 WTI를 전폭으로 둔다. 모바일: CAI → 예측 → WTI의 단일 열. 작은 화면에서 날짜를 두 줄로 허용하고 숫자·단위를 자르지 않는다.

### 공개 확률의 승인 조건

실제 학습 산출물·모델 버전·예측 시각·대상 기간·데이터 품질과 공개 승인이 연결될 때만 모델 확률을 게시한다. 독립 검증 전이면 “탐색 모델·독립 검증 전”을 바로 옆에 표시한다. 가상 예시는 별도 데모에서만 허용한다. [R10, U01]

## 06. 화면 명세 — 연구·검증

**소스 목록을 늘어놓는 대신, CAI를 만드는 근거와 검증 질문을 보여준다.**

| 영역 | 보여줄 내용 | 완료 기준 |
| --- | --- | --- |
| 현재 연구 상태 | 자료 확보 / 지수 산출 / 가중치 학습 / 평가를 별도 표시 | “후보 있음”이 “지수 있음”이나 “검증 통과”가 되지 않음 |
| CAI 구성 데이터 | 채택·검토·보류 구분, 측정값·지역·주기·공통 기간·최신성 | 현재 지수의 실제 성분 수와 조사 후보 수를 구분 |
| 정의·가중치 | equal-weight / learned-weight, 산식 버전·고정일 | 1/n 공개. 학습 계수는 팀의 공개 정책에 따름 |
| 모델 비교 | 단순 기준 / 기존 정보 / 동일 CAI / 학습 CAI | 같은 타깃·기간·표본. Brier 등 지표 없으면 — |
| 실행 근거 | run ID·데이터 빈티지·코드 해시·표본·노출·동료 검토 | 실행하지 않은 학습·OOS를 완료로 표시하지 않음 |
| 추가 설명 | 전처리·결측·공개시점·모델·불확실성 | 모두 기본 접힘, 직접 링크 진입 시 해당 절만 펼침 |

### 데이터 상세의 핵심

측정값이 무엇인지 먼저 쓴다. 교통량과 사고 건수, 주문 수와 붐빔 라벨, 유량과 신고 건수는 다르다. 시장·재고·날씨는 활동 구성과 별도 통제/문맥으로 구분한다. 출처가 존재하는 것과 CAI 편입 적격성은 별도다.

### 공개 근거와 비공개 레포

현재 저장소는 private로 확인된다. 외부 방문자에게 비공개 GitHub 링크만 주지 않는다. 허용된 연구 요약·출처 메타데이터·평가 표를 웹에서 읽을 수 있게 제공하고, 제한 원문에는 “팀 내부 자료”를 표시한다. 원자료 공개 권한은 별도 확인한다. [R12]

슬라이더 실험실은 기본 홈에서 제거한다. 유지한다면 연구 탭의 접힌 “가상 예시”로 제한하고 공개 지수·과거 WTI·학습 결과를 바꾸지 않도록 격리한다.

## 07. 화면 명세 — 히스토리와 링크 호환

**기록의 원본을 옮기지 않고, 현재와 다른 연구 방향을 이해할 수 있게 연결한다.**

히스토리는 “방향·결정” 타임라인과 “과거 연구 찾기”를 한 화면 안에서 제공한다. 날짜, 당시 질문, 바꾼 이유, 당시 상태, 연결된 근거/커밋을 표시한다. 제안·합의·대체됨·기각을 구분한다.

| 현재 진입점 | 개편 후 처리 |
| --- | --- |
| /?sample=<기존 값>#research-sample | /history?sample=<동일 값>#research-sample로 보존. 지원 ID는 현재 SAMPLE_LINKS의 9개 값을 기준으로 검증. |
| /research?sample=<기존 값> | 기존 loader의 root 리다이렉트를 history로 교체. 이중 리다이렉트/루프 방지. |
| /research?candidate=<id> | CAI 현행 성분이면 research에서 열고, 그 외 기존 후보는 history에서 연다. 매핑 기준은 manifest. |
| /research#ledger, #history | 클라이언트 호환 처리 또는 명시 링크로 history로 이동. URL fragment는 서버 요청에 포함되지 않음. |
| /research#method, #intake | 새 연구 화면의 방법/데이터 위치에 호환 anchor 유지. |
| /observations/cushing-busy 등 | 기존 상세 경로 유지. 돌아가기 대상은 history의 동일 사례로 변경. |

### 자동 폐기하지 않는 항목

CFAM은 현장 관심/재고 문맥을 묶은 별도 탐색 사례로 표시한다. 고정 비중, 예약 비중, 실제 적용 비중을 구분한다. 새 CAI와 연결할 수는 있지만 이름만 바꾸어 동일 지수처럼 취급하지 않는다. 기존 실패·미통과 이유도 보존한다. [R08–R09]

### 유지보수 원칙

현재 사례의 직접 진입·브라우저 뒤로가기·검색 필터 상태를 테스트한다. 데이터 원장과 history를 복제한 두 번째 원장을 만들지 않는다. 히스토리는 원장/결정 기록을 읽어 보여주는 뷰로 둔다. [R05, R11]

## 08. 데이터와 화면 사이의 계약

**페이지가 학습·수집을 직접 실행하지 않는다. 검토된 산출물을 읽는 구조로 만든다.**

> 기존 수집/원장 → 정제·시점 정렬 → CAI 계산·학습·평가 run → 공개용 allowlist export → 서버 loader → 대시보드. 웹 방문이 원자료 재수집이나 모델 재학습을 유발하지 않게 한다.

| 객체 | 필수 필드 제안 |
| --- | --- |
| IndexSnapshot | index_id, definition_version, weighting_method, score(null 허용), as_of, computed_at, run_id, coverage, constituent_count |
| ForecastSnapshot | model_id, trained_run_id, generated_at, decision_cutoff, target_start/end, target_definition, classes, probabilities(null 허용), publication_approved |
| ValidationSummary | NOT_RUN/EXPLORATORY/INDEPENDENT_TESTED, sample_period, n, benchmark, metrics, oos_exposure, freeze_ref, review_ref |
| 공통 상태 | data_origin(OBSERVED/DEMO/NO_DATA), freshness(FRESH/STALE/ERROR), observed_at, available_at, retrieved_at, error_code |
| EvidenceLink | 허용된 원출처, 공개 요약 경로, run/commit, 접근 범위. 비밀키·서명 URL·제한 원문 제외 |

### CFAM 로직을 그대로 운영 CAI로 쓰지 않는 이유

현재 combine은 성분이 없으면 남는 비중을 재배분하고, 전체 비중이 없으면 0을 반환한다. fallbackBoard는 저장된 점수로 combine을 호출하고 tsUtc를 새 실행 시각으로 만든다. 이것을 새 CAI의 관측일/신선도 계약으로 그대로 사용하면 안 된다. [R09]

새 CAI에서는 결측을 0점으로 바꾸지 않는다. 필수 성분 누락 시 산출 불가 또는 사전 승인한 결측 규칙을 따른다. 구성 변경/재배분은 버전과 coverage에 기록한다. 캐시를 표시하면 원래 관측일을 보존하고 갱신 지연으로 표시한다.

WTI 조회에는 이미 마지막 정상 응답 시각을 보존하는 코드가 있다. 이 패턴을 재사용하되, 인스턴스 메모리 캐시가 장기 원본 저장소라는 가정은 하지 않는다. [R10]

## 09. 연구 워크플로와 제품 공개 조건

**지수 구축, 가중치 학습, 독립 평가를 서로 다른 완료 조건으로 유지한다.**

| 단계 | 작업 | 웹에서 말할 수 있는 것 |
| --- | --- | --- |
| 자료 판정 | 활동/관심/통제/구조 분류, 기간·권한·공개시점 | 현재 후보와 확보 상태 |
| 기준 CAI | 적격 성분 점수 변환·1/n·버전 고정 | 실제 지수·기준일·산식 |
| 가중치 학습 | WTI 방향 정답, 손실·제약·후보 수 사전 고정 | 학습 산출물 존재, 성과 인증 아님 |
| 내부 검증 | 개발 구간 내부에서 소수 조합 비교·선택 | 선택 근거와 개발 구간 결과 |
| 동결·최종 평가 | 모델·변환·코드 동결, 적격 OOS 보고 | 독립성 충족 여부·표본·실측 결과 |
| 게시 승인 | 원본→run→화면 대사·동료 검토 | 승인된 숫자와 정확한 상태 |

### 지수와 모델의 의미

CAI = Σ(wᵢ × sᵢ), sᵢ는 0–100점, wᵢ≥0, 합계 1. 동일 비중은 사람이 정한 기준선이고, 학습 비중은 명시한 WTI 타깃 오차를 줄이도록 추정한 실험 버전이다. 학습형을 실제 도시 바쁨의 정답으로 해석하지 않는다.

일반 회귀 계수나 중요도를 임의로 절댓값·100%로 바꾸지 않는다. 합계 1 제약과 혼합 부호 표현의 제약을 학습 설계에서 명시한다. 현재 CFAM의 고정 PINCH와 예약 가중치는 이런 학습 산출물이 아니다. [R09]

### 최종 시험을 고르는 곳으로 쓰지 않는다

학습 → 내부 검증에서 선택 → 최종 동결 → OOS 평가. 전처리도 학습 구간만 적합한다. 2024+를 이미 본 후보는 노출 상태를 보존하며, 날짜나 이름 변경으로 독립성을 복원하지 않는다. 기존 프로젝트 검정 규약을 유지한다. [M01, 기존 PRD v0.4]

주간 성분이 부족해 월간으로 전환하면 지수·타깃·표본 기준·화면 문구를 함께 결정한다. 월간 값을 복제해 주간 관측으로 부풀리지 않는다. 미실행·낮은 성능도 결과로 공개한다.

## 10. 코드 변경 범위와 단계적 이전

**새 프레임워크나 새 사이트를 만들지 않는다. 기존 앱 안에서 책임을 나눈다.**

| 기존 경로 / 제안 경로 | 변경 범위 |
| --- | --- |
| app/app/routes/home.tsx [기존] | CAI 중심 composition. 시정·탱커·과거 사례 조회는 history로 이동. WTI loader/차트 유지. |
| app/app/components/desk-chrome.tsx [기존] | 제품명·3개 nav·build 정보. 작은 팀 표기와 skip link 유지. |
| app/app/routes/research.tsx [기존] | 현재 CAI 선별 뷰·검증, 오래된 장부 뷰 분리. sample redirect 갱신. |
| app/app/routes/history.tsx [신규 제안] | 기존 ResearchSample/장부 재사용, 결정 타임라인·검색·옛 링크 처리. |
| app/app/routes.ts / lib/research-charts.ts [기존] | history 등록, SAMPLE_LINKS 매핑과 revalidation 호환 갱신. |
| app/app/components/cai/* [신규 제안] | 게이지 / 추이 / 예측 / CAI 설명 / 상태 표시를 작은 컴포넌트로 분리. |
| app/app/lib/cai-view.ts, cai-view.server.ts [신규 제안] | 공개 snapshot 검증과 읽기. 원자료/비공개 계수를 화면으로 전달하지 않음. |
| research/indexes/cushing-activity-index/<run>/ [제안] | 연구 정본·manifest·공개용 작은 산출물. 기존 INTAKE 규칙과 대조 후 경로 확정. |

기존 React Router loader/action 방식과 현행 의존성을 유지한다. v4 단일 HTML을 iframe으로 넣거나 SPA를 하나 더 만드는 방식은 기본안에서 제외한다. 데이터별 loader 실패를 분리해 CAI 오류가 WTI까지 비우지 않게 한다. [R14–R16]

### 이전 순서

문서·정의 합의 → history와 호환 링크 → snapshot 계약·빈 상태 → 홈/연구 화면 이식 → 실제 run 연결 → 프리뷰 검수 → 운영 alias 전환. 각 단계는 작은 PR로 검토하고 기존 경로를 삭제하지 않는다.

## 11. 실행 작업표와 의존성

**기존 tasks.json을 정본으로 유지하고, 아래는 확장 제안으로만 병합한다.**

| 작업 / 연계 ID | 범위와 완료 기준 | 착수 조건 |
| --- | --- | --- |
| OPS-01 | 운영 build SHA·Vercel 설정·CI 실패 원인 확인. 마지막 정상 배포와 rollback 기록 | 권한/실행 환경 확인 |
| DEC-01 · DEC-02 | CAI/CFAM 관계, 세 메뉴, 공개 정책, 역할·가용 시간 합의 | 팀 검토 |
| DATA-01 | 실제 후보 판정표, 필드·주기·기간·권한·시점 증거 | 최신 자료 read 가능 |
| REP-01 | 현행 기획 연결, README/AGENTS 입구 정리, 과거 문서 보존 | DEC-01 승인 |
| UI-05 / S1 | history 라우트·구사례 이동·URL 호환 테스트 | IA 승인 |
| UI-05 / S2 | CAI snapshot 계약·게이지·예측 빈 상태·반응형 | 필드 계약 승인 |
| UI-05 / S3 | CAI 연구 뷰·히스토리 타임라인·공개 근거 | S1·S2 |
| UI-06 | 실제 산출물·기간·최신성·누락/실패 상태 연결 | IDX-01·UI-05, 예측은 별도 학습/게시 승인 |
| QA-02 [추가 제안] | 코드 검사·옛 링크·수치 대사·공개 권한·화면 검수 | UI-06 또는 명시적 빈 상태 release |
| REL-01 [추가 제안] | 프리뷰와 운영 SHA 일치·rollback·오프라인 발표 | QA-02·OPS-01·게시 승인 |

### 작업 상태를 바꾸는 규칙

READY → DOING → REVIEW → DONE. DONE은 실제 파일·명령 출력·리뷰·화면 증거가 있을 때만. BLOCKED는 원인과 해제 조건을 적는다. 이번에 작성한 것은 기획 산출물이며 위 구현 작업을 완료 처리하지 않는다.

DATA-02 → RES-01 → IDX-01 → ML-01 → ML-02 → EVAL-01의 기존 연구 의존성은 유지한다. UI shell 작업은 승인 후 연구와 병행 가능하되, 실제 수치 연결은 해당 run이 생긴 뒤 한다. 담당은 기존 제안 역할만 유지하고 수락을 추정하지 않는다.

## 12. 검수·배포·발표의 통과 조건

**보기 좋은 화면과 검증된 연구, 성공한 배포는 각각 증거가 필요하다.**

| 검수 영역 | 수용 기준 |
| --- | --- |
| 정보구조 | 홈에 독립 관측 목록/장문의 검증 결론 카드 없음. CAI란?에 통합, 상태는 기본 노출. |
| 계기판 | 0·50·100·null, 범위 초과·비수치 검증. 숫자·바늘·접근성 값 일치. |
| 예측 | 모형 미실행은 —. 날짜/주차·class 정의·합계·반올림 대사. 모델 출력을 정확도로 표시하지 않음. |
| 시간·결측 | 미래 공개 자료 유입 없음, 결측 그래프 단절, stale 관측일 보존. 조회 시각으로 관측일 대체 금지. |
| 기존 기능 | WTI 차트·9개 기존 sample 링크·검색·깊은 링크·뒤로가기 보존. |
| 접근성 | 360·390·691·1280px에서 확인. 키보드 접기·focus·명시 label·차트 대체표·색 외 의미 제공. |
| 공개 범위 | 비공개 계수·키·제한 원자료가 loader 응답/JS bundle에 없음. public 근거 링크를 로그아웃 상태로 확인. |
| 배포 | 타깃 SHA의 CI·프리뷰·운영 footer build를 대조. 실패 시 마지막 정상 버전으로 복구 가능. |

### 실행할 기존 명령 — 이번 답변에서 실행한 것은 아님

app/: npm run typecheck → npm run build → .github/workflows/ci.yml의 지정 Node 테스트. research/: 원장 self-test/check, export check, 필요한 수집기 self-test, pytest. 새 CAI 테스트를 추가하면 CI 목록에도 명시적으로 연결한다. [R14–R15]

앱 브라우저 검수는 레포 AGENTS의 ego 규칙을 따른다. 이 환경에서는 해당 런타임이 확인되지 않아 앱 화면 자동 검수는 미실행이다. 다른 브라우저 도구로 조용히 대체하지 않는다. [R16]

### 마감 축소안

자료가 부족하면 실제 WTI + CAI 산출 대기 + 확보/차단 근거 + 히스토리로 발표한다. 학습 완료·독립 검증 전이면 그 상태를 표시한다. 운영 배포가 막혀도 검토된 로컬/오프라인 결과는 별도 준비한다.

## 13. 문서 체계와 다음 AI의 진입점

**문서를 더 쌓기보다, 각 문서의 책임과 우선순위를 고정한다.**

| 문서 | 책임 |
| --- | --- |
| README.md | 제품 1문단·현재 상태·실행 방법·문서 길잡이. 일별 긴 기록은 history로 연결. |
| docs/cai/PRD.md | 제품 목적·범위·연구 개념의 기준. 기존 v0.4를 팀 승인 후 개정. |
| docs/cai/WEBSITE_PLAN.md [제안] | 본 v0.5의 화면·IA·이전·검수 규격. PRD를 복제하지 않고 연결. |
| docs/testing-protocol.md / research/INTAKE.md | 통계 검정 / 수집·저장 경계의 정본 유지. |
| docs/cai/DECISIONS_AND_HISTORY.md | 제안/승인/대체/기각 구분, 근거 커밋. 과거 원문 삭제 금지. |
| docs/cai/tasks.json | 단일 작업 원장. Markdown/보드는 파생. 이번 확장 표는 승인 후 병합. |
| AGENTS.md / docs/cai/AI_WORKFLOW.md | 도구·읽기 순서·파일 소유·중단·검증·인계 계약. 별도 AI별 규칙 중복 방지. |

### AI 작업 지시의 최소 내용

태스크 ID와 목표, 최신 base SHA, 읽을 문서, 소유 파일, 변경 금지 영역, 입력 run, 완료 기준, 검증 명령, 승인 필요 항목을 함께 전달한다. 작업 후 변경 파일·명령 실제 출력·증거·남은 문제·다음 작업을 남긴다.

### 도구 운용

이번에는 GitHub 연결로 읽기, Superpowers의 기획/검증 절차로 구조화했다. ECC·Ponytail·Agency Agents·Vercel 직접 도구는 이 세션에서 실행 연결을 확인하지 못해 실제 실행하지 않았다. 다음 환경에 있더라도 먼저 확인하고 기존 AGENTS의 권한·파일 소유권 규칙을 우선 대조한다.

> 다음 의사결정: ① 기존 앱 점진 개편, ② 대시보드/연구·검증/히스토리, ③ CFAM을 별도 탐색 이력으로 보존, ④ 실제 run 기반 게시, ⑤ 기존 링크 보존. 승인 후 문서 PR과 history/상태 계약부터 시작한다.

## 근거와 조회 범위

- **R01. [최신 main 확인](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)** — 확인 시 main: cecf1cf. 커밋 시각 2026-09-11 10:41:24 KST. 이후 변경은 재조회 필요.
- **R02. [홈 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/home.tsx)** — home.tsx 반환 내용 확인. 연구 소개·장부 현황, WTI 일봉, ResearchSample. 홈 loader가 시정·탱커·쿠싱 날씨도 읽음.
- **R03. [공통 헤더·푸터](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/components/desk-chrome.tsx)** — 전체 조회. 메인/리서치 두 메뉴, 팀·build SHA/branch/dirty 표시.
- **R04. [라우트 설정](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes.ts)** — 전체 조회. /, /research, /backtest, 4개 observations 라우트. /history는 등록되어 있지 않음.
- **R05. [리서치 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/research.tsx)** — 1–210행 요청의 반환 범위 확인. 진행 후보·접힌 과거 장부·검색·판정 필터·근거·sample 리다이렉트.
- **R06. [쿠싱 상세 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/cushing-busy.tsx)** — 전체 조회. 제목과 문구가 현장 활동 보드·점수 없음. CushingObservation 공유.
- **R07. [쿠싱 관측 컴포넌트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/components/cushing-observation.tsx)** — 1–150, 270–390, 391–495행 요청의 반환 범위 확인. 다수 고정 원자료 import, 판단 보류와 90일/80% 조건. 전체 파일 감사 아님.
- **R08. [최근 CFAM 변경](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)** — 변경 목록·diff 확인. 연구 문서와 별도 web/cfam.html, cfam-engine.ts 추가. 앱 홈 변경 커밋으로 해석하지 않음.
- **R09. [CFAM 계산 엔진](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/research/programs/cushing-busy/web/cfam-engine.ts)** — 커밋 diff와 170–247행 조회. 수동 PINCH, 잔여 비중 재배분, fallback 상수, 실행 시각 생성. ML 학습 코드가 아님.
- **R10. [WTI 서버 조회](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/lib/wti-daily.server.ts)** — 전체 조회. Yahoo CL=F 5년 일봉·1분 인스턴스 캐시·3.5초 timeout. 실패 시 마지막 정상 자료의 시각 보존.
- **R11. [기존 사례 URL·파서](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/lib/research-charts.ts)** — 1–115행 조회. 9개 SAMPLE_LINKS와 검증 함수. query-only 전환 시 시장 재조회 억제.
- **R12. [Vercel 커밋 상태](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)** — GitHub status API 확인: Vercel failure / Deployment was blocked, 2026-09-11 10:41:28 KST. 세부 원인·운영 alias는 미확인.
- **R13. [GitHub Actions 실행](https://github.com/Noah-TaeHwan/ls-crude/actions/runs/34551671564)** — ci #591: completed/failure. app/research job 모두 failure. step/log 원인 판독 미실행.
- **R14. [CI 정의](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/.github/workflows/ci.yml)** — 전체 조회. Node22·Python3.12, typecheck/build, 8개 지정 Node test, 연구 원장 검사·pytest.
- **R15. [앱 패키지](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/package.json)** — 전체 조회. React Router 8, React 19, Tailwind 4, Vite 8. 현재 의존성 변경 제안 없음.
- **R16. [AI 작업 규칙](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/AGENTS.md)** — 전체 조회. loader/action 패턴, 원장 규칙, ego 전용 브라우저, 파일 소유권·위임 제한.
- **R17. [프로젝트 README](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/README.md)** — 1–26행 조회. 기존 탐색형 목적·팀·2026-09-15 09:00 KST 마감. 표시된 과거 원장 수는 재집계하지 않음.
- **M01. [모델 선택과 최종 평가](https://scikit-learn.org/stable/modules/cross_validation.html)** — 학습·내부 검증·시험 구간 분리, 변환은 학습 자료에만 적합한다는 원칙 참고.
- **U01. [접기 접근성](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)** — 접기 컨트롤의 키보드·확장 상태 전달 요구 참고.
- **O01. [Vercel Git 배포](https://vercel.com/docs/git)** — 계정·저장소·작성자 권한 점검의 일반 참고. 이 프로젝트 차단 원인 확정 근거가 아님.

**대화 근거:** 사용자 UI 코멘트 1–7, v4 PRD·TEAM_REVIEW·tasks.json. 이는 사용자 요구/이전 계획의 근거이며 실제 운영·모델 성과의 근거가 아닙니다.
