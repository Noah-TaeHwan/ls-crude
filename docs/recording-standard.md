# 후보 기록 규약

이 규약은 이번 신규 연구 OS의 기록 정본입니다. [방법론](research-methodology.md)은 작업 순서, [검정 규약](testing-protocol.md)은 증거/누수 기준, [INTAKE](../research/INTAKE.md)는 저장 위치를 담당합니다.

## 원장과 카드

[ledger.csv](../research/candidates/ledger.csv)는 UTF-8 CSV 요약이고 [후보 카드 양식](../research/candidates/_TEMPLATE.md)을 복사한 파일이 상세 정본입니다. **2026-09-07 이후 신규 원장은 활동 proxy 01–08, 피자급 09–17, 피자급 후속 18–29를 합친 29행**입니다. 기존 연구는 [factors](../research/factors/README.md)와 노트에 남으며 전체 연구를 0건으로 초기화하지 않습니다.

1. 기존 가설을 먼저 확인합니다. 신규 ID는 ALT-YYYYMMDD-NN(등록일 KST, 일별 01부터 빈 번호)입니다. 기존 팩터 번호와 혼용하지 않습니다. 같은 후보는 계속 같은 ID를 쓰고, 재개 시 legacy_ref와 과거 노출/판정을 명시합니다.
2. 후보 양식을 research/candidates/<candidate_id>.md로 복사하고 모든 칸을 채웁니다. 모르는 사실은 미확인, 실행 전 결과는 미실행으로 씁니다.
3. CSV에 아래 13칸을 한 행으로 기록합니다. 쉼표가 포함된 값은 CSV 규칙대로 큰따옴표로 감쌉니다. record_path는 저장소 루트 상대 경로입니다.
4. 한 후보에는 작성 담당자 한 명을 둡니다. 카드와 CSV를 함께 수정하고 이력을 남깁니다. 동료가 근거·표본·판정을 검토합니다. 충돌한 판정은 담당자가 근거와 함께 조정합니다.

| CSV 칸 | 의미 |
| --- | --- |
| candidate_id, name, thesis | 식별자, 이름, 왜 WTI에 닿을 수 있는지 한 줄 |
| availability | public / needs_key / scrape / manual / unavailable |
| collection_status | NOT_STARTED / COLLECTING / COLLECTED / BLOCKED / FAILED |
| test_status | NOT_RUN / RUN (실행 실패는 NOT_RUN + 오류 기록, 무효 검정은 RUN + 무효 사유) |
| evidence_level | [검정 규약](testing-protocol.md)의 E0~E4; 단계 번호가 알파 품질 점수가 아님 |
| decision, decision_reason | KEEP / KILL / PARK 및 근거 |
| next_action, owner, next_review_date | 다음 행동 한 개, 오태환/손성찬 중 담당 1명, YYYY-MM-DD |
| record_path | research/candidates/<candidate_id>.md |

public은 허가를 뜻하지 않고 scrape는 허용된 수집이라는 뜻이 아닙니다. needs_key는 키가 필요한 경로이며 키 자체를 카드·CSV에 넣지 않습니다. 확인 전 availability=unavailable와 access_method에 “미확인”을 적습니다. 영구 부재로 단정하지 않습니다.

## 모든 후보 카드에 필요한 내용

| 묶음 | 필수 기록 |
| --- | --- |
| 가설 | ID/이름/한 줄 thesis, 실제 activity, sensitive_context, 피자 비유의 대응과 한계, 반증 조건, 기존 가설 연결 |
| 출처 | 모든 source URL, 접근법, 가용성, license/ToS/ethics 요약 및 확인 근거 URL·일자, 출처 표 연결 |
| 수집 | 상태, raw 경로 또는 blocker, 실제 수집 명령/단계·시각·hash, 기간·행 수·결측/중복, 동료 재취득 방법 |
| 시점 | observed_at와 available_at 구분, 시간대·발표 지연·개정/빈티지, 공개시각 근거 |
| 구성 | 산식·단위·주기·지역·집계/분모·가중치·결측/이상치·정규화, 지수 정의·스크립트·파생물 경로 |
| 검정 | WTI 타깃 공식/기간, corr·lag·event study·placebo 계획/실행/미실행 사유, 분할·OOS 열람·동결 이력, 결과·전체 시도·N·불확실성·표/그림·실행 영수증 |
| 판정 | KEEP/KILL/PARK·이유, 다음 행동·담당·날짜, 다른 팀원의 검토 결과·시각·수정 이력, 재개 조건 |

검정이 없으면 숫자 대신 NOT_RUN과 이유를 적습니다. 원본을 확보하지 못한 후보에게 raw hash나 상관을 요구하며 가짜 값을 채우지 않습니다. E2 이상을 주장하려면 실제 입력→코드→출력 영수증이 있어야 하며 E4에는 미열람/독립 평가 근거가 추가로 필요합니다.

## 상태·판정과 조회

| 상황 | collection_status / test_status / decision | 반드시 남길 것 |
| --- | --- | --- |
| 등록 후 조사 대기 | NOT_STARTED / NOT_RUN / PARK | 다음 접근 확인·담당·날짜 |
| 자료/허가/역사 부재로 차단 | BLOCKED / NOT_RUN / PARK | 접근 시도·차단 원인·해소 조건 |
| 수집 중 오류 | FAILED / NOT_RUN / PARK | 명령·시각·오류·제공자 지침에 맞춘 제한된 재시도 |
| 측정 부적격·가설 반증 | 현재 수집/검정 상태 유지 / KILL | 측정 불일치 또는 실제 검정 근거, 종료 이유 |
| 후속 연구 가치 | 실제 수집/검정 상태 / KEEP | 충족한 기준, 한계, 후속 검정. 수익성·인과·알파 인증 아님 |

