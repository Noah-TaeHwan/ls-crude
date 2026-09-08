#!/usr/bin/env python3
"""후보 카드를 정본으로 CSV를 검사(기본)하거나 명시적으로 원자 갱신한다.

직접 하위 Markdown은 _TEMPLATE.md만 제외한다. 다른 Markdown, 잘못된 ALT
파일명, 심볼릭 링크는 무시하지 않고 거절한다. 하위 디렉터리는 후보 범위 밖이다.
추가 상세 필드는 보존 대상 원문이며 CSV로 복제하지 않는다.
@param CLI --check(기본), --write, --self-test 중 하나.
@returns 정상 0, 검증 오류 또는 원장 불일치 1.
"""

import argparse
import csv
from datetime import date
import io
import os
from pathlib import Path
import re
import sys
import tempfile


FIELDS = "candidate_id,name,thesis,availability,collection_status,test_status,evidence_level,decision,decision_reason,next_action,owner,next_review_date,record_path".split(",")
ENUMS = {
    "availability": {"public", "needs_key", "scrape", "manual", "unavailable"},
    "collection_status": {"NOT_STARTED", "COLLECTING", "COLLECTED", "BLOCKED", "FAILED"},
    "test_status": {"NOT_RUN", "RUN"},
    "evidence_level": {"E0", "E1", "E2", "E3", "E4"},
    "decision": {"KEEP", "KILL", "PARK"},
    "owner": {"오태환", "손성찬"},
}
ID = re.compile(r"ALT-([0-9]{8})-([0-9]{2})")
FIELD = re.compile(r"^\|\s*([a-z_]+)\s*\|\s*(.*?)\s*\|\s*$")


def card_row(path):
    """카드의 필수 값과 제목·경로·중복 키를 검사한다.
    @param path 단일 후보 Markdown 경로.
    @returns CSV 순서의 13개 문자열.
    """
    match = ID.fullmatch(path.stem)
    if not match or path.suffix != ".md" or path.is_symlink() or not path.is_file():
        raise ValueError(f"후보 파일명/파일 오류: {path.name}")
    day, sequence = match.groups()
    date.fromisoformat(f"{day[:4]}-{day[4:6]}-{day[6:]}")
    if sequence == "00":
        raise ValueError(f"후보 번호 00 금지: {path.name}")
    lines = path.read_text(encoding="utf-8").splitlines()
    values = {}
    for line in lines:
        field = FIELD.fullmatch(line)
        if not field or field[1] == "field":
            continue
        key, value = field.groups()
        if key in values:
            raise ValueError(f"카드 필드 중복: {path.name} {key}")
        values[key] = value
    for key in FIELDS[:-1]:
        if not values.get(key, "").strip():
            raise ValueError(f"필수 필드 누락: {path.name} {key}")
    if values["candidate_id"] != path.stem:
        raise ValueError(f"카드 ID/파일명 불일치: {path.name}")
    for key, allowed in ENUMS.items():
        if values[key] not in allowed:
            raise ValueError(f"상태 오류: {path.name} {key}")
    review = values["next_review_date"]
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", review):
        raise ValueError(f"재검토일 형식 오류: {path.name}")
    date.fromisoformat(review)
    record_path = f"research/candidates/{path.name}"
    if values.get("record_path", record_path) != record_path:
        raise ValueError(f"카드 경로 불일치: {path.name}")
    values["record_path"] = record_path
    titles = [line[2:].strip() for line in lines if line.startswith("# ")]
    if len(titles) != 1 or re.findall(ID, titles[0]) != [match.groups()]:
        raise ValueError(f"제목 ID 불일치/중복: {path.name}")
    title_name = titles[0].split(path.stem, 1)[1].strip().removeprefix("—").strip()
    # 기존 ID-only 제목 및 작성자 꼬리표는 이름을 주장하지 않는다.
    if title_name and not re.fullmatch(r"\(worker-[0-9]+\)", title_name):
        normalize = lambda text: "".join(c for c in text.casefold() if c.isalnum())
        if normalize(title_name) != normalize(values["name"]):
            raise ValueError(f"제목/name 불일치: {path.name}")
    return [values[key] for key in FIELDS]


