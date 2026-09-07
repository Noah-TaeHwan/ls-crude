"""Independent stdlib reconstruction; never imports the production hunt script."""
import argparse, calendar, csv, hashlib, json, math, platform, statistics, sys
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root', type=Path, default=Path.cwd())
parser.add_argument('--raw', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args=parser.parse_args()
ROOT=args.root.resolve()
OUT=args.output.resolve(); OUT.mkdir(parents=True,exist_ok=True)
RAW=(ROOT/args.raw).resolve()
CID=RAW.parent.name
assert CID=='ALT-20260907-01', 'This check is for the frozen Locks27 recipe only'
RESULT=ROOT/'research/indexes'/CID/RAW.name
DERIVED=ROOT/'research/data/processed'/CID/RAW.name/'monthly.csv'
assert (RESULT/'tests.csv').exists() and DERIVED.exists(), 'Run production analysis first'

def month(d): return d.year*12+d.month-1
def label(m): return f'{m//12:04d}-{m%12+1:02d}'
def y(m): return m//12
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def close(a,b): return math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-10)
def pearson(xs,ys):
    if len(xs)<3: return None
    xm=statistics.mean(xs); ym=statistics.mean(ys)
    a=sum((x-xm)*(z-ym) for x,z in zip(xs,ys))
    b=math.sqrt(sum((x-xm)**2 for x in xs)*sum((z-ym)**2 for z in ys))
    return a/b if b else None

plan=json.loads((ROOT/'research/indexes'/CID/'plan-v1.json').read_text())
manifest=json.loads((RAW/'manifest.json').read_text())
assert sha(ROOT/'research/indexes'/CID/'plan-v1.json')==manifest['plan_sha256']
assert datetime.fromisoformat(plan['frozen_at_utc']) < datetime.fromisoformat(manifest['requests'][0]['attempted_at_utc'])
for r in manifest['requests']:
    if 'path' in r: assert sha(ROOT/r['path'])==r['sha256'],r['path']
activity=json.loads((RAW/'activity.json').read_text())
weeks=defaultdict(dict)
for row in activity:
    d=date.fromisoformat(row['date'][:10]); c=row['commodity']; tons=float(row['tons']) if row.get('tons') is not None else None
    assert date(2015,1,1)<=d<=date(2023,12,31) and d.weekday()==5
    assert (tons is None or (math.isfinite(tons) and tons>=0)) and row['lock']=='MS Locks 27'
    assert c not in weeks[d]
    weeks[d][c]=tons
assert all(set(cells)=={'Corn','Soybeans','Wheat','Other Grain'} for cells in weeks.values())
weekly={d:sum(cells.values()) for d,cells in weeks.items() if all(v is not None for v in cells.values())}
activity_month={}; coverage={}
for yr in range(2015,2024):
    for mo in range(1,13):
        expected=[date(yr,mo,d) for d in range(1,calendar.monthrange(yr,mo)[1]+1) if date(yr,mo,d).weekday()==5]
        values=[weekly[d] for d in expected if d in weekly]
        key=yr*12+mo-1
        coverage[key]={'expected':len(expected),'observed':len(values),'complete':len(values)==len(expected)}
        activity_month[key]=statistics.mean(values) if len(values)==len(expected) else None
signal={m:100*math.log(a/activity_month[m-12]) for m,a in activity_month.items() if a is not None and a>0 and activity_month.get(m-12) is not None and activity_month[m-12]>0}
source_sum=sum(float(r['tons']) for r in activity if r.get('tons') is not None)
partial_week_known=sum(v for d,cells in weeks.items() if d not in weekly for v in cells.values() if v is not None)
complete_week_partial_month=sum(v for d,v in weekly.items() if activity_month[month(d)] is None)
used_sum=sum(a*coverage[m]['expected'] for m,a in activity_month.items() if a is not None)
assert source_sum==sum(weekly.values())+partial_week_known
assert close(source_sum,used_sum+complete_week_partial_month+partial_week_known)
prices=[]
with (RAW/'wti.csv').open() as f:
    for row in csv.DictReader(f):
        d=date.fromisoformat(row['date']); p=float(row['Close'])
        assert date(2015,1,1)<=d<=date(2023,12,31)
        assert row['sample']=='in'
        prices.append((d,p))
assert len({d for d,p in prices})==len(prices)
prices.sort(); monthly_prices={}; groups=defaultdict(list)
for d,p in prices: groups[month(d)].append((d,p))
for m in activity_month:
    current=groups[m]; prior=groups[m-1]
    if not current or not prior:
        monthly_prices[m]={'r':None,'d':None,'bad':True,'p':current[-1][1] if current else None}
        continue
    start,p0=prior[-1]; end,p1=current[-1]
    window=[p for d,p in prices if start<=d<=end]
    bad=any(not math.isfinite(p) or p<=0 for p in window)
    monthly_prices[m]={'r':None if bad else p1/p0-1,'d':p1-p0,'bad':bad,'p':p1}

