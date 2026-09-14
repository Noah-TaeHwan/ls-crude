# URL 호환 계약 — 구주소를 삭제하지 않기

기준은 실제 최신 `SAMPLE_LINKS`의 모든 지원 값이다. v0.5 스냅샷의 9개는 아래와 같으며, 추가된 실제 값도 누락하지 않는다. 삭제/교체는 사용자 결정 없이 하지 않는다.

`visibility`, `tankers`, `empties`, `watermelon`, `jeju`, `degree-days`, `petroleum-rail`, `helix`, `cushing-busy`.

| 요청 | 처리 |
|---|---|
| /?sample=watermelon#research-sample | /history?sample=watermelon#research-sample |
| /research?sample=jeju | /history?sample=jeju#research-sample (한 번만 이동) |
| /history?sample=jeju#research-sample | 같은 주소 유지, 일치하는 사례 |
| 알 수 없는 sample | 원래 페이지의 정상 기본 뷰 + 지원하지 않는 사례 안내; redirect 없음 |
| /research?candidate=현재 manifest의 ID | /research 유지, 해당 후보 확인 |
| /research?candidate=알려진 옛 ID | /history?candidate=같은 ID#ledger |
| 알 수 없는 candidate | 빈 검색 결과; 새 후보/원장 생성 금지 |
| /research#ledger, /research#history | 클라이언트에서 /history#같은 anchor로 replace |
| /research#method, /research#intake | 현행 화면 유지, 해당 접힌 절 열기 |
| /#research-sample (query 없음) | 클라이언트에서 /history#research-sample로 replace |
| /observations/* | 기존 URL 유지, 돌아가기 링크는 해당 history 사례 |
| /backtest | 기존 GET/POST 계약 보존; 새로운 백테스트 실행 기능을 만들지 않음 |

## 구현 경계

URL fragment는 서버 request에 오지 않는다. sample/candidate의 query 이동은 서버가 처리하고, hash-only 이동은 useLocation 등 기존 클라이언트 패턴으로 처리한다. 리다이렉트 이후의 경로를 또 원래 경로로 돌리지 않는다. 미지원 ID의 외부 URL 값을 redirect 대상으로 쓰지 않는다.

특정 파라미터를 변경할 때 필요한 기타 query는 보존한다. sample과 candidate가 동시에 있으면 지원되는 sample 이동을 먼저 적용하고 candidate는 유지한다. hash-only 이동은 replace로 하여 뒤로가기 루프를 피한다.

기존 `sampleShouldRevalidate`는 실제 route 변화/history loader와 대조한다. 다른 route로 이동했는데 소스 데이터가 갱신되지 않거나, 같은 sample 전환마다 WTI를 불필요하게 다시 읽지 않게 한다. 기존 WTI polling 정책을 변경하는 작업으로 확장하지 않는다.

## 필수 검사

모든 지원 sample에 대해 root 진입·research 진입·history 직접 진입을 parameterized test로 실행한다. 미지원 값·빈 값·URL encoding을 검사한다. hash는 실제 브라우저에서 직접 진입/내부 클릭/뒤로가기/새로고침을 확인한다. 브라우저가 없으면 hash 검수는 NOT_RUN이며 정적 코드를 읽었다고 PASS라 하지 않는다.

## CAI 날짜 조회 — 2026-09-14

홈의 선택 상태는 `cai_date=YYYY-MM-DD`, `cai_range=year|all`로 저장한다. 생략하면 최신 산출일과 해당 연도를 표시한다. 날짜는 검증된 공개 history의 정확한 구성원이어야 하며 결측값은 null 그대로 표시한다. 중복·미지원 날짜/범위는 안내와 함께 유효한 기본값으로 표시한다. `year`는 선택 연도다.

날짜 UI는 query/hash를 보존하는 replace 이동을 사용하고 스크롤·펼침 상태를 초기화하지 않는다. 슬라이더 드래그는 방문 key에 묶인 임시 상태로 보여주고 pointerUp/이동키 keyUp/blur 때 한 번 반영한다. pointerCancel은 임시 상태를 취소한다. 서로 다른 방문 key에는 임시 값을 재사용하지 않는다.

홈 shouldRevalidate는 목적지에 cai_date가 있고 두 CAI 매개변수만 달라진 이동을 제외한다. 같은 URL의 수동/주기 갱신, 다른 query/path/hash 변경, bare 홈 메뉴 진입 및 POST는 기존 규칙을 따른다. 예전 sample/candidate/hash 경로 규칙은 유지한다. 날짜 폼은 읽기 전용 GET이며 뉴스 CRUD를 노출하지 않는다.
