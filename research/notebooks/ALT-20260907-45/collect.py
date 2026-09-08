"""NOAA CPC 인구가중 월별 냉난방도일(2015-2023)을 수집하고 원단위로 대사한다. WTI 검정 없음."""
import argparse
import csv
import hashlib
import io
import json
import re
import tempfile
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CID = 'ALT-20260907-45'
BASE = 'https://ftp.cpc.ncep.noaa.gov/htdocs/degree_days/weighted/legacy_files'
KINDS = ('heating', 'cooling')
MONTHS = ('January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December')
YEARS = tuple(range(2015, 2024))
UA = 'ls-crude-research/1.0 (contact: research; public-data-check)'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """같은 출력은 유지하고 다른 결과의 기존 파일 덮어쓰기를 막는다."""
    if path.exists():
        assert path.read_bytes() == data, f'output differs; use new run/version: {path}'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


def file_url(kind, year, month):
    return f'{BASE}/{kind}/statesCONUS/{year}/{month}.txt'


def parse_month_file(data, kind, year, month):
    """월별 파일에서 발행월 표기와 첫 POPULATION WEIGHTED 구간의 UNITED STATES 월합계를 읽는다."""
    text = data.decode('utf-8', errors='strict')
    lines = text.splitlines()
    label = next((ln for ln in lines if 'MONTHLY DATA FOR' in ln), None)
    assert label is not None, 'month label missing'
    m = re.search(r'MONTHLY DATA FOR\s+([A-Z]+)\s+(\d{4})', label)
    assert m, 'month label unparsable'
    label_token = m.group(1).capitalize()
    label_month = next((full for full in MONTHS if full.startswith(label_token)), None)
    assert label_month is not None, f'unexpected month label: {label.strip()}'
    assert label_month == month and int(m.group(2)) == year, (
        f'path/label month mismatch: {year}/{month} vs {label.strip()}')
    pop_idx = next((i for i, ln in enumerate(lines) if ln.strip() == 'POPULATION WEIGHTED'), None)
    assert pop_idx is not None, 'POPULATION WEIGHTED section missing'
    us_line = next((ln for ln in lines[pop_idx + 1:] if ln.lstrip().startswith('UNITED STATES')), None)
    assert us_line is not None, 'UNITED STATES row missing'
    tokens = us_line.split()
    assert len(tokens) >= 4, 'UNITED STATES row too short'
    month_total = tokens[2]
    assert re.fullmatch(r'-?\d+', month_total), 'month total not an integer'
    value = int(month_total)
    missing = value == -999
    assert missing or value >= 0, 'negative degree days'
    return {'missing': missing, 'value': None if missing else value}


def self_test():
    def fixture(month_total, label='MONTHLY DATA FOR JANUARY 2023', decoy_total='777'):
        return '\n'.join([
            '              HEATING DEGREE DAY DATA MONTHLY SUMMARY',
            label,
            '   STATE         MONTH MON  MON',
            '                 TOTAL DEV  DEV',
            ' ALABAMA             5    1    2',
            '',
            '        POPULATION WEIGHTED',
            '   REGION',
            ' NEW ENGLAND         9   -1   -2',
            f' UNITED STATES      {month_total}   -2   -8  -100  -100',
            '',
            '        BOTTLED TANK LP GAS HEATING WEIGHTED',
            '   REGION',
            f' UNITED STATES      {decoy_total}   -4  -12  -100  -100',
            '',
        ]).encode()

    got = parse_month_file(fixture('41'), 'heating', 2023, 'January')
    assert got == {'missing': False, 'value': 41}, got
    got = parse_month_file(fixture('0'), 'cooling', 2023, 'January')
    assert got == {'missing': False, 'value': 0}, got
    got = parse_month_file(fixture('-999'), 'heating', 2023, 'January')
    assert got == {'missing': True, 'value': None}, got
    for bad_total in ('4.5', 'NA'):
        try:
            parse_month_file(fixture(bad_total), 'heating', 2023, 'January')
        except AssertionError:
            pass
        else:
            raise AssertionError('accepted bad total: ' + bad_total)
    try:
        parse_month_file(fixture('41', label='MONTHLY DATA FOR FEBRUARY 2023'), 'heating', 2023, 'January')
    except AssertionError:
        pass
    else:
        raise AssertionError('accepted path/label mismatch')
    with tempfile.TemporaryDirectory() as temp:
        path = Path(temp) / 'output'
        preserve(path, b'original')
        preserve(path, b'original')
        try:
            preserve(path, b'changed')
        except AssertionError:
            pass
        else:
            raise AssertionError('overwrote different output')
    print('PASS: month-label check, first-section capture, -999/decimal guards, immutable output')


