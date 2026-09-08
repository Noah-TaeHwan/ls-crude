# 연구 수집 규칙

이 파일은 **저장 위치와 승격 절차의 정본**입니다. 신규 활동 proxy의 [방법론](../docs/research-methodology.md)·[검정](../docs/testing-protocol.md)·[기록 규약](../docs/recording-standard.md)을 함께 따릅니다. 예전 crypto×news 전용 조건은 신규 후보의 입장 조건이 아닙니다. 펜타곤 피자는 발상 패턴, Oil Slice는 기존 공개 신호 초안입니다.

## 흐름

**후보/가설 등록 → 출처·접근 확인 → 허용된 작은 샘플 → 개별 관측 → 적격 후보만 관계 검정·선택적 조합.**

카드가 정본이며 `python3 research/scripts/sync_candidate_ledger.py --write`로 원장을 생성하고 `--check`로 대조합니다. 원장의 수집·검정·판정 상태는 분리합니다. 최신 관측 시연과 과거 선행성 검정의 완료 조건을 혼용하지 않습니다.

아직 자료가 없어도 실제 아이디어·차단·실패를 기록합니다. 아이디어도 없으면 신규 원장을 비워 둡니다. 조사 덤프를 실험 카드에 바로 올리지 않습니다.

| 이것 | 위치 | Git / 정본 |
| --- | --- | --- |
| 신규 후보 요약·상세·판정 | [candidates/ledger.csv](candidates/ledger.csv), [양식](candidates/_TEMPLATE.md) 복사 | 작은 CSV·Markdown, 상태가 바뀌어도 경로 유지 |
| 기존 팩터와 실험 이력 | [factors/README.md](factors/README.md) | 보존. 새 원장에 자동 복제하지 않음 |
| 허용된 PDF·CSV·응답 등 원본 | [gathering/raw/](gathering/raw/README.md)의 후보 ID/수집시각 폴더 | 덤프 gitignored; 출처/manifest README만 Git |
| 가설·접근 시도·실패·검토 노트 | [gathering/notes/](gathering/notes/README.md) | 날짜-슬러그.md, 원문 대신 링크·요약 |
| 출처와 저장/분석/재배포 권한 | [gathering/sources/REGISTRY.md](gathering/sources/REGISTRY.md) | 기존 출처 중복 금지 |
| 지수 정의·실행 영수증 | [indexes/](indexes/README.md)의 후보 ID/run | 작은 명세·표·허용된 그림만; 원본/대형 출력 금지 |
| 재현 코드·노트북 | research/notebooks/<candidate_id>/ | 실제 실행 순서·환경·입력·출력 경로 명시 |
| 정제·지수 출력 | research/data/processed/<candidate_id>/<run>/ | gitignored, 원본과 분리하여 재생성 |
| 검토 뒤 승격된 실험 | [docs/experiments/](../docs/experiments/README.md) | 다음 비어 있는 번호. 이번 setup에서는 승격 없음 |
| 기존 작은 시드·팀원 랩 | [data/](data/README.md), [data/pizza/](data/pizza/README.md) | 원래 위치 유지, 무단 이동/삭제 없음 |
| 옛 crypto×news 조사 표 | [notebooks/pizza-hunt.md](notebooks/pizza-hunt.md) | 역사 문서, 신규 원장은 candidates/ |

기존 날짜-슬러그 raw 폴더와 기존 팩터별 랩은 이동하지 않습니다. 신규 raw의 예시 경로 규칙은 research/gathering/raw/ALT-YYYYMMDD-NN/YYYYMMDDTHHMMSSZ/입니다. 폴더 이름이 UTC라면 manifest에도 그 기준을 적습니다.

## 수집 전후

1. 후보 카드에 activity·sensitive context·WTI 가설과 다음 접근 확인 행동을 적습니다.
2. 제공자 URL, 공식 API/파일/수동 접근법, 허가·약관 근거 URL/확인일, 관측/공개 주기·역사 범위·빈티지를 출처 표와 카드에 기록합니다. 공개 페이지가 있다는 것만으로 저장·재배포를 허용하지 않습니다.
3. 확인된 범위 안에서만 수집합니다. 키 필요·허가 불명·역사 부재는 BLOCKED/PARK; 오류는 FAILED/PARK입니다. 시간·명령·실패 이유·재시도 횟수·다음 행동을 보존합니다. 차단을 우회하지 않습니다.
4. 받은 원본은 새 수집시각 폴더에 저장합니다. README에 URL·수집시각(시간대)·파일명·SHA-256·행 수/기간·명령 또는 수동 절차·권한·재취득 방법을 기록합니다. 원본은 덮어쓰지 않습니다. hash는 파일이 있을 때만 계산합니다.
5. 정제/집계는 processed의 별도 run에 쓰고 [지수 영수증](indexes/_TEMPLATE.md)에 원본→코드→출력 경로와 hash를 남깁니다. 원본이 바뀌면 새 빈티지로 다룹니다.
6. 원장·카드·노트에서 미실행/실패/검토 범위를 명시합니다. 동료가 입력에 접근하지 못하면 팀 재현은 미검증입니다.

raw README도 공개 자료입니다. 비밀키·서명 URL·개인 데이터·재배포 금지 원문을 붙이지 않습니다. 원본은 Git에 올리지 않고 필요한 허용된 인계 방법만 기록합니다.

## 고정 경계

- 가격은 Yahoo Finance CL=F. Investing.com 뉴스는 CSV 정본이며 사이트 스크래핑 금지.
- 시점은 관측일이 아니라 이용 가능 시각 기준. 지연·주말·시간대·개정·결측을 기록.
- 선택/튜닝은 2015-01-01~2023-12-31 안에서만. 2024+는 동결 뒤 미열람 조건이 성립할 때 한 번. 기존 열람을 새 ID로 지우지 않음.
- 라이선스/ToS 위반 수집, 자격증명 취득, 개인·예약자·결제 데이터 수집 금지.
- 합성 데이터나 미재현 상관·샤프·MDD·적중률을 실증으로 쓰지 않음.
- 수집 작업으로 app/·src/·tests/·팀원 랩을 변경하지 않음.

## 검토와 승격

노트·출처·raw/차단 근거·시점·구성·사전 검정 계획을 다른 팀원이 확인한 뒤, 실험을 진행할 준비가 된 후보만 docs/experiments의 다음 번호로 승격할 수 있습니다. 승격은 양의 결과나 알파 인증이 아닙니다. 기존 번호는 재사용하지 않습니다.

KILL은 같은 카드에 종료 근거와 이력을 남깁니다. PARK는 재개 조건·담당·날짜를 남깁니다. KEEP은 다음 연구 단계의 기준과 제한을 남깁니다. 결정과 수집/검정 상태를 혼동하지 않으며, 실패 원본·노트는 삭제하지 않습니다.
