"""고정 실행의 원자료·전처리·검정표를 표준 라이브러리로 독립 대사한다."""
import csv,json,math,hashlib,statistics
from pathlib import Path
from datetime import date,timedelta
root=Path(__file__).resolve().parents[3]
raw=root/'research/gathering/raw/ALT-20260907-01/20260907T062017Z'
out=root/'research/indexes/joint-hunt-20260908/20260908T044354588864Z'
proc=root/'research/data/processed/joint-hunt-20260908/20260908T044354588864Z'
receipt=json.loads((out/'receipt.json').read_text())
for item in receipt['inputs']:
 assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest()==item['sha256']
for path,sha in receipt['outputs'].items():
 assert hashlib.sha256((root/path).read_bytes()).hexdigest()==sha
rows=json.loads((raw/'activity.json').read_text())
calendar=[]; d=date(2015,1,3)
while d<=date(2023,12,31): calendar.append(d); d+=timedelta(days=7)
groups={d:[] for d in calendar}
for x in rows: groups[date.fromisoformat(x['date'][:10])].append(None if x.get('tons') is None else float(x['tons']))
a={d:sum(v) if len(v)==4 and None not in v else None for d,v in groups.items()}
signal={d:100*math.log(a[d]/a.get(d-timedelta(weeks=52))) if a[d] is not None and a[d]>0 and a.get(d-timedelta(weeks=52)) is not None and a[d-timedelta(weeks=52)]>0 else None for d in calendar}
prices={date.fromisoformat(x['date'][:10]):float(x['Close']) for x in csv.DictReader((raw/'wti.csv').open())}
ends={d:max((p for p in prices if d-timedelta(days=6)<=p<=d),default=None) for d in calendar}
ret={}
for d in calendar:
 prev=ends.get(d-timedelta(weeks=1)); end=ends[d]
 window=[v for t,v in prices.items() if prev and prev<=t<=end]
 ret[d]=prices[end]/prices[prev]-1 if prev and end and window and all(math.isfinite(v) and v>0 for v in window) else None
known=sum(v for vs in groups.values() for v in vs if v is not None)
complete=sum(v for v in a.values() if v is not None)
incomplete=sum(v for d,vs in groups.items() if a[d] is None for v in vs if v is not None)
assert known==complete+incomplete
checks={'known_tons':known,'complete_week_tons':complete,'incomplete_week_known_tons':incomplete,'source_rows':len(rows),'missing_ton_cells':sum(v is None for vs in groups.values() for v in vs),'source_zero_cells':sum(v==0 for vs in groups.values() for v in vs),'calendar_weeks':len(calendar),'complete_weeks':sum(v is not None for v in a.values()),'zero_complete_weeks':sum(v==0 for v in a.values()),'signal_weeks':sum(v is not None for v in signal.values()),'wti_rows':len(prices),'wti_nonpositive':sum(v<=0 for v in prices.values()),'wti_valid_returns':sum(v is not None for v in ret.values())}
recon=json.loads((out/'reconciliation.json').read_text())
for k,v in checks.items(): assert recon[k]==v,(k,v,recon[k])
for x in csv.DictReader((proc/'weekly.csv').open()):
 d=date.fromisoformat(x['week']); vals={'activity':a[d],'signal':signal[d],'wti_return':ret[d],'prior52_activity':a.get(d-timedelta(weeks=52))}
 for k,v in vals.items():
  assert (not x[k]) if v is None else math.isclose(float(x[k]),v,rel_tol=1e-11,abs_tol=1e-11),(d,k,v,x[k])
actual=list(csv.DictReader((out/'tests.csv').open()))
pair_file=list(csv.DictReader((proc/'pairs.csv').open()))
summary=[]
for x in actual:
 lo,hi=(date(2015,1,1),date(2020,12,31)) if x['split']=='train' else (date(2021,1,1),date(2023,12,31))
 lag,shift=int(x['lag']),int(x['signal_shift_weeks'])
 scope=scen=missing=0; pairs=[]
 for d in calendar:
  origin=d-timedelta(weeks=shift); den=origin-timedelta(weeks=52); target=d+timedelta(weeks=lag)
  start,end=ends.get(target-timedelta(weeks=1)),ends.get(target)
  if not (lo<=d<=hi and lo<=origin<=hi and start and end and lo<=start<=hi and lo<=end<=hi):continue
  scope+=1
  if x['variant']=='exclude2020' and any(t.year==2020 for t in [origin,den,start,end]):scen+=1;continue
  sig,r=signal.get(origin),ret.get(target)
  if sig is None or r is None:missing+=1;continue
  pairs.append((d,sig,r,origin,den,start,end))
 assert [scope,scen,missing,len(pairs)]==[int(x[k]) for k in ['scoped_n','scenario_excluded_n','missing_pair_n','n']],x
 corr=statistics.correlation([p[1] for p in pairs],[p[2] for p in pairs])
 assert math.isclose(corr,float(x['corr']),abs_tol=1e-12),x
 stored=[p for p in pair_file if p['split']==x['split'] and p['variant']==x['variant']]
 assert len(stored)==len(pairs)
 for p,s in zip(pairs,stored):
  assert s['anchor_week']==str(p[0])
  for k,v in zip(['signal','target'],p[1:3]):assert math.isclose(float(s[k]),v,abs_tol=1e-11)
  for k,v in zip(['origin','denominator','target_start','target_end'],p[3:]):assert s[k]==str(v),(k,s[k],v)
 for k,v in [('first_origin',min(p[3] for p in pairs)),('last_origin',max(p[3] for p in pairs)),('first_denominator',min(p[4] for p in pairs)),('first_target',min(p[6] for p in pairs)),('last_target',max(p[6] for p in pairs))]:assert x[k][:10]==str(v)
 summary.append({'split':x['split'],'variant':x['variant'],'n':len(pairs),'r':corr})
print(json.dumps({'result':'PASS','independence':'stdlib only; production module not imported','hashes':'all input and output hashes match','weekly_rows':len(calendar),'tests':len(actual),'pairs':len(pair_file),'reconciliation':checks,'results':summary},indent=2))
