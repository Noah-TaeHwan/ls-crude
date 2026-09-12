#!/usr/bin/env python3
"""2019 보강 고정 실험 재현: 로컬 zip/JSON 재생성, 입력·예측의 정확한 일치 검사.

실험 환경의 Python으로 저장소 루트에서 실행한다. 다운로드·새 설정·OOS 실행 없음.
기존 입력은 수정하지 않으며 모든 출력은 새 --out 디렉터리에만 기록한다.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REFERENCE = ROOT / "research/experiments/cai/reference/2019plus_20260912T013423Z"
CONFIG = ROOT / "research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json"


def sha(path: Path) -> str:
    """파일 바이트의 SHA-256을 반환한다."""
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def strict_compare(summary: dict, expected: dict, run_dir: Path) -> dict:
    """전체 설정·계수·지표와 비공개 예측 해시를 비교하고 불일치 시 실패한다."""
    ignored = {"run_id", "generated_at", "env"}
    checks = {key: summary.get(key) == value for key, value in expected.items() if key not in ignored}
    checks["summary_keys"] = set(summary) == set(expected)
    checks["all_done"] = all(m["status"] == "done" for m in summary["models"])
    checks["library_versions"] = all(summary["env"].get(k) == v for k, v in expected["env"].items() if k != "platform")
    reference = json.loads((REFERENCE / "verification.json").read_text())
    checks["prediction_files"] = {p.name for p in (run_dir / "internal").glob("predictions_*.csv")} == set(reference["predictions"])
    for filename, item in reference["predictions"].items():
        path = run_dir / "internal" / filename
        rows = list(csv.DictReader(path.open()))
        pairs = json.dumps([[r["date"], r["target"]] for r in rows], separators=(",", ":")).encode()
        checks[filename] = sha(path) == item["sha256"] and len(rows) == item["rows"]
        checks[f"{filename}:dates_targets"] = hashlib.sha256(pairs).hexdigest() == item["dates_targets_sha256"]
        checks[f"{filename}:is_only"] = all("2015-01-01" <= r["date"] <= "2023-12-31" for r in rows)
    return checks


def self_check(run_dir: Path) -> None:
    """실제 재현 결과는 통과하고 상태·지표·가중치가 손상된 결과는 실패함을 확인한다."""
    expected = json.loads((REFERENCE / "export/summary.json").read_text())
    actual = json.loads((run_dir / "export/summary.json").read_text())
    assert all(strict_compare(actual, expected, run_dir).values())
    for key, wrong in [("status", "failed"), ("metrics", {"n": 244}), ("weights", [1.0, 0.0])]:
        changed = json.loads(json.dumps(actual))
        changed["models"][0][key] = wrong
        assert not all(strict_compare(changed, expected, run_dir).values()), key
    print("SELF CHECK PASS: genuine match; corrupted status/metrics/weights rejected")


def main() -> int:
    """고정 입력 재생성과 실제 재실행 후 공개 가능한 검증 영수증을 기록한다."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--self-check", type=Path, metavar="RUN_DIR")
    args = parser.parse_args()
    if args.self_check:
        self_check(args.self_check)
        return 0
    if args.out is None:
        parser.error("--out is required (a new directory)")
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    monthly = out / "monthly"
    monthly.mkdir()
    expected = json.loads((REFERENCE / "export/summary.json").read_text())
    commands = []

    def command(*parts: str) -> str:
        """기존 도구를 실행하고 재실행 가능한 인수·로그를 새 출력에 보존한다."""
        argv = [sys.executable, *map(str, parts)]
        result = subprocess.run(argv, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        commands.append({"argv": argv, "exit_code": result.returncode})
        with (out / "commands.log").open("a") as log:
            log.write(json.dumps(argv, ensure_ascii=False) + "\n" + result.stdout + "\n")
        result.check_returncode()
        return result.stdout

    sources = list(csv.DictReader((REFERENCE / "traffic_sources.csv").open()))
    for source in sources:
        archive = ROOT / source["zip_path"]
        if sha(archive) != source["zip_sha256"]:
            raise ValueError(f"source vintage mismatch: {archive}")
        with zipfile.ZipFile(archive) as z:
            raw = z.read(source["member"])
        if hashlib.sha256(raw).hexdigest() != source["vol_sha256"]:
            raise ValueError(f"VOL mismatch: {source['member']}")
        stem = f"avc040_{source['month']}{source['year']}"
        vol = monthly / f"{stem}.VOL"
        vol.write_bytes(raw)
        command("research/notebooks/091-tmas/parse_volume.py", "--vol", vol,
                "--year", source["year"], "--station", "AVC040", "--out-hourly", monthly / f"{stem}_hourly.csv",
                "--out-daily", monthly / f"{stem}_daily.csv", "--out-quality", monthly / f"{stem}_quality.json")
    command("research/notebooks/091-tmas/build_window_index.py", "daily", "--run-dir", monthly,
            "--prior-0757", monthly, "--prior-0825", monthly, "--extra-years", "2019", "--out", out / "panel.csv")
    for item in json.loads((REFERENCE / "dmr_sources.json").read_text()):
        if sha(ROOT / item["path"]) != item["sha256"]:
            raise ValueError(f"DMR builder source vintage mismatch: {item['path']}")
    command("research/notebooks/091-candidates/dmr_series_build.py", out / "dmr")
    config = json.loads(CONFIG.read_text())
    input_checks = {}
    for component, kind, flag, source in zip(config["components"], ["traffic", "dmr"],
                                            ["--daily-panel", "--series"], [out / "panel.csv", out / "dmr/dmr_series_rows.csv"]):
        rebuilt = out / Path(component["path"]).name
        command("research/scripts/build_pilot_inputs.py", kind, flag, source, "--out", rebuilt)
        input_checks[rebuilt.name] = sha(rebuilt) == component["sha256"] and rebuilt.read_bytes() == (ROOT / component["path"]).read_bytes()
    if not all(input_checks.values()):
        raise ValueError(f"rebuilt input mismatch: {input_checks}")
    command("-m", "ls_crude.experiment.cli", "validate", "--config", CONFIG)
    command("-m", "ls_crude.experiment.cli", "run", "--config", CONFIG, "--base-dir", out / "runs", "--no-cache")
    runs = list((out / "runs").glob("*/export/summary.json"))
    if len(runs) != 1:
        raise ValueError(f"expected one new run, found {len(runs)}")
    run_dir = runs[0].parent.parent
    command("-m", "ls_crude.experiment.cli", "compare", "--left", REFERENCE, "--right", run_dir)
    summary = json.loads(runs[0].read_text())
    checks = strict_compare(summary, expected, run_dir)
    # 영수증에는 행별 예측·원자료·명령의 개인 절대경로를 넣지 않는다.
    receipt = {"reference_run": expected["run_id"], "run_id": summary["run_id"], "env": summary["env"],
               "traffic_zip_count": len(sources), "downloads": 0, "final_oos_executed": False,
               "input_checks": input_checks, "checks": checks, "match": all(checks.values()),
               "spec_hash": summary["spec_hash"], "code_combined": summary["code_combined"],
               "models": [{k: m[k] for k in ["id", "status", "train_rows", "metrics", "weights"]} for m in summary["models"]]}
    (out / "verification.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    (out / "commands.json").write_text(json.dumps(commands, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"run_id": summary["run_id"], "match": receipt["match"], "receipt": str(out / "verification.json")}, ensure_ascii=False))
    return 0 if receipt["match"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
