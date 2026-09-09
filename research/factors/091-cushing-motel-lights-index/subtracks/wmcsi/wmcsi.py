"""WMCSI, factor-local only.  Requires a verified M1/M2 rolling price panel."""
from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data" / "wmcsi_daily.csv"
RECEIPT = ROOT / "receipts" / "latest_execution.json"
FIELDS = ("date", "m1_price", "m2_price", "calendar_spread", "prompt_stress_score")


def number(value: object) -> float | None:
    try:
        return float(str(value))
    except (TypeError, ValueError):
        return None


def read_panel(path: Path) -> list[dict[str, object]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    return [{"date": row.get("date", ""), "m1_price": number(row.get("m1_price")), "m2_price": number(row.get("m2_price"))} for row in rows]


def yahoo_daily(symbol: str) -> dict[str, float]:
    """Download a single explicitly specified Yahoo series; no symbol guessing."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote(symbol, safe='=') }?interval=1d&range=max"
    with urlopen(Request(url, headers={"User-Agent": "ls-crude-research/1.0"}), timeout=20) as response:
        result = json.loads(response.read())["chart"]["result"][0]
    closes = result["indicators"]["quote"][0]["close"]
    return {datetime.fromtimestamp(ts, timezone.utc).date().isoformat(): float(close) for ts, close in zip(result["timestamp"], closes) if close is not None}


def zscore(values: list[float], window: int) -> float | None:
    if len(values) < window:
        return None
    sample = values[-window:]
    mean = sum(sample) / window
    variance = sum((value - mean) ** 2 for value in sample) / window
    return (sample[-1] - mean) / math.sqrt(variance) if variance else 0.0


def calculate(panel: list[dict[str, object]]) -> list[dict[str, object]]:
    valid = sorted((row for row in panel if row["m1_price"] is not None and row["m2_price"] is not None), key=lambda row: str(row["date"]))
    spreads: list[float] = []
    output: list[dict[str, object]] = []
    for row in valid:
        spread = float(row["m1_price"]) - float(row["m2_price"])
        spreads.append(spread)
        z14, z30 = zscore(spreads, 14), zscore(spreads, 30)
        score = max(z for z in (z14, z30) if z is not None) if z14 is not None and z30 is not None else None
        output.append({"date": row["date"], "m1_price": round(float(row["m1_price"]), 4), "m2_price": round(float(row["m2_price"]), 4), "calendar_spread": round(spread, 4), "prompt_stress_score": "" if score is None else round(score, 4)})
    return output


def write(rows: list[dict[str, object]]) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--input", type=Path, help="Verified rolling daily M1/M2 CSV.")
    source.add_argument("--yahoo-symbols", nargs=2, metavar=("M1", "M2"), help="One explicit contract pair only; not a historical rolling chain.")
    args = parser.parse_args()
    if args.input:
        panel = read_panel(args.input)
        source_kind = "verified_local_panel"
    elif args.yahoo_symbols:
        first, second = map(yahoo_daily, args.yahoo_symbols)
        panel = [{"date": day, "m1_price": first[day], "m2_price": second[day]} for day in sorted(first.keys() & second.keys())]
        source_kind = "explicit_yahoo_contract_pair"
    else:
        panel, source_kind = [], "no_verified_rolling_m1_m2_source"
    rows = calculate(panel)
    write(rows)
    status = "ok" if rows else "park_no_verified_rolling_m1_m2_panel"
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps({"status": status, "source": source_kind, "input_rows": len(panel), "output_rows": len(rows), "scored_rows": sum(bool(row["prompt_stress_score"] != "") for row in rows)}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": status, "input_rows": len(panel), "output_rows": len(rows)}))


if __name__ == "__main__":
    main()