def collect(run_id):
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    raw = ROOT / 'research/gathering/raw' / CID / run_id
    assert not raw.exists(), f'raw run exists; use new UTC run: {raw}'
    files_dir = raw / 'files'
    requests = []
    failures = 0
    for kind in KINDS:
        for year in YEARS:
            for month in MONTHS:
                name = f'{kind}/{year}/{month}.txt'
                url = file_url(kind, year, month)
                requested_at = datetime.now(timezone.utc).isoformat()
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': UA})
                    with urllib.request.urlopen(req, timeout=30) as response:
                        data = response.read(1_000_001)
                        assert len(data) <= 1_000_000, 'unexpected response size'
                        status = response.status
                        last_modified = response.headers.get('Last-Modified')
                    dest = files_dir / name
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(data)
                    entry = {'name': name, 'url': url, 'requested_at': requested_at,
                             'retrieved_at': datetime.now(timezone.utc).isoformat(),
                             'http_status': status, 'last_modified': last_modified,
                             'bytes': len(data), 'sha256': digest(data)}
                except Exception as exc:
                    failures += 1
                    entry = {'name': name, 'url': url, 'requested_at': requested_at,
                             'failed_at': datetime.now(timezone.utc).isoformat(),
                             'error_type': type(exc).__name__, 'error': str(exc)[:200]}
                requests.append(entry)
                time.sleep(0.2)
    (raw / 'requests.json').write_text(json.dumps(requests, indent=2) + '\n')
    print(json.dumps({'files_ok': len(requests) - failures, 'files_failed': failures}, indent=2))
    assert failures == 0, f'{failures} monthly files failed; partial collection, do not use as complete panel'


def build(run_id):
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    raw = ROOT / 'research/gathering/raw' / CID / run_id
    out = ROOT / 'research/data/processed' / CID / run_id
    receipt = ROOT / 'research/indexes' / CID / run_id
    manifest = json.loads((raw / 'requests.json').read_text())
    assert len(manifest) == len(KINDS) * len(YEARS) * 12, 'incomplete request manifest'
    assert all(e.get('http_status') == 200 for e in manifest), 'manifest has failed requests'
    series = {}
    missing_files = []
    for entry in manifest:
        data = (raw / 'files' / entry['name']).read_bytes()
        assert digest(data) == entry['sha256'], f"raw SHA-256 differs from manifest: {entry['name']}"
        kind, year, month_file = entry['name'].split('/')
        parsed = parse_month_file(data, kind, int(year), month_file[:-4])
        key = (year, month_file[:-4])
        assert key not in series.setdefault(kind, {}), f"duplicate month file: {entry['name']}"
        if parsed['missing']:
            missing_files.append(entry['name'])
        series[kind][key] = parsed['value']
    months = [f'{y}-{m:02d}' for y in YEARS for m in range(1, 13)]
    name_of = {f'{y}-{m:02d}': (str(y), MONTHS[m - 1]) for y in YEARS for m in range(1, 13)}
    for kind in KINDS:
        assert len(series[kind]) == len(months), f'incomplete {kind} panel'
    rows = []
    for i, month in enumerate(months):
        year, month_name = name_of[month]
        hdd = series['heating'][(year, month_name)]
        cdd = series['cooling'][(year, month_name)]
        row = {'month': month, 'hdd': '' if hdd is None else hdd, 'cdd': '' if cdd is None else cdd,
               'hdd_yoy': '', 'cdd_yoy': ''}
        if i >= 12:
            prev = rows[i - 12]
            if row['hdd'] != '' and prev['hdd'] != '':
                row['hdd_yoy'] = row['hdd'] - prev['hdd']
            if row['cdd'] != '' and prev['cdd'] != '':
                row['cdd_yoy'] = row['cdd'] - prev['cdd']
        rows.append(row)
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=['month', 'hdd', 'cdd', 'hdd_yoy', 'cdd_yoy'])
    writer.writeheader()
    writer.writerows(rows)
    data = stream.getvalue().encode()
    preserve(out / 'degree-days.csv', data)
    hdd_vals = [r['hdd'] for r in rows if r['hdd'] != '']
    cdd_vals = [r['cdd'] for r in rows if r['cdd'] != '']
    input_sha = {e['name']: e['sha256'] for e in manifest}
    summary = {
        'candidate': CID,
        'source': 'NOAA CPC population-weighted monthly degree days, statesCONUS files',
        'unit': 'degree days per calendar month, UNITED STATES row of first POPULATION WEIGHTED section',
        'months': len(rows), 'first_month': months[0], 'last_month': months[-1],
        'raw_files': len(manifest), 'parsed_rows': len(rows),
        'missing_month_totals': missing_files,
        'hdd_zero_months': sum(1 for v in hdd_vals if v == 0),
        'cdd_zero_months': sum(1 for v in cdd_vals if v == 0),
        'hdd_min': min(hdd_vals), 'hdd_max': max(hdd_vals),
        'cdd_min': min(cdd_vals), 'cdd_max': max(cdd_vals),
        'input_sha256_count': len(input_sha), 'output_sha256': digest(data),
        'available_at': 'per-file Last-Modified recorded in raw requests.json; monthly vintage not restored',
        'WTI_tests': 'NOT_RUN',
    }
    preserve(receipt / 'quality.json', (json.dumps(summary, indent=2) + '\n').encode())
    svg_levels = render_levels(months, [r['hdd'] if r['hdd'] != '' else None for r in rows],
                               [r['cdd'] if r['cdd'] != '' else None for r in rows])
    preserve(receipt / 'degree-days-monthly.svg', svg_levels.encode())
    svg_yoy = render_yoy(months[12:], [r['hdd_yoy'] if r['hdd_yoy'] != '' else None for r in rows[12:]],
                         [r['cdd_yoy'] if r['cdd_yoy'] != '' else None for r in rows[12:]])
    preserve(receipt / 'degree-days-yoy.svg', svg_yoy.encode())
    print(json.dumps(summary, indent=2))


