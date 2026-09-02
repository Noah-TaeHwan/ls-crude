# AIS going-dark (고정 해역) — 보류

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-02 |
| 상태 | 보류 |
| 작성 | 에이전트 |
| 관련 출처 | AIS going-dark (고정 해역, 보류) |

## 한 줄 가설

고정한 해역에서 AIS를 끄는 척수가 이례적으로 늘면 원유 통행·제재 회피와 붙을 수 있다는 가설이었습니다. 2026년 going-dark는 흔한 통과 전술이라 제재 플래그로 쓰지 않습니다. 2015–2023 공개 시계열도 확인하지 못했습니다.

## 크립토의 뭐 × 뉴스의 무슨

| 쪽 | 내용 | 아직 없음 |
| --- | --- | --- |
| 크립토의 뭐 | AIS 위치 신호입니다. 크립토가 아닙니다. | 예 |
| 뉴스의 무슨 | 고정 해역 going-dark 일별 시계열은 확보하지 못했습니다. | 예 |

둘 다 채워지기 전에는 [`pizza-hunt.md`](../../notebooks/pizza-hunt.md)에 행을 만들지 않습니다.

## 본문

팀 채팅 2026-09-02 (금고 잠금 아님, 노트만). 팀원 트래커는 AIS가 아닙니다. `research/data/iran whale tracker`는 Nobitex·CoinEx 온체인 주소 추적입니다. 2015 시계열이 없고, 폴더는 main에서 2026-09-02 09:54 KST에 삭제되었습니다 (`5271321`). 2026년 going-dark는 흔한 통과 전술입니다. 제재 플래그로 쓰지 않습니다. 보류입니다.

### 본 것 (링크)

- 삭제된 랩은 온체인입니다. `iran_whale_tracker_v4.py` 헤더는 Iranian Crypto Whale & Exchange Flow Tracker이고, 라벨은 Nobitex TRON 핫월렛·CoinEx TRON 입금·OFAC BTC입니다. AIS 수신기가 아닙니다. 이 폴더를 `gathering/`으로 옮기지 않습니다.
- PortWatch FAQ는 호르무즈 분쟁 중 GPS 재밍, AIS 스푸핑, going dark를 이상치로 적습니다. [https://portwatch.imf.org/pages/faqs](https://portwatch.imf.org/pages/faqs). 제재 대상국 항구와 홍해에서도 트랜스폰더가 꺼질 수 있다고 적습니다. 이는 PortWatch 척수의 한계이지, 고정 해역 going-dark 피처가 아닙니다.
- 2026-06-12 AGBI: 상업 유조선이 호르무즈에서 트랜스폰더를 끄고, 이란 연계 그림자 선대와 같은 방법을 씁니다. [https://www.agbi.com/analysis/shipping/2026/06/commercial-tankers-adopt-iranian-dark-fleet-tactics/](https://www.agbi.com/analysis/shipping/2026/06/commercial-tankers-adopt-iranian-dark-fleet-tactics/). Lloyd’s List는 비이란 연계 선박의 dark transit이 늘었다고 전합니다. 제재 회피 전용이 아닙니다.

### 안 본 것

- 고정 해역 박스의 2015–2023 공개 AIS going-dark 일별 시계열. URL은 «모름»입니다.
- UNGP/Kpler 원천 AIS의 재배포 조건. PortWatch FAQ는 회원 기관용 UNGP라고 적습니다. 우리 파이프라인용 공개 다운로드로 단정하지 않습니다.
- Reuters 2026-06-16 원문. 이 환경에서 401이라 본문을 확인하지 못했습니다.
- Investing.com 사이트. 스크래핑하지 않습니다.

### 기존 Oil Slice(`000`)와 다른 점

Oil Slice는 헤드라인 태그입니다. AIS going-dark는 위치 신호의 공백입니다. 맵·히트맵을 메인 신호로 쓰지 않습니다. 실험 `001`로 올리지 않습니다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` / 해당 없음 (이 노트는 가격을 받지 않음) |
| 뉴스 출처 | 해당 없음. Investing.com을 긁지 않음 |
| 라이선스 | 모름. 공개 2015 AIS 시계열 제공자를 정하지 않음 |
| 발표 지연 | 모름 |
| look-ahead | 모름. 실시간 AIS를 같은 봉에 붙이면 look-ahead가 될 수 있으나, 시계열이 없어 검증하지 않음 |
| 본 기간 | 인샘플 `2015-01-01`~`2023-12-31` 공개 시계열을 확인하지 못함 |
| 아웃샘플을 봤나 | 아니오. 2026 보도는 제재 플래그로 쓰지 말라는 맥락만 봄 |
| 성과 숫자 | 없음 (지어 내지 않음) |

## 다음 한 가지

보류를 유지합니다. 라이선스가 있는 2015–2023 고정 해역 AIS가 공개로 생기기 전에는 후보 표와 실험 카드를 만들지 않습니다.
