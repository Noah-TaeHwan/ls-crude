#!/usr/bin/env python3
"""2026-09-07 헌트: 공개 원본을 후보별 수집시각 폴더에 저장한다.

표준 라이브러리만 사용한다. 자격증명·Investing.com 스크래핑 없음.
실패도 HTTP 상태·오류를 manifest에 남긴다.
"""

from __future__ import annotations

import hashlib
import json
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STAMP = "20260907T063658Z"
UA = "ls-crude-research/0.1 (https://github.com/Noah-TaeHwan/ls-crude; alt-data hunt)"
CTX = ssl.create_default_context()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch(url: str, timeout: int = 60, extra_headers: dict[str, str] | None = None) -> tuple[int, bytes, str]:
    headers = {"User-Agent": UA, "Accept": "*/*"}
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as resp:
            body = resp.read()
            return int(resp.status), body, ""
    except urllib.error.HTTPError as err:
        body = err.read() if err.fp else b""
        return int(err.code), body, str(err)
    except Exception as err:  # noqa: BLE001 — 수집 영수증용
        return 0, b"", f"{type(err).__name__}: {err}"


def save_raw(candidate_id: str, filename: str, url: str, body: bytes, status: int, error: str) -> dict:
    folder = ROOT / "gathering" / "raw" / candidate_id / STAMP
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / filename
    if body:
        path.write_bytes(body)
    row = {
        "candidate_id": candidate_id,
        "filename": filename,
        "url": url,
        "status": status,
        "bytes": len(body),
        "sha256": sha256_bytes(body) if body else "",
        "error": error,
        "retrieved_at_utc": STAMP,
        "path": str(path.relative_to(ROOT.parent)),
    }
    return row


def write_folder_readme(candidate_id: str, rows: list[dict], extra: str) -> None:
    folder = ROOT / "gathering" / "raw" / candidate_id / STAMP
    folder.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# {candidate_id} raw {STAMP}",
        "",
        f"수집시각(UTC): {STAMP}",
        "User-Agent: ls-crude-research/0.1",
        "Investing.com 스크래핑 없음. 키·쿠키 없음.",
        "",
        extra.strip(),
        "",
        "| 파일 | HTTP | bytes | SHA-256 | URL |",
        "| --- | ---: | ---: | --- | --- |",
    ]
    for row in rows:
        lines.append(
            f"| `{row['filename']}` | {row['status']} | {row['bytes']} | `{row['sha256'][:16] or 'empty'}…` | {row['url']} |"
        )
        if row["error"]:
            lines.append(f"|  | 오류 |  |  | {row['error'][:200]} |")
    (folder / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def collect_portwatch() -> list[dict]:
    cid = "ALT-20260907-18"
    rows: list[dict] = []
    base = (
        "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/"
        "Daily_Chokepoints_Data/FeatureServer/0/query"
    )
    for portid, name in (("chokepoint6", "hormuz"), ("chokepoint1", "placebo_chokepoint1")):
        query = urllib.parse.urlencode(
            {
                "where": f"portid='{portid}'",
                "outFields": "*",
                "maxRecordCountFactor": "5",
                "outSR": "4326",
                "f": "json",
                "orderByFields": "date",
                "resultRecordCount": "5000",
            }
        )
        url = f"{base}?{query}"
        status, body, error = fetch(url, timeout=90)
        rows.append(save_raw(cid, f"{name}.json", url, body, status, error))
        time.sleep(0.4)
    # distinct names for placebo mapping
    dist = urllib.parse.urlencode(
        {
            "where": "1=1",
            "outFields": "portid,portname",
            "returnDistinctValues": "true",
            "f": "json",
            "resultRecordCount": "1000",
        }
    )
    url = f"{base}?{dist}"
    status, body, error = fetch(url, timeout=60)
    rows.append(save_raw(cid, "chokepoint_ids.json", url, body, status, error))
    write_folder_readme(
        cid,
        rows,
        "출처: IMF PortWatch ArcGIS REST Daily_Chokepoints_Data. FAQ 예시 URL. "
        "상업 재배포는 copyright@imf.org. 원본 JSON은 gitignored.",
    )
    return rows


def collect_eia_rigs() -> list[dict]:
    cid = "ALT-20260907-19"
    urls = [
        (
            "oil_rotary_weekly.xls",
            "https://www.eia.gov/dnav/pet/hist_xls/E_ERTRR0_XR0_NUS_Cw.xls",
        ),
        (
            "oil_rotary_weekly_leaf.html",
            "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=E_ERTRRO_XR0_NUS_C&f=W",
        ),
        (
            "drill_weekly.xls",
            "https://www.eia.gov/dnav/pet/xls/PET_CRD_DRILL_S1_W.xls",
        ),
        (
            "ng_rotary_monthly.html",
            "https://www.eia.gov/dnav/ng/hist/e_ertrr0_xr0_nus_cM.htm",
        ),
        (
            "pet_drill_monthly.html",
            "https://www.eia.gov/dnav/pet/pet_crd_drill_s1_m.htm",
        ),
        (
            "baker_hughes_na.html",
            "https://rigcount.bakerhughes.com/na-rig-count/",
        ),
    ]
    rows: list[dict] = []
    for filename, url in urls:
        status, body, error = fetch(url, timeout=60)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "EIA dnav는 Baker Hughes 리그카운트를 허가 받아 재공표. Baker Hughes 원 엑셀도 시도. "
        "API 키 없음.",
    )
    return rows


