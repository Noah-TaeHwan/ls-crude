"""웹과 같은 후보 JSON에서 GitHub 공동 작업표를 생성한다. --check는 읽기만 한다."""
import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "app/app/data/research-workflow.json"
OUTPUT = ROOT / "docs/cai/CANDIDATE_WORKLIST.md"
STATUS = {"planned": "예정", "in_progress": "진행 중", "review": "검토 요청", "done": "완료", "blocked": "차단"}
OWNERS = {None: "미정", "taehwan": "태환", "seongchan": "성찬"}
CATEGORY = {"used": "실험에 사용", "sample": "표본만 확보", "route": "경로만 확인", "forward": "앞으로 기록", "context": "배경 자료", "hold": "보류·기각"}


def render(data: dict) -> str:
    """담당 제안·실제 작업·자료 상태를 별도 열로 표시한다."""
    rows = data["candidates"]
    if len({row["id"] for row in rows}) != len(rows):
        raise ValueError("후보 ID가 중복됩니다")
    counts = Counter(row["work"]["status"] for row in rows)
    lines = ["# CAI 공동 작업표", "", "<!-- 생성: python3 research/scripts/build_cai_team_worklist.py ; 표 직접 편집 금지 -->", "",
             f"자료 기준 {data['snapshotDate']} · 작업 제안 {data['workUpdatedAt']} · 후보/보조자료 {len(rows)}개.", "",
             "자료 분류와 실제 작업 상태는 별개입니다. 담당 제안은 수락 전입니다. 예정은 착수 미확인이며 오늘 모두 수집한다는 뜻이 아닙니다. 배경 자료는 CAI 성분에 자동 포함하지 않습니다.", "",
             "원장 등록 상태: " + " · ".join(f"{label} {counts[key]}" for key, label in STATUS.items()) + ". 사람의 실제 착수/완료를 확인한 뒤 갱신합니다.", "",
             "| 번호 | 후보 ID · 이름 | 자료 분류 | 담당 | 작업 | 수집 | 전처리 | 기간 | 다음 행동·조건 |",
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    for n, row in enumerate(rows, 1):
        work = row["work"]
        if work["assignment"] not in {"unassigned", "proposed", "confirmed"} or ((work["owner"] is None) != (work["assignment"] == "unassigned")):
            raise ValueError(f"담당 상태가 맞지 않습니다: {row['id']}")
        if work["status"] == "in_progress" and work["assignment"] != "confirmed":
            raise ValueError("담당 확인 없이 진행 중으로 표시할 수 없습니다")
        owner = OWNERS[work["owner"]] + (" · 제안" if work["assignment"] == "proposed" else "")
        values = [str(n), f"{row['id']} · {row['name']}", CATEGORY[row["category"]], owner, STATUS[work["status"]], work["collection"], work["processing"], row["period"], row["nextAction"] + (" 조건: " + work["blocker"] if work["blocker"] else "")]
        lines.append("| " + " | ".join(value.replace("|", "\\|").replace("\n", " ") for value in values) + " |")
    lines += ["", "## 갱신·근거", "", "- [공동 작업 시작](TEAM_START_HERE.md) · [단계별 AI 프롬프트](TEAM_PROMPTS.md)",
              "- 변경 정본: [research-workflow.json](../../app/app/data/research-workflow.json)의 해당 ID. 이름·번호로 새 후보를 중복 등록하지 않습니다.",
              "- 담당 수락을 확인하면 assignment=confirmed, 실제 착수 시 status=in_progress로 바꿉니다. 샘플 확보만으로 작업 완료·입력 준비를 선언하지 않습니다.",
              "- 근거·기간·품질 검사와 함께 수집/전처리 상태를 갱신한 PR을 제출합니다. 생성기로 이 표를 갱신하고 --check로 웹 정본과 일치를 검사합니다.",
              "- 각 후보의 원출처 URL·설명은 위 JSON의 sourceUrls·summary·role에 보존합니다. 출처를 새로 방문하지 않고 확인된 기록을 옮긴 표입니다.", ""]
    return "\n".join(lines)


def main() -> None:
    """공동 작업표를 생성하거나 정본과 같은지 확인한다."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    text = render(json.loads(SOURCE.read_text()))
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text() != text:
            raise SystemExit("STALE: docs/cai/CANDIDATE_WORKLIST.md")
    else:
        OUTPUT.write_text(text)
    print("PASS" if args.check else "WROTE", OUTPUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
