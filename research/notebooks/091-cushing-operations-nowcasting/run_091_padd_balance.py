"""Validate an EIA PADD 2/3 balance context against future WTI volatility.

This is not a pipeline-flow measurement: EIA PADD stocks and refinery utilization
are regional weekly balances.  Each value becomes usable five calendar days after
the Friday report week, before calculating future CLF realized volatility.
"""
from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[3]
RAW=ROOT/'research/gathering/raw/ALT-20260908-29/20260908T220000Z'
OUT=ROOT/'research/indexes/091-cushing-operations-nowcasting/20260908T091PADZ'

def tidy(path: Path, name: str) -> pd.DataFrame:
    tab=pd.read_html(path)[4]
    rows=[]
    for _,r in tab.iterrows():
        ym=str(r.iloc[0])
        if not ym or ym=='nan': continue
        year,month=ym.split('-')
        for w in range(1,6):
            d,v=r.iloc[2*w-1],r.iloc[2*w]
            if pd.isna(d) or pd.isna(v): continue
            rows.append({'report_week':pd.to_datetime(f'{year}-{d}',format='%Y-%m/%d'),name:float(v)})
    return pd.DataFrame(rows).drop_duplicates('report_week').sort_values('report_week')

def corr_by_sample(df, cols):
    rows=[]
    for signal in cols:
        for sample, g in df.groupby('sample'):
            h=g[[signal,'future_20d_rv']].dropna()
            rows.append({'signal':signal,'sample':sample,'pearson_r':h.iloc[:,0].corr(h.iloc[:,1]),'n':len(h)})
    return pd.DataFrame(rows)

def main():
    OUT.mkdir(parents=True,exist_ok=True); (OUT/'figures').mkdir(exist_ok=True)
    parts=[tidy(RAW/'padd2_crude_stocks.html','padd2_crude_kbbl'),tidy(RAW/'padd3_crude_stocks.html','padd3_crude_kbbl'),tidy(RAW/'padd2_utilization.html','padd2_util_pct'),tidy(RAW/'padd3_utilization.html','padd3_util_pct'),tidy(RAW/'cushing_crude_stocks.html','cushing_crude_kbbl')]
    weekly=parts[0]
    for x in parts[1:]: weekly=weekly.merge(x,on='report_week',how='inner')
    weekly['available_date']=weekly.report_week+pd.Timedelta(days=5)
    for col in ['padd2_crude_kbbl','padd3_crude_kbbl']:
        weekly[f'{col}_z52']=(weekly[col]-weekly[col].rolling(52,min_periods=52).mean())/weekly[col].rolling(52,min_periods=52).std()
    weekly['padd_stock_gap_z52']=weekly.padd2_crude_kbbl_z52-weekly.padd3_crude_kbbl_z52
    weekly['utilization_gap_pp']=weekly.padd2_util_pct-weekly.padd3_util_pct
    weekly['future_4w_cushing_change_kbbl']=weekly.cushing_crude_kbbl.shift(-4)-weekly.cushing_crude_kbbl
    clf=pd.read_csv(ROOT/'research/data/clf-daily-2015-2026.csv',parse_dates=['date']).sort_values('date')
    # CLF includes the 2020 negative-settlement episode; log returns are undefined
    # across a non-positive close, so those windows remain missing rather than fabricated.
    clf['ret']=np.where((clf.Close>0)&(clf.Close.shift(1)>0),np.log(clf.Close/clf.Close.shift(1)),np.nan)
    clf['future_20d_rv']=clf.ret.rolling(20).std().shift(-20)*np.sqrt(252)
    usable=pd.merge_asof(weekly.sort_values('available_date'),clf[['date','future_20d_rv','sample']].sort_values('date'),left_on='available_date',right_on='date',direction='forward')
    tests=corr_by_sample(usable,['padd_stock_gap_z52','utilization_gap_pp'])
    # Direct physical check is not the same thing as a price/volatility claim.
    physical=[]
    for col in ['padd_stock_gap_z52','utilization_gap_pp']:
        for sample,g in usable.groupby('sample'):
            h=g[[col,'future_4w_cushing_change_kbbl']].dropna(); physical.append({'signal':col,'sample':sample,'pearson_r':h.iloc[:,0].corr(h.iloc[:,1]),'n':len(h)})
    pd.DataFrame(physical).to_csv(OUT/'padd_balance_to_cushing_4w.csv',index=False,float_format='%.6f')
    tests.to_csv(OUT/'padd_balance_to_future_wti_volatility.csv',index=False,float_format='%.6f')
    usable.to_csv(OUT/'padd_balance_weekly_panel.csv',index=False,float_format='%.6f')
    fig,ax=plt.subplots(figsize=(10,4.6)); q=usable.dropna(subset=['padd_stock_gap_z52','future_20d_rv'])
    for sample,color in [('in','#167448'),('out','#bd3e34')]:
        g=q[q['sample']==sample]; ax.scatter(g.padd_stock_gap_z52,g.future_20d_rv,s=11,alpha=.5,label=sample,color=color)
    ax.set(title='PADD 2 minus PADD 3 crude-stock anomaly vs future 20-day WTI volatility',xlabel='52-week z-score gap',ylabel='annualized realized volatility');ax.grid(alpha=.2);ax.legend(title='sample');fig.tight_layout();fig.savefig(OUT/'figures/091-padd-stock-gap-future-wti-vol.svg',format='svg')

if __name__=='__main__': main()