def collect_cftc() -> list[dict]:
    cid = "ALT-20260907-20"
    rows: list[dict] = []
    for year in range(2015, 2024):
        url = f"https://www.cftc.gov/files/dea/history/fut_disagg_txt_{year}.zip"
        status, body, error = fetch(url, timeout=90)
        rows.append(save_raw(cid, f"fut_disagg_txt_{year}.zip", url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "CFTC Disaggregated Futures Only 연간 ZIP. 공개 시장 보고서. 원본 gitignored.",
    )
    return rows


def collect_sg_bunker() -> list[dict]:
    cid = "ALT-20260907-21"
    rows: list[dict] = []
    urls = [
        (
            "poll_download.json",
            "https://api-open.data.gov.sg/v1/public/api/datasets/d_4f5abbf4486bf8e52bbed3be56dde562/poll-download",
        ),
        (
            "datastore_search.json",
            "https://data.gov.sg/api/action/datastore_search?resource_id=d_4f5abbf4486bf8e52bbed3be56dde562&limit=5",
        ),
        (
            "dataset_page.html",
            "https://data.gov.sg/datasets/d_4f5abbf4486bf8e52bbed3be56dde562/view",
        ),
        (
            "opendata_licence.html",
            "https://data.gov.sg/open-data-licence",
        ),
    ]
    for filename, url in urls:
        status, body, error = fetch(url, timeout=60)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.3)
    # If poll-download returned a URL, fetch CSV
    poll_path = ROOT / "gathering" / "raw" / cid / STAMP / "poll_download.json"
    if poll_path.exists() and poll_path.stat().st_size:
        try:
            payload = json.loads(poll_path.read_text(encoding="utf-8"))
            csv_url = (
                payload.get("data", {}).get("url")
                or payload.get("url")
                or payload.get("result", {}).get("url")
            )
            if csv_url:
                status, body, error = fetch(str(csv_url), timeout=90)
                rows.append(save_raw(cid, "bunker_sales.csv", str(csv_url), body, status, error))
        except Exception as err:  # noqa: BLE001
            rows.append(
                save_raw(cid, "bunker_sales.csv", "poll-download-parse", b"", 0, str(err))
            )
    write_folder_readme(
        cid,
        rows,
        "Singapore data.gov.sg dataset d_4f5abbf4486bf8e52bbed3be56dde562. Open Data Licence.",
    )
    return rows


def collect_opensky() -> list[dict]:
    cid = "ALT-20260907-22"
    rows: list[dict] = []
    live = "https://opensky-network.org/api/states/all?lamin=24.0&lomin=56.0&lamax=27.5&lomax=58.5"
    status, body, error = fetch(live, timeout=30)
    rows.append(save_raw(cid, "live_hormuz_bbox.json", live, body, status, error))
    hist = "https://opensky-network.org/api/flights/all?begin=1420070400&end=1420156800"
    status, body, error = fetch(hist, timeout=30)
    rows.append(save_raw(cid, "historical_2015_probe.json", hist, body, status, error))
    faq = "https://opensky-network.org/about/faq"
    status, body, error = fetch(faq, timeout=30)
    rows.append(save_raw(cid, "faq.html", faq, body, status, error))
    write_folder_readme(
        cid,
        rows,
        "OpenSky REST. 역사 전체는 연구기관 신청. 라이브 bbox는 인샘플 시계열이 아님.",
    )
    return rows


def collect_wiki() -> list[dict]:
    cid = "ALT-20260907-23"
    rows: list[dict] = []
    articles = {
        "Cushing,_Oklahoma": "cushing.json",
        "Strategic_Petroleum_Reserve_(United_States)": "spr.json",
        "Pizza": "pizza_placebo.json",
    }
    for article, filename in articles.items():
        url = (
            "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
            f"en.wikipedia/all-access/user/{article}/daily/20150701/20231231"
        )
        status, body, error = fetch(url, timeout=60)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.4)
    write_folder_readme(
        cid,
        rows,
        "Wikimedia Pageviews REST. 데이터 CC0. UA 필수. 당일값은 불완전할 수 있음.",
    )
    return rows


