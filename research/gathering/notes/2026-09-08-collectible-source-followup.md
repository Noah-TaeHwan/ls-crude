# 수집 가능한 기존 후보를 실제 표본으로 이어가기

2026-09-08. 이번 범위는 수집 경로2개 확인·원본 보존·대사·기록이며 WTI관계 검정이나 새 웹카드 배포는 아니다. Agency-Agents Data Engineer가싱가포르를, root가운영자료를 조사하고 서로검토했다.

## 결과

| 기존 후보 | 이전 → 이번에 확인한 것 | 판정·다음 단계 |
| --- | --- | --- |
| ALT-20260907-26 Singapore Tanker Arrival Watch | 월간ID미확보 → [MPA collection392의공식유형/총계API](https://data.gov.sg/collections/392/view) 취득 성공. 12개월유형36행+총계12행, 매월합계일치 | BLOCKED/E1/PARK → COLLECTED/E2/KEEP. 월간관측후속배정이지WTI성과인증아님. Noah: 월별공표·잠정치개정 안내와웹카드표시범위결정 |
| ALT-20260908-16 KGLS 시정의운영근거 | 공식운영사례미확보 → [USCG 상태표와LNM 원문2개](../../indexes/ALT-20260908-16/20260908T055451Z/README.md) 확보.4개항목과시각있는이동제한계획1건분리 | PARK유지. 실제안개폐쇄·재개시각/시간대가없어사건결합NOT_RUN. 성찬: 공식확정사건/허용인계경로확인 |

**실제 전진:** 신규후보0개, 기존후보2개진행, 원천ID차단1개해소, 실제월간관측그림1개추가. 원장전체67개(KEEP5/PARK51/KILL11)는repo집계이고효과를검증한67개라는뜻이아니다. 같은차단을날짜만바꿔재시도하지않았다.

## 싱가포르 — 설명 가능한 물리 활동 표본

[실제표·그림·SHA·재현](../../indexes/ALT-20260907-26/20260908T055411Z/README.md). [제공자정의](https://data.gov.sg/datasets/d_c9dcfd8b85990669d1e74dd7ad71eb8b/view)는75GT초과탱커의월별입항이며 Oil/Chemical/LNG·LPG로구분한다. Oil Tankers를원유전용또는고유선박수로바꾸어부르지않는다. gross tonnage의배율은이번에감사하지않아계산에서제외했다.

**repo empirical only:** 2025-08~2026-07 12개월표본. 최신월1568 Oil+468 Chemical+231 LNG/LPG=2267이며 [별도공식total](https://data.gov.sg/datasets/d_9adb5ace517591edd9a8c88291ac1f1c/view) API값과같다. 중복·count결측·불일치0. 12개월모두유형합과총계가일치한다. 상관·수익률·방향성은계산하지않았다.

최신월은제공자안내상잠정치이고월별최초공표일은미확인이다. 공식웹catalog total표시와실제API최신월이달라그차이도영수증에남겼다. 웹페이지갱신일을개별월발표일로쓰지않는다. 이번2024+활동값열람은관측시연이며독립OOS의미열람성주장을하지않는다.

## USCG — 접근 성공과 사건 데이터의 차이

[PDF24쪽](https://www.navcen.uscg.gov/sites/default/files/pdf/lnms/lnm0811g2026.pdf)에2026-03-18 9a.m.–3p.m. 이동제한이있지만사유는pipeline/dive operations이고시작변경조건에fog가언급된다. 이를안개로실현된폐쇄6시간이라고계산하지않았다. 시간대·실제시작/끝·최초공개시각은null이다.

Port Status의Last Changed는2024년날짜이고, 당일안개폐쇄이력이나서비스갱신지연을제공하는필드는아니다. 이표를현재시정카드에‘항만정상’으로붙이지않는다. 공식공지의접근경로는찾았으나확정기상사건자료의관문은남았다. 실제사건을찾기전위성/기상관측과가격을억지로결합하지않는다.

## 실행·검토

- 수집기와정제본은새UTC빈티지, 원문은gitignored. [SG 라이선스](https://data.gov.sg/open-data-licence)와[USCG 공개정보정책](https://www.uscg.mil/disclaim/)을직접확인하고출처/비공식파생물표시를남겼다.
- root가싱가포르2JSON을생산코드import없이읽어12개월합과원본SHA를독립검사했다. self-test와고정run replay도직접PASS. 원단위그림을확인했다.
- 싱가포르수집기의원본변조검출·출력덮어쓰기방지·all-zero그림방어를보완했다. 최초수동UTCrun오류와요청시작을retrieved_at으로기록한문제는원본을바꾸지않고영수증에서정정했다. 미래수집은UTC자동생성·요청/완료시각분리다.
- root가USCG2원본SHA확인과4항목/공지1건을추출하고PDF24쪽렌더링을대조했다. [재현명령](../../indexes/ALT-20260908-16/20260908T055451Z/README.md). Python표준라이브러리와설치된pdftotext를사용한다.
- 원장생성기로카드의요약필드를갱신했다. 초기수집/원단위구성검증과관계검정은구분하며미실행은NOT_RUN으로유지한다.

교차검토PASS: Agency-Agents가USCG원본2개·PDF본문·check/inspect를독립확인했고,root는싱가포르원본합계·해시와그림을확인했다. 공지의계획시행일/공표일구분과원문구간·안개조건검사를추가했다. 두후보의후속자료수집범위완료이며실현기상폐쇄자료·월별최초공표일과WTI관계는미완료다.

로컬검증: 카드/원장67개대조PASS, 앱typecheck/build 및12 tests PASS, 두수집기의실제원본체크·재생PASS. AST그래프5037nodes/6258edges로갱신했으며기존SQL파서누락경고는남았다. 앱화면추가·운영브라우저검증은이번범위아니다.
