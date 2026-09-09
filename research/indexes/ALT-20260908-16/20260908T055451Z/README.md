# USCG 운영 자료 접근 — 시정 연결의 다음 관문

확인2026-09-08. 기존 ALT16 시정의 후속 자료이며 새로운 후보나 WTI 검정이 아니다. 원문2개 모두 HTTP200으로 확보하고 [기계판독 표본](operational-sample.json)을 재현했다. 첫 외부 공개시각·실제 폐쇄 시작/종료는 미확인이라 KGLS와 결합하지 않았다.

## 실제 확보한 문서

- [NAVCEN Houston–Galveston Port Status](https://www.navcen.uscg.gov/port-status?zone=HOUSTON-GALVESTON): 게시된4항목. FREEPORT/GALVESTON의 Last Changed는2024-12-15, HOUSTON/TEXAS CITY는2024-09-11. 표의 Open과GALVESTON의WITH RESTRICTIONS를 함께 보존한다. Last Changed는 수집시각이나 안개 폐쇄 사건시각이 아니며, 해당 표만으로 실시간 안개 통항 여부를 확인할 수 있다는 근거는 없다.
- [USCG LNM0811g2026 PDF](https://www.navcen.uscg.gov/sites/default/files/pdf/lnms/lnm0811g2026.pdf): PDF24쪽 Temporary VTS Measure. 문서에2026-03-18, 9:00a.m.–3:00p.m., Upper Houston Ship Channel의 Sam Houston Bridge–Green's Bayou 구간 이동 제한이 적혀 있다. 사유는 pipeline and dive operations이다. 안개가 있으면 시작을 조정할 수 있다는 조건은 실제 안개 발생 또는 폐쇄 실현 기록이 아니다. 해당 문단의 시간대 표기가 없어 UTC로 변환하지 않았다.

이것은 **시각이 적힌 운영 공지1건**의 접근 성공이다. 실제 기상 폐쇄·재개 사건쌍 확보는 아직 PARTIAL이다. 현재 조건에서 이 문서를 근거로 WTI/기상 상관·폐쇄 시간 지수를 계산하지 않는다. 검색에서 찾은 상업매체·선박대리점 재인용은 공식 사건 정본으로 승격하지 않았다.

권리: [USCG 공개 웹 정책](https://www.uscg.mil/disclaim/)의 비로그인 공개정보 복사/배포 안내를 확인했다. 출처를 표시하고 로고·승인 암시 없이 집계·공지 내용만 사용한다. 외부 링크의 권리까지 확장하지 않는다.

## 원본·정제·검증

원본은 `research/gathering/raw/ALT-20260908-16/20260908T055451Z/`에 gitignored로 보존. [수집 영수증](../../../gathering/raw/ALT-20260908-16/20260908T055451Z/README.md)에2개 응답의 UTC·bytes·SHA가 있다. `operational-sample.json`의null은 추정해서 채우지 않았다.

```bash
python3 research/notebooks/ALT-20260908-16/collect_notices.py --check research/gathering/raw/ALT-20260908-16/20260908T055451Z
python3 research/notebooks/ALT-20260908-16/inspect_notices.py --raw research/gathering/raw/ALT-20260908-16/20260908T055451Z
# 새 원문 빈티지 취득(기존폴더 덮어쓰기 없음)
python3 research/notebooks/ALT-20260908-16/collect_notices.py
```

환경: Python표준라이브러리, PDF추출은 설치된 Poppler `pdftotext` 필요. root가본문 추출과 PDF24쪽 렌더링을 직접 대조했다. HTML4행·공지1건·원본해시가 일치한다. 다른환경의동일원문재취득은미검증이며 위새취득은다른빈티지일수있다.

다음 행동(손성찬, 제안): **실제 제한·재개가 확인된 사건의 시작/끝·시간대·원천 게시시각이 있는 공식 아카이브 또는 허용 인계 경로**를 확인한다. 여기까지 확보되기 전엔 현재 Port Status표의 Open을 시정 카드의항만정상 신호로 연결하지 않는다.

독립 교차검토: Agency-Agents Data Engineer가2개원본bytes/SHA·PDF24쪽본문·추출재현을확인했다. `notice_date`는계획시행일이며공표일이아니다. 고정출력의구간·안개조건이원문과달라지면추출을중단하도록검사를추가했다.
