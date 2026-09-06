# Arena식 디자인 고도화 — 기획·준비 (PLAN)

작성: 2026-09-06. 상태: 준비 완료, 미착수. 이 파일이 정본이다.

## 목표

발표용 임팩트와 데이터 정직성을 동시에 잡는 인터랙티브 대시보드.
벤치마크(Arena)식 진행: **두 방향안을 뽑고 비교·채택**한다. 투표 기준은 대중표가 아니라
당사자 채택 + 실데이터 정합이다.

## 범위 IN

- 화면: `/` 홈, `/research` 연구 장부 (라우트 추가 없음)
- P1 (정적 데이터로 완성): 시간 범위 전환, 지표 토글(rv5/rv20/백분위), 방법 expander,
  장부 테이블 정렬·필터
- P2 (설계 후): Oil Pulse 파형 + 팩터 드릴다운 (`docs/ui-design-oil-pulse.md` 기반)
- A안 "관측소": 현 구조 유지 + 밀도·타이포·차트 polish
- B안 "Oil Pulse": 파형 + DEFCON 게이지 전면

## 범위 OUT (위반 불가)

- `/backtest` 신설, 웹에서 백테스트 실행 (`docs/local-backtest.md`)
- 미검증 신호(Slice 등)를 변동성 게이지에 혼합. 후보 요소는 "연구 후보·예시" 딱지 유지
- 라이트테마·신규 페이지·실시간 소켓·알림 (일봉 데이터에 과함)
- 성과 숫자(샤프·MDD·적중률) 생성. 모든 수치는 스냅샷 실값에만 바인딩
- `useLoaderData`/`useActionData` 사용 (AGENTS.md)

## 데이터 계약 (디자인 재료 — 전부 실값)

- `app/public/wti-market-snapshot.json`: 최근 60봉 OHLCV, rv5·rv20·백분위,
  provenance(행수·SHA), freshnessPolicy(36h·4d). 일봉이라 P1 인터랙션은 클라이언트 계산으로 충분
- `app/public/baseline-snapshot.json`: 인샘플 180행 + 뉴스 40건 (보조)
- `app/app/routes/research.tsx` LEDGER_ROWS 하드코딩: 52 후보·통과 0, 판정 4종(철회·기각·보류·별도 전략)
- 기존 컴포넌트: `desk-chrome`, `hub-card`, `news-desk`, `watch-gauge`, `ui/`

## Agency-Agents 세팅 (투입 순서대로)

### ② UI Designer — 첫 타자 (승인 대기 중)
- 목적: A/B 두 방향안 + P1·P2 인터랙션 스펙을 1개 문서로
- 범위: 읽기만 — `app/app/routes/`, `app/app/components/`, `docs/ui-design-oil-pulse.md`,
  ego 스크린샷(메인이 제공). 쓰기 1건: `docs/design/001-ab-directions.md`
- 금지: 코드 수정, 새 의존성, 범위 OUT 일체, 가짜 데이터·가짜 인터랙션, WCAG AA 무시
- 증거: 방향별 근거 화면·데이터 필드 매핑 표
- 완료: 문서 존재 + A/B 비교표 + P1·P2 항목별 데이터원 명시. 메인이 직접 읽고 검증

### ④ UI Finish-Gate Reviewer — ② 산출물 게이트 (대기)
- 목적: generic 대시보드 방지. 디자인 계약 + PASS/FAIL
- 범위: 읽기만 — `docs/design/001-ab-directions.md` + 현 라이브 화면
- 금지: 재디자인, 취향 비평. 제품 증거 없는 지적 금지
- 완료: 게이트 리포트 (통과 조건 목록). FAIL이면 ②로 반려, 최대 2회

### ⑦ Frontend Developer — 채택안 구현 (대기, 조건부)
- 목적: 사용자 채택 1안에 한해 P1 → P2 순 구현
- 소유: `app/`만. `research/`·스냅샷 생성 코드 수정 금지
- 금지: 범위 OUT 일체 + AGENTS.md 대시보드 규칙
- 증거: `npm run dev` ego 실측 + typecheck. 메인이 스크린샷 직접 확인

### ⑤ Accessibility Auditor — 구현 후 (대기)
- 목적: WCAG 2.2 AA (다크테마 대비·키보드·라이브리전)
- 완료: 위반 목록 + 심각도. Critical 0이어야 PR

### Evidence Collector / Reality Checker — 기존 자동 허용枠 (대기)
- 구현 후 독립 검증. 스크린샷 기반, 기본값 NEEDS WORK

### 제외 (사유)
- image-prompt·storyteller·whimsy: 마케팅용. nudge·feedback: 사용자 데이터 없음
- cultural: 단일 발표. UX Researcher 풀 리서치: 피험자 모집 불가 (Persona Walkthrough는 ② 문서 리뷰용으로만 필요시)
- Agents Orchestrator: AGENTS.md 자동 호출 금지

## 순서

② → 메인 검증 → 사용자 1안 채택 → ④ 게이트 → ⑦ 구현(P1→P2) → ⑤ → Evidence → Reality → PR → 머지 → ego 배포 확인

## 결정 기록 (001 열린 질문 해소, 2026-09-06 리드 판단)
- Q1 (52 전행 노출): 6행 유지. 전행 데이터원 «모름»이므로 P1-4는 대표 6행 기준. 전행 공개는 별도 과제
- Q2 (게이지 라벨): A-1은 "DEFCON 3" 유지. A-2·B는 한글 밴드(안정·보통·고조·급변) + "방향 신호가 아닙니다" 고정
- Q3 (판정 정렬): 별도 전략·보류·기각·철회 순. "미검증·보류는 성과로 세지 않음" 문구 유지

## 잔류 Minor (P1 출하 후, 2026-09-06 ⑤ 감사)
- H1 순서(H2 뒤 H1): DOM 순서 변경이라 레이아웃 리스크 — 다음 스프린트
- live region 4칸 전체 낭독: SR 동작 변경이라 실측 후 — 다음 스프린트
- 백분위 숨김 시 게이지 73 잔류: hero 게이지는 항상 표시(스펙), 지표행만 숨김 — 현행 유지

## 수락 기준 (PR 전)

- [ ] 모든 수치·차트가 스냅샷 실값 바인딩 (하드코딩 데모값 0)
- [ ] 후보 요소에 "연구 후보·예시" 표시 유지
- [ ] CI (research·app·Vercel) 녹색
- [ ] ego-browser 로컬+배포 스크린샷 검증
- [ ] ⑤ Critical 0

## 롤백 runbook (장애 시)

1. Vercel → Deployments에서 직전 Production 빌드 선택 → Promote to Production
2. `git revert <사고 머지 SHA>` → `fix/revert-xxx` 브랜치 → PR → CI 녹색 후 머지
3. 스냅샷-only 사고면 해당 `chore: WTI 시장 관측값` 커밋만 revert (정적 JSON이라 안전)
4. 복구 후 ego-browser로 배포본 스냅샷·게이지·장부 3점 확인

## SLO (2026-09-06 선언, 월 1회 Actions 이력으로 측정)

- 관측 신선도: 평일 `fresh` 비율 ≥95% (분모=평일 cron 실행, 분자=fresh 판정)
- main 빌드 성공률 100% (실패 시 즉시 revert, 예외 없음)
