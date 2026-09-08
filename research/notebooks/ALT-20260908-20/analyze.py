"""제주 두 연료의 원단위와 조건부 비중을 대사한다. WTI 검정·전국 외삽 없음."""
import argparse
import csv
import hashlib
import io
import json
import re
import subprocess
import sys
import zipfile
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CID = "ALT-20260908-20"
MEMBERS = {"lng": "제주 시간대별 발전량(LNG)_240331.csv", "oil_category": "제주 시간대별 발전량(유류)_240331.csv"}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """서로 다른 기존 출력은 덮어쓰지 않는다."""
    if path.exists():
        assert path.read_bytes() == data, f"different output: {path}; use a new run/version"
    else: path.write_bytes(data)


def parse(data):
    """CP949 날짜·24시간 스키마를 검사하고 진짜 0을 유지한다."""
    reader = csv.reader(io.StringIO(data.decode("cp949")))
    assert next(reader) == ["날짜"] + [str(i) for i in range(1,25)], "hour schema changed"
    rows = {}
    for row in reader:
        assert len(row) == 25, "missing/extra hour columns"
        day = date.fromisoformat(row[0])
        assert day.isoformat() == row[0] and row[0] not in rows, "bad/duplicate day"
        assert all(re.fullmatch(r"\d+(?:\.\d{1,3})?", value) for value in row[1:]), "invalid/missing/nonfinite/negative MWh"
        rows[row[0]] = [Decimal(v) for v in row[1:]]
    assert rows, "empty data"
    return rows


def aggregate(lng, oil):
    """일·월 합계와 두 연료 내부 비중을 정확한 소수 합계로 계산한다."""
    assert set(lng) == set(oil), "fuel date coverage mismatch"
    dates = sorted(lng)
    assert all(date.fromisoformat(b)-date.fromisoformat(a) == timedelta(days=1) for a,b in zip(dates,dates[1:])), "missing date"
    daily, monthly = [], {}
    for day in dates:
        gas, liquid = sum(lng[day]), sum(oil[day])
        total = gas+liquid
        assert total > 0, "both-fuel daily denominator is zero; do not invent share"
        daily.append({"date":day,"lng_mwh":gas,"oil_category_mwh":liquid,"two_fuel_mwh":total,"oil_share_of_two_fuels_pct":100*liquid/total})
        month = monthly.setdefault(day[:7], {"month":day[:7],"days":0,"lng_mwh":Decimal(0),"oil_category_mwh":Decimal(0),"daily_shares":[]})
        month["days"] += 1
        month["lng_mwh"] += gas
        month["oil_category_mwh"] += liquid
        month["daily_shares"].append(100*liquid/total)
    for month in monthly.values():
        total = month["lng_mwh"]+month["oil_category_mwh"]
        month["oil_share_of_two_fuels_pct"] = 100*month["oil_category_mwh"]/total
        month["mean_daily_share_pct"] = sum(month.pop("daily_shares"))/month["days"]
    for fuel, source in [("lng_mwh",lng),("oil_category_mwh",oil)]:
        assert sum(sum(v) for v in source.values()) == sum(r[fuel] for r in daily) == sum(r[fuel] for r in monthly.values()), "aggregation mismatch"
    return daily, list(monthly.values())


def csv_bytes(rows):
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream,fieldnames=list(rows[0]),lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue().encode()


def self_test():
    header = "날짜,"+",".join(str(i) for i in range(1,25))+"\n"
    line = "2024-02-29,"+",".join(["0"]+ ["1.001"]*23)+"\n"
    rows = parse((header+line).encode("cp949"))
    assert rows["2024-02-29"][0] == 0
    daily,monthly = aggregate(rows,rows)
    assert daily[0]["oil_share_of_two_fuels_pct"] == 50 and monthly[0]["lng_mwh"] == Decimal("23.023")
    for broken in [line+line, line.replace(",0,",",,"),line.replace(",0,",",-1,"),line.replace(",0,",",NaN,"),line.rsplit(",",1)[0]]:
        try: parse((header+broken).encode("cp949"))
        except (AssertionError,ValueError): pass
        else: raise AssertionError("accepted malformed data")
    gap = {"2024-02-27":[Decimal(1)]*24,"2024-02-29":[Decimal(1)]*24}
    try: aggregate(gap,gap)
    except AssertionError: pass
    else: raise AssertionError("accepted missing day")
    print("PASS: zero, leap day, exact sums, missing cells/dates, negative, NaN, duplicate")


