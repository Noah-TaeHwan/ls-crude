#!/usr/bin/env python3
"""CFAM meme live loop. Not alpha. Not 091 quantitative input.

Every --interval seconds:
  pull EIA + wiki (cached if unchanged)
  read optional observer QSR JSON
  1/n on available auto legs, then mix QSR at LOW weight if present.

Google Maps is not scraped. Drop labels into qsr_observer.json.
"""
from __future__ import annotations

import argparse, csv, json, re, time, urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

WIKI_PAGE = "Cushing,_Oklahoma"
EIA_LEAF = (
    "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx"
    "?n=PET&s=W_EPC0_SAX_YCUOK_MBBL&f=W"
)
QSR_WEIGHT = 0.15  # meme pinch. auto legs share the rest 1/n
LABEL_MAP = {
    "not busy": 15,
    "usually not busy": 15,
    "somewhat busy": 45,
    "busy": 70,
    "as busy as it gets": 90,
    "usually as busy as it gets": 90,
    "closed": None,
}

def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "cfam-meme-engine/0.2"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

def pctile(x, xs):
    xs = sorted(xs)
    if not xs:
        return None
    return 100.0 * sum(1 for y in xs if y <= x) / len(xs)

def wiki_attn():
    end = date.today()
    start = end - timedelta(days=180)
    url = (
        "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
        "en.wikipedia/all-access/user/"
        + quote(WIKI_PAGE, safe="")
        + f"/daily/{start:%Y%m%d}/{end:%Y%m%d}"
    )
    items = json.loads(get(url))["items"]
    series = [
        (datetime.strptime(x["timestamp"][:8], "%Y%m%d").date(), x["views"])
        for x in items
    ]
    wmap = dict(series)
    wd = series[-1][0]

    def mean_last(n, endd):
        xs = [
            wmap[endd - timedelta(days=k)]
            for k in range(n)
            if endd - timedelta(days=k) in wmap
        ]
        return sum(xs) / len(xs) if xs else None

    w7 = mean_last(7, wd)
    hist = [mean_last(7, wd - timedelta(days=k)) for k in range(14, 90)]
    hist = [x for x in hist if x]
    return {
        "leg": "wiki",
        "asof": str(wd),
        "value": w7,
        "score": pctile(w7, hist),
        "note": "7d views vs trailing 90d",
    }

def eia_legs():
    html = get(EIA_LEAF).decode("latin-1", "replace")
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.I | re.S)

    def cells(r):
        return [
            re.sub(r"<[^>]+>", " ", c).replace("&nbsp;", " ").strip()
            for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.I | re.S)
        ]

    pairs = []
    for r in rows:
        cs = cells(r)
        if not cs or not re.match(r"20\d{2}-[A-Za-z]{3}", cs[0]):
            continue
        year = int(cs[0][:4])
        rest = cs[1:]
        i = 0
        while i + 1 < len(rest):
            d, v = rest[i], rest[i + 1]
            i += 2
            if re.match(r"\d{2}/\d{2}$", d) and re.match(r"[\d,]+$", v):
                mo, da = map(int, d.split("/"))
                pairs.append((date(year, mo, da), int(v.replace(",", ""))))
    pairs = sorted(set(pairs))
    chg = [
        (pairs[i][0], abs(pairs[i][1] - pairs[i - 1][1]), pairs[i][1])
        for i in range(1, len(pairs))
    ]
    last_d, last_abs, last_lvl = chg[-1]
    abs52 = [a for d, a, _ in chg[-52:]]
    lvl5y = [v for d, v in pairs if d >= last_d - timedelta(days=365 * 5)]
    return [
        {
            "leg": "eia_move",
            "asof": str(last_d),
            "value": last_abs,
            "score": pctile(last_abs, abs52),
            "note": "|weekly Δ kbbl| vs 52w",
        },
        {
            "leg": "eia_tight",
            "asof": str(last_d),
            "value": last_lvl,
            "score": 100 - pctile(last_lvl, lvl5y),
            "note": "low tanks = high tightness meme",
        },
    ]

def qsr_leg(path: Path):
    if not path.exists():
        return None
    raw = json.loads(path.read_text())
    labels = raw.get("venues") or raw.get("labels") or []
    scores = []
    for row in labels:
        lab = str(row.get("label") or row.get("busy") or "").strip().lower()
        s = LABEL_MAP.get(lab)
        if s is not None:
            scores.append(s)
    if not scores:
        return None
    return {
        "leg": "qsr_s",
        "asof": str(raw.get("asof") or raw.get("observed_at") or ""),
        "value": sum(scores) / len(scores),
        "score": sum(scores) / len(scores),
        "n_venues": len(scores),
        "note": "091-S frozen basket, observer file only. Maps not scraped.",
        "weight": QSR_WEIGHT,
    }

def combine(auto, qsr):
    auto = [x for x in auto if x.get("score") is not None]
    if not auto and not qsr:
        return None
    if auto:
        base = sum(x["score"] for x in auto) / len(auto)
    else:
        base = None
    if qsr and base is not None:
        score = (1 - QSR_WEIGHT) * base + QSR_WEIGHT * qsr["score"]
    elif qsr:
        score = qsr["score"]
    else:
        score = base
    if score < 40:
        label = "quiet"
    elif score >= 60:
        label = "busy"
    else:
        label = "normal"
    return score, label, len(auto)

def tick(qsr_path: Path) -> dict:
    auto = [wiki_attn()] + eia_legs()
    qsr = qsr_leg(qsr_path)
    score, label, n_auto = combine(auto, qsr)
    return {
        "ts_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "score": round(score, 1),
        "label": label,
        "n_auto_legs": n_auto,
        "qsr_included": bool(qsr),
        "qsr_weight": QSR_WEIGHT if qsr else 0.0,
        "auto_weight_each": (1 - (QSR_WEIGHT if qsr else 0)) / n_auto if n_auto else 0,
        "legs": auto + ([qsr] if qsr else []),
        "not_alpha": True,
        "google_scraped": False,
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--once", action="store_true")
    p.add_argument("--interval", type=int, default=300)
    p.add_argument("--outdir", default="research/programs/cushing-busy/engine/out")
    p.add_argument(
        "--qsr",
        default="research/programs/cushing-busy/engine/qsr_observer.json",
    )
    args = p.parse_args()
    out = Path(args.outdir)
    out.mkdir(parents=True, exist_ok=True)
    qsr = Path(args.qsr)
    while True:
        snap = tick(qsr)
        (out / "now.json").write_text(json.dumps(snap, indent=2), encoding="utf-8")
        log = out / "ticks.csv"
        new = not log.exists()
        with log.open("a", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["ts_utc", "score", "label", "qsr_included"])
            if new:
                w.writeheader()
            w.writerow(
                {
                    "ts_utc": snap["ts_utc"],
                    "score": snap["score"],
                    "label": snap["label"],
                    "qsr_included": snap["qsr_included"],
                }
            )
        print(json.dumps({k: snap[k] for k in ("ts_utc", "score", "label", "qsr_included")}))
        if args.once:
            break
        time.sleep(args.interval)

if __name__ == "__main__":
    main()
