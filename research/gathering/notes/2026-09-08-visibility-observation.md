# 갤버스턴 공항 시정 — 관측 경로 하나 실제 확보

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-08 / Agency-Agents Data Engineer |
| 후보 ID / 카드 경로 | [ALT-20260908-16](../../candidates/ALT-20260908-16.md) |
| 상태 | COLLECTED / E2 / PARK / WTI NOT_RUN |
| 연결 출처 | NOAA/NWS AWC METAR; REGISTRY의 NOAA/NWS AWC METAR — KGLS 관측 시연에 등록 |

## 무엇이 새로 생겼나

[실제28개 관측·그림·재현](../../indexes/ALT-20260908-16/20260908T050739Z/README.md)을 확보했다(**repo empirical only**). `10+`를 정확히 10마일로 바꿔 “변동성 0”이라고 만들지 않고, 모든 점을 하한 화살표로 보여준다. 결과가 밋밋해도 다른 날·다른 역으로 재선택하지 않았다.

KGLS는 [공식 NWS 역 목록](https://www.weather.gov/hgx/models)의 Galveston Scholes Field다. 기존 [항만안개 발상](../../../docs/research-direction-2026-09-08.md)의 관측 경로부터 확인했으며, [legacy020 Kuwait sandstorm](../../factors/archive/020-sandstorm-visibility-gulf-operations.md)과 다른 지역·원천 형태다. **기상 조건은 사람·선박의 활동량이 아니다.** 항만 대표성이나 공급 차질·유가 반응을 확인한 것으로 설명하지 않는다.

## 확보와 경계

[AWC API](https://aviationweather.gov/data/api/)의 단일역24h 요청을 [NWS 재사용 조건](https://www.weather.gov/disclaimer) 확인 후 실행. 원문은 gitignored 새UTC폴더에 보존하고 SHA-256을 [영수증](../../indexes/ALT-20260908-16/20260908T050739Z/receipt.json)에 기록했다. 관측은 2026-09-07 05:52~09-08 04:52UTC, 수집은09-08 05:07:40UTC. 지역시간·KST로 날짜를 이동시키지 않았다.

처음 API 접근 probe HTTP200 1회는 원본을 저장하지 않았고 수치 증거에 쓰지 않았다. 2분 이상 뒤28개 보고 빈티지를 보존하는 정식수집1회. 원본공유 전 동료의 동일빈티지 재취득은 미검증이며 새로운 rolling API 요청으로 과거 창을 재현했다고 주장하지 않는다.

[AWC 설명](https://aviationweather.gov/help/data/#metars)의 단위·관측시각과 API의 receiptTime/reportTime을 구분한다. 당시 외부 공개시각은 미입증. 관측자료를 봤으므로 이 후보의 최신 관측 노출은 SEEN; WTI·결합검정은 이번에 조회하지 않았다. 테스트와 placebo는 미실행이며 관계 없음이라는 결론도 없다.

## 다음 한 가지

손성찬 / 2026-09-15: **공식 Houston–Galveston 통항 제한/해제 공지에서 시각 있는 사례1건의 공개·재사용 경로 확인**. 새 키나 유료 서비스를 임의 신청하지 않는다. 확보 뒤 공항 기상이 항로 상태를 대리할 수 있는지부터 판단한다. Noah는 이 관측이 제품에서 보고 싶은 정보인지 결정한다.

독립 검토 결과는 후보 카드에 통합한다. 이 노트는 새로운 승자 지수나 교역 선행성의 증거가 아니다.