def sync(directory, write=False):
    """모든 카드를 검증한 뒤 원장 전체를 비교하거나 같은 폴더에서 교체한다.
    @param directory 후보 폴더. @param write 명시적 쓰기 여부.
    @returns 검증한 후보 수. 오류 시 기존 원장을 보존한다.
    """
    paths = sorted(path for path in directory.iterdir()
                   if path.suffix.lower() == ".md" and path.name != "_TEMPLATE.md")
    if not paths:
        raise ValueError("후보 카드 없음")
    rows = [card_row(path) for path in paths]
    if len({row[0] for row in rows}) != len(rows):
        raise ValueError("후보 ID 중복")
    ledger = directory / "ledger.csv"
    if ledger.is_symlink():
        raise ValueError("원장 심볼릭 링크 금지")
    expected = [FIELDS, *rows]
    if not write:
        with ledger.open(encoding="utf-8-sig", newline="") as source:
            actual = list(csv.reader(source, strict=True))
        # 기존 원장의 행 순서는 무관하다. 쓰기는 파일명 순서로 고정한다.
        if not actual or actual[0] != FIELDS or sorted(actual[1:]) != rows:
            raise ValueError("카드·원장 불일치: 카드 확인 후 --write 실행")
        return len(rows)
    output = io.StringIO(newline="")
    csv.writer(output, lineterminator="\n").writerows(expected)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="",
                                         dir=directory, prefix=".ledger-", delete=False) as target:
            temporary = Path(target.name)
            target.write(output.getvalue())
            target.flush()
            os.fsync(target.fileno())
        temporary.chmod(ledger.stat().st_mode & 0o777 if ledger.exists() else 0o644)
        os.replace(temporary, ledger)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return len(rows)


def self_test():
    """작은 임시 카드로 오류 거절·따옴표·원장 보존·반복성을 확인한다.
    @param 없음.
    @returns 성공 시 None, 회귀 시 AssertionError.
    """
    values = ["ALT-20260908-01", '관측, "활동"', "가설", "public", "COLLECTED",
              "NOT_RUN", "E1", "PARK", "자료 부족", "추가 확보", "오태환", "2026-09-15"]
    valid = '# ALT-20260908-01 — 관측, "활동"\n' + "\n".join(
        f"| {key} | {value} |" for key, value in zip(FIELDS, values))
    with tempfile.TemporaryDirectory() as temporary:
        directory = Path(temporary)
        path = directory / "ALT-20260908-01.md"
        path.write_text(valid, encoding="utf-8")
        assert sync(directory, True) == sync(directory) == 1
        ledger = directory / "ledger.csv"
        baseline = ledger.read_bytes()
        sync(directory, True)
        assert baseline == ledger.read_bytes()
        cases = [valid.replace("| thesis | 가설 |", ""),
                 valid + "\n| name | 다른 이름 |", valid + "\n| name | 관측, \"활동\" |",
                 valid.replace("| public |", "| restricted |"),
                 valid.replace("| 2026-09-15 |", "| 2026-02-30 |"),
                 valid.replace("| ALT-20260908-01 |", "| ALT-20260908-02 |"),
                 valid.replace('# ALT-20260908-01', '# ALT-20260908-02'),
                 valid.replace('— 관측, "활동"', '— 다른 관측'),
                 valid + "\n| record_path | ../outside.md |"]
        for invalid in cases:
            path.write_text(invalid, encoding="utf-8")
            try:
                sync(directory, True)
            except ValueError:
                pass
            else:
                raise AssertionError("잘못된 카드 허용")
            assert ledger.read_bytes() == baseline
        path.write_text(valid, encoding="utf-8")
        for name in ("unrelated.md", "ALT-bad.md", "ALT-20260230-02.md", "ALT-20260908-00.md", "ALT-20260908-02.MD"):
            extra = directory / name
            extra.write_text(valid, encoding="utf-8")
            try:
                sync(directory, True)
            except ValueError:
                pass
            else:
                raise AssertionError(f"잘못된 파일 허용: {name}")
            assert ledger.read_bytes() == baseline
            extra.unlink()
        assert not list(directory.glob(".ledger-*"))
        ledger.write_text("bad header\n", encoding="utf-8")
        try:
            sync(directory)
        except ValueError:
            pass
        else:
            raise AssertionError("잘못된 원장 허용")
    print("PASS: 임시 카드 오류 거절, 원장 보존, CSV 왕복, 결정적 재생성")


def main():
    """기본 읽기 전용 CLI를 실행한다.
    @param 없음(sys.argv 사용).
    @returns 프로세스 종료 코드.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="읽기 전용 대조 (기본·권장)")
    mode.add_argument("--write", action="store_true", help="전체 카드 검증 뒤 CSV 원자 교체")
    mode.add_argument("--self-test", action="store_true", help="임시 폴더 회귀 검사")
    args = parser.parse_args()
    try:
        if args.self_test:
            self_test()
        else:
            count = sync(Path(__file__).resolve().parents[1] / "candidates", args.write)
            print(f"PASS: {count} cards; {'wrote' if args.write else 'checked'} ledger.csv")
    except (OSError, ValueError, csv.Error) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
