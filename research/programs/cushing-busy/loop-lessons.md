# Loop lessons

### Lesson: no series cap
- Trigger: 코디네이터가 시리즈 3개/라운드 6회에서 루프를 멈춤. 사용자가 상한은 없다고 교정함.
- Instruction: 검증된 시계열을 계속 붙인다. 시리즈 개수나 라운드 수로 성공 종결하지 않는다. 커밋·푸시·PR 요청, PROGRAM 밖, 날짜 창작, 점수/WTI만 멈춤 조건이다.
- Evidence: 사용자 2026-09-09 “루프 상한은 없어. 계속 해.”
- Added: 2026-09-09 round 7

### Lesson: time series not a one-shot table
- Trigger: QCEW 한 분기 표·헤드라인 1건을 시리즈로 세고 종료함. 사용자는 수집한 쿠싱 자료를 시계열로 보여주는 것이 핵심이라고 함.
- Instruction: 보드에 올리는 1순위는 날짜가 연속인 공개 시계열(차트). 한 시점 표·이벤트 1건은 문맥이지 시계열 완료가 아니다. 다음 후보는 분기 QCEW 이력처럼 점을 이을 수 있는 자료.
- Evidence: 사용자 2026-09-09 “쿠싱 관련 데이터를 수집하고, 그것을 '시계열'로 보여주는 것이 중요한 거 아냐?”
- Added: 2026-09-09 round 7

### Lesson: sample buttons must show frozen research even if intake parse fails
- Trigger: HLX·수박·제주·미국 도일·LA항·미국 철도 버튼이 `record` 없음으로 시계열을 숨김. 갤버스턴·싱가포르는 live 경로라 보임.
- Instruction: 자료 탐색 사례의 시계열·성찬 가설 카피는 접수 원장 파싱과 독립이다. 원장 스탬프가 없어도 고정 JSON/CSV 차트를 그린다.
- Evidence: 로컬 `/?sample=helix` SSR `해당 후보 정본을 확인하지 못했습니다` + `helix-index-plot` 없음. `defcon-sample` 단위시험은 디스크 카드로 통과.
- Added: 2026-09-09 round 7

### Lesson: coordinator dispatches opencode, does not implement
- Trigger: 사용자가 수집·구현을 코디네이터가 직접 하지 말고 opencode 워커가 하게 하라고 반복함.
- Instruction: 수집·리더·시험·보드 연결은 `orca orchestration worker-start --agent opencode`로 보낸다. 코디네이터는 스펙, 검수, ack/release, 다음 파동만 한다. 같은 워크트리 작성자는 최대 2명, 파일 소유가 겹치지 않게 한다.
- Evidence: 사용자 2026-09-10 “너가 직접 하는게 아니라 Opencode 워커들이 하고.”
- Added: 2026-09-10 round 9

### Lesson: IEM Cushing station is CUH
- Trigger: IEM daily.py `stations=KCUH&network=OK_ASOS` returned `station: KCUH not found`. `stations=CUH` returned 4269 dated days.
- Instruction: Cushing Municipal on IEM OK_ASOS is stid `CUH`, not ICAO `KCUH`. Probe the network CSV before fail-closed.
- Evidence: IEM 200 body + freeze `20260910T091KCUHZ` receipt maxTempSumInt=307313.
- Added: 2026-09-10 round 10
