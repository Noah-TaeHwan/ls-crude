"""2026-09-07 joint hunt: PortWatch Hormuz + FRED HY OAS vs WTI RV.

실행:
  research/.venv/bin/python research/notebooks/ALT-20260907-04/run_portwatch_hyoas_hunt.py

출력: gathering/raw, data/processed, indexes, reports JSON.
가설 채택·알파 주장이 아니라 탐색 영수증이다.
"""

from __future__ import annotations

import hashlib
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "research" / "src"))
from ls_crude.data.yahoo import download_ohlcv

UA = {"User-Agent": "ls-crude-research/0.1 (https://github.com/Noah-TaeHwan/ls-crude)"}
RUN_TS = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
IS_START, IS_END = "2015-01-01", "2023-12-31"
OOS_START = "2024-01-01"


def sha256(path: Path) -> str:
    """파일 SHA-256.

    @param path: 대상 파일
    @returns: hex digest
    """
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fetch_portwatch_hormuz() -> pd.DataFrame:
    """IMF PortWatch Hormuz(chokepoint6) 일별 통과 척수를 페이지네이션으로 받는다.

    @returns: date·n_total·n_tanker 등
    """
    base = (
        "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/"
        "Daily_Chokepoints_Data/FeatureServer/0/query"
    )
    fields = "date,n_total,n_tanker,n_container,n_dry_bulk,n_general_cargo,n_roro,portid"
    rows: list[dict] = []
    offset = 0
    while True:
        url = (
            f"{base}?where=portid%3D%27chokepoint6%27"
            f"&outFields={fields}"
            f"&orderByFields=date%20ASC&resultRecordCount=1000&resultOffset={offset}&f=json"
        )
        request = Request(url, headers=UA)
        with urlopen(request, timeout=60) as response:
            payload = json.loads(response.read().decode())
        if payload.get("error"):
            raise RuntimeError(payload["error"])
        features = payload.get("features") or []
        if not features:
            break
        for feature in features:
            rows.append(feature["attributes"])
        if len(features) < 1000:
            break
        offset += 1000
    frame = pd.DataFrame(rows)
    if frame.empty:
        raise RuntimeError("PortWatch returned empty Hormuz series")
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce").dt.tz_localize(None).dt.normalize()
    for column in [name for name in frame.columns if name.startswith("n_")]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    return frame.dropna(subset=["date"]).sort_values("date").drop_duplicates("date", keep="last")


def fetch_fred(series_id: str, raw_dir: Path) -> pd.Series:
    """FRED fredgraph.csv를 받아 저장한다.

    @param series_id: FRED ID
    @param raw_dir: 원본 저장 폴더
    @returns: 날짜 인덱스 시계열
    """
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    request = Request(url, headers=UA)
    with urlopen(request, timeout=60) as response:
        raw = response.read()
    raw_dir.mkdir(parents=True, exist_ok=True)
    out = raw_dir / f"{series_id}.csv"
    out.write_bytes(raw)
    frame = pd.read_csv(out)
    date_column = "observation_date" if "observation_date" in frame.columns else "DATE"
    value_column = series_id if series_id in frame.columns else frame.columns[-1]
    series = frame.set_index(pd.to_datetime(frame[date_column], errors="coerce"))[value_column]
    series = pd.to_numeric(series, errors="coerce").dropna().sort_index()
    series.index = pd.to_datetime(series.index).tz_localize(None).normalize()
    series.name = series_id
    return series


def realized_vol(close: pd.Series, horizon: int = 5) -> pd.Series:
    """신호일 t 기준 다음 horizon 거래일 실현변동성(% 연환산 RMS).

    @param close: CL=F Close
    @param horizon: 미래 창 길이
    @returns: RV 시계열
    """
    returns = close.pct_change()
    values = returns.to_numpy()
    out = np.full(len(close), np.nan)
    for index in range(len(close) - horizon):
        window = values[index + 1 : index + 1 + horizon]
        if np.isnan(window).any():
            continue
        out[index] = 100.0 * math.sqrt((252.0 / horizon) * np.sum(window**2))
    return pd.Series(out, index=close.index, name=f"rv{horizon}")


