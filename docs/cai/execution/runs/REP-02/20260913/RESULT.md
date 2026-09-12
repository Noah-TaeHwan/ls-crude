# REP-02 — 대표 연구 기준·재현·설명 연결

- 범위: 승인된 계획의 연구 브리프, 기존 2019 보강 실험 재현, 웹/오프라인 설명 연결. 새 수집·모델 탐색·OOS 성과 계산·팀 메시지 발송 없음.
- 대표 원래 run: `20260912T013423Z`; 새 같은 환경 재현: `20260912T233055Z`. 대표 선정 이유는 최신 완료 입력 보강이며 성과 선택이 아님.
- 근거 정본: `docs/cai/RESEARCH_BRIEF.md`, `research/experiments/cai/REPRODUCE_2019.md`, `research/indexes/091-cai-reproduction-20260913/verification.json`.

## 직접 검증

- Data Engineer가 로컬 원자료에서 입력 재생성/고정 실행. 메인이 입력2종 바이트·hash, 예측6파일 바이트, 날짜≤2023, 학습753/평가245를 다시 확인하고 log loss/Brier를 예측으로 재계산해 원수치·공개 요약과 대조: PASS.
- `research/.venv/bin/python research/scripts/reproduce_cai_2019.py --self-check research/data/processed/091-cai-reproduction-20260913/full-chain/runs/20260912T233055Z`: 정상 PASS, status/metrics/weights 손상 거부.
- `python3 research/scripts/build_cai_research_brief.py --check`: Markdown/오프라인 HTML 동일, 고정 config hash·대표 reference 수치 일치.
- `research/.venv/bin/python -m pytest research/tests/test_experiments.py research/tests/test_cai_research_brief.py -q`: 21 PASS.
- `cd app && npm run typecheck && npm run build && node --test tests/*.test.mjs`: 306 PASS, typecheck/build exit0.
- 독립 Reality Checker가 의미·수치·재현 경로 검토. 공유 안내의 --no-cache 누락1건을 찾아 수정함. 최종 원문 명령을 메인이 대조.
- `git diff --check`: PASS.

## Ego 브라우저 증거

- 사용자용 개발서버127.0.0.1:5173 유지. 1440px에서 대표 표4행·실제 log loss·양수 Δll 확인.
- 390px: document.scrollWidth=innerWidth=390, 대표표4행. region focus+ArrowRight 가로 탐색 PASS.
- 연구→대시보드→Back: 펼친 team-work와 scrollY 복원 PASS. hash 직접 진입 PASS.
- 연구 요약 링크로 HTML 다운로드, 서버 원본과 byte-identical.
- 파일을 별도 페이지에서 network offline=true로 열어 표6행·0.696606 확인. remote resource 요청0.
- 검수 캡처 `/tmp/ls-crude-brief-desktop.png`, `/tmp/ls-crude-brief-mobile.png`. browser TaskSpace10은 검수용이며 기존 사용자 탭/서버와 구분한다.

## 판정과 남은 경계

- REP-02 로컬 산출물/재현/설명 연결 DONE. Git 전달과 운영 버전은 해당 PR/배포 기록에서 확인한다.
- DATA-01 REVIEW: 최종 성분·측정 대표성·공개 적격성. 완료된 TMAS 보강/DMR 문서 조사는 반복하지 않음.
- OPS-01 DONE: 읽기 진단 완료, GitHub 결제/한도 이슈 자체 복구는 아님.
- UI-06 TODO: 현재 실측 동결 지수·미래 확률은 별도 권리·시점·검증·게시 조건 대기.
- 같은 환경 재현 ≠ 성찬님 독립 재현. 원파일2024+ 바이트의 해시/입력 재생성과 OOS 성과 계산을 구분하며, OOS 성과/선택은 미실행.
