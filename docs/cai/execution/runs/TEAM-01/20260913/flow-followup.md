# TEAM-01 연속 UX 피드백 반영

- 2번은 자체 후보 목록33개를 열고 3번 수집 상태표를 열지 않는다. 같은 JSON을 사용하며 후보 상태표는 한 곳에만 존재한다.
- 4번 준비 상태를 work.processing enum으로 집계: ready2/in_progress0/pending22/excluded9. 후속 제안4는 담당 수락 전이며 준비 완료로 세지 않는다. 목록과 집계를 함께 렌더한다.
- 준비 상태는 모델 요약 로드 여부와 독립적이다. 새 후보가 ready가 돼도 과거 대표 run의 입력 수2는 변하지 않는다(회귀 테스트).
- 5번: 106자료→33후보→실제대표입력2, 조합·학습 결과6모델과 공통 check/run/package 프로그램. 긴 계산식은 상세 안에 둔다.
- 6번: CAI 결과물과 대시보드 CTA. 실제 공개 index는 기존 loader 값을 사용하며 준비 중/실제0/DEMO를 구분한다. 점수 생성이나 새 학습은 하지 않음.
- 긴 실험·검증 기록은 6단계 아래 #past로 이동. #experiments 및 #workflow-experiments의 조상펼침·기존 링크를 보존. 개발상태도 아래 접기로 이동.
- 검증: 웹310 tests, typecheck/build PASS. worklist Python 검사 및 --check PASS. 독립 Reality Checker 정적 검토에서 추가실질결함 없음.
- Ego12: 2번open=true/3번=false/33항목, 4번ready2/proposals4, 5번models6, 6번tables0/CTA도달/390overflow0, legacy #experiments에서past+workflow-experiments open확인.
- 캡처 /tmp/ls-crude-flow-stage4.png, /tmp/ls-crude-flow-stage5-mobile.png, /tmp/ls-crude-flow-stage6-mobile.png. 헤더에 가려진 자동화 클릭은 DOM 위치 확인 뒤 중앙으로 스크롤하여 실제 포인터로 검증했다.
- 전체 disclosure-history.browser.mjs도 Ego12/5173에서 실행: 단계별 독립 접기, Back/Forward 복원, 메뉴 초기화, 같은 hash 재열기, query 이동 후 복원 PASS. /tmp/ls-crude-flow-browser-final.log.
- 공개 https://ls-crude.vercel.app/research 는 인증 없는 HTTP200 확인. 해당 변경의 배포SHA는 PR/배포기록 참조. 사용자용5173서버 유지, 메시지 미발송.
