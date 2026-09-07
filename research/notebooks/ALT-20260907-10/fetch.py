"""Fetch raw snapshots for ALT-20260907 batch (stdlib only).

Raw outputs (gitignored, immutable snapshots):
  $RAW/ALT-20260907-10/20260907T000000Z/  CFTC disaggregated COT history zips (public)
  $RAW/ALT-20260907-11/20260907T000000Z/  EIA DNAV distillate product-supplied xls (public)
  $RAW/ALT-20260907-12/20260907T000000Z/  FRED TSIFRGHT csv (BTS source, via fredgraph.csv)
  $RAW/ALT-20260907-13/20260907T000000Z/  IMF PortWatch daily chokepoint json pages (public ArcGIS)
  $RAW/WTI-CLF/20260907T000000Z/          Yahoo CL=F daily 2015-2023 (shared target)

Usage: RAW=research/gathering/raw python3 research/notebooks/ALT-20260907-10/fetch.py
"""
import csv
import datetime as dt
import hashlib
import json
import os
import sys
import urllib.request
import zipfile

UA = {"User-Agent": "ls-crude-research/1.0 (academic alt-data audit; contact via repo)"}
TS = "20260907T000000Z"


def get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read()


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def save(raw, cid, name, data):
    d = os.path.join(raw, cid, TS)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    with open(p, "wb") as f:
        f.write(data)
    print(f"saved {p} bytes={len(data)} sha256={sha256(p)[:16]}...")
    return p


def main():
    raw = os.environ.get("RAW")
    if not raw:
        sys.exit("set RAW env to research/gathering/raw")
    # 1. Yahoo CL=F daily 2015-01-01..2023-12-31 (target only, no 2024+ viewed)
    p1, p2 = 1420070400, 1704067200
    st, data = get(
        f"https://query1.finance.yahoo.com/v8/finance/chart/CL=F"
        f"?interval=1d&period1={p1}&period2={p2}"
    )
    print("yahoo status", st)
    j = json.loads(data)["chart"]["result"][0]
    ts = j["timestamp"]
    q = j["indicators"]["quote"][0]
    rows = [
        (dt.datetime.fromtimestamp(t, dt.timezone.utc).date().isoformat(), c, v)
        for t, c, v in zip(ts, q["close"], q.get("volume") or [None] * len(ts))
        if c is not None
    ]
    buf = "date,close,volume\n" + "".join(
        f"{d},{c},{'' if v is None else v}\n" for d, c, v in rows
    )
    save(raw, "WTI-CLF", "clf_daily_2015_2023.csv", buf.encode())
    print(f"clf rows={len(rows)} span={rows[0][0]}..{rows[-1][0]}")
    # 2. CFTC disaggregated futures-only history 2015..2023, NYMEX WTI 067651
    cot_rows = []
    for y in range(2015, 2024):
        st, blob = get(f"https://www.cftc.gov/files/dea/history/fut_disagg_txt_{y}.zip")
        zp = os.path.join("/tmp", f"cot{y}.zip")
        open(zp, "wb").write(blob)
        save(raw, "ALT-20260907-10", f"fut_disagg_txt_{y}.zip", blob)
        with zipfile.ZipFile(zp) as z:
            name = z.namelist()[0]
            txt = z.read(name).decode("utf-8", "replace")
        rd = list(csv.DictReader(txt.splitlines()))
        keep = [r for r in rd if r.get("CFTC_Contract_Market_Code") == "067651"]
        cot_rows += keep
        print(y, "http", st, "wti-rows", len(keep))
    # 3. FRED TSIFRGHT (BTS Transportation Services Index: Freight)
    st, blob = get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=TSIFRGHT")
    print("fred status", st)
    save(raw, "ALT-20260907-12", "TSIFRGHT.csv", blob)
    # 4. EIA DNAV weekly distillate product supplied
    st, blob = get("https://www.eia.gov/dnav/pet/hist_xls/WDIUPUS2w.xls")
    print("eia status", st)
    save(raw, "ALT-20260907-11", "WDIUPUS2w.xls", blob)
    # 5. PortWatch daily chokepoints: chokepoint6 (Hormuz), 2019..2023 via ArcGIS REST
    base = ("https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/"
            "Daily_Chokepoints_Data/FeatureServer/0/query")
    import urllib.parse

    def q(offset):
        params = urllib.parse.urlencode({
            "where": "portid='chokepoint6' AND year>=2019 AND year<=2023",
            "outFields": "year,month,day,portid,portname,n_tanker,n_total,capacity_tanker,capacity",
            "orderByFields": "year,month,day",
            "resultOffset": offset, "resultRecordCount": 1000, "f": "json",
        })
        st, blob = get(base + "?" + params)
        assert st == 200, st
        return blob

    pages, off = 0, 0
    total = 0
    while True:
        blob = q(off)
        save(raw, "ALT-20260907-13", f"chokepoint6_2019_2023_p{pages:02d}.json", blob)
        feats = json.loads(blob)["features"]
        total += len(feats)
        pages += 1
        if len(feats) < 1000 or pages > 6:
            break
        off += 1000
    print(f"portwatch pages={pages} records={total}")


if __name__ == "__main__":
    main()
