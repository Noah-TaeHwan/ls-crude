# 2026-09-08 공동 헌트 — 활동 자료와 검정의 경계를 좁히기

상태: **Research 산출물 GOAL_MET / Finance 대사 PASS / Academic PARTIAL / 전체 요청 PARTIAL**. 2026-09-08 후속 리뷰에서 완료 범위를 정정했다. 우승 지수 없음. Academic·Finance·Research·Specialized 공동 작업이며 사람의 검토·외부 논문심사 완료가 아니다. [학술 메모](2026-09-08-joint-academic-memo.md) · [원장](../../candidates/ledger.csv).

## 이번 실행의 변화

기존 **ALT-20260907-01~08 8개**를 같은 ID로 재탐색했다. 새 후보 발견 8개로 세지 않는다. 원장 전체 62개, KEEP 4 / PARK 47 / KILL 11은 이번 로컬 집계다(**repo empirical only**). 이번 범위는 PARK 7 / KILL 1, 승자 지수 없음. 기존 factors와 합산하지 않는다.

핵심 전진은 (1) 바지선의 월간 결과를 덮어쓰지 않는 주간 빈도 검정, (2) LA항의 소규모 사실값 대사, (3) PortWatch 기존 계산의 방법 결함 발견과 증거 등급 하향, (4) Black Marble의 제품 버전별 QA 조건 구체화다. 03·05·08은 차단/측정 실패가 바뀌지 않았음을 확인하여 같은 시도를 반복하지 않는다. 이 평가는 이번 파일·공식 출처 확인 범위의 기록이며 전수조사가 아니다.

## 점수와 접근 영수증