def run(run_id):
    assert re.fullmatch(r"\d{8}T\d{6}Z",run_id), "UTC run ID required"
    raw = ROOT/"research/gathering/raw"/CID/run_id
    receipts = json.loads((raw/"requests.json").read_text())
    for receipt in receipts:
        assert receipt["status"] == 200 and digest((raw/receipt["name"]).read_bytes()) == receipt["sha256"], "source hash/status mismatch"
    data = (raw/"jeju-original.bin").read_bytes()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        assert set(archive.namelist()) == set(MEMBERS.values()), "ZIP members changed"
        assert sum(i.file_size for i in archive.infolist()) < 1_000_000, "oversized archive"
        files = {fuel:archive.read(name) for fuel,name in MEMBERS.items()}
    panels = {fuel:parse(content) for fuel,content in files.items()}
    daily,monthly = aggregate(panels["lng"],panels["oil_category"])
    assert daily[0]["date"] == "2023-05-01" and daily[-1]["date"] == "2024-03-31", "review new coverage before using this specification"
    quality = {"days":len(daily),"hours_per_fuel":len(daily)*24,"start":daily[0]["date"],"end":daily[-1]["date"],
               "members_sha256":{k:digest(v) for k,v in files.items()},"raw_sha256":digest(data),
               "lng_mwh":str(sum(r["lng_mwh"] for r in daily)),"oil_category_mwh":str(sum(r["oil_category_mwh"] for r in daily)),
               "zero_hours":{k:sum(v==0 for day in panel.values() for v in day) for k,panel in panels.items()},
               "missing_hours":0,"missing_dates":0,"duplicate_dates":0,"negative_values":0,
               "latest":{k:str(v) for k,v in daily[-1].items()},
               "max_weighted_vs_mean_daily_share_difference_pp":str(max(abs(m["oil_share_of_two_fuels_pct"]-m["mean_daily_share_pct"]) for m in monthly)),
               "share_up_while_oil_mwh_down_days":sum(b["oil_share_of_two_fuels_pct"]>a["oil_share_of_two_fuels_pct"] and b["oil_category_mwh"]<a["oil_category_mwh"] for a,b in zip(daily,daily[1:])),
               "WTI_tests":"NOT_RUN","available_at":None,"asof_safe":"NOT_PROVEN","denominator":"oil category + LNG only; not Jeju total generation; oil includes bio heavy oil"}
    out = ROOT/"research/data/processed"/CID/run_id
    evidence = ROOT/"research/indexes"/CID/run_id
    out.mkdir(parents=True,exist_ok=True)
    evidence.mkdir(parents=True,exist_ok=True)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig,axes = plt.subplots(2,1,figsize=(11,6),sharex=True,layout="constrained")
    dates = [date.fromisoformat(r["date"]) for r in daily]
    for field,label,color in [("lng_mwh","LNG","#377eb8"),("oil_category_mwh","Oil category (includes bio heavy oil)","#d07832")]:
        axes[0].plot(dates,[float(r[field]) for r in daily],label=label,color=color,linewidth=.9)
    axes[0].legend(fontsize=9)
    axes[0].set(ylabel="Daily generation (MWh)",ylim=(0,None))
    axes[1].plot(dates,[float(r["oil_share_of_two_fuels_pct"]) for r in daily],color="#d07832",linewidth=1)
    axes[1].set(ylabel="Oil / (oil + LNG), %",ylim=(0,100),xlabel="Source date; historic sample, not a live signal")
    for axis in axes: axis.grid(axis="y",alpha=.2)
    fig.suptitle("Jeju: two-fuel generation observation")
    fig.supxlabel("Source: Korea Power Exchange / data.go.kr 15069334. Not all generation, fuel consumption or a WTI forecast.",fontsize=9)
    buffer=io.BytesIO();fig.savefig(buffer,format="png",dpi=130);plt.close(fig)
    outputs={out/"daily.csv":csv_bytes(daily),evidence/"monthly.csv":csv_bytes(monthly),evidence/"observation.png":buffer.getvalue()}
    for path,content in outputs.items(): preserve(path,content)
    quality["output_sha256"]={str(p.relative_to(ROOT)):digest(v) for p,v in outputs.items()}
    preserve(evidence/"quality.json",(json.dumps(quality,indent=2)+"\n").encode())
    execution={"at":datetime.now(timezone.utc).isoformat(),"command":sys.argv,"python":sys.version,"matplotlib":matplotlib.__version__,
               "revision":subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip(),
               "dirty":bool(subprocess.check_output(["git","status","--porcelain"],cwd=ROOT,text=True)),"code_sha256":digest(Path(__file__).read_bytes())}
    preserve(evidence/("execution-"+datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")+".json"),(json.dumps(execution,indent=2)+"\n").encode())
    print(json.dumps(quality,indent=2))


if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--run")
    parser.add_argument("--self-test",action="store_true")
    args=parser.parse_args()
    if args.self_test:self_test()
    else:run(args.run or "")
