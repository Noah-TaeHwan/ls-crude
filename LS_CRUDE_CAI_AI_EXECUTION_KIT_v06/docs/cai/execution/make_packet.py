#!/usr/bin/env python3
"""Assemble CAI Markdown work orders offline. Does not execute tasks or write files.

Python 3.9+; standard library only. stdout is the packet/list, stderr is an error.
--check validates this package, not the user's repo, approvals, tests, or any model.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import sys
from typing import Any

BASE = Path(__file__).resolve().parent
REQUIRED = ("CORE_RULES.md", "EXECUTOR_PROMPT.md", "PROJECT_BRIEF.md",
            "templates/RESULT_TEMPLATE.md")

class KitError(ValueError):
    """An invalid, incomplete, or changed packet source."""


def safe_file(name: str) -> Path:
    if not isinstance(name, str) or not name or "\\" in name:
        raise KitError(f"Unsafe path: {name!r}")
    relative = PurePosixPath(name)
    if relative.is_absolute() or ".." in relative.parts:
        raise KitError(f"Unsafe path: {name!r}")
    path = (BASE / relative).resolve()
    if BASE != path and BASE not in path.parents:
        raise KitError(f"Unsafe path: {name!r}")
    if not path.is_file():
        raise KitError(f"Missing file: {name}")
    return path


def text(name: str) -> str:
    return safe_file(name).read_text(encoding="utf-8")


def spec_sections(source: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    current = None
    buf: list[str] = []
    in_fence = False
    fence_char = ""
    for line in source.splitlines(keepends=True):
        strip = line.lstrip()
        if strip.startswith("```") or strip.startswith("~~~"):
            marker = strip[0]
            if not in_fence:
                in_fence, fence_char = True, marker
            elif marker == fence_char:
                in_fence = False
        match = None if in_fence else re.match(r"^## (\d{2})\. ", line)
        stop = not in_fence and line.startswith("## ")
        if match or stop:
            if current is not None:
                sections[current] = "".join(buf).strip()
            current = match.group(1) if match else None
            buf = []
        if current is not None:
            buf.append(line)
    if current is not None:
        sections[current] = "".join(buf).strip()
    return sections


def load() -> tuple[dict[str, Any], dict[str, str]]:
    try:
        catalog = json.loads(text("catalog.json"))
    except json.JSONDecodeError as exc:
        raise KitError(f"Invalid catalog JSON: {exc}") from exc
    if not isinstance(catalog, dict) or catalog.get("catalog_kind") != "WORK_INSTRUCTIONS_NOT_LIVE_TASK_LEDGER":
        raise KitError("Unexpected catalog kind; this is not a task ledger.")
    units = catalog.get("units")
    if not isinstance(units, list) or not units:
        raise KitError("Missing units")
    source = safe_file(catalog["spec"])
    if hashlib.sha256(source.read_bytes()).hexdigest() != catalog.get("spec_sha256"):
        raise KitError("Spec hash mismatch. Review the source change before updating its catalog hash.")
    sections = spec_sections(source.read_text(encoding="utf-8"))
    ids: set[str] = set()
    for unit in units:
        if not isinstance(unit, dict):
            raise KitError("Each unit must be a catalog object")
        uid = unit.get("id")
        if not isinstance(uid, str) or not re.fullmatch(r"[A-Z][A-Za-z0-9.-]*", uid):
            raise KitError(f"Invalid task ID: {uid!r}")
        if uid in ids:
            raise KitError(f"Duplicate task ID: {uid}")
        ids.add(uid)
        card = text(unit["card"])
        if not card.startswith(f"# {uid} —"):
            raise KitError(f"Card heading mismatch: {uid}")
        for key in ("depends_on", "spec_sections", "contracts", "read_files", "write_allowlist", "required_approvals"):
            if not isinstance(unit.get(key), list):
                raise KitError(f"Invalid {key} list: {uid}")
        for section in unit["spec_sections"]:
            if section not in sections:
                raise KitError(f"Missing spec section {section}: {uid}")
        for contract in unit["contracts"]:
            safe_file(contract)
    for file in REQUIRED:
        safe_file(file)
    graph = {u["id"]: u["depends_on"] for u in units}
    for uid, dependencies in graph.items():
        for dep in dependencies:
            if dep not in ids:
                raise KitError(f"Unknown dependency {dep}: {uid}")
    visiting: set[str] = set()
    visited: set[str] = set()
    def visit(uid: str) -> None:
        if uid in visiting:
            raise KitError(f"Dependency cycle: {uid}")
        if uid in visited:
            return
        visiting.add(uid)
        for dep in graph[uid]:
            visit(dep)
        visiting.remove(uid)
        visited.add(uid)
    for uid in graph:
        visit(uid)
    return catalog, sections


def packet(catalog: dict[str, Any], sections: dict[str, str], uid: str) -> str:
    unit = next((u for u in catalog["units"] if u["id"] == uid), None)
    if unit is None:
        raise KitError(f"Unknown task: {uid}. Run --list.")
    chunks = [f"# WORK ORDER — {uid}\n\n"
              f"기존 task: {unit['parent_id']} · 실행 패키지 {catalog['package_version']}\n\n"
              "이 패킷은 작업 명세이며 실행 승인·완료 증거가 아니다. 현재 AGENTS·코드·원장·권한을 확인한다.\n"
              "명시된 한 단위만 진행하고 기대 결과를 실제 로그로 쓰지 않는다.\n",
              text("CORE_RULES.md"), text(unit["card"])]
    chunks.extend(text(path) for path in unit["contracts"])
    chunks.append("# 필요한 기획서 원문 발췌\n\n과거 현황은 스냅샷이다. 현재 구현·승인과 충돌하면 확인한다.")
    chunks.extend(sections[key] for key in unit["spec_sections"])
    chunks.append("# RESULT_TEMPLATE — 실제 실행 이후 기록\n\n" + text("templates/RESULT_TEMPLATE.md"))
    chunks.append("## 마지막 확인\n수정 범위·수용 조건·실제 검사·미실행 항목을 대조하고 REVIEW에서 멈춘다.")
    return "\n\n---\n\n".join(s.strip() for s in chunks) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--list", action="store_true", help="List static task instructions, not live status")
    mode.add_argument("--check", action="store_true", help="Check package integrity and dependencies")
    mode.add_argument("--task", metavar="ID", help="Print one work order to stdout")
    args = parser.parse_args()
    try:
        catalog, sections = load()
        if args.list:
            for unit in catalog["units"]:
                print(f"{unit['id']} | {unit['parent_id']} | {unit['title']}")
        elif args.check:
            print(f"PASS: {len(catalog['units'])} units; package paths, spec hash, sections and dependency DAG checked.")
            print("NOT TESTED: model behavior, repo code, permissions, app tests, CI, deployment.")
        else:
            print(packet(catalog, sections, args.task), end="")
        return 0
    except (KitError, OSError, KeyError, TypeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