[기존 L/A/H/T/W 규칙](2026-09-07-activity-proxy-hunt.md#점수-규칙--성과-수치가-아닌-조사자-판단)을 유지한다. 측정 명료성 / 접근 실행성 / IS 역사 / 시점 추적 / WTI 가설 구체성을 각 0–2, 동일 가중 합산한다. **조사자 판단**이지 수익성·발견 확률이 아니다. 날짜는 2026-09-08 KST, 출처별 web 열람/공식 검색 발췌를 사용했다. 페이지 접근과 역사 시계열 취득은 별개다. 원문 대량 저장·인증 우회·API 신청·외부 연락은 하지 않았다.

| 후보 | L/A/H/T/W → 합계 | 이번 확인 근거 / 정확한 차단 | 판정·다음 담당(제안, 09-09) |
| --- | --- | --- | --- |
| [01 Locks27](../../candidates/ALT-20260907-01.md) | 2/2/2/0/1 → 7 | [USDA](https://www.ams.usda.gov/services/transportation-analysis/gtr-datasets)의 Table10 곡물 물동량과 Figure12 이동·Figure13 빈 바지선은 다른 변수. 기존 raw hash 검증 후 주간 계산 실행. 당시 공개 빈티지는 미복원 | PARK / 손성찬: 과거 보고서 Table10과 현재 스냅샷 대사 |
| [02 LA항](../../candidates/ALT-20260907-02.md) | 2/1/2/1/1 → 7 | [2023 공식 표](https://portoflosangeles.org/business/statistics/container-statistics/historical-teu-statistics-2023) web 열람·2개월 사실값 대사. 기존 curl403은 그대로 역사 기록. [Disclaimer](https://portoflosangeles.org/disclaimer)만으로 전체 재배포 허가 확인 불가. 장기 패널·최초 공개일 미확보 | PARK / 손성찬: 허용 월표 취득·발행일 인계 |
| [03 TSA](../../candidates/ALT-20260907-03.md) | 2/1/1/1/1 → 6 | [2019 경로](https://www.tsa.gov/travel/passenger-volumes/2019) Research web403, root web internal error로 정상 취득 미확인. [BTS 설명](https://www.bts.gov/browse-statistical-products-and-data/preliminary-estimates/preliminary-estimates-enplanements-tsa)의 검색 인원과 탑승 인원 불일치. 역사 원본·가용시각·고정 YoY 학습 표본 부족 | PARK / 오태환: 허용 인계·공개시각 확인 |
| [04 PortWatch](../../candidates/ALT-20260907-04.md) | 2/2/1/0/2 → 7 | [공식 출범은 2023-11-15](https://www.imf.org/en/news/seminars/conferences/2023/11/15/launch-of-the-portwatch-platform). 이전 연도 재구성본의 당시 공개성은 입증되지 않음. 기존 코드 결함은 아래. 신규 수집·WTI 재검정 없음 | PARK / 오태환: IS-only 타깃·경계 수정 계획. E3→E2 |
| [05 Nightfire](../../candidates/ALT-20260907-05.md) | 2/0/2/0/2 → 6 | [현 라이선스 안내](https://payneinstitute.mines.edu/viirs-nightfire-licensing/)의 학술 무상도 서명·기간·자격 조건. 세부 PDF 재열람 실패, 팀 승인 없음. 원본 미취득 | PARK / 손성찬: 팀 이용 유형·자격 판단 |
| [06 Black Marble](../../candidates/ALT-20260907-06.md) | 1/1/2/0/1 → 5 | [NASA VNP46A2 v2](https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/VNP46A2/)에서 QA0만 고품질, 1–5 불량. 버전별 층·품질 의미를 구별. AOI·유효 픽셀 분모·원생산 빈티지·raster 계산 미구축 | PARK / 오태환: 산업/대조 AOI와 v2 QA0·gap-filled 제외 고정 |
| [07 GPR](../../candidates/ALT-20260907-07.md) | 1/2/2/1/1 → 7 | [원저자 안내](https://www.matteoiacoviello.com/gpr.htm?mod=article_inline)의 CC BY·개정·빈티지 명명은 공식 검색 발췌로 재확인. 기본 페이지 직접 열람 실패를 정상 수집으로 쓰지 않음. 파일명과 최초 공개시각 조인 미구축 | PARK / 오태환: 빈티지·발행일·관측월 대사 |
| [08 인기시간대](../../candidates/ALT-20260907-08.md) | 1/0/0/0/0 → 1 | [Google 정의](https://support.google.com/business/answer/6263531?hl=en)는 수개월 평균·주간 피크 대비 상대 방문 활동. 주문량·기관 활동 변수가 아님. 매장/개인/주문 원문 미수집 | KILL / 손성찬: 현 방식 종료 유지; 동의된 익명 역사 주문자료가 생겨야 재개 |

## Finance: 구성·가정·실행 여부

아래 산식은 **repo 연구 설계**이며 관측과 유가를 연결한다는 사실 주장이 아니다. 모든 후보에 관측/공개/수집시각을 분리한다. 과거 결과를 본 후의 후속 탐색이므로 독립 확증 검정이 아니다. 후보별 과거 OOS 노출은 보존하며 이번 계산은 2015–2023만 사용한다.

| 후보 | 지수·분모·결측 | WTI 관계 확인 / 반증·시나리오 |
| --- | --- | --- |
| 01 | 기존 월간 정의 유지. 이번 별도 주간 변형은 4곡물 합계 A, I=100 ln(A_t/A_(t−52)); 전년 같은 날짜가 아닌 364일. 결측 주/분모≤0 제외 | 주별 다음 주 수익률, lag −1/0/+1/+2, 52주 과거 시프트, 추가1주 지연, 2020 관련 분자·분모·가격창 제외. 실제 전체14행 아래 링크 |
| 02 | S=100×empty exports/(empty+loaded exports), I=S_m−S_(m−12), %p. 분모>0, 결측≠0 | 2개월 S 대사만 RUN; **WTI/YoY 지수 NOT_RUN**(전년월·장기 가용패널 없음). 분모 축소와 수량 증가를 분리, +1개월 지연·2020 제외 계획 |
| 03 | 완전월 검색 일평균 A, 100 ln(A_m/A_(m−12)); 모든 달력일 필요 | NOT_RUN: 역사 원본/시점·표본 부족. 월 lag −1/0/1/2, 12개월 시프트 계획. 2020 및 전년 분모 제외 후 표본 최소 기준 점검 |
| 04 | 현재 n_total의 20행 rolling z, min_periods10·표본SD. 관측+9일 뒤 첫 CL 세션은 가정 | 기존 RUN 기록 유지, **금회 재실행 없음 / LEGACY_METHOD_REVIEW_REQUIRED**. 과거 효과 숫자 재사용 중지. 수정 후 원 WTI 거래일축 RV5·IS 끝 purge·가격창 검증; 지연/180일 대조도 다시 명세 필요 |
| 05 | 고정 시설의 유효 야간 연소 관측합/유효 밤 수 A, 이전12연속월 평균·표본SD z. 실제 필드·단위 미확정 | NOT_RUN: 승인·자료 없음. 구름/미탐지≠0; 유효비율70% 대80%, 시설 바스켓 고정 계획. 원유 배럴 환산 안 함 |
| 06 | 고정 AOI QA 통과 실제 픽셀 공간평균→월평균, 이전12개월 z. gap-filled 제외, 면적·유효일 분모는 실행전 확정 | NOT_RUN: raster 패널 없음. 동일/대조 AOI, 70% 대80% 유효비율 비교 계획. 모텔 인원으로 명명 안 함 |
| 07 | Recent GPR만 log1p(GPR_m)−log1p(GPR_(m−1)); 음수/결측 제외, Historical판 접합 금지 | NOT_RUN: 최초 빈티지 패널 없음. 최초본/현재본 비교·추가 공개지연 계획. Investing.com CSV 정본을 교체하지 않는 외부 서사 대조군 |
| 08 | 구성 안 함 | NOT_RUN은 통계적 null이 아님. 측정 부적격으로 종료 |

02/03/05/06/07의 월별 공통 계획은 k=+1 주 검정, −1/0/+2 보조, split2015–2020/2021–2023, 타깃 양끝 purge, 12개월 과거 시프트다. 실행 가능성부터 해결하고 유리한 결과를 위해 표본 기준·가중치를 변경하지 않는다. 실제 시계열 없는 후보의 상관은 숫자 0이 아니라 **NOT_RUN**이다.

### 01 바지선 — 실제 주간 계산

[새 명세·실행기](../../notebooks/joint-hunt-20260908/README.md) · [결과와 그림·입출력 hash](../../indexes/joint-hunt-20260908/README.md). 기존 수집 원본을 재사용했다. 최초 공개 빈티지는 없으므로 **NOT_PROVEN as-of-safe**, 관측주 정렬의 기술통계다. 새로운 원본 취득 또는 독립 검증으로 세지 않는다. 유의성·인과·거래 수익 검정은 수행하지 않았다.

직접 실행과 독립 Finance 재계산은 **470주 / 14검정 / 중복 변형을 포함한 2,566쌍**이 일치했다. 2,566은 독립 표본수가 아니다. 알려진 원문 합계는 **217,649,472 = 완전주 214,009,449 + 불완전주 알려진 셀 3,640,023** short tons. 결측10셀은 보간하지 않았다.

| 변형(repo empirical only) | 학습 n / r | 내부 검증 n / r |
| --- | ---: | ---: |
| 다음 주 주 검정 | 240 / 0.030305 | 155 / -0.094648 |
| 추가1주 지연 | 239 / 0.117933 | 155 / -0.070222 |
| 52주 시프트 | 193 / -0.054417 | 104 / 0.050295 |
| 2020 관련 입력·타깃 제외 | 193 / 0.036263 | 104 / -0.115046 |

전체 값·제외수·입출력 hash는 [실행 영수증](../../indexes/joint-hunt-20260908/20260908T044354588864Z/receipt.json)과 [독립 대사](../../indexes/joint-hunt-20260908/20260908T044354588864Z/independent-finance-review.json)에 있다. 주 관계의 부호가 구간별로 다르므로 PARK 유지. 상관이 없다는 통계적 증명은 아니다. 52주 시프트는 시간구조 sanity이며 인과 대조군이 아니다. 추가1주 지연과 lag+2는 같은 쌍이 될 수 있으므로 서로 독립한 증거로 세지 않는다. 2020 제외는 YoY 분모를 통해 2021 표본도 줄이는 시나리오다.

### 02 LA항 — 사실값 소표본 대사

2023년 1·2월 공식 표에서 직접 읽은 6개 수치만 인용한다. 웹 페이지 전체/역사 데이터베이스 복제·재배포는 하지 않았다. 원본 파일·raw hash 없음; 원출처는 위 월표 링크, 확인일2026-09-08 KST. 아래 계산은 **repo empirical only**다.

| 월 | Loaded exports TEU | Empty exports TEU | 공식 Total exports TEU | Empty 비중(%) |
| --- | ---: | ---: | ---: | ---: |
| 2023-01 | 102723.25 | 244770.00 | 347493.25 | 70.4387783 |
| 2023-02 | 82404.00 | 153859.50 | 236263.50 | 65.1219930 |

각 loaded+empty=total이며 비중 차이는 −5.3167853%p. 이 두 점으로 YoY나 WTI 상관을 추정하지 않는다. 월간 전체 패널·전년월 값·공표일·허용 취득이 있어야 후보 검정으로 넘어간다. 장기 미수집 상태는 COLLECTING/E1이며 E2 승격하지 않는다.

소표본 대사 재현(저장소 루트; 실제 출처 숫자이며 합성 예제 아님):

```bash
python3 - <<'PY'
from decimal import Decimal as D
rows=[('102723.25','244770.00','347493.25'),('82404.00','153859.50','236263.50')]
shares=[]
for row in rows:
    loaded,empty,total=map(D,row)
    assert loaded+empty==total and total>0
    shares.append(100*empty/total)
print('shares_pct',shares,'change_pp',shares[1]-shares[0])
PY
```

### 04 기존 검정 증거 하향

**repo empirical only — Finance 읽기 검토 후 root가 코드 직접 확인.** [기존 실행기](../../notebooks/ALT-20260907-04/run_portwatch_hyoas_hunt.py)의 `align_signal_to_wti`는 inner join 뒤 RV5를 계산하여 신호 누락 때 5거래일 대신 5관측행이 될 수 있다. `realized_vol`은 비양수 가격창을 제외하지 않는다. `corr_split`은 신호일만 분할하여 IS 말단의 미래 타깃을 purge하지 않는다. 실제 과거 결과에 미친 크기는 미계산이며 과거 수치를 null 또는 성공으로 재해석하지 않는다.

따라서 RUN 이력을 보존하고 **E3→E2 / PARK**, 판정 이유를 LEGACY_METHOD_REVIEW_REQUIRED로 갱신했다. E2는 기존 구성 경로가 있다는 뜻이고 관계 검정 적합성 보증이 아니다. 과거 원문/산출물은 삭제하지 않는다. 이번에는 OOS를 다시 열지 않으며 코드 수정·재검정은 별도 IS-only 명세로 예약한다. 04·13·18은 같은 원천 family이며 독립 발견 3개가 아니다.

## 3분 데모

“우리는 WTI와 연결될 수 있는 이상한 활동을 찾고 있습니다. 오늘은 새 이름을 늘리는 대신 기존 8개를 다시 검토했습니다.”(30초) 원장과 점수표를 보여주며 접근·시점·측정 적합성이 별도라는 점을 짚는다. (60초) 바지선의 실제 주간 그림과 학습/내부검증 결과, 합계 대사와 결측을 보여준다. “실제 자료와 계산은 있지만 선행성은 입증하지 못했습니다.” (40초) LA항은 두 달 수출 비중까지 대사했지만 장기 패널은 없고, Google 인기시간대는 주문량이 아니어서 종료했다고 설명한다. (30초) PortWatch의 기존 숫자를 재검토해 증거를 낮춘 사례를 보여준다. (20초) 성찬은 허용 취득·빈티지 대사, Noah는 QA/시점·타깃 검증을 맡는 제안을 확인한다. “오늘 성과는 승자 지수가 아니라 다음 사람이 같은 막힘을 반복하지 않을 증거와 재현 코드입니다.”

## 최종 검토

**Research 산출물 GOAL_MET**: 기존 후보 8행을 실제 재탐색·점수화·갱신, 주간 지수 1개 재현과 전체14검정·시나리오·그림2개, LA항2개월 소표본 대사, 출처 메모·구성표·3분 데모·담당/09-09 행동을 기록했다. 논문 출판 준비 완료나 최종 지수 발견을 의미하지 않는다.

| 검토 표면 | 직접 확인한 증거 |
| --- | --- |
| Academic | 원논문/공식 자료5단위의 근거·확인 수준과 8개 주석. Root가 AEA2개·BH publisher 요약을 직접 재열람하여 논증과 대조. 전문 전체 읽기/외부 peer review 미완료이며 초록·공식 발췌에 근거한 짧은 메모 |
| Finance | 생산 코드 import 없이 470주/14검정/2566중복포함pair/hash 대사 PASS. Root가 `python3 research/notebooks/joint-hunt-20260908/finance-audit.py` 직접 재실행 exit0 |
| Specialized | Root가 `research/.venv/bin/python research/notebooks/joint-hunt-20260908/run.py` 직접 실행 exit0. [root 재실행 영수증](../../indexes/joint-hunt-20260908/20260908T044835442898Z/receipt.json)의14행 수치가 최초 run과 일치. 원본 해시·비양수·분할·질량 assert 실행 |
| Research/원장 | 독립 Research가 8개 카드 필드·원장·로컬 파일링크 검토 PASS. Root도62행 전체 필드와 RUN 결과경로·LA Decimal 대사 직접 PASS. 02 장기수집/소표본 구분 문구 보완 |
| 그림 | Root가 실제 SVG2개의 제목·축·범례·전체기간을 렌더링 확인. Quick Look pt단위 썸네일은 잘림이 있어 px크기 임시 사본으로 재확인; 원본 SVG는 변경하지 않음. 브라우저/웹배포 검증 아님 |
| 회귀 | `cd research && .venv/bin/python -m pytest tests/test_splits.py tests/test_wiki_pageviews_asof.py`: **9 passed**. 앱 변경 없으며 앱 빌드·배포를 검증했다는 뜻 아님 |
| Graph | `graphify update .` AST 갱신4792 nodes/5912 edges. tree_sitter_sql 부재로 SQL1개 제외, 문서 의미그래프 최신성 별도 미검증 |

남은 조건은 사람의 허용 취득/이용 유형 결정, 최초 빈티지·공표시각 대사, AOI/QA와 PortWatch 타깃 재검증이다. 새로운 데이터가 없으면 03·05·08을 같은 방식으로 다시 수집하지 않는다. 다음 우선순위는 01빈티지 → 07최초공개값 연결 → 02허용 월표 인계이며 후보 효과를 가장 크게 만드는 순위가 아니다.

## PR 통합 검증 이력

PR CI에서 병행 main 추가 ALT-20260908-15 카드의 필수 필드 부재가 확인됐다. main dd27905를 통합하고 원장13열 중 카드12필드만 원본문 앞에 연결했다. 공항 원문·수치·판정은 변경/재검증하지 않았으며 이번8개 탐색에 추가하지 않는다. 통합 후 전체 원장은63행(KEEP4/PARK48/KILL11)이고 앞의62행은 탐색 시작 스냅샷이다. 앱의 엄격한 원장 검사 실패를 완화하지 않았다.

형식 보정 후 root의 앱 `npm run typecheck`, `npm run build`와 node 테스트8개 PASS. 초기 CI 및 수정 전 로컬 테스트에서 동일15번 필드 실패를 재현했고, 보정 후 테스트만 다시 실행하여 해소를 확인했다. 브라우저/프로덕션 E2E와 별개다.

## 후속 리뷰 반영

초록 중심 메모만으로 전체 peer-review-ready를 충족했다고 볼 수 없어 상단 완료 범위를 정정했다. [학술 원문 대조 보완](2026-09-08-joint-academic-memo.md#리뷰-후-원문-대조--2026-09-08) 뒤에도 Academic은 PARTIAL이다.

검정규약의 주 타깃 산점도 누락은 기존 고정 IS pairs만 사용하여 보완했다. [주검정 산점도](../../indexes/joint-hunt-20260908/review-20260908/primary-scatter.png) · [입력·출력 해시](../../indexes/joint-hunt-20260908/review-20260908/scatter-receipt.json) · [재현 코드](../../notebooks/joint-hunt-20260908/plot_primary.py). 학습240/내부155쌍 그대로이며 추가 통계·튜닝·OOS 열람은 없다. 최초 실행 영수증과 원본은 변경하지 않았다.