KILL은 기각, BLOCKED는 차단, PARK+NOT_STARTED/COLLECTING은 탐색 중으로 보여줍니다. 별도 rejected/blocked 폴더를 만들지 않고 같은 카드와 이력을 유지합니다. 기존 HOLD/REJECTED는 일괄 자동 변환하지 않습니다. 재개 때 근거를 읽고 대응 판정을 기록합니다.

아래는 원장을 건드리지 않는 상태별 조회입니다(저장소 루트).

~~~bash
python3 - <<'PYVIEW'
import csv
from collections import Counter
from pathlib import Path
rows = list(csv.DictReader(Path("research/candidates/ledger.csv").open(encoding="utf-8", newline="")))
print("신규 OS 후보:", len(rows), "(기존 factors 이력 제외)")
print("판정:", dict(Counter(r["decision"] for r in rows)))
for label, keep in [
    ("기각", lambda r: r["decision"] == "KILL"),
    ("차단", lambda r: r["collection_status"] == "BLOCKED"),
    ("탐색 중", lambda r: r["decision"] == "PARK" and r["collection_status"] in {"NOT_STARTED", "COLLECTING"}),
]:
    print(label, [(r["candidate_id"], r["record_path"]) for r in rows if keep(r)])
PYVIEW
~~~

## 원장 구조 검사

아래 명령은 **메타데이터 구조만** 검사합니다. CSV에 실후보 행을 넣은 뒤에도 실행합니다. 빈 원장 통과는 연구 완료 증거가 아닙니다. 상세 내용·약관·원본 진위·E2~E4 주장은 동료가 [검정 규약](testing-protocol.md)으로 따로 확인합니다. Python의 assert를 쓰므로 -O 옵션 없이 실행합니다.

~~~bash
python3 - <<'PYCHECK'
import csv
import re
from datetime import date
from pathlib import Path

base = Path.cwd()
fields = "candidate_id,name,thesis,availability,collection_status,test_status,evidence_level,decision,decision_reason,next_action,owner,next_review_date,record_path".split(",")
enums = {
    "availability": {"public", "needs_key", "scrape", "manual", "unavailable"},
    "collection_status": {"NOT_STARTED", "COLLECTING", "COLLECTED", "BLOCKED", "FAILED"},
    "test_status": {"NOT_RUN", "RUN"},
    "evidence_level": {"E0", "E1", "E2", "E3", "E4"},
    "decision": {"KEEP", "KILL", "PARK"},
    "owner": {"오태환", "손성찬"},
}
with (base / "research/candidates/ledger.csv").open(encoding="utf-8", newline="") as stream:
    reader = csv.DictReader(stream)
    assert reader.fieldnames == fields, "원장 헤더 불일치"
    rows = list(reader)
seen = set()
for row in rows:
    assert set(row) == set(fields) and all(row.values()), "빈 칸/초과 칼럼"
    cid = row["candidate_id"]
    assert re.fullmatch(r"ALT-[0-9]{8}-[0-9]{2}", cid) and not cid.endswith("-00"), "후보 ID 형식"
    date.fromisoformat(f"{cid[4:8]}-{cid[8:10]}-{cid[10:12]}")
    assert cid not in seen, "중복 ID"
    seen.add(cid)
    assert re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", row["next_review_date"]), "재검토일 형식"
    date.fromisoformat(row["next_review_date"])
    for field, allowed in enums.items():
        assert row[field] in allowed, f"{cid}: 잘못된 {field}"
    assert row["record_path"] == f"research/candidates/{cid}.md", "카드 경로 형식"
    record = base / row["record_path"]
    assert record.is_file(), f"{cid}: 카드 없음"
    cells = dict(re.findall(r"^\| ([a-z_]+) \| (.*?) \|$", record.read_text(encoding="utf-8"), re.M))
    for field in fields[:-1]:
        assert cells.get(field) == row[field], f"{cid}: 카드/원장 {field} 불일치"
    if row["test_status"] == "RUN":
        result = (base / cells.get("result_path", "")).resolve()
        assert result.is_relative_to(base.resolve()) and result.is_file(), f"{cid}: 실행 결과 경로 없음"
print(f"PASS: 원장 구조 {len(rows)}행 (연구 성과 검증 아님)")
PYCHECK
~~~

## 데이터와 실행 영수증

경로와 Git 규칙은 [INTAKE](../research/INTAKE.md)를 따릅니다. 원본은 후보 ID/수집시각별 immutable snapshot으로 보존합니다. 정제·지수 산출은 data/processed로 분리합니다. 원본을 수정하거나 결측을 실제 0으로 꾸미지 않습니다.

[indexes 양식](../research/indexes/_TEMPLATE.md)에 입력/출력 상대 경로·SHA-256, 데이터 기간·행 수, 수집/공개시각, 코드 revision/dirty 여부·실행 명령·환경, 결과 경로와 재현자를 기록합니다. 큰 데이터는 Git에 넣지 않습니다. 원본이 로컬에만 있고 동료가 재취득할 수 없다면 팀 재현은 미검증입니다. 웹에 공개할 수 없는 원본은 합법적 접근 절차와 메타데이터만 제시합니다.