def render_levels(months, hdd, cdd):
    W, H, L, B = 860, 330, 52, 46
    vmax = max([v for v in hdd + cdd if v is not None] + [1]) * 1.08
    def x(i):
        return L + i * (W - L - 14) / (len(months) - 1)
    def y(v):
        return (H - B) - v / vmax * (H - B - 30)
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="860" height="330" viewBox="0 0 860 330" role="img" aria-labelledby="t d">',
             '<title id="t">US population-weighted heating and cooling degree days, monthly</title>',
             '<desc id="d">National monthly totals 2015-2023 from NOAA CPC statesCONUS files. Summer HDD zeros and winter CDD zeros are observed zeros, not missing. Monthly vintage not restored; no WTI test.</desc>',
             '<rect width="860" height="330" fill="white"/>',
             '<text x="52" y="24">US population-weighted degree days, monthly total (degree days)</text>']
    for tick in range(5):
        v = vmax * tick / 4
        parts.append(f'<text x="6" y="{y(v):.1f}" font-size="11">{v:.0f}</text><path d="M52 {y(v):.1f} H846" stroke="#ddd"/>')
    for i in range(0, len(months), 12):
        parts.append(f'<text x="{x(i):.1f}" y="300" font-size="11">{months[i][:4]}</text><path d="M{x(i):.1f} 284 V292" stroke="#333"/>')
    for label, vals, color in (('HDD', hdd, '#b3541e'), ('CDD', cdd, '#1e6fb3')):
        pts = ' '.join(f'{x(i):.1f},{y(v):.1f}' for i, v in enumerate(vals) if v is not None)
        parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.6"/>')
    parts.append('<rect x="640" y="34" width="12" height="12" fill="#b3541e"/><text x="656" y="44" font-size="12">HDD heating</text>')
    parts.append('<rect x="640" y="52" width="12" height="12" fill="#1e6fb3"/><text x="656" y="62" font-size="12">CDD cooling</text>')
    parts.append('<text x="52" y="318" font-size="11">Source: NOAA CPC. Current vintage; monthly first-release dates not restored.</text></svg>')
    return '\n'.join(parts)


def render_yoy(months, hdd_yoy, cdd_yoy):
    W, H, L, B = 860, 300, 56, 46
    vals = [v for v in hdd_yoy + cdd_yoy if v is not None]
    span = max([abs(v) for v in vals] + [1]) * 1.1
    def x(i):
        return L + i * (W - L - 14) / (len(months) - 1)
    def y(v):
        return 30 + (1 - (v + span) / (2 * span)) * (H - B - 30)
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="860" height="300" viewBox="0 0 860 300" role="img" aria-labelledby="t2 d2">',
             '<title id="t2">Year-over-year change of monthly degree days</title>',
             '<desc id="d2">Card-planned I_m as year-over-year difference, 2016-2023. Observation construction only; no WTI test.</desc>',
             '<rect width="860" height="300" fill="white"/>',
             '<text x="56" y="22">Degree-day YoY change, monthly (degree days; card-planned I_m)</text>',
             f'<path d="M56 {y(0):.1f} H846" stroke="#333"/>']
    for i in range(0, len(months), 12):
        parts.append(f'<text x="{x(i):.1f}" y="272" font-size="11">{months[i][:4]}</text>')
    for label, vals_, color in (('HDD YoY', hdd_yoy, '#b3541e'), ('CDD YoY', cdd_yoy, '#1e6fb3')):
        pts = ' '.join(f'{x(i):.1f},{y(v):.1f}' for i, v in enumerate(vals_) if v is not None)
        parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.4"/>')
    parts.append('<text x="56" y="290" font-size="11">Source: NOAA CPC, derived YoY from monthly totals. Not fuel use; no WTI relation tested.</text></svg>')
    return '\n'.join(parts)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--collect', action='store_true')
    parser.add_argument('--run')
    args = parser.parse_args()
    if args.self_test:
        self_test()
    elif args.collect:
        run_id = args.run or datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        collect(run_id)
    else:
        assert args.run, '--run required for build'
        build(args.run)
