"""KGLS 시정 관측만 수집·재현한다. WTI·통항 상태를 조회하거나 추정하지 않는다."""
import argparse
import csv
import hashlib
import html
import io
import json
import math
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[3]
CID = 'ALT-20260908-16'
URL = 'https://aviationweather.gov/api/data/metar?ids=KGLS&format=json&hours=24'


def iso(value):
    """API ISO 시각을 UTC-aware datetime으로 변환한다."""
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('timezone missing')
    return result.astimezone(timezone.utc)


def visibility(value):
    """SM 값과 제한 부호를 분리한다. 상하한을 실제 정확값으로 대체하지 않는다."""
    if value is None or value == '':
        return None, 'missing'
    text = str(value).strip().removesuffix('SM')
    relation = 'exact'
    if text.endswith('+'):
        text, relation = text[:-1], 'lower_bound'
    elif text.startswith('P'):
        text, relation = text[1:], 'lower_bound'
    elif text.startswith('M'):
        text, relation = text[1:], 'upper_bound'
    parts = [float(Fraction(part)) for part in text.split()]
    if not parts or any(part < 0 for part in parts):
        raise ValueError('negative or empty fraction')
    number = sum(parts)
    if not math.isfinite(number) or number < 0:
        raise ValueError('invalid visibility')
    return number, relation


def clean(data, retrieved):
    """단일 관측소·중복·미래시각·시정 schema를 검증하고 오류 행을 보존한다."""
    if not isinstance(data, list) or not data or len(data) >= 400:
        raise ValueError('empty/invalid payload or possible 400-entry truncation')
    rows, rejected, seen = [], [], set()
    for i, record in enumerate(data):
        try:
            if record['icaoId'] != 'KGLS':
                raise ValueError('unexpected station')
            observed = datetime.fromtimestamp(record['obsTime'], timezone.utc)
            received = iso(record['receiptTime'])
            report = iso(record['reportTime'])
            if observed > retrieved or received > retrieved or report > retrieved:
                raise ValueError('future observation/receipt/report')
            if received < observed:
                raise ValueError('receipt precedes observation')
            if observed in seen:
                raise ValueError('duplicate observation; correction requires review')
            value, relation = visibility(record.get('visib'))
            seen.add(observed)
            rows.append(dict(observed_at=observed.isoformat(), receipt_time=received.isoformat(),
                             report_time=report.isoformat(), visib_source=record.get('visib'),
                             bound_sm=value, relation=relation,
                             quality_score=0.5 if relation == 'missing' else 1.0))
        except (KeyError, TypeError, ValueError, ZeroDivisionError, OverflowError) as error:
            rejected.append(dict(source_row=i, reason=str(error)))
    return sorted(rows, key=lambda row: row['observed_at']), rejected


def self_check():
    """합성 경계 입력은 parser 검증 전용이며 관측 결과에 쓰지 않는다."""
    assert visibility('10+') == (10.0, 'lower_bound')
    assert visibility('P6SM') == (6.0, 'lower_bound')
    assert visibility('M1/4SM') == (0.25, 'upper_bound')
    assert visibility('1 1/2') == (1.5, 'exact')
    assert visibility(None) == (None, 'missing')
    sample = dict(icaoId='KGLS', obsTime=1704067200, receiptTime='2024-01-01T00:01:00Z',
                  reportTime='2024-01-01T00:00:00Z', visib='10+')
    now = iso('2024-01-01T01:00:00Z')
    good, bad = clean([sample, sample, dict(sample, obsTime=now.timestamp()+1)], now)
    assert len(good) == 1 and len(bad) == 2
    assert clean([dict(sample, visib='junk')], now)[1]
    print('PASS: bound, fraction, null, duplicate, future and malformed checks')