def collect_fred_freight() -> list[dict]:
    cid = "ALT-20260907-24"
    rows: list[dict] = []
    for series in ("TSIFRGHT", "DCOILWTICO"):
        url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}"
        status, body, error = fetch(url, timeout=45)
        rows.append(save_raw(cid, f"{series}.csv", url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "FRED fredgraph.csv. TSIFRGHT=BTS Freight TSI. DCOILWTICO는 현물 참고이며 WTI 타깃은 Yahoo CL=F.",
    )
    return rows


def collect_eia_jet() -> list[dict]:
    cid = "ALT-20260907-25"
    rows: list[dict] = []
    urls = [
        (
            "weekly_product_supplied.html",
            "https://www.eia.gov/dnav/pet/pet_cons_wpsup_k_4.htm",
        ),
        (
            "jet_weekly_leaf.html",
            "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=WKJUPUS2&f=W",
        ),
        (
            "jet_weekly.xls",
            "https://www.eia.gov/dnav/pet/hist_xls/WKJUPUS2w.xls",
        ),
        (
            "api_no_key.json",
            "https://api.eia.gov/v2/petroleum/cons/wpsup/data/?frequency=weekly&data[0]=value&facets[product][]=EPJK&length=1",
        ),
    ]
    for filename, url in urls:
        status, body, error = fetch(url, timeout=45)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "EIA 주간 제트유 product supplied. API 키 없음. dnav HTML/XLS 시도.",
    )
    return rows


def collect_sg_tankers() -> list[dict]:
    cid = "ALT-20260907-26"
    rows: list[dict] = []
    # Search page + known collection
    urls = [
        (
            "tanker_collection.html",
            "https://data.gov.sg/collections/388/view",
        ),
        (
            "search_tanker.html",
            "https://data.gov.sg/datasets?query=Tanker%20Arrivals&agencies=Maritime%20and%20Port%20Authority%20of%20Singapore%20(MPA)",
        ),
        (
            "vessel_calls_search.html",
            "https://data.gov.sg/datasets?query=Vessel%20Calls%20Monthly%20MPA",
        ),
    ]
    for filename, url in urls:
        status, body, error = fetch(url, timeout=45)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "MPA tanker/vessel arrivals. 데이터셋 ID는 페이지에서 확인 후 재수집.",
    )
    return rows


def collect_mobility() -> list[dict]:
    cid = "ALT-20260907-27"
    rows: list[dict] = []
    urls = [
        ("covid_mobility.html", "https://www.google.com/covid19/mobility/"),
        (
            "archive_org_probe.html",
            "https://www.google.com/covid19/mobility/data_documentation.html",
        ),
    ]
    for filename, url in urls:
        status, body, error = fetch(url, timeout=30)
        rows.append(save_raw(cid, filename, url, body, status, error))
    write_folder_readme(
        cid,
        rows,
        "Google Community Mobility Reports. 2022-10-15 종료. 2024+ OOS 불가.",
    )
    return rows


def collect_marinetraffic() -> list[dict]:
    cid = "ALT-20260907-28"
    rows: list[dict] = []
    url = "https://www.marinetraffic.com/en/ais-api-services"
    status, body, error = fetch(url, timeout=30)
    rows.append(save_raw(cid, "ais_api_services.html", url, body, status, error))
    write_folder_readme(
        cid,
        rows,
        "선박별 AIS 상업 API. 레포는 개별 선박 추적 금지. 수집하지 않음.",
    )
    return rows


def collect_ercot() -> list[dict]:
    cid = "ALT-20260907-29"
    rows: list[dict] = []
    urls = [
        ("load_page.html", "https://www.ercot.com/gridinfo/load/forecast"),
        (
            "mis_public.html",
            "https://www.ercot.com/mp/data-products/data-product-details?id=NP6-345-CD",
        ),
    ]
    for filename, url in urls:
        status, body, error = fetch(url, timeout=30)
        rows.append(save_raw(cid, filename, url, body, status, error))
        time.sleep(0.3)
    write_folder_readme(
        cid,
        rows,
        "ERCOT 공개 부하. 약관·역사 CSV 직접 URL은 페이지 확인 필요.",
    )
    return rows


def main() -> None:
    all_rows: list[dict] = []
    collectors = [
        collect_portwatch,
        collect_eia_rigs,
        collect_cftc,
        collect_sg_bunker,
        collect_opensky,
        collect_wiki,
        collect_fred_freight,
        collect_eia_jet,
        collect_sg_tankers,
        collect_mobility,
        collect_marinetraffic,
        collect_ercot,
    ]
    for fn in collectors:
        print(f"RUN {fn.__name__}", flush=True)
        try:
            rows = fn()
        except Exception as err:  # noqa: BLE001
            print(f"FAIL {fn.__name__}: {err}", flush=True)
            rows = []
        all_rows.extend(rows)
        for row in rows:
            print(
                f"  {row['candidate_id']} {row['filename']} HTTP {row['status']} {row['bytes']}B",
                flush=True,
            )
    summary = ROOT / "gathering" / "raw" / f"HUNT-{STAMP}-summary.json"
    summary.write_text(json.dumps(all_rows, indent=2), encoding="utf-8")
    print(f"SUMMARY {summary} n={len(all_rows)}", flush=True)


if __name__ == "__main__":
    main()