def align_signal_to_wti(signal: pd.Series, prices: pd.DataFrame, lag_days: int) -> pd.DataFrame:
    """관측일+lag 이후 첫 WTI 거래일에 신호를 붙인다.

    @param signal: 관측일 인덱스 신호
    @param prices: Yahoo CL=F
    @param lag_days: 보수적 공개 지연(달력일)
    @returns: Close·index_value·rv5·ret1 패널
    """
    available = signal.copy()
    available.index = available.index + pd.Timedelta(days=lag_days)
    trade = prices.copy()
    trade.index = pd.to_datetime(trade.index).tz_localize(None).normalize()
    rows = []
    for date, value in available.items():
        later = trade.index[trade.index > pd.Timestamp(date)]
        if len(later) == 0:
            continue
        rows.append({"signal_date": later[0], "index_value": float(value)})
    aligned = pd.DataFrame(rows).drop_duplicates("signal_date", keep="last").set_index("signal_date")
    panel = trade.join(aligned, how="inner")
    panel["rv5"] = realized_vol(panel["Close"], 5)
    panel["ret1"] = panel["Close"].pct_change().shift(-1)
    return panel


def corr_split(panel: pd.DataFrame, column: str, target: str) -> dict:
    """인샘플/아웃샘플 Pearson 상관.

    @param panel: 결합 패널
    @param column: 지수 열
    @param target: 타깃 열
    @returns: IS/OOS n·r
    """

    def one(mask: pd.Series) -> dict:
        subset = panel.loc[mask, [column, target]].dropna()
        if len(subset) < 8:
            return {"n": int(len(subset)), "r": None}
        return {
            "n": int(len(subset)),
            "r": float(subset[column].corr(subset[target], method="pearson")),
        }

    in_sample = (panel.index >= IS_START) & (panel.index <= IS_END)
    out_sample = panel.index >= OOS_START
    return {"IS": one(in_sample), "OOS": one(out_sample)}


def lag_curve(panel: pd.DataFrame, column: str, target: str, lags=range(-5, 6)) -> list[dict]:
    """인샘플 lag 곡선 corr(I_t, target_{t+k}).

    @param panel: 결합 패널
    @param column: 지수
    @param target: 타깃
    @param lags: k 목록
    @returns: lag별 n·r
    """
    in_sample = panel.loc[(panel.index >= IS_START) & (panel.index <= IS_END)].copy()
    rows = []
    for lag in lags:
        paired = pd.concat([in_sample[column], in_sample[target].shift(-lag)], axis=1).dropna()
        paired.columns = ["x", "y"]
        rows.append(
            {
                "lag_k": int(lag),
                "n": int(len(paired)),
                "r": float(paired["x"].corr(paired["y"])) if len(paired) >= 8 else None,
            }
        )
    return rows


