#!/usr/bin/env python3
"""CFAM meme score. Cache 5 minutes. Not alpha."""
from __future__ import annotations

import json, re, time, urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

CACHE = Path(__file__).with_name("now.json")
TTL = 300
WIKI_PAGE = "Cushing,_Oklahoma"
EIA_LEAF = (
    "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx"
    "?n=PET&s=W_EPC0_SAX_YCUOK_MBBL&f=W"
)

# snapshot pinches (drop if score is None)
PINCH = [
    {"id": "S", "name": "QSR", "w": 0.15, "score": None, "note": "관찰 파일 없음"},
    {"id": "U", "name": "산업공고", "w": 0.10, "score": 50.0, "note": "4/8"},
    {"id": "V", "name": "허가", "w": 0.10, "score": None, "note": "원장 n 없음"},
    {"id": "A", "name": "숙박세", "w": 0.05, "score": 58.0, "note": "FY24 마지막월 %"},
    {"id": "H", "name": "검색", "w": 0.05, "score": None, "note": "Trends 미수출"},
    {"id": "M", "name": "시청공고", "w": 0.05, "score": 50.0, "note": "3/6"},
    {"id": "W", "name": "AQI", "w": 0.05, "score": None, "note": "측정소 없음"},
    {"id": "Z", "name": "뉴스", "w": 0.05, "score": None, "note": "7일 n 없음"},
    {"id": "X", "name": "스프레드", "w": 0.01, "score": None, "note": "쌍 없음"},
    {"id": "Y", "name": "펌프갭", "w": 0.01, "score": None, "note": "표시가 없음"},
]


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "cfam-web/0.1"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def pctile(x, xs):
    xs = sorted(xs)
    if not xs:
        return None
    return 100.0 * sum(1 for y in xs if y <= x) / len(xs)


def wiki():
    fallback = {
        "id": "wiki",
        "name": "위키",
        "score": 11.8,
        "note": "캐시 11.8 (429)",
        "asof": None,
        "auto": True,
    }
    try:
        end = date.today()
        start = end - timedelta(days=180)
        url = (
            "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
            "en.wikipedia/all-access/user/"
            + quote(WIKI_PAGE, safe="")
            + f"/daily/{start:%Y%m%d}/{end:%Y%m%d}"
        )
        items = json.loads(get(url))["items"]
    except Exception as e:
        fallback["note"] = f"캐시 11.8 ({e.__class__.__name__})"
        return fallback
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
        "id": "wiki",
        "name": "위키",
        "score": pctile(w7, hist),
        "note": f"7일 {w7:.0f}",
        "asof": str(wd),
        "auto": True,
    }


def eia():
    fallback = [
        {"id": "eia_move", "name": "EIA |Δ|", "score": 38.5, "note": "캐시", "asof": "2026-09-04", "auto": True},
        {"id": "eia_tight", "name": "EIA 타이트", "score": 87.0, "note": "캐시", "asof": "2026-09-04", "auto": True},
    ]
    try:
        html = get(EIA_LEAF).decode("latin-1", "replace")
    except Exception:
        return fallback
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
    return [
        {
            "id": "eia_move",
            "name": "EIA |Δ|",
            "score": pctile(last_abs, [a for _, a, _ in chg[-52:]]),
            "note": f"{last_abs} kbbl",
            "asof": str(last_d),
            "auto": True,
        },
        {
            "id": "eia_tight",
            "name": "EIA 타이트",
            "score": 100 - pctile(last_lvl, [v for d, v in pairs if d >= last_d - timedelta(days=365 * 5)]),
            "note": f"{last_lvl:,} kbbl",
            "asof": str(last_d),
            "auto": True,
        },
    ]


def combine(auto, pinches):
    live_p = [p for p in pinches if p.get("score") is not None]
    w_p = sum(p["w"] for p in live_p)
    rest = max(0.0, 1.0 - w_p)
    live_a = [a for a in auto if a.get("score") is not None]
    w_each = rest / len(live_a) if live_a else 0.0
    legs = []
    total = 0.0
    tw = 0.0
    for a in live_a:
        legs.append({**a, "w": round(w_each, 4), "contrib": round(w_each * a["score"], 2)})
        total += w_each * a["score"]
        tw += w_each
    for p in live_p:
        legs.append(
            {
                "id": p["id"],
                "name": p["name"],
                "score": p["score"],
                "w": p["w"],
                "note": p["note"],
                "auto": False,
                "contrib": round(p["w"] * p["score"], 2),
            }
        )
        total += p["w"] * p["score"]
        tw += p["w"]
    dropped = [
        {"id": p["id"], "name": p["name"], "w": p["w"], "note": p["note"]}
        for p in pinches
        if p.get("score") is None
    ]
    score = total / tw if tw else None
    label = "quiet" if score < 40 else ("busy" if score >= 60 else "normal")
    return score, label, legs, dropped


def build():
    auto = [wiki()] + eia()
    score, label, legs, dropped = combine(auto, PINCH)
    return {
        "ts_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "score": round(score, 1),
        "label": label,
        "legs": legs,
        "dropped": dropped,
        "ttl_sec": TTL,
        "not_alpha": True,
        "not_realtime_source": True,
        "note": "5분은 캐시. 위키·EIA만 새로 읽음.",
    }


def load_or_build(force=False):
    if not force and CACHE.exists():
        age = time.time() - CACHE.stat().st_mtime
        if age < TTL:
            d = json.loads(CACHE.read_text())
            d["cache_age_sec"] = int(age)
            return d
    d = build()
    CACHE.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    d["cache_age_sec"] = 0
    return d


if __name__ == "__main__":
    print(json.dumps(load_or_build(force=True), ensure_ascii=False, indent=2))
