"""Single entry point for the CAI experiment program.

Usage (from the research directory, with its venv):
    .venv/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/dev_is.config.json
    .venv/bin/python -m ls_crude.experiment.cli demo
    .venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/dev_is.config.json
    .venv/bin/python -m ls_crude.experiment.cli status --run-dir <run_dir>
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from . import PROGRAM_VERSION
from .fixtures import synthetic_frames, synthetic_spec
from .runner import DEFAULT_BASE_DIR, compare_runs, run, utc_stamp
from .spec import REPO_ROOT, SpecError, load_spec, validate_inputs


def _print_configs(run_dir: Path) -> None:
    state = json.loads((run_dir / "internal" / "run_state.json").read_text(encoding="utf-8"))
    print(f"run_dir: {run_dir}")
    print(f"configs: {state['configs'].__len__()}")
    for config_id, entry in state["configs"].items():
        metrics = entry.get("metrics") or {}
        metric_text = f"acc={metrics.get('accuracy', 'n/a')} ll={metrics.get('log_loss')}" if metrics else ""
        print(f"  {config_id:22s} {entry['status']:8s} {metric_text} {entry.get('reason', '')}")


def _cmd_validate(args: argparse.Namespace) -> int:
    try:
        spec = load_spec(args.config)
        resolved = validate_inputs(spec)
    except SpecError as error:
        print(f"INVALID: {error}")
        return 1
    print(json.dumps({
        "candidate_id": spec.candidate_id,
        "models": list(spec.models),
        "components": [item.name for item in spec.components],
        "inputs": resolved,
        "target": spec.raw.get("target"),
        "split": {"train_end": spec.train_end, "val": [spec.val_start, spec.val_end]},
    }, ensure_ascii=False, indent=2))
    print("SPEC VALID")
    return 0


def _cmd_demo(args: argparse.Namespace) -> int:
    frames = synthetic_frames(seed=args.seed, n_components=args.components)
    spec = synthetic_spec(n_components=args.components)
    base_dir = args.out or str(REPO_ROOT / "research" / "data" / "processed" / "091-cai-exp-demo")
    run_dir = run(spec, frames=frames, base_dir=base_dir, run_id=utc_stamp())
    print(f"SYNTHETIC DEMO COMPLETE ({PROGRAM_VERSION})")
    _print_configs(run_dir)
    print(f"export: {run_dir / 'export' / 'summary.json'}")
    return 0


def _cmd_run(args: argparse.Namespace) -> int:
    spec = load_spec(args.config)
    run_dir = run(
        spec,
        base_dir=args.base_dir or DEFAULT_BASE_DIR,
        run_id=utc_stamp(),
        resume=args.resume,
        max_seconds=args.max_seconds,
        use_cache=not args.no_cache,
        retry_failed=args.retry_failed,
    )
    print(f"RUN COMPLETE ({PROGRAM_VERSION})")
    _print_configs(run_dir)
    print(f"export: {run_dir / 'export' / 'summary.json'}")
    return 0


def _cmd_status(args: argparse.Namespace) -> int:
    _print_configs(Path(args.run_dir))
    return 0


def _cmd_compare(args: argparse.Namespace) -> int:
    report = compare_runs(args.left, args.right)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("MATCH" if report["match"] else "MISMATCH")
    return 0 if report["match"] else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="ls_crude.experiment.cli", description="CAI experiment program")
    parser.add_argument("--version", action="version", version=PROGRAM_VERSION)
    sub = parser.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="validate a spec and its pinned inputs")
    validate.add_argument("--config", required=True)
    validate.set_defaults(func=_cmd_validate)

    demo = sub.add_parser("demo", help="run the synthetic end-to-end demo")
    demo.add_argument("--out", default=None)
    demo.add_argument("--seed", type=int, default=7)
    demo.add_argument("--components", type=int, default=2)
    demo.set_defaults(func=_cmd_demo)

    run_cmd = sub.add_parser("run", help="run a real in-sample experiment")
    run_cmd.add_argument("--config", required=True)
    run_cmd.add_argument("--base-dir", default=None)
    run_cmd.add_argument("--resume", default=None)
    run_cmd.add_argument("--max-seconds", type=int, default=None)
    run_cmd.add_argument("--no-cache", action="store_true")
    run_cmd.add_argument("--retry-failed", action="store_true")
    run_cmd.set_defaults(func=_cmd_run)

    status = sub.add_parser("status", help="show config statuses for a run")
    status.add_argument("--run-dir", required=True)
    status.set_defaults(func=_cmd_status)

    compare = sub.add_parser("compare", help="compare two owner runs (spec/input/target/eval must match)")
    compare.add_argument("--left", required=True)
    compare.add_argument("--right", required=True)
    compare.set_defaults(func=_cmd_compare)

    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
