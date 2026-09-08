"""Render the CFAM 091-I through 091-N evidence audit.

These are source/measurement figures, not price tests.  Where a source is
blocked or only a one-off administrative page exists, the chart reports that
gate honestly rather than synthesising a time series.
"""

from __future__ import annotations

import csv
import gzip
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091INSZ"
LODES = ROOT / "gathering" / "raw" / "ALT-20260908-09" / "20260908T034000Z" / "ok_od_main_JT00_2022.csv.gz"


def save(fig: plt.Figure, name: str) -> None:
    figures = OUT / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    fig.savefig(figures / f"{name}.png", dpi=180, bbox_inches="tight")
    path = figures / f"{name}.svg"
    fig.savefig(path, format="svg", bbox_inches="tight")
    path.write_text("\n".join(line.rstrip() for line in path.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")
    plt.close(fig)


def lodes_summary() -> pd.DataFrame:
    total_rows = payne_rows = payne_jobs = 0
    with gzip.open(LODES, "rt", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            total_rows += 1
            if row["w_geocode"].startswith("40119"):
                payne_rows += 1
                payne_jobs += int(row["S000"])
    return pd.DataFrame([(2022, total_rows, payne_rows, payne_jobs)], columns=["year", "oklahoma_od_rows", "payne_workplace_od_rows", "payne_workplace_jobs"])


def render_lodes() -> None:
    frame = lodes_summary()
    frame.to_csv(OUT / "091i_lodes_2022_summary.csv", index=False)
    values = [frame.loc[0, "oklahoma_od_rows"], frame.loc[0, "payne_workplace_od_rows"], frame.loc[0, "payne_workplace_jobs"]]
    labels = ["Oklahoma OD\nrelationships", "Payne workplace\nOD relationships", "Payne workplace\njobs"]
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(labels, values, color=["#aec7e8", "#6c9ec8", "#e39c52"])
    ax.set_yscale("log")
    ax.set_ylabel("annual aggregate count")
    ax.set_title("091-I — public Census LODES: 2022 employment-OD structure", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    for i, value in enumerate(values): ax.text(i, value + max(values) * .015, f"{value:,}", ha="center", fontsize=9)
    ax.text(0.01, -0.25, "Workplace geography is Payne County, not a Cushing terminal boundary. Annual employment relationships do not measure daily footfall, dwell time, shifts, parking, or route use.", transform=ax.transAxes, fontsize=8.3)
    save(fig, "091i-lodes-annual-structure")


def render_gate_boards() -> None:
    # 091-J: seven requested proximity signals, classified from the documented access audit.
    j = pd.DataFrame({"state": ["actual but wrong construct", "actual but failed", "no public panel"], "signals": [2, 1, 4]})
    j.to_csv(OUT / "091j_hub_proximity_gate_summary.csv", index=False)
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(j["state"], j["signals"], color=["#d89b50", "#c96d6d", "#a5a5a5"])
    ax.set_ylim(0, 7)
    ax.set_ylabel("requested signals out of 7")
    ax.set_title("091-J — hub-proximity audit: data-access and measurement gate", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    for i, v in enumerate(j["signals"]): ax.text(i, v + .12, str(v), ha="center")
    ax.text(0.01, -0.25, "Actual-but-wrong: hotel tax and static road context. Failed: urban nightlight. No panel: parking, lunch footfall, mobile movement, event-day archive. No score is calculated.", transform=ax.transAxes, fontsize=8.15)
    save(fig, "091j-hub-proximity-gateboard")

    k = pd.DataFrame({"pipeline step": ["Carrier CDR", "Tower assignment", "100m grid", "Device trajectory"], "datasets collected": [0, 0, 0, 0]})
    k.to_csv(OUT / "091k_telecom_blocked_audit.csv", index=False)
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.barh(k["pipeline step"], [0.08] * len(k), color="#c96d6d")
    ax.set_xlim(0, 1)
    ax.set_xlabel("datasets collected (all zero)")
    ax.set_title("091-K — telecom mobility pipeline: deliberate collection block", loc="left", fontweight="bold")
    ax.text(.13, .5, "No raw signaling, CDR, device, tower or trajectory data collected.\nThis is an access + privacy boundary, not a missing visualization.", va="center", fontsize=11)
    ax.grid(axis="x", alpha=0.2)
    save(fig, "091k-telecom-blocked-gateboard")

    l = pd.DataFrame({"year": [2015, 2023], "ev_oil_displacement_mbd": [.030, .700]})
    l.to_csv(OUT / "091l_iea_documented_endpoint_sample.csv", index=False)
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.plot(l["year"], l["ev_oil_displacement_mbd"], marker="o", linewidth=2.4, color="#5b8db8")
    ax.set_xticks(l["year"])
    ax.set_ylabel("million barrels/day")
    ax.set_title("091-L — IEA EV oil-displacement endpoints already documented in Factor 004", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    ax.text(0.01, -0.24, "Two documented endpoints only; not a Cushing series and not a policy-vintage panel. It is national long-run context, not a CFAM busy measure.", transform=ax.transAxes, fontsize=8.3)
    save(fig, "091l-iea-structural-context")

    m = pd.DataFrame({"municipal listing": ["Water/Sewer\nmaintenance", "Streets\nmaintenance", "Police\nofficer"], "open_listings": [1, 1, 1]})
    m.to_csv(OUT / "091m_city_open_positions_snapshot.csv", index=False)
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(m["municipal listing"], m["open_listings"], color="#7aab8a")
    ax.set_ylim(0, 1.5)
    ax.set_ylabel("visible listing count")
    ax.set_title("091-M — City of Cushing open-positions: one dated public snapshot", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    ax.text(0.01, -0.25, "Three current municipal vacancies only. No posting/close dates, vacancy duration, applicant totals, citywide employment, or oil-sector activity are observed.", transform=ax.transAxes, fontsize=8.3)
    save(fig, "091m-city-positions-snapshot")

    n = pd.DataFrame({"public route": ["City pages\nretrieved", "Agenda archive\nidentified", "new long activity\npanels found"], "count": [4, 1, 0]})
    n.to_csv(OUT / "091n_municipal_source_audit.csv", index=False)
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(n["public route"], n["count"], color=["#6c9ec8", "#d89b50", "#c96d6d"])
    ax.set_ylim(0, 5)
    ax.set_ylabel("count")
    ax.set_title("091-N — City public-data map: source audit result", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    for i, v in enumerate(n["count"]): ax.text(i, v + .12, str(v), ha="center")
    ax.text(0.01, -0.25, "The agenda archive is a valid route to inspect official reports; a page count, meeting count, calendar, or department description is not an activity series.", transform=ax.transAxes, fontsize=8.3)
    save(fig, "091n-city-source-audit")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render_lodes()
    render_gate_boards()


if __name__ == "__main__":
    main()
