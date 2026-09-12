# DMR 계열 분해 감사 + SPP 접근·약관 차단 (DATA-04, 091-candidates)

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-11 / 오태환 |
| 후보 ID / 카드 경로 | 미등록 (091 트랙, DATA-04 / run `20260911T102736Z`) |
| 상태 | DMR 검토 중(계열 판정) · SPP 차단(portal 접속 불가) |
| 연결 출처 | ../sources/REGISTRY.md «FHWA TMAS 연속교통»(정렬 기준), «Yahoo Finance CL=F»(WTI 거래일), DMR·SPP는 미등록 |

## 활동과 WTI 가설

- **CHAI/DMR:** ECHO DMR 방류 유량은 규제 신고 로그다. 시설이 실제로 운영되면 방류·처리량에
  흔적이 남을 수 있다는 약한 가설만 가능하며, 강수·유입수(I&I)·면제(NODI C)·신고 관행이 지배한다.
  CHAI v3(성찬님 수신 스캐폴드)는 합성 시나리오 테스트만 있고 실측 유량이 없어, "실측 관측(DMR)
  vs 구조/합성(CHAI)"을 혼동하면 안 된다.
- **SPP:** RTBM LMP·혼잡(MCC)은 전력시장 데이터다. 파이프라인 펌핑이 아니라 권역 전력 스트레스의
  간접 후보이며, 유가와의 관계는 별도 실증 전까지 가설일 뿐이다. 이번 런은 표본 자체를 받지 못했다.

## 확인한 것 / 확인하지 못한 것

- **DMR 원문·확인시각·접근법:** 로컬 raw 18개 JSON(`research/gathering/raw/091-cushing-dmr/`,
  2026-09-10 수집, ECHO effluent REST keyless + 명시적 기간). 이번 런은 다운로드 없이 재파싱만 했다.
  1722행이 동결 CSV(`20260910T091DMRZ`)와 키 집합 완전 일치(추가 0·누락 0·중복 0) — 재현 확인.
- **계열 규칙:** 시설×outfall×단위×통계기준. 단위(MGD/gal/d/null)·기준(MO AVG/DAILY MX) 간
  합산·환산·채움 없음. NODI C 842행은 null 유지. 계열 32개 중 116개월 연속은
  **OK0026701 South STP MGD 하나**뿐(2016-12..2026-07, 전부 수치).
- **단위 전이 의심(미확정):** OK0026701 2015-01..2016-11·OK0044598 2015-01..2017-04는 단위 필드가
  비어 있다. OK0044598 2016-11-30 행은 단위 `gal/d`인데 값 `.008` — 이후 전부 `8000`대(1e6 배 차이).
  filed 그대로 보존하고 변환하지 않았다.
- **정렬 실측:** WTI 거래일(2015–2023, 2262일)과 month-end 관측일의 교집합은 계열별로 관측의
  약 60–70%(예: South STP train 49→35, val 36→25). TMAS AVC040 2023 일별 날짜와는 South STP
  MGD·Skull Creek gal/d는 12/12, Greenfield 007/008 MGD는 5/5 공통. 공표 지연은
  `ValueReceivedDate` 기준 중앙값 7–17일(전 행 존재) — look-ahead 규칙에 필요.
- **SPP:** `https://portal.spp.org/`·file-browser API가 이 환경에서 TCP 타임아웃(5회,
  2026-09-11T10:30–10:34Z, HTTPS/HTTP·IPv4, 0바이트). `www.spp.org`는 200. **우회 안 함.**
  약관 확인: www.spp.org/terms-conditions(비상업 복제·배포는 출처 표기 시 허용, **상업적 사용은
  사전 서면 허가**), External Systems AUP(가용성 훼손 금지, 기본 조회 이상 폴링은 사전 승인,
  FERC·Tariff·Market Protocols 준수). 파일브라우저 계정 필요 여부는 portal 접속 불가로 미확인.
- **검정·OOS:** 미실행. OOS(2024+) 미접촉. SPP는 시도했으나 표본 0.
- **결과 보고서:** [DATA-04 RESULT](../../../docs/cai/execution/runs/DATA-04/RESULT.md) ·
  [인덱스 영수증](../../indexes/091-candidates/20260911T102736Z/README.md) ·
  [SPP 약관·차단 기록](../../indexes/091-candidates/20260911T102736Z/spp-access-terms.json).

## 판정과 다음 행동

- **DMR: PARK(검토 중) — 규제 로그 유지.** 구성요소 후보로는 South STP MGD(기계적 준비 완료,
  가용일 규칙 필요) 1개, 조건부 Skull Creek gal/d·Greenfield MGD. 어느 것도 '쿠싱 원유 활동'
  직접 지표가 아니다.
- **SPP: BLOCKED.** portal.spp.org 접속 불가 + 상업·재배포 조건 사전 허가 필요. 재개 조건:
  (1) 이 환경에서 portal 접속 성공, (2) 비상업 연구 내부 사용 범위 서면 확인, (3) 1일 1파일
  ≤5 MB 표본. 담당 오태환.
- 최소 다음 개선(1개): DMR South STP에 `ValueReceivedDate` 가용일 규칙을 적용한 뒤
  단일 구성요소(월간)로 dev 실험 입력 가능 여부 판정.
- 다른 팀원 검토 범위: 없음(미요청).

후보는 [새 원장](../../candidates/ledger.csv)과 [상세 카드 양식](../../candidates/_TEMPLATE.md)에 기록합니다. 노트는 카드를 대신하지 않습니다. [INTAKE](../../INTAKE.md)와 [검정 규약](../../../docs/testing-protocol.md)을 따릅니다.
