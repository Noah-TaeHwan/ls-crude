#!/usr/bin/env python3
"""2026-09-07 헌트: 확보된 원본으로 지수를 만들고 인샘플만 WTI와 비교한다.

아웃샘플(2024+)은 후보 선택에 쓰지 않는다. 샤프/MDD/적중률을 만들지 않는다.
실행: cd research && .venv/bin/python notebooks/hunt-20260907/build_and_test.py
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import math
import zipfile
from datetime import date, datetime, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT.parent
STAMP = "20260907T063658Z"
RUN_ID = "run-20260907T063658Z"
IS_START = pd.Timestamp("2015-01-01")
IS_END = pd.Timestamp("2023-12-31")
RAW = ROOT / "gathering" / "raw"
PROC = ROOT / "data" / "processed"
IDX = ROOT / "indexes"
NOTEBOOK = ROOT / "notebooks" / "hunt-20260907"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_wti() -> pd.DataFrame:
    path = ROOT / "data" / "clf-daily-2015-2026.csv"
    frame = pd.read_csv(path, parse_dates=["date"])
    frame = frame.set_index("date").sort_index()
    frame.index = pd.to_datetime(frame.index).tz_localize(None).normalize()
    close = pd.to_numeric(frame["Close"], errors="coerce")
    out = pd.DataFrame({"close": close})
    out = out.loc[out["close"] > 0]
    r = out["close"].pct_change()
    out["r1"] = r
    # F_h(t) = P_{t+h}/P_t - 1
    out["f1"] = out["close"].shift(-1) / out["close"] - 1
    out["f5"] = out["close"].shift(-5) / out["close"] - 1
    # RV_h excludes r_t
    acc = 0.0
    for j in range(1, 6):
        acc = acc + r.shift(-j) ** 2
    out["rv5"] = 100.0 * np.sqrt((252.0 / 5.0) * acc)
    out["sample"] = np.where(out.index <= IS_END, "in", "out")
    return out


def next_trading_on_or_after(trading: pd.DatetimeIndex, when: pd.Timestamp) -> pd.Timestamp | None:
    later = trading[trading >= pd.Timestamp(when).normalize()]
    if len(later) == 0:
        return None
    return pd.Timestamp(later[0])


def next_tuesday_strict(day: pd.Timestamp) -> pd.Timestamp:
    day = pd.Timestamp(day).normalize()
    delta = (1 - int(day.weekday())) % 7
    if delta == 0:
        delta = 7
    return day + pd.Timedelta(days=int(delta))


def pearson(x: np.ndarray, y: np.ndarray) -> float:
    if x.size < 8:
        return float("nan")
    if np.std(x) == 0 or np.std(y) == 0:
        return float("nan")
    return float(np.corrcoef(x, y)[0, 1])


def spearman(x: np.ndarray, y: np.ndarray) -> float:
    if x.size < 8:
        return float("nan")
    rx = pd.Series(x).rank().to_numpy()
    ry = pd.Series(y).rank().to_numpy()
    return pearson(rx, ry)


def lag_table(signal: pd.Series, ret: pd.Series, ks: range) -> pd.DataFrame:
    rows = []
    for k in ks:
        aligned = pd.concat({"s": signal, "y": ret.shift(-k)}, axis=1).dropna()
        rows.append(
            {
                "k": k,
                "n": int(len(aligned)),
                "pearson": pearson(aligned["s"].to_numpy(), aligned["y"].to_numpy()),
                "spearman": spearman(aligned["s"].to_numpy(), aligned["y"].to_numpy()),
            }
        )
    return pd.DataFrame(rows)


def pair_stats(name: str, signal: pd.Series, target: pd.Series) -> dict:
    aligned = pd.concat({"s": signal, "y": target}, axis=1).dropna()
    n = int(len(aligned))
    return {
        "name": name,
        "n": n,
        "pearson": pearson(aligned["s"].to_numpy(), aligned["y"].to_numpy()) if n else float("nan"),
        "spearman": spearman(aligned["s"].to_numpy(), aligned["y"].to_numpy()) if n else float("nan"),
        "signal_mean": float(aligned["s"].mean()) if n else float("nan"),
        "target_mean": float(aligned["y"].mean()) if n else float("nan"),
    }


def save_table(path: Path, frame: pd.DataFrame) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(path, index=False)


def plot_two_series(path: Path, left: pd.Series, right: pd.Series, title: str, ylab_l: str, ylab_r: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots(figsize=(9, 4.2))
    ax.plot(left.index, left.values, color="#1f4e5f", lw=1.2, label=ylab_l)
    ax.set_ylabel(ylab_l, color="#1f4e5f")
    ax2 = ax.twinx()
    ax2.plot(right.index, right.values, color="#b85c38", lw=1.0, alpha=0.85, label=ylab_r)
    ax2.set_ylabel(ylab_r, color="#b85c38")
    ax.set_title(title)
    ax.axvline(IS_END, color="#888", ls="--", lw=0.8)
    ax.grid(True, alpha=0.25)
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)


def load_portwatch(filename: str) -> pd.DataFrame:
    path = RAW / "ALT-20260907-18" / STAMP / filename
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = [feat["attributes"] for feat in payload.get("features", [])]
    frame = pd.DataFrame(rows)
    frame["date"] = pd.to_datetime(frame["date"])
    frame = frame.set_index("date").sort_index()
    for col in ("n_tanker", "n_total", "capacity_tanker"):
        frame[col] = pd.to_numeric(frame[col], errors="coerce")
    return frame


def weekly_portwatch(daily: pd.DataFrame, col: str) -> pd.DataFrame:
    """월–일 주간 평균. 공개는 다음 화요일(공식 화 09:00 ET)."""
    week = daily[col].resample("W-SUN").mean().dropna().rename("value")
    out = week.to_frame()
    out["observed_week_end"] = out.index
    out["available_at"] = out.index.map(next_tuesday_strict)
    return out


def load_bh_oil_weekly() -> pd.DataFrame:
    path = RAW / "ALT-20260907-19" / STAMP / "bh_48162dfc.xlsx"
    raw = pd.read_excel(path, sheet_name="US Oil & Gas Split", engine="pyxlsb", header=None)
    header_row = None
    for i, row in raw.iterrows():
        vals = [str(v).strip() if pd.notna(v) else "" for v in row.tolist()]
        if vals and vals[0] == "Date" and "Oil" in vals:
            header_row = i
            break
    if header_row is None:
        raise ValueError("Baker Hughes Oil/Gas header not found")
    frame = raw.iloc[int(header_row) + 1 :].copy()
    frame.columns = ["Date", "Oil", "Gas", "Misc", "Total", "pct_oil"] + list(
        range(6, frame.shape[1])
    )
    serial = pd.to_numeric(frame["Date"], errors="coerce")
    frame = frame.loc[serial.notna()].copy()
    frame["date"] = pd.to_datetime("1899-12-30") + pd.to_timedelta(serial.loc[serial.notna()], unit="D")
    frame["oil"] = pd.to_numeric(frame["Oil"], errors="coerce")
    frame["gas"] = pd.to_numeric(frame["Gas"], errors="coerce")
    frame = frame.dropna(subset=["date", "oil"]).set_index("date").sort_index()
    frame.index = frame.index.normalize()
    # 금요일 발표 가정 → 다음 월요일
    frame["available_at"] = frame.index + pd.Timedelta(days=3)
    return frame


def load_cftc_wti() -> pd.DataFrame:
    rows: list[dict] = []
    for year in range(2015, 2024):
        zpath = RAW / "ALT-20260907-20" / STAMP / f"fut_disagg_txt_{year}.zip"
        with zipfile.ZipFile(zpath) as zf:
            name = zf.namelist()[0]
            text = zf.read(name).decode("latin-1")
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            if row.get("CFTC_Contract_Market_Code") != "067651":
                continue
            if row.get("Market_and_Exchange_Names") != "CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE":
                continue
            rows.append(row)
    frame = pd.DataFrame(rows)
    frame["date"] = pd.to_datetime(frame["Report_Date_as_YYYY-MM-DD"])
    long_ = pd.to_numeric(frame["M_Money_Positions_Long_All"], errors="coerce")
    short = pd.to_numeric(frame["M_Money_Positions_Short_All"], errors="coerce")
    oi = pd.to_numeric(frame["Open_Interest_All"], errors="coerce")
    out = pd.DataFrame(
        {
            "date": frame["date"],
            "mm_net": long_ - short,
            "oi": oi,
        }
    ).dropna()
    out["mm_net_oi"] = out["mm_net"] / out["oi"]
    out = out.drop_duplicates("date").set_index("date").sort_index()
    out["available_at"] = out.index + pd.Timedelta(days=3)
    return out


def load_bunker() -> pd.DataFrame:
    path = RAW / "ALT-20260907-21" / STAMP / "bunker_sales.csv"
    frame = pd.read_csv(path)
    frame["month"] = pd.to_datetime(frame["month"] + "-01")
    frame["bunker_sales"] = pd.to_numeric(frame["bunker_sales"], errors="coerce")
    monthly = frame.groupby("month", as_index=True)["bunker_sales"].sum().sort_index().to_frame("tonnes")
    month_end = monthly.index + pd.offsets.MonthEnd(0)
    monthly["available_at"] = month_end + pd.Timedelta(days=45)
    monthly["observed_month"] = monthly.index
    return monthly


def load_wiki(filename: str) -> pd.Series:
    path = RAW / "ALT-20260907-23" / STAMP / filename
    payload = json.loads(path.read_text(encoding="utf-8"))
    items = payload.get("items", [])
    idx = pd.to_datetime([it["timestamp"][:8] for it in items])
    views = pd.Series([it["views"] for it in items], index=idx, name="views").sort_index()
    views.index = views.index.normalize()
    return views


def load_fred_tsi() -> pd.DataFrame:
    path = RAW / "ALT-20260907-24" / STAMP / "TSIFRGHT.csv"
    frame = pd.read_csv(path)
    frame["date"] = pd.to_datetime(frame["observation_date"])
    frame["value"] = pd.to_numeric(frame["TSIFRGHT"], errors="coerce")
    frame = frame.dropna().set_index("date").sort_index()
    month_end = frame.index + pd.offsets.MonthEnd(0)
    frame["available_at"] = month_end + pd.Timedelta(days=45)
    return frame


def load_jet() -> pd.DataFrame:
    path = RAW / "ALT-20260907-25" / STAMP / "jet_weekly.xls"
    raw = pd.read_excel(path, sheet_name="Data 1", header=None)
    frame = raw.iloc[3:, [0, 1]].copy()
    frame.columns = ["date", "kbd"]
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame["kbd"] = pd.to_numeric(frame["kbd"], errors="coerce")
    frame = frame.dropna().set_index("date").sort_index()
    frame.index = frame.index.normalize()
    # WPSR: 주 종료 금요일, 수요일 10:30 ET 공개 → +5일
    frame["available_at"] = frame.index + pd.Timedelta(days=5)
    return frame


def map_signal(signal: pd.DataFrame, value_col: str, prices: pd.DataFrame) -> pd.DataFrame:
    trading = prices.index
    mapped = []
    for ts, row in signal.iterrows():
        avail = pd.Timestamp(row["available_at"]).normalize()
        trade = next_trading_on_or_after(trading, avail)
        if trade is None:
            continue
        mapped.append(
            {
                "signal_date": pd.Timestamp(ts).normalize(),
                "available_at": avail,
                "trade_date": trade,
                "value": float(row[value_col]) if pd.notna(row[value_col]) else float("nan"),
            }
        )
    out = pd.DataFrame(mapped).dropna(subset=["value"])
    if out.empty:
        return out
    out = out.drop_duplicates("trade_date", keep="last").set_index("trade_date").sort_index()
    return out


def is_filter(frame: pd.DataFrame) -> pd.DataFrame:
    return frame.loc[(frame.index >= IS_START) & (frame.index <= IS_END)].copy()


def delta(series: pd.Series) -> pd.Series:
    return series.diff()


def write_index_readme(cid: str, body: str) -> None:
    folder = IDX / cid
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "README.md").write_text(body, encoding="utf-8")


def main() -> None:
    PROC.mkdir(parents=True, exist_ok=True)
    IDX.mkdir(parents=True, exist_ok=True)
    prices = load_wti()
    is_px = is_filter(prices)
    summary_rows: list[dict] = []

    # --- 01 PortWatch ---
    hormuz = load_portwatch("hormuz.json")
    suez = load_portwatch("placebo_chokepoint1.json")
    malacca = load_portwatch("malacca.json")
    bering = load_portwatch("bering.json")
    h_week = weekly_portwatch(hormuz, "n_tanker")
    b_week = weekly_portwatch(bering, "n_total")
    s_week = weekly_portwatch(suez, "n_tanker")
    m_week = weekly_portwatch(malacca, "n_tanker")
    h_map = map_signal(h_week, "value", prices)
    b_map = map_signal(b_week, "value", prices)
    s_map = map_signal(s_week, "value", prices)
    m_map = map_signal(m_week, "value", prices)
    h_is = is_filter(h_map)
    panel01 = is_px.join(h_is["value"].rename("hormuz_tanker"), how="inner")
    panel01 = panel01.join(is_filter(b_map)["value"].rename("bering_total"), how="left")
    panel01 = panel01.join(is_filter(s_map)["value"].rename("suez_tanker"), how="left")
    panel01 = panel01.join(is_filter(m_map)["value"].rename("malacca_tanker"), how="left")
    panel01["d_hormuz"] = delta(panel01["hormuz_tanker"])
    panel01["d_bering"] = delta(panel01["bering_total"])
    stats01 = [
        pair_stats("hormuz_d_vs_f1", panel01["d_hormuz"], panel01["f1"]),
        pair_stats("hormuz_d_vs_rv5", panel01["d_hormuz"], panel01["rv5"]),
        pair_stats("hormuz_lvl_vs_f1", panel01["hormuz_tanker"], panel01["f1"]),
        pair_stats("bering_d_vs_f1", panel01["d_bering"], panel01["f1"]),
        pair_stats("suez_d_vs_f1", delta(panel01["suez_tanker"]), panel01["f1"]),
        pair_stats("malacca_d_vs_f1", delta(panel01["malacca_tanker"]), panel01["f1"]),
    ]
    lag01 = lag_table(panel01["d_hormuz"], panel01["f1"], range(-5, 6))
    out01 = PROC / "ALT-20260907-18" / RUN_ID
    out01.mkdir(parents=True, exist_ok=True)
    panel01.to_csv(out01 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-18" / "is_stats.csv", pd.DataFrame(stats01))
    save_table(IDX / "ALT-20260907-18" / "lag_f1.csv", lag01)
    plot_two_series(
        IDX / "ALT-20260907-18" / "hormuz_tanker_vs_wti_is.png",
        panel01["hormuz_tanker"],
        panel01["close"],
        "IS only: PortWatch Hormuz tanker count (weekly mean) vs CL=F close — dual axis, different units",
        "n_tanker weekly mean",
        "CL=F USD/bbl",
    )
    raw01 = RAW / "ALT-20260907-18" / STAMP / "hormuz.json"
    write_index_readme(
        "ALT-20260907-18",
        "\n".join(
            [
                "# ALT-20260907-18 PortWatch Hormuz tanker weekly",
                "",
                f"run `{RUN_ID}` · 인샘플만 · 원본 `{raw01.relative_to(REPO)}` sha256 `{sha256_file(raw01)}`",
                "",
                "## 사전 정의",
                "- 활동: IMF PortWatch `chokepoint6` 일별 `n_tanker`의 주(월–일) 평균.",
                "- 공개: 공식 FAQ 매주 화 09:00 ET. 주 종료일 다음 화요일을 `available_at`으로 두고 그 날 이후 첫 CL 거래일에 결합.",
                "- 타깃: 그 거래일의 `f1`(다음 1거래일 수익률), `rv5`(다음 5거래일 실현변동성, r_t 제외).",
                "- placebo: Bering `n_total` 동일 레시피. 보조: Suez/Malacca tanker.",
                "- 선택 구간: 2019-01-01(원천 시작)~2023-12-31. 2015–2018 없음.",
                "- OOS: 이 실행에서 계산하지 않음 (`UNSEEN` 주장 아님 — 파일에 2024+ 행이 있으나 통계에 미사용).",
                "",
                "## 실행 결과 (IS)",
                pd.DataFrame(stats01).to_string(index=False),
                "",
                "이중축 그림은 단위가 다르다. 크기를 같은 효과로 읽지 말 것.",
                "주장 가능: 이 원본으로 주간 유조선 척수 지수를 구성할 수 있다. 주장 불가: 알파·인과·거래 성과.",
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-18"} for s in stats01])

    # --- 02 Baker Hughes US oil rigs weekly ---
    bh = load_bh_oil_weekly()
    bh_map = map_signal(bh, "oil", prices)
    bh_is = is_filter(bh_map)
    panel02 = is_px.join(bh_is["value"].rename("oil_rigs"), how="inner")
    panel02["d_oil_rigs"] = delta(panel02["oil_rigs"])
    gas_map = map_signal(bh.assign(available_at=bh["available_at"]), "gas", prices) if "gas" in bh else None
    if gas_map is not None and not gas_map.empty:
        panel02 = panel02.join(is_filter(gas_map)["value"].rename("gas_rigs"), how="left")
        panel02["d_gas_rigs"] = delta(panel02["gas_rigs"])
    stats02 = [
        pair_stats("oilrig_d_vs_f1", panel02["d_oil_rigs"], panel02["f1"]),
        pair_stats("oilrig_d_vs_rv5", panel02["d_oil_rigs"], panel02["rv5"]),
        pair_stats("oilrig_lvl_vs_f1", panel02["oil_rigs"], panel02["f1"]),
    ]
    if "d_gas_rigs" in panel02:
        stats02.append(pair_stats("gasrig_d_vs_f1", panel02["d_gas_rigs"], panel02["f1"]))
    lag02 = lag_table(panel02["d_oil_rigs"], panel02["f1"], range(-5, 6))
    out02 = PROC / "ALT-20260907-19" / RUN_ID
    out02.mkdir(parents=True, exist_ok=True)
    panel02.to_csv(out02 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-19" / "is_stats.csv", pd.DataFrame(stats02))
    save_table(IDX / "ALT-20260907-19" / "lag_f1.csv", lag02)
    plot_two_series(
        IDX / "ALT-20260907-19" / "us_oil_rigs_vs_wti_is.png",
        panel02["oil_rigs"],
        panel02["close"],
        "IS only: Baker Hughes US oil rotary rigs vs CL=F close — dual axis, different units",
        "US oil rigs",
        "CL=F USD/bbl",
    )
    raw02 = RAW / "ALT-20260907-19" / STAMP / "bh_48162dfc.xlsx"
    write_index_readme(
        "ALT-20260907-19",
        "\n".join(
            [
                "# ALT-20260907-19 Baker Hughes US oil rotary rigs",
                "",
                f"run `{RUN_ID}` · 원본 `{raw02.relative_to(REPO)}` sha256 `{sha256_file(raw02)}`",
                "",
                "## 사전 정의",
                "- 시트 `US Oil & Gas Split`, 열 Oil. Excel serial date.",
                "- 공개: 관측 주 금요일 발표 가정, `available_at` = 날짜+3일(월요일) 이후 첫 CL 거래일. 당시 빈티지 미복원 → `NOT_PROVEN as-of-safe`.",
                "- placebo/보조: 같은 시트의 Gas 리그 주간 변화.",
                "- IS 2015-01-01~2023-12-31.",
                "",
                pd.DataFrame(stats02).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-19"} for s in stats02])

    # --- 03 CFTC ---
    cot = load_cftc_wti()
    cot_map = map_signal(cot, "mm_net", prices)
    cot_is = is_filter(cot_map)
    panel03 = is_px.join(cot_is["value"].rename("mm_net"), how="inner")
    panel03["d_mm"] = delta(panel03["mm_net"])
    stats03 = [
        pair_stats("mmnet_d_vs_f1", panel03["d_mm"], panel03["f1"]),
        pair_stats("mmnet_d_vs_rv5", panel03["d_mm"], panel03["rv5"]),
        pair_stats("mmnet_lvl_vs_f1", panel03["mm_net"], panel03["f1"]),
    ]
    lag03 = lag_table(panel03["d_mm"], panel03["f1"], range(-5, 6))
    out03 = PROC / "ALT-20260907-20" / RUN_ID
    out03.mkdir(parents=True, exist_ok=True)
    panel03.to_csv(out03 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-20" / "is_stats.csv", pd.DataFrame(stats03))
    save_table(IDX / "ALT-20260907-20" / "lag_f1.csv", lag03)
    plot_two_series(
        IDX / "ALT-20260907-20" / "cftc_mm_net_vs_wti_is.png",
        panel03["mm_net"],
        panel03["close"],
        "IS only: CFTC WTI managed-money net vs CL=F close — dual axis, different units",
        "MM net contracts",
        "CL=F USD/bbl",
    )
    raw03 = RAW / "ALT-20260907-20" / STAMP / "fut_disagg_txt_2019.zip"
    write_index_readme(
        "ALT-20260907-20",
        "\n".join(
            [
                "# ALT-20260907-20 CFTC WTI managed-money net",
                "",
                f"run `{RUN_ID}` · 코드 `067651` NYMEX Light Sweet. 예: `{raw03.relative_to(REPO)}` sha256 `{sha256_file(raw03)}`",
                "",
                "- 산식: Long_All − Short_All. 화요일 포지션, 금요일 공개 → +3일.",
                "- IS 2015–2023 ZIP만 (2024 ZIP 미수집).",
                "",
                pd.DataFrame(stats03).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-20"} for s in stats03])

    # --- 04 bunker ---
    bunker = load_bunker()
    bun_map = map_signal(bunker, "tonnes", prices)
    bun_is = is_filter(bun_map)
    panel04 = is_px.join(bun_is["value"].rename("bunker_t"), how="inner")
    panel04["d_bunker"] = delta(panel04["bunker_t"])
    stats04 = [
        pair_stats("bunker_d_vs_f1", panel04["d_bunker"], panel04["f1"]),
        pair_stats("bunker_d_vs_rv5", panel04["d_bunker"], panel04["rv5"]),
        pair_stats("bunker_d_vs_f5", panel04["d_bunker"], panel04["f5"]),
    ]
    out04 = PROC / "ALT-20260907-21" / RUN_ID
    out04.mkdir(parents=True, exist_ok=True)
    panel04.to_csv(out04 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-21" / "is_stats.csv", pd.DataFrame(stats04))
    plot_two_series(
        IDX / "ALT-20260907-21" / "singapore_bunker_vs_wti_is.png",
        panel04["bunker_t"],
        panel04["close"],
        "IS only: Singapore MPA bunker sales (all types, tonnes) vs CL=F — dual axis",
        "bunker tonnes",
        "CL=F USD/bbl",
    )
    raw04 = RAW / "ALT-20260907-21" / STAMP / "bunker_sales.csv"
    write_index_readme(
        "ALT-20260907-21",
        "\n".join(
            [
                "# ALT-20260907-21 Singapore MPA bunker sales",
                "",
                f"run `{RUN_ID}` · `{raw04.relative_to(REPO)}` sha256 `{sha256_file(raw04)}`",
                "",
                "- 월별 전 유종 합(톤). `available_at` = 월말+45일 (정확한 공표 달력 미복원, NOT_PROVEN as-of-safe).",
                "- 월간이라 일별 f1 상관의 독립 n은 월 관측 수에 가깝다.",
                "",
                pd.DataFrame(stats04).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-21"} for s in stats04])

    # --- 06 wiki ---
    cushing = load_wiki("cushing.json")
    pizza = load_wiki("pizza_placebo.json")
    spr = load_wiki("spr.json")

    def wiki_map(views: pd.Series) -> pd.DataFrame:
        frame = views.to_frame("views")
        frame["available_at"] = frame.index + pd.Timedelta(days=1)
        return map_signal(frame, "views", prices)

    c_map = is_filter(wiki_map(cushing))
    p_map = is_filter(wiki_map(pizza))
    s_map = is_filter(wiki_map(spr))
    panel06 = is_px.join(c_map["value"].rename("cushing"), how="inner")
    panel06 = panel06.join(p_map["value"].rename("pizza"), how="left")
    panel06 = panel06.join(s_map["value"].rename("spr"), how="left")
    panel06["d_cushing"] = delta(panel06["cushing"])
    panel06["d_pizza"] = delta(panel06["pizza"])
    panel06["d_spr"] = delta(panel06["spr"])
    stats06 = [
        pair_stats("cushing_d_vs_f1", panel06["d_cushing"], panel06["f1"]),
        pair_stats("cushing_d_vs_rv5", panel06["d_cushing"], panel06["rv5"]),
        pair_stats("pizza_d_vs_f1", panel06["d_pizza"], panel06["f1"]),
        pair_stats("spr_d_vs_f1", panel06["d_spr"], panel06["f1"]),
    ]
    lag06 = lag_table(panel06["d_cushing"], panel06["f1"], range(-5, 6))
    out06 = PROC / "ALT-20260907-23" / RUN_ID
    out06.mkdir(parents=True, exist_ok=True)
    panel06.to_csv(out06 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-23" / "is_stats.csv", pd.DataFrame(stats06))
    save_table(IDX / "ALT-20260907-23" / "lag_f1.csv", lag06)
    plot_two_series(
        IDX / "ALT-20260907-23" / "cushing_wiki_vs_wti_is.png",
        panel06["cushing"],
        panel06["close"],
        "IS only: Wikipedia Cushing, Oklahoma pageviews (D+1) vs CL=F — dual axis",
        "pageviews",
        "CL=F USD/bbl",
    )
    raw06 = RAW / "ALT-20260907-23" / STAMP / "cushing.json"
    write_index_readme(
        "ALT-20260907-23",
        "\n".join(
            [
                "# ALT-20260907-23 Wikipedia Cushing, Oklahoma pageviews",
                "",
                f"run `{RUN_ID}` · `{raw06.relative_to(REPO)}` sha256 `{sha256_file(raw06)}`",
                "",
                "- D+1 정렬. 당시 적재 시각 영수증 없음 → NOT_PROVEN as-of-safe. 후보 점수 산정 금지에 가깝고 탐색만.",
                "- placebo: Pizza 문서. 보조: Strategic Petroleum Reserve 문서.",
                "",
                pd.DataFrame(stats06).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-23"} for s in stats06])

    # --- 07 freight TSI ---
    tsi = load_fred_tsi()
    tsi_map = map_signal(tsi, "value", prices)
    tsi_is = is_filter(tsi_map)
    panel07 = is_px.join(tsi_is["value"].rename("tsi"), how="inner")
    panel07["d_tsi"] = delta(panel07["tsi"])
    stats07 = [
        pair_stats("tsi_d_vs_f1", panel07["d_tsi"], panel07["f1"]),
        pair_stats("tsi_d_vs_rv5", panel07["d_tsi"], panel07["rv5"]),
        pair_stats("tsi_d_vs_f5", panel07["d_tsi"], panel07["f5"]),
    ]
    out07 = PROC / "ALT-20260907-24" / RUN_ID
    out07.mkdir(parents=True, exist_ok=True)
    panel07.to_csv(out07 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-24" / "is_stats.csv", pd.DataFrame(stats07))
    plot_two_series(
        IDX / "ALT-20260907-24" / "freight_tsi_vs_wti_is.png",
        panel07["tsi"],
        panel07["close"],
        "IS only: FRED TSIFRGHT vs CL=F — dual axis",
        "Freight TSI (2000=100)",
        "CL=F USD/bbl",
    )
    raw07 = RAW / "ALT-20260907-24" / STAMP / "TSIFRGHT.csv"
    write_index_readme(
        "ALT-20260907-24",
        "\n".join(
            [
                "# ALT-20260907-24 BTS Freight TSI via FRED",
                "",
                f"run `{RUN_ID}` · `{raw07.relative_to(REPO)}` sha256 `{sha256_file(raw07)}`",
                "",
                "- 월간. `available_at`=월말+45일. 빈티지 미복원.",
                "- 파이프라인 물동량 포함. 원유 고유 활동이 아님.",
                "",
                pd.DataFrame(stats07).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-24"} for s in stats07])

    # --- 08 jet ---
    jet = load_jet()
    jet_map = map_signal(jet, "kbd", prices)
    jet_is = is_filter(jet_map)
    panel08 = is_px.join(jet_is["value"].rename("jet_kbd"), how="inner")
    panel08["d_jet"] = delta(panel08["jet_kbd"])
    stats08 = [
        pair_stats("jet_d_vs_f1", panel08["d_jet"], panel08["f1"]),
        pair_stats("jet_d_vs_rv5", panel08["d_jet"], panel08["rv5"]),
        pair_stats("jet_lvl_vs_f1", panel08["jet_kbd"], panel08["f1"]),
    ]
    lag08 = lag_table(panel08["d_jet"], panel08["f1"], range(-5, 6))
    out08 = PROC / "ALT-20260907-25" / RUN_ID
    out08.mkdir(parents=True, exist_ok=True)
    panel08.to_csv(out08 / "is_panel.csv")
    save_table(IDX / "ALT-20260907-25" / "is_stats.csv", pd.DataFrame(stats08))
    save_table(IDX / "ALT-20260907-25" / "lag_f1.csv", lag08)
    plot_two_series(
        IDX / "ALT-20260907-25" / "jet_supplied_vs_wti_is.png",
        panel08["jet_kbd"],
        panel08["close"],
        "IS only: EIA weekly jet fuel product supplied vs CL=F — dual axis",
        "jet kbd",
        "CL=F USD/bbl",
    )
    raw08 = RAW / "ALT-20260907-25" / STAMP / "jet_weekly.xls"
    write_index_readme(
        "ALT-20260907-25",
        "\n".join(
            [
                "# ALT-20260907-25 EIA weekly kerosene-type jet fuel product supplied",
                "",
                f"run `{RUN_ID}` · `{raw08.relative_to(REPO)}` sha256 `{sha256_file(raw08)}`",
                "",
                "- WKJUPUS2. 주 종료+5일. API 키 없이 dnav XLS.",
                "- 공식 수요 통계. 피자급 국소 활동이 아님. 039 휘발유 수요와 같은 가족.",
                "",
                pd.DataFrame(stats08).to_string(index=False),
            ]
        )
        + "\n",
    )
    summary_rows.extend([{**s, "candidate_id": "ALT-20260907-25"} for s in stats08])

    summary = pd.DataFrame(summary_rows)
    save_table(IDX / "HUNT-20260907-is-stats.csv", summary)
    (PROC / "HUNT-20260907-summary.json").write_text(
        json.dumps(
            {
                "run_id": RUN_ID,
                "is_window": ["2015-01-01", "2023-12-31"],
                "oos_used_for_selection": False,
                "rows": summary.to_dict(orient="records"),
            },
            indent=2,
            default=str,
        ),
        encoding="utf-8",
    )
    print(summary.to_string(index=False))
    print("DONE", RUN_ID)


if __name__ == "__main__":
    main()
