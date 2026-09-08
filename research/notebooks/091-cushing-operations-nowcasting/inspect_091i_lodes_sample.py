"""Audit the literal public LODES sample used by CFAM 091-I.

The output deliberately reports Payne County workplace geography rather than
claiming a Cushing boundary.  This establishes access and data shape only;
LODES is annual employment OD, not a daily mobility feed.
"""

from __future__ import annotations

import csv
import gzip
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "gathering/raw/ALT-20260908-09/20260908T034000Z/ok_od_main_JT00_2022.csv.gz"


def main() -> None:
    total_rows = payne_rows = payne_jobs = 0
    with gzip.open(SOURCE, "rt", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            total_rows += 1
            if row["w_geocode"].startswith("40119"):  # Payne County workplace block
                payne_rows += 1
                payne_jobs += int(row["S000"])
    print(
        {
            "source": SOURCE.name,
            "year": 2022,
            "od_rows": total_rows,
            "payne_county_workplace_od_rows": payne_rows,
            "payne_county_workplace_jobs": payne_jobs,
        }
    )


if __name__ == "__main__":
    main()