def main():
    """새 원본 빈티지를 취득하거나 --raw 경로의 원본으로 같은 산출물을 재생성한다."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--raw', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        self_check()
        return
    if args.raw:
        raw = args.raw.resolve()
        manifest = json.loads((raw.parent / 'manifest.json').read_text())
        payload = raw.read_bytes()
        if hashlib.sha256(payload).hexdigest() != manifest['raw_sha256']:
            raise ValueError('raw hash mismatch')
    else:
        started = datetime.now(timezone.utc)
        raw = ROOT / 'research/gathering/raw' / CID / started.strftime('%Y%m%dT%H%M%SZ') / 'metar.json'
        raw.parent.mkdir(parents=True, exist_ok=False)
        try:
            with urlopen(Request(URL, headers={'User-Agent': 'ls-crude-research/1.0'}), timeout=30) as response:
                payload = response.read()
                status = response.status
        except Exception as error:
            (raw.parent / 'README.md').write_text(f'# Collection FAILED\n\n{URL}\n\n{started.isoformat()}\n\n{type(error).__name__}: {error}\nNo retries.\n')
            raise
        raw.write_bytes(payload)
        manifest = dict(url=URL, requested_at=started.isoformat(), retrieved_at=datetime.now(timezone.utc).isoformat(),
                        status=status, raw_sha256=hashlib.sha256(payload).hexdigest())
        (raw.parent / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    if not args.raw:
        (raw.parent / 'README.md').write_text('# KGLS raw receipt\n\n'+json.dumps(manifest, indent=2)+'\n\nOriginal metar.json and manifest.json are gitignored. NOAA/NWS research reuse: https://www.weather.gov/disclaimer . No endorsement. Reacquisition gives a new rolling window.\n')
    try:
        rows, rejected = clean(json.loads(payload), iso(manifest['retrieved_at']))
        if not rows:
            raise ValueError('no valid observations')
    except (ValueError, TypeError) as error:
        if not args.raw:
            with (raw.parent / 'README.md').open('a') as stream:
                stream.write(f'\nValidation FAILED: {error}\n')
        raise
    run = raw.parent.name
    output = ROOT / 'research/data/processed' / CID / run
    output.mkdir(parents=True, exist_ok=True)
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
    writer.writeheader(); writer.writerows(rows)
    processed_bytes = stream.getvalue().encode()
    processed_path = output / 'observations.csv'
    if processed_path.exists() and processed_path.read_bytes() != processed_bytes:
        raise ValueError('existing processed run differs; preserve and use a new run/version')
    if not processed_path.exists():
        processed_path.write_bytes(processed_bytes)
    summary = dict(**manifest, run=run, source_rows=len(json.loads(payload)), accepted_rows=len(rows), rejected=rejected,
                   missing_visibility=sum(r['relation']=='missing' for r in rows),
                   lower_bound_rows=sum(r['relation']=='lower_bound' for r in rows),
                   exact_rows=sum(r['relation']=='exact' for r in rows),
                   first_observed=rows[0]['observed_at'], last_observed=rows[-1]['observed_at'],
                   latest_age_minutes=(iso(manifest['retrieved_at'])-iso(rows[-1]['observed_at'])).total_seconds()/60,
                   max_gap_minutes=max(((iso(b['observed_at'])-iso(a['observed_at'])).total_seconds()/60 for a,b in zip(rows,rows[1:])), default=None),
                   source_date_matches_retrieval_utc=iso(rows[-1]['observed_at']).date()==iso(manifest['retrieved_at']).date(),
                   mean_visibility='NOT_COMPUTABLE: censoring; no exact-value imputation',
                   observed_hours=len({r['observed_at'][:13] for r in rows}), test_status='NOT_RUN')
    receipt = ROOT / 'research/indexes' / CID / run
    receipt.mkdir(parents=True, exist_ok=True)
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 380" role="img" aria-labelledby="title desc">',
           '<title id="title">KGLS Galveston Scholes visibility observations</title>',
           '<desc id="desc">Airport observations only; arrows show lower bounds, not exact visibility. No WTI or port-operation inference.</desc>',
           '<rect width="960" height="380" fill="#f8fafc"/>',
           '<g font-family="sans-serif" font-size="14" fill="#172554">',
           '<text x="60" y="32">KGLS / Galveston Scholes: reported visibility (statute miles)</text>',
           '<text x="60" y="56">OBSERVATION DEMO - airport only; no port, tanker or oil-price inference</text>']
    known = [r for r in rows if r['bound_sm'] is not None]
    ceiling = max(12, max((r['bound_sm'] for r in known), default=0)+2)
    start, end = iso(rows[0]['observed_at']).timestamp(), iso(rows[-1]['observed_at']).timestamp()
    for tick in (0, ceiling/2, ceiling):
        y=280-170*tick/ceiling
        svg.append(f'<path d="M60 {y} H900" stroke="#cbd5e1"/><text x="20" y="{y+5}">{tick:g}</text>')
    for r in known:
        x=60+840*(iso(r['observed_at']).timestamp()-start)/max(1,end-start)
        y=280-170*r['bound_sm']/ceiling
        label=html.escape(f"{r['observed_at']} | {r['visib_source']} SM ({r['relation']})")
        svg.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#0369a1"><title>{label}</title></circle>')
        if r['relation'] != 'exact':
            shift=-18 if r['relation']=='lower_bound' else 18
            svg.append(f'<path d="M{x} {y} v{shift} m-4 {(-shift/3):g} l4 {shift/3:g} l4 {-shift/3:g}" stroke="#0369a1" fill="none"/>')
    svg.extend([f'<text x="60" y="310">{rows[0]["observed_at"]}</text>',f'<text x="645" y="310">{rows[-1]["observed_at"]}</text>',
                '<text x="60" y="340">UTC; arrows = reported bounds. No line interpolation. Missing values omitted, counted in receipt.</text>',
                '<text x="60" y="365">Source: NOAA/NWS Aviation Weather Center. LS CRUDE derived research graphic; not an official product.</text></g></svg>'])
    plot_text = '\n'.join(svg)+'\n'
    plot_path = receipt / 'visibility.svg'
    if plot_path.exists() and plot_path.read_text() != plot_text:
        raise ValueError('existing run plot differs; preserve and use a new run/version')
    if not plot_path.exists():
        plot_path.write_text(plot_text)
    summary['processed_sha256']=hashlib.sha256((output/'observations.csv').read_bytes()).hexdigest()
    summary['plot_sha256']=hashlib.sha256((receipt/'visibility.svg').read_bytes()).hexdigest()
    summary['script_sha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    receipt_text = json.dumps(summary, indent=2)+'\n'
    receipt_path = receipt / 'receipt.json'
    if receipt_path.exists() and receipt_path.read_text() != receipt_text:
        raise ValueError('existing run receipt differs; preserve and use a new run/version')
    if not receipt_path.exists():
        receipt_path.write_text(receipt_text)
    print(json.dumps(summary,indent=2))


if __name__ == '__main__':
    main()