all_pairs=[]; stats=[]
for split,start,end in [('train',2015*12,2020*12+11),('validation',2021*12,2023*12+11)]:
    for variant,lag in [('primary',k) for k in [-1,0,1,2]]+[(v,1) for v in ['dollar','placebo12','no2020','delay1','wti_baseline']]:
        pairs=[]
        for m in activity_month:
            if not(start<=m<=end and m+lag<=end and m+lag-1>=start): continue
            source_m=m-12 if variant=='placebo12' else m-1 if variant=='delay1' else m
            if variant in ('placebo12','delay1') and source_m<start: continue
            x=monthly_prices[m]['r'] if variant=='wti_baseline' else signal.get(source_m)
            yy=monthly_prices.get(m+lag,{}).get('d' if variant=='dollar' else 'r')
            if variant=='no2020' and any(y(k)==2020 for k in (m,m-12,m+lag,m+lag-1)): continue
            if x is None or yy is None: continue
            pairs.append((m,x,yy))
            all_pairs.append({'split':split,'variant':variant,'lag_months':lag,'signal_month':label(m),'source_signal_month':label(source_m),'target_start_month':label(m+lag-1),'target_end_month':label(m+lag),'signal':x,'target':yy})
        r=pearson([p[1] for p in pairs],[p[2] for p in pairs])
        stats.append({'split':split,'variant':variant,'lag_months':lag,'n':len(pairs),'pearson_r':r,'first_signal_month':label(pairs[0][0]) if pairs else '', 'last_signal_month':label(pairs[-1][0]) if pairs else ''})
with (OUT/'independent-pairs.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(all_pairs[0]));w.writeheader();w.writerows(all_pairs)
with (OUT/'independent-stats.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(stats[0]));w.writeheader();w.writerows(stats)
comparisons=[]
if (RESULT/'tests.csv').exists():
    got=list(csv.DictReader((RESULT/'tests.csv').open()))
    assert len(got)==len(stats)==18
    for g,s in zip(got,stats):
        for k in ('split','variant','first_signal_month','last_signal_month'): assert g[k]==s[k],(k,g,s)
        for k in ('lag_months','n'): assert int(g[k])==s[k],(k,g,s)
        assert (not g['pearson_r'] and s['pearson_r'] is None) or close(float(g['pearson_r']),s['pearson_r']),(g,s)
    comparisons.append('18 stats rows n/r/lag/split/endpoints independently reproduced')
if DERIVED.exists():
    got=list(csv.DictReader(DERIVED.open())); assert len(got)==108
    for g in got:
        m=month(date.fromisoformat(g['month']+'-01'))
        assert int(g['observed'])==coverage[m]['observed'] and int(g['expected'])==coverage[m]['expected']
        assert (g['complete']=='True')==coverage[m]['complete']
        assert (not g['activity'] and activity_month[m] is None) or close(float(g['activity']),activity_month[m])
        assert (not g['signal'] and m not in signal) or close(float(g['signal']),signal[m])
        assert close(float(g['p']),monthly_prices[m]['p'])
        for k in ('r','d'):
            assert (not g[k] and monthly_prices[m][k] is None) or close(float(g[k]),monthly_prices[m][k])
        assert (g['bad_window']=='True')==monthly_prices[m]['bad']
    comparisons.append('108 monthly values/coverage/YoY signals/price endpoints independently reproduced')
report={'scope':'independent Finance numeric plane, no production script imports','raw_rows':len(activity),'weekly_rows':len(weekly),'source_sum_short_tons':source_sum,'month_reconstruction_sum_short_tons':sum(a*coverage[m]['expected'] for m,a in activity_month.items() if a is not None),'partial_week_known_short_tons':partial_week_known,'complete_week_partial_month_short_tons':complete_week_partial_month,'source_missing_cells':sum(r.get('tons') is None for r in activity),'complete_months':sum(c['complete'] for c in coverage.values()),'signal_months':len(signal),'daily_wti_rows':len(prices),'nonpositive_prices':[{'date':str(d),'close':p} for d,p in prices if p<=0],'excluded_return_months':[label(m) for m,p in monthly_prices.items() if p['bad']],'primary_stats':[s for s in stats if s['variant']=='primary' and s['lag_months']==1],'comparisons':comparisons,'script_sha256':sha(Path(__file__)),'asof_safe':'NOT_PROVEN; observed-month snapshot only','calendar_completeness':'NOT_PROVEN; only returned Yahoo rows inspected','source_date_max':str(max(weekly)),'wti_date_max':str(max(d for d,p in prices))}
report.update(command=' '.join(sys.argv),cwd=str(ROOT),python=platform.python_version(),reviewed_production_path='research/notebooks/ALT-20260907-01/hunt.py',reviewed_production_sha256=sha(ROOT/'research/notebooks/ALT-20260907-01/hunt.py'),raw_manifest_sha256=sha(RAW/'manifest.json'),plan_sha256=sha(ROOT/'research/indexes'/CID/'plan-v1.json'),input_hashes={r['path']:sha(ROOT/r['path']) for r in manifest['requests'] if 'path' in r},tested_output_hashes={str(p.relative_to(ROOT)):sha(p) for p in [RESULT/'tests.csv',DERIVED]},correction_history=['Finance detected delay1 using2020-12 source signal in2021validation; specialist added source-month split guard before final numeric audit','Actual Other Grain label handled;10missing ton cells preserved and incomplete weeks/months excluded; no filling'],judgment='PASS for scoped numerical plane; full candidate-goal review pending')
(OUT/'numeric-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
