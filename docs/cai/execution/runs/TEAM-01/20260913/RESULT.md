# TEAM-01 — 공동 작업 패키지·카드 UI

## 완료 범위

- 6단계 카드와 번호/목적/결과/다음 행동 위계, 6단계 목차와 target 강조.
- 기존33개 JSON에 담당 제안·작업·수집·전처리 metadata. 기존 후보 내용·분류 불변. 성찬5/11/16 제안, 태환2 제안; 완료1/10만, 진행중 등록0.
- GitHub README 시작 링크, TEAM_START_HERE·CANDIDATE_WORKLIST·TEAM_PROMPTS·MESSAGE_SEONGCHAN. 새 수집·학습·발신은 하지 않음.
- cai_team.py check/package와 새 입력 EXAMPLE. 기존 engine 변경 없음. v1공통조건·typed config·입력/결과/환경 검사, 제출4파일만 생성.

## 검증

- `npm run typecheck`, `npm run build`, `node --test tests/*.test.mjs`: 웹308 PASS.
- `research/.venv/bin/python -m pytest research/tests/test_experiments.py research/tests/test_cai_team.py research/tests/test_cai_worklist.py research/tests/test_cai_research_brief.py -q --basetemp /tmp/ls-crude-team-tests-protocol-final`: 연구57 PASS.
- `python3 research/scripts/build_cai_team_worklist.py --check`, `python3 research/scripts/build_cai_research_brief.py --check`, 문서 상대링크·git diff --check: PASS.
- 기존2019 run `20260912T013423Z`에 대한 실제 check/package 성공. 메인이 제출4파일만 존재, 원본config객체/spec_hash 동일, source_run_env 보존을 다시 확인. 모델 재학습 없음. 검증 출력은 /tmp/ls-crude-team-package-main-final.
- 독립 Reality Checker: typed schema 중첩값누출·환경정보누락·공동조건미강제3건 수정 후 재검토, 추가 문제 없음.
- Ego TaskSpace12: 1440px 카드6개·목차6개. 390px document.scrollWidth=innerWidth, 카드3 제목폭258px. 표본필터 번호5/11/16/20/25 보존, 성찬제안3, 키보드가로스크롤·Back 상세복원 PASS.
- 실제 스크린샷 /tmp/ls-crude-stage-cards-desktop.png, /tmp/ls-crude-stage-cards-mobile-fixed.png. 최초 mobile flex로 제목좁아짐 발견 후 grid2열/별도상태행으로 수정·시각검수.

## 한계와 전달

- check는 공통유효행과 두class 존재를 확인하며 통계적 표본충분성/권리/측정의미 승인이 아니다. 최종 OOS 잠금, 연구는 회고용.
- 담당은 제안이며 수락 전. GitHub Issue 지정·멘션·메시지 발송은 실행하지 않음.
- 현재 지수/미래확률 자동게시 없음. 제출 PR 검토 후 기존 공개 요약 생성/배포 경로를 사용한다.
- Git 전달과 운영 SHA는 해당 PR·Vercel 검증 결과에서 확인한다. 사용자용5173 서버는 유지 대상.
