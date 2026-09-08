"""불변 IS 입력을 검증하고 사전 주별 계획의 기술 통계를 재현한다."""
import hashlib
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / 'research/gathering/raw/ALT-20260907-01/20260907T062017Z'
OUT = ROOT / 'research/indexes/joint-hunt-20260908'
PLAN = Path(__file__).with_name('plan.md')


def sha(path):
    """파일 바이트의 SHA256을 반환한다."""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run():
    """실제 원문만 집계하며 결측/출처 변조는 실패로 종료한다."""
    manifest = json.loads((RAW / 'manifest.json').read_text())
    for item in manifest['requests']:
        assert sha(ROOT / item['path']) == item['sha256'], 'input hash mismatch'
    assert manifest['requests'][-1]['options']['ticker'] == 'CL=F'
    frame = pd.DataFrame(json.loads((RAW / 'activity.json').read_text()))
    assert {'date', 'commodity', 'lock', 'tons'} <= set(frame)
    frame['date'] = pd.to_datetime(frame['date'])
    frame['tons'] = pd.to_numeric(frame['tons'], errors='raise')
    assert set(frame.commodity) == {'Corn', 'Soybeans', 'Wheat', 'Other Grain'}
    assert set(frame.lock) == {'MS Locks 27'}
    assert not frame.duplicated(['date', 'commodity']).any()
    assert (frame.date.dt.dayofweek == 5).all()
    assert frame.date.between('2015-01-01', '2023-12-31').all()
    assert (frame.tons.dropna() >= 0).all() and np.isfinite(frame.tons.dropna()).all()
    calendar = pd.date_range('2015-01-01', '2023-12-31', freq='W-SAT')
    grouped = frame.groupby('date').tons.agg(['sum', 'count']).reindex(calendar)
    activity = grouped['sum'].where(grouped['count'].eq(4))
    positive = activity.where(activity > 0)
    signal = 100 * np.log(positive / positive.shift(52))
    prices = pd.read_csv(RAW / 'wti.csv', parse_dates=['date']).set_index('date').sort_index()
    assert not prices.index.duplicated().any()
    assert prices.index.min() >= pd.Timestamp('2015-01-01') and prices.index.max() < pd.Timestamp('2024-01-01')
    close = pd.to_numeric(prices.Close, errors='raise')
    assert np.isfinite(close.dropna()).all()
    daily = close.to_frame('close')
    daily['week'] = daily.index.to_period('W-SAT').end_time.normalize()
    weekly = daily.groupby('week').agg(price=('close', lambda x: x.iloc[-1]))
    weekly['actual_end'] = daily.groupby('week').apply(lambda x: x.index[-1])
    weekly = weekly.reindex(calendar)
    returns = pd.Series(np.nan, index=calendar)
    bad = pd.Series(True, index=calendar)
    for i in range(1, len(calendar)):
        start, end = weekly.actual_end.iloc[i-1:i+1]
        if pd.isna(start) or pd.isna(end):
            continue
        window = close.loc[start:end]
        bad.iloc[i] = bool(window.isna().any() or (window <= 0).any())
        if not bad.iloc[i]:
            returns.iloc[i] = weekly.price.iloc[i] / weekly.price.iloc[i-1] - 1
    now = datetime.now(timezone.utc).isoformat()
    derived = pd.DataFrame({'activity': activity, 'prior52_activity': activity.shift(52), 'signal': signal,
                            'wti_return': returns, 'price_window_invalid': bad,
                            'data_quality_score': grouped['count'].fillna(0)/4,
                            'created_at': now, 'updated_at': now, 'deleted_at': '',
                            'source_system': 'USDA n4pw-9ygw + Yahoo CL=F'})
    variants = [('primary',1,0), ('lag_minus1',-1,0), ('lag0',0,0), ('lag2',2,0),
                ('delay1',1,1), ('placebo52',1,52), ('exclude2020',1,0)]
    results, all_pairs = [], []
    dates = pd.Series(calendar, index=calendar)
    for split, start, end in [('train','2015-01-01','2020-12-31'),('internal','2021-01-01','2023-12-31')]:
        lo, hi = pd.Timestamp(start), pd.Timestamp(end)
        for variant, lag, shift in variants:
            pairs = pd.DataFrame({'signal':signal.shift(shift), 'target':returns.shift(-lag),
                'origin':dates.shift(shift), 'denominator':dates.shift(shift+52),
                'target_start':weekly.actual_end.shift(1-lag), 'target_end':weekly.actual_end.shift(-lag)})
            scope = dates.between(lo,hi) & pairs.origin.between(lo,hi) & pairs.target_start.between(lo,hi) & pairs.target_end.between(lo,hi)
            scenario = pd.Series(True,index=calendar)
            if variant == 'exclude2020':
                scenario = ~pd.concat([pairs[c].dt.year.eq(2020) for c in ['origin','denominator','target_start','target_end']],axis=1).any(axis=1)
            valid = pairs.loc[scope & scenario].dropna()
            corr = valid.signal.corr(valid.target) if len(valid)>=2 and valid.signal.std()>0 and valid.target.std()>0 else np.nan
            results.append({'split':split,'variant':variant,'lag':lag,'signal_shift_weeks':shift,
                'scoped_n':int(scope.sum()),'scenario_excluded_n':int((scope & ~scenario).sum()),
                'missing_pair_n':int((scope & scenario).sum())-len(valid),'n':len(valid),'corr':corr,
                'first_origin':str(valid.origin.min()),'last_origin':str(valid.origin.max()),
                'first_denominator':str(valid.denominator.min()), 'first_target':str(valid.target_end.min()),
                'last_target':str(valid.target_end.max()),'minimum24':len(valid)>=24})
            valid['split'], valid['variant'] = split, variant
            all_pairs.append(valid)
    tests = pd.DataFrame(results)
    run_id = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    output = OUT / run_id
    output.mkdir(parents=True, exist_ok=False)
    processed = ROOT / 'research/data/processed/joint-hunt-20260908' / run_id
    processed.mkdir(parents=True, exist_ok=False)
    derived.to_csv(processed/'weekly.csv',index_label='week')
    pd.concat(all_pairs).to_csv(processed/'pairs.csv',index_label='anchor_week')
    tests.to_csv(output/'tests.csv',index=False)
    complete_sum = float(activity.sum())
    incomplete_known = float(grouped.loc[grouped['count'].ne(4),'sum'].sum())
    reconciliation = {'known_tons':float(frame.tons.sum()), 'complete_week_tons':complete_sum,
        'incomplete_week_known_tons':incomplete_known, 'source_rows':len(frame),
        'missing_ton_cells':int(frame.tons.isna().sum()), 'source_zero_cells':int(frame.tons.eq(0).sum()),
        'calendar_weeks':len(calendar),'observed_weeks':len(frame.date.unique()),
        'missing_calendar_weeks':int(grouped['count'].isna().sum()),'incomplete_observed_weeks':int(grouped['count'].lt(4).sum()),
        'complete_weeks':int(activity.notna().sum()),'zero_complete_weeks':int(activity.eq(0).sum()),
        'signal_weeks':int(signal.notna().sum()),'missing_signal_weeks':int(signal.isna().sum()),
        'wti_rows':len(prices),'wti_nonpositive':int(close.le(0).sum()),'wti_missing_returned_close':int(close.isna().sum()),
        'wti_valid_returns':int(returns.notna().sum()),'invalid_price_weeks':[str(x.date()) for x in calendar[bad]]}
    assert reconciliation['known_tons'] == complete_sum + incomplete_known
    assert all(tests.scoped_n == tests.scenario_excluded_n + tests.missing_pair_n + tests.n)
    fig, ax = plt.subplots(figsize=(9,3))
    signal.plot(ax=ax); ax.set(title='Locks27: 52-week log activity change (observed-date only)', ylabel='100 log ratio', xlabel='Week ending Saturday')
    fig.tight_layout(); fig.savefig(output/'activity.svg'); plt.close(fig)
    fig, ax = plt.subplots(figsize=(9,3))
    for split in ['train','internal']:
        part=tests[tests.split.eq(split)]
        ax.plot(part.variant,part['corr'],marker='o',label=split)
    ax.axhline(0,color='grey',linewidth=.5); ax.legend(); ax.set(ylabel='Pearson r',title='Exploratory variants; overlapping tests, no as-of claim')
    fig.tight_layout(); fig.savefig(output/'relationships.svg'); plt.close(fig)
    (output/'reconciliation.json').write_text(json.dumps(reconciliation,indent=2)+'\n')
    receipt = {'candidate_id':'ALT-20260907-01','run':run_id,'created_at':now,
        'plan_sha256':sha(PLAN),'code_sha256':sha(Path(__file__)),
        'input_manifest':str((RAW/'manifest.json').relative_to(ROOT)), 'manifest_sha256':sha(RAW/'manifest.json'),
        'inputs':manifest['requests'],'versions':{'python':platform.python_version(),'pandas':pd.__version__,'numpy':np.__version__,'matplotlib':matplotlib.__version__},
        'outputs':{str(p.relative_to(ROOT)):sha(p) for p in [*output.iterdir(),*processed.iterdir()]},
        'asof_safe':'NOT_PROVEN','oos':'NOT_LOADED; NOT_RUN','claims':'repo empirical only',
        'review':'runnable invariants PASS; independent review pending',
        'calendar_completeness':'Yahoo returned rows only; exchange holiday calendar NOT_PROVEN'}
    (output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({'output':str(output.relative_to(ROOT)),'processed':str(processed.relative_to(ROOT)),'reconciliation':reconciliation},indent=2))
    print(tests[['split','variant','n','corr']].to_string(index=False))


if __name__ == '__main__':
    try:
        run()
    except (FileNotFoundError, AssertionError, ValueError, KeyError) as error:
        print(f'BLOCKED: {error}; no substitute data generated',file=sys.stderr)
        sys.exit(2)