def main() -> None:
    """수집·지수·WTI 관계 검정을 실행하고 영수증을 남긴다."""
    portwatch = fetch_portwatch_hormuz()
    portwatch_raw = ROOT / f"research/gathering/raw/ALT-20260907-04/{RUN_TS}"
    portwatch_raw.mkdir(parents=True, exist_ok=True)
    portwatch_path = portwatch_raw / "hormuz_chokepoint6_daily.csv"
    portwatch.to_csv(portwatch_path, index=False)
    (portwatch_raw / "manifest.json").write_text(
        json.dumps(
            {
                "retrieved_at_utc": RUN_TS,
                "source": "IMF PortWatch Daily_Chokepoints_Data ArcGIS FeatureServer",
                "filter": "portid=chokepoint6",
                "url_template": (
                    "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/"
                    "Daily_Chokepoints_Data/FeatureServer/0/query"
                ),
                "rows": int(len(portwatch)),
                "start": str(portwatch["date"].min().date()),
                "end": str(portwatch["date"].max().date()),
                "sha256": sha256(portwatch_path),
                "license_note": (
                    "IMF PortWatch © IMF; citation Kpler/UNGP/IMF; "
                    "commercial redistribution may need copyright@imf.org"
                ),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    (portwatch_raw / "README.md").write_text(
        f"# ALT-20260907-04 PortWatch Hormuz raw\n\nUTC retrieve: `{RUN_TS}`\n\n"
        f"rows={len(portwatch)} | {portwatch['date'].min().date()}.."
        f"{portwatch['date'].max().date()}\n\n"
        f"File `{portwatch_path.name}` sha256 `{sha256(portwatch_path)}`.\n"
        "CSV is gitignored; do not commit the dump.\n",
        encoding="utf-8",
    )

    hy_raw = ROOT / f"research/gathering/raw/ALT-20260907-30/{RUN_TS}"
    hy_oas = fetch_fred("BAMLH0A0HYM2", hy_raw)
    (hy_raw / "manifest.json").write_text(
        json.dumps(
            {
                "retrieved_at_utc": RUN_TS,
                "source": "FRED BAMLH0A0HYM2",
                "url": "https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2",
                "rows": int(hy_oas.notna().sum()),
                "start": str(hy_oas.index.min().date()),
                "end": str(hy_oas.index.max().date()),
                "sha256": sha256(hy_raw / "BAMLH0A0HYM2.csv"),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    (hy_raw / "README.md").write_text(
        f"# ALT-20260907-30 FRED HY OAS raw\n\nUTC retrieve: `{RUN_TS}`\n\n"
        f"series BAMLH0A0HYM2 rows={int(hy_oas.notna().sum())} | "
        f"{hy_oas.index.min().date()}..{hy_oas.index.max().date()}\n\n"
        f"sha256 `{sha256(hy_raw / 'BAMLH0A0HYM2.csv')}`.\n",
        encoding="utf-8",
    )

    prices = download_ohlcv("CL=F", start="2015-01-01")
    transit = portwatch.set_index("date")["n_total"].astype(float).sort_index()
    transit_z = (
        (transit - transit.rolling(20, min_periods=10).mean())
        / transit.rolling(20, min_periods=10).std()
    )
    transit_z = transit_z.replace([np.inf, -np.inf], np.nan).dropna()
    portwatch_panel = align_signal_to_wti(transit_z.rename("pw_z20"), prices, lag_days=9)

    placebo = transit_z.copy()
    placebo.index = placebo.index + pd.Timedelta(days=180)
    placebo_panel = align_signal_to_wti(placebo.rename("pw_z20_placebo"), prices, lag_days=9)

    hy_change = hy_oas.diff().dropna()
    hy_panel = align_signal_to_wti(hy_change.rename("hy_doas"), prices, lag_days=1)
    merged = pd.concat(
        [hy_oas.rename("oas"), np.log(prices["Close"]).rename("log_cl")],
        axis=1,
    ).dropna()
    in_sample_fit = merged.loc[(merged.index >= IS_START) & (merged.index <= IS_END)]
    beta, alpha = [float(value) for value in np.polyfit(
        in_sample_fit["log_cl"].to_numpy(),
        in_sample_fit["oas"].to_numpy(),
        1,
    )]
    residual = (merged["oas"] - (alpha + beta * merged["log_cl"])).rename("codc_resid")
    codc_panel = align_signal_to_wti(residual, prices, lag_days=1)

    portwatch_proc = ROOT / f"research/data/processed/ALT-20260907-04/{RUN_TS}"
    portwatch_proc.mkdir(parents=True, exist_ok=True)
    portwatch_panel.to_csv(portwatch_proc / "index_wti_panel.csv")
    transit_z.to_csv(portwatch_proc / "pw_z20.csv", header=True)

    hy_proc = ROOT / f"research/data/processed/ALT-20260907-30/{RUN_TS}"
    hy_proc.mkdir(parents=True, exist_ok=True)
    hy_panel.to_csv(hy_proc / "hy_doas_panel.csv")
    codc_panel.to_csv(hy_proc / "codc_resid_panel.csv")

    results = {
        "run_utc": RUN_TS,
        "assumptions": {
            "portwatch_lag_calendar_days": 9,
            "portwatch_index": "20d rolling z-score of n_total (Hormuz chokepoint6)",
            "portwatch_coverage": (
                f"{portwatch['date'].min().date()} .. {portwatch['date'].max().date()} "
                f"n={len(portwatch)}"
            ),
            "hy_lag_calendar_days": 1,
            "hy_index_primary": "1d change in BAMLH0A0HYM2",
            "codc_index": "IS-fit residual OAS - (a + b*log CL Close); a,b fit 2015-2023 only",
            "codc_beta_is": beta,
            "codc_alpha_is": alpha,
            "target_primary": "next 5 trading-day WTI RV (% ann. RMS)",
            "split": (
                "IS 2015-01-01..2023-12-31; OOS 2024-01-01+ exploratory "
                "(repo already SEEN elsewhere — not E4)"
            ),
            "nulls": (
                "PortWatch starts ~2019 — no backfill to 2015. "
                "Missing days not imputed as 0."
            ),
        },
        "portwatch_z_vs_rv5": corr_split(portwatch_panel, "index_value", "rv5"),
        "portwatch_z_vs_ret1": corr_split(portwatch_panel, "index_value", "ret1"),
        "portwatch_placebo_shift180_vs_rv5": corr_split(placebo_panel, "index_value", "rv5"),
        "hy_doas_vs_rv5": corr_split(hy_panel, "index_value", "rv5"),
        "codc_resid_vs_rv5": corr_split(codc_panel, "index_value", "rv5"),
        "portwatch_lag_curve_is_rv5": lag_curve(portwatch_panel, "index_value", "rv5"),
    }

    figure, axes = plt.subplots(2, 1, figsize=(10, 7))
    subset = portwatch_panel.loc[portwatch_panel.index >= "2019-01-01"]
    axes[0].plot(
        subset.index,
        subset["index_value"],
        color="#1f4e5f",
        lw=0.8,
        label="Hormuz z20 (+9d avail)",
    )
    axes[0].set_ylabel("z")
    axes[0].set_title("ALT-20260907-04 PortWatch Hormuz n_total z20")
    axes[0].legend(loc="upper left", fontsize=8)
    twin = axes[0].twinx()
    twin.plot(subset.index, subset["Close"], color="#b85c38", lw=0.7, alpha=0.65)
    twin.set_ylabel("CL=F")
    hy_subset = hy_panel.loc[hy_panel.index >= "2015-01-01"]
    axes[1].plot(
        hy_subset.index,
        hy_subset["index_value"],
        color="#1f4e5f",
        lw=0.55,
        label="Δ HY OAS (+1d)",
    )
    axes[1].set_title("ALT-20260907-30 ICE BofA HY OAS daily change")
    axes[1].legend(loc="upper left", fontsize=8)
    figure.tight_layout()
    for candidate_id in ["ALT-20260907-04", "ALT-20260907-30"]:
        directory = ROOT / "research" / "indexes" / candidate_id
        directory.mkdir(parents=True, exist_ok=True)
        figure.savefig(directory / f"series_{RUN_TS}.png", dpi=120)
    plt.close(figure)

    figure, axes = plt.subplots(1, 2, figsize=(10, 4))
    for axis, panel, title in [
        (axes[0], portwatch_panel, "PortWatch z20 vs RV5 (IS)"),
        (axes[1], codc_panel, "CODC resid vs RV5 (IS)"),
    ]:
        in_sample = panel.loc[
            (panel.index >= IS_START) & (panel.index <= IS_END),
            ["index_value", "rv5"],
        ].dropna()
        axis.scatter(in_sample["index_value"], in_sample["rv5"], s=8, alpha=0.35, color="#1f4e5f")
        axis.set_xlabel("index")
        axis.set_ylabel("WTI RV5")
        axis.set_title(title)
    figure.tight_layout()
    for candidate_id in ["ALT-20260907-04", "ALT-20260907-30"]:
        figure.savefig(
            ROOT / "research" / "indexes" / candidate_id / f"scatter_is_{RUN_TS}.png",
            dpi=120,
        )
    plt.close(figure)

    results_path = ROOT / "research/reports/2026-09-07-joint-hunt-portwatch-hyoas.json"
    results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
    print("RUN_TS", RUN_TS)


if __name__ == "__main__":
    main()
