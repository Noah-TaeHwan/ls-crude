# 실행 결과 — UI-07 (두 메뉴 IA·간결 대시보드·연구 기록 통합)

```yaml
unit_id: UI-07
status: DONE
executed_at_kst: "2026-09-11 16:54 .. 17:20"
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a (branch work/ui-05-s2a)
code_base: cecf1cf + 미커밋 M1/UI-07 변경 (커밋 없음)
preview: http://127.0.0.1:5173/ (PID 28156 유지, 재시작 없음)
```

## 1. 승인 범위

사용자 결정(2026-09-11): 상단 메뉴를 3개(대시보드 / 연구·검증 / 히스토리)에서
2개(대시보드 / 연구 기록)로 변경. 연구 방법·기록·공개 검증 규칙은 폐기하지 않음.

## 2. 변경 요약

- 메뉴: `desk-chrome.tsx`에서 링크 2개만 노출. `/history`는 라우트로 유지.
- 대시보드: CAI / WTI 방향 / WTI 가격 중심. 긴 소개 문구 축소, 기준일·산출
  상태·단위·예측 기간은 짧은 한 줄. `CAI란?`은 기본 접힘(2개 details 중 0개 open).
  산출값이 없을 때 계기판 compact(`data-cai-gauge="compact"`, 162px, SVG 없음),
  가상 점수·확률로 빈 공간을 채우지 않음.
- 연구 기록: `/research`를 기준으로 `#current`(현재 자료·실험) + `#past`(과거 기록:
  원장·결정 타임라인·사례) 두 섹션 통합. 긴 표·원장은 details/검색으로 접근
  (details 19개, 검색 입력 2개). `/history`도 같은 통합 기록을 렌더(리다이렉트 없음).

## 3. 구주소 호환 (실측)

| 입력 | 결과 |
| --- | --- |
| `/history` 직접 진입·새로고침 | 200, `/history` 유지, `#current`·`#past`·`#ledger`·`#history` 렌더 |
| `/history?candidate=018` | URL 유지, 원장 섹션 렌더 |
| `/research?candidate=018` | 단일 308 → `/history?candidate=018#ledger` (이후 안정, 루프 없음) |
| `/research?sample=…` | 파라미터 보존 308 (기존 M1 규칙 유지) |
| hash replace | 클라이언트 전용(`cai-legacy-routing.ts`), 서버 fragment 미사용 |

## 4. 검증 증거

- 앱 테스트: CI 목록 15파일 `node --test …` → **146 pass / 0 fail** (9.8s)
- `npm run typecheck` → exit 0, `npm run build` → exit 0 (client 1.14s·server 0.40s)
- ego 브라우저(5173, 에이전트 TaskSpace 종료 완료):
  - 네비 링크 2개(대시보드 `/`, 연구 기록 `/research`) 확인
  - 콘솔 오류 0, 예외 0, vite-error-overlay 없음
  - 390px: `/`·`/research` overflow 0 (scrollWidth 390) / 1280px: overflow 0
  - 스크린샷: `/tmp/ls-crude-desktop-home.png`, `/tmp/ls-crude-mobile-research.png`
- 작업 트리: 미커밋 보존(10 M + 신규 cai/연구기록 파일), 커밋·push 없음.

## 5. 남은 한계

- 최종 QA(QA-02)와 배포(REL-01)는 별도 승인 대기. UI-07 자체는 로컬 검수 완료.
- `.github/workflows/ci.yml`은 기존 M1 변경분 그대로(이번 배치에서 미수정).
