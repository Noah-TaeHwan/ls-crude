#!/usr/bin/env python3
"""로컬 작업 현황 JSON 생성기 (표준 라이브러리만) — 웹 로컬 현황 영역용.

실제 자료만 읽어 상태를 만든다:
- 다운로드: raw/091-tmas/*/zips/*.zip 개수·바이트·최근 mtime
- 학습: data/processed/<base>/<run>/internal/run_state.json (모델별 상태)
- 입력: data/processed/091-cai-exp-pilot/inputs/*.csv (파일명·크기·mtime만)
- 현재 작업: --state JSON(없으면 '실행 기록 없음')

출력에는 개인 절대경로·원자료 값·로그 전문을 넣지 않는다. 진행률 분모가 없으면 %도 만들지 않는다.
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # research/
BASES = ("091-cai-exp-2019", "091-cai-exp-noah-terminal", "091-cai-exp-pilot", "091-cai-exp-sens")


def _utc(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def downloads() -> list[dict]:
    items = []
    total_files = total_bytes = 0
    for folder in sorted((ROOT / "gathering/raw/091-tmas").glob("*/zips")):
        zips = sorted(folder.glob("*.zip"))
        if not zips:
            continue
        size = sum(p.stat().st_size for p in zips)
        latest = max(p.stat().st_mtime for p in zips)
        total_files += len(zips)
        total_bytes += size
        items.append({
            "label": f"TMAS {folder.parent.name[:8]}",
            "files": len(zips),
            "bytes": size,
            "latest_activity_utc": _utc(latest),
            "complete": None,
        })
    items.append({"label": "TMAS 누적", "files": total_files, "bytes": total_bytes,
                  "latest_activity_utc": items[-1]["latest_activity_utc"] if items else None, "complete": None})
    return items


def runs() -> list[dict]:
    out = []
    for base in BASES:
        base_dir = ROOT / "data/processed" / base
        if not base_dir.is_dir():
            continue
        run_dirs = [d for d in base_dir.glob("2026*") if (d / "internal" / "run_state.json").exists()]
        if not run_dirs:
            continue
        latest = max(run_dirs, key=lambda d: d.name)
        state = json.loads((latest / "internal" / "run_state.json").read_text(encoding="utf-8"))
        counts = {"done": 0, "blocked": 0, "failed": 0, "pending": 0, "running": 0}
        train_rows = 0
        for entry in state.get("configs", {}).values():
            status = entry.get("status", "pending")
            counts[status] = counts.get(status, 0) + 1
            if status == "done" and entry.get("train_rows"):
                train_rows = max(train_rows, int(entry["train_rows"]))
        out.append({
            "id": state.get("run_id", latest.name),
            "base": base,
            "started_utc": state.get("started_at"),
            "finished_utc": state.get("finished_at"),
            "models": counts,
            "train_rows": train_rows or None,
            "cached": all(bool(e.get("cached")) for e in state.get("configs", {}).values()) if state.get("configs") else None,
        })
    out.sort(key=lambda r: (r.get("finished_utc") or "", r["id"]), reverse=True)
    return out


def inputs() -> list[dict]:
    out = []
    for path in sorted((ROOT / "data/processed/091-cai-exp-pilot/inputs").glob("*.csv")):
        st = path.stat()
        out.append({"name": path.name, "bytes": st.st_size, "modified_utc": _utc(st.st_mtime)})
    return out


def build(state_path: Path) -> dict:
    state = {}
    if state_path.exists():
        state = json.loads(state_path.read_text(encoding="utf-8"))
    else:
        state = {"task": "기록된 실행 없음", "owner": None, "stage": "미확인",
                 "blocker": None, "result": None, "screen_reflected": None,
                 "last_activity_at": None, "started_at": None, "throughput": None}
    return {
        "schema": "cai-local-work-status/v1",
        "kind": "local_work_status",
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "로컬 파일(manifest·run_state·inputs)",
        "current": state,
        "downloads": downloads(),
        "runs": runs(),
        "inputs": inputs(),
        "seongchan": state.get("seongchan") or {
            "last_report": "2026-09-11 주말 결과 2건(문서·엔진) 수신",
            "status": "미확인 — 새 보고 없음",
        },
        "notes": [
            "진행률 분모가 없으면 %를 만들지 않습니다.",
            "프로세스 종료 결과가 없으면 '실행 상태 확인 필요'로 표시합니다.",
            "캐시 재사용과 실제 재학습을 구분합니다.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    parser.add_argument("--state", default=str(ROOT / "data/processed/local-status-current.json"))
    args = parser.parse_args()
    data = build(Path(args.state))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes) | stage: {data['current'].get('stage')} | runs: {len(data['runs'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
