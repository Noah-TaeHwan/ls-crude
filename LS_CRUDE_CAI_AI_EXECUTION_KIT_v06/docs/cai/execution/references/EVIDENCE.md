# 조사 근거와 미확인 영역

기준: 2026-09-11 / main `cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef` / 읽기 전용 조회.

## R01 · 최신 main 확인

[최신 main 확인](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)

확인 시 main: cecf1cf. 커밋 시각 2026-09-11 10:41:24 KST. 이후 변경은 재조회 필요.

## R02 · 홈 라우트

[홈 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/home.tsx)

home.tsx 반환 내용 확인. 연구 소개·장부 현황, WTI 일봉, ResearchSample. 홈 loader가 시정·탱커·쿠싱 날씨도 읽음.

## R03 · 공통 헤더·푸터

[공통 헤더·푸터](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/components/desk-chrome.tsx)

전체 조회. 메인/리서치 두 메뉴, 팀·build SHA/branch/dirty 표시.

## R04 · 라우트 설정

[라우트 설정](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes.ts)

전체 조회. /, /research, /backtest, 4개 observations 라우트. /history는 등록되어 있지 않음.

## R05 · 리서치 라우트

[리서치 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/research.tsx)

1–210행 요청의 반환 범위 확인. 진행 후보·접힌 과거 장부·검색·판정 필터·근거·sample 리다이렉트.

## R06 · 쿠싱 상세 라우트

[쿠싱 상세 라우트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/routes/cushing-busy.tsx)

전체 조회. 제목과 문구가 현장 활동 보드·점수 없음. CushingObservation 공유.

## R07 · 쿠싱 관측 컴포넌트

[쿠싱 관측 컴포넌트](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/components/cushing-observation.tsx)

1–150, 270–390, 391–495행 요청의 반환 범위 확인. 다수 고정 원자료 import, 판단 보류와 90일/80% 조건. 전체 파일 감사 아님.

## R08 · 최근 CFAM 변경

[최근 CFAM 변경](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)

변경 목록·diff 확인. 연구 문서와 별도 web/cfam.html, cfam-engine.ts 추가. 앱 홈 변경 커밋으로 해석하지 않음.

## R09 · CFAM 계산 엔진

[CFAM 계산 엔진](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/research/programs/cushing-busy/web/cfam-engine.ts)

커밋 diff와 170–247행 조회. 수동 PINCH, 잔여 비중 재배분, fallback 상수, 실행 시각 생성. ML 학습 코드가 아님.

## R10 · WTI 서버 조회

[WTI 서버 조회](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/lib/wti-daily.server.ts)

전체 조회. Yahoo CL=F 5년 일봉·1분 인스턴스 캐시·3.5초 timeout. 실패 시 마지막 정상 자료의 시각 보존.

## R11 · 기존 사례 URL·파서

[기존 사례 URL·파서](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/app/lib/research-charts.ts)

1–115행 조회. 9개 SAMPLE_LINKS와 검증 함수. query-only 전환 시 시장 재조회 억제.

## R12 · Vercel 커밋 상태

[Vercel 커밋 상태](https://github.com/Noah-TaeHwan/ls-crude/commit/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef)

GitHub status API 확인: Vercel failure / Deployment was blocked, 2026-09-11 10:41:28 KST. 세부 원인·운영 alias는 미확인.

## R13 · GitHub Actions 실행

[GitHub Actions 실행](https://github.com/Noah-TaeHwan/ls-crude/actions/runs/34551671564)

ci #591: completed/failure. app/research job 모두 failure. step/log 원인 판독 미실행.

## R14 · CI 정의

[CI 정의](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/.github/workflows/ci.yml)

전체 조회. Node22·Python3.12, typecheck/build, 8개 지정 Node test, 연구 원장 검사·pytest.

## R15 · 앱 패키지

[앱 패키지](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/app/package.json)

전체 조회. React Router 8, React 19, Tailwind 4, Vite 8. 현재 의존성 변경 제안 없음.

## R16 · AI 작업 규칙

[AI 작업 규칙](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/AGENTS.md)

전체 조회. loader/action 패턴, 원장 규칙, ego 전용 브라우저, 파일 소유권·위임 제한.

## R17 · 프로젝트 README

[프로젝트 README](https://github.com/Noah-TaeHwan/ls-crude/blob/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/README.md)

1–26행 조회. 기존 탐색형 목적·팀·2026-09-15 09:00 KST 마감. 표시된 과거 원장 수는 재집계하지 않음.

## M01 · 모델 선택과 최종 평가

[모델 선택과 최종 평가](https://scikit-learn.org/stable/modules/cross_validation.html)

학습·내부 검증·시험 구간 분리, 변환은 학습 자료에만 적합한다는 원칙 참고.

## U01 · 접기 접근성

[접기 접근성](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

접기 컨트롤의 키보드·확장 상태 전달 요구 참고.

## O01 · Vercel Git 배포

[Vercel Git 배포](https://vercel.com/docs/git)

계정·저장소·작성자 권한 점검의 일반 참고. 이 프로젝트 차단 원인 확정 근거가 아님.

## 직접 접근 실패

운영 URL과 Vercel 프로젝트 URL 모두 web open이 Cache miss로 실패했다. 컨테이너 requests도 DNS NameResolutionError로 실패했다. 이것은 이 환경의 접근 결과이며 사이트 다운 여부나 인증 실패를 입증하지 않는다. 운영 렌더·현재 alias·프로젝트 설정·플랜·세부 로그를 확인한 것으로 쓰지 않는다.

## 도구

GitHub 연결로 코드·커밋·상태·CI 메타데이터 조회. Superpowers using-superpowers·brainstorming을 읽고 기획을 구성. 이전 계획 파일은 Files로 확인. 문서 산출은 로컬 생성. Plugin 검색에서 Vercel/Browser/ECC/Ponytail/Agency Agents 실행 연결을 확보하지 못해 해당 도구를 실행하지 않았다. 설치되지 않았다고 단정하지 않는다.

## 이 작업에서 하지 않은 것

레포 clone/build/앱 브라우저 검수, 원자료 전수 감사, 모델 학습, 성과 재계산, 권한·과금 변경, GitHub 파일/이슈/PR 쓰기, 병합, Vercel 배포, 팀원 발송/승인은 하지 않았다. UI 참고 이미지는 대화의 v4 목업으로 운영 캡처가 아니다.
