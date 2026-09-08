"""NOAA CPC 인구가중 월별 냉난방도일(2015-2023)을 수집하고 원단위로 대사한다. WTI 검정 없음."""
import argparse
import csv
import hashlib
import io
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CID = 'ALT-20260907-45'
RUN = '20260908T120546Z'
BASE = 'https://ftp.cpc.ncep.noaa.gov/htdocs/degree_days/weighted/legacy_files'
KINDS = ('heating', 'cooling')
MONTHS = ('January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December')
ABBR = {'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
        'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
        'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'}
YEARS = tuple(range(2015, 2024))
UA = 'ls-crude-research/1.0 (contact: research; public-data-check)'
HDD_SUM = 36249
CDD_SUM = 12720
MISMATCH_COUNT = 20


def digest(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """같은 출력은 유지하고 다른 결과의 기존 파일 덮어쓰기를 막는다."""
    if path.exists():
        assert path.read_bytes() == data, f'output differs; use new run/version: {path}'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


ABORT_STATUS = frozenset({401, 403, 429})


def atomic_write_json(path, obj):
    """임시 파일 기록 후 교체한다. 중단 시에도 마지막까지의 영수증이 남는다."""
    tmp = path.with_name(path.name + '.tmp')
    tmp.write_text(json.dumps(obj, indent=2) + '\n')
    os.replace(tmp, path)


def file_url(kind, year, month):
    return f'{BASE}/{kind}/statesCONUS/{year}/{month}.txt'


def month_token_to_full(token):
    """정확한 전체 이름 또는 표준 3자 약어만 허용한다. 앞부분 일치는 거부한다."""
    titled = token.capitalize()
    if titled in MONTHS:
        return titled
    upper = token.upper()
    if upper in ABBR:
        return ABBR[upper]
    return None


def is_section_header(line):
    stripped = line.strip()
    return bool(stripped) and stripped == stripped.upper() and stripped.endswith('WEIGHTED') \
        and not any(c.isdigit() for c in stripped)


def parse_month_file(data, kind, year, month):
    """제목행 종류·발행월 표기·POPULATION 구간 내 유일 US행을 검증하고 월합계와 공급자 전년차를 읽는다."""
    assert kind in KINDS, f'unknown kind: {kind}'
    text = data.decode('utf-8', errors='strict')
    lines = text.splitlines()
    title = next((ln.strip() for ln in lines if ln.strip()), None)
    assert title == f'{kind.upper()} DEGREE DAY DATA MONTHLY SUMMARY', \
        f'kind/title mismatch for {kind}: {title!r}'
    label = next((ln for ln in lines if 'MONTHLY DATA FOR' in ln), None)
    assert label is not None, 'month label missing'
    m = re.search(r'MONTHLY DATA FOR\s+([A-Za-z]+)\s+(\d{4})', label)
    assert m, 'month label unparsable'
    label_month = month_token_to_full(m.group(1))
    assert label_month is not None, f'unexpected month token: {label.strip()}'
    assert label_month == month and int(m.group(2)) == year, (
        f'path/label month mismatch: {year}/{month} vs {label.strip()}')
    pop_idx = next((i for i, ln in enumerate(lines) if ln.strip() == 'POPULATION WEIGHTED'), None)
    assert pop_idx is not None, 'POPULATION WEIGHTED section missing'
    us_rows = []
    for ln in lines[pop_idx + 1:]:
        if is_section_header(ln):
            break
        tokens = ln.split()
        if len(tokens) >= 2 and tokens[0] == 'UNITED' and tokens[1] == 'STATES':
            us_rows.append(ln)
    assert len(us_rows) == 1, f'POPULATION section must hold exactly one US row, found {len(us_rows)}'
    tokens = us_rows[0].split()
    assert len(tokens) >= 5, 'UNITED STATES row too short'
    numbers = []
    for raw_value in tokens[2:5]:
        assert re.fullmatch(r'-?\d+', raw_value), 'US row value not an integer'
        value = int(raw_value)
        numbers.append(None if value == -999 else value)
    total, _dev_norm, provider_yoy = numbers
    assert total is None or total >= 0, 'negative degree-day total'
    return {'missing': total is None, 'total': total, 'provider_yoy': provider_yoy}


def real_fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read(1_000_001)
        assert len(data) <= 1_000_000, 'unexpected response size'
        return data, response.status, response.headers.get('Last-Modified')


def collect(run_id, _fetch=None, _root=None, _sleep=None):
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    root = _root or ROOT
    fetch = _fetch or real_fetch
    sleep = _sleep or (lambda seconds: time.sleep(seconds))
    raw = root / 'research/gathering/raw' / CID / run_id
    assert not raw.exists(), f'raw run exists; use new UTC run: {raw}'
    raw.mkdir(parents=True)
    files_dir = raw / 'files'
    receipt = raw / 'requests.json'
    atomic_write_json(receipt, [])
    total = len(KINDS) * len(YEARS) * 12
    requests = []
    failures = 0

    def fail_entry(name, url, requested_at, exc, aborted=False):
        entry = {'name': name, 'url': url, 'requested_at': requested_at,
                 'failed_at': datetime.now(timezone.utc).isoformat(),
                 'error_type': type(exc).__name__, 'error': str(exc)[:200] or type(exc).__name__}
        if aborted:
            entry['aborted'] = True
        return entry

    def stop(name, exc):
        atomic_write_json(receipt, requests)
        raise AssertionError(
            f'access/rate-limit blocked at {name}; stopped after {len(requests)} of {total}, '
            f'log preserved at {receipt}; no retry, no bypass') from exc

    for kind in KINDS:
        for year in YEARS:
            for month in MONTHS:
                name = f'{kind}/{year}/{month}.txt'
                url = file_url(kind, year, month)
                requested_at = datetime.now(timezone.utc).isoformat()
                try:
                    data, status, last_modified = fetch(url)
                except KeyboardInterrupt as exc:
                    requests.append(fail_entry(name, url, requested_at, exc, aborted=True))
                    atomic_write_json(receipt, requests)
                    raise
                except Exception as exc:
                    failures += 1
                    requests.append(fail_entry(name, url, requested_at, exc,
                                               aborted=getattr(exc, 'code', None) in ABORT_STATUS))
                    atomic_write_json(receipt, requests)
                    if getattr(exc, 'code', None) in ABORT_STATUS:
                        stop(name, exc)
                    sleep(0.2)
                    continue
                if status in ABORT_STATUS:
                    failures += 1
                    exc = RuntimeError(f'HTTP {status} (access/rate-limit class, no retry)')
                    requests.append(fail_entry(name, url, requested_at, exc, aborted=True))
                    atomic_write_json(receipt, requests)
                    stop(name, exc)
                if status != 200:
                    failures += 1
                    requests.append(fail_entry(name, url, requested_at,
                                               RuntimeError(f'HTTP {status}')))
                    atomic_write_json(receipt, requests)
                    sleep(0.2)
                    continue
                dest = files_dir / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
                requests.append({'name': name, 'url': url, 'requested_at': requested_at,
                                 'retrieved_at': datetime.now(timezone.utc).isoformat(),
                                 'http_status': status, 'last_modified': last_modified,
                                 'bytes': len(data), 'sha256': digest(data)})
                atomic_write_json(receipt, requests)
                sleep(0.2)
    print(json.dumps({'files_ok': len(requests) - failures, 'files_failed': failures}, indent=2))
    assert failures == 0, f'{failures} monthly files failed; partial collection, do not use as complete panel'


def read_panel(raw):
    """원본 216개와 manifest를 대조하고 월별 합계·공급자 전년차를 반환한다."""
    manifest = json.loads((raw / 'requests.json').read_text())
    assert len(manifest) == len(KINDS) * len(YEARS) * 12, 'incomplete request manifest'
    assert all(e.get('http_status') == 200 for e in manifest), 'manifest has failed requests'
    series = {}
    for entry in manifest:
        data = (raw / 'files' / entry['name']).read_bytes()
        assert digest(data) == entry['sha256'], f"raw SHA-256 differs from manifest: {entry['name']}"
        kind, year, month_file = entry['name'].split('/')
        parsed = parse_month_file(data, kind, int(year), month_file[:-4])
        key = (year, month_file[:-4])
        assert key not in series.setdefault(kind, {}), f"duplicate month file: {entry['name']}"
        series[kind][key] = parsed
    months = [f'{y}-{m:02d}' for y in YEARS for m in range(1, 13)]
    name_of = {f'{y}-{m:02d}': (str(y), MONTHS[m - 1]) for y in YEARS for m in range(1, 13)}
    for kind in KINDS:
        assert len(series[kind]) == len(months), f'incomplete {kind} panel'
    return manifest, series, months, name_of


def yoy_rows(series, months, name_of, provider):
    """자체 전년차와 공급자 전년차를 함께 담은 월별 행을 만든다."""
    rows = []
    for i, month in enumerate(months):
        year, month_name = name_of[month]
        cell = {}
        for kind, prefix in (('heating', 'hdd'), ('cooling', 'cdd')):
            parsed = series[kind][(year, month_name)]
            total = parsed['total']
            cell[prefix] = '' if total is None else total
            own = ''
            if i >= 12:
                prev_total = series[kind][name_of[months[i - 12]]]['total']
                if total is not None and prev_total is not None:
                    own = total - prev_total
            cell[prefix + '_yoy'] = own
            if provider:
                value = parsed['provider_yoy']
                cell['provider_' + prefix + '_yoy'] = '' if value is None else value
        rows.append({'month': month, **cell})
    return rows


def build(run_id):
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    raw = ROOT / 'research/gathering/raw' / CID / run_id
    out = ROOT / 'research/data/processed' / CID / run_id
    receipt = ROOT / 'research/indexes' / CID / run_id
    manifest, series, months, name_of = read_panel(raw)
    missing_files = [e['name'] for e in manifest
                     if series[e['name'].split('/')[0]][(e['name'].split('/')[1], e['name'].split('/')[2][:-4])]['total'] is None]
    rows = yoy_rows(series, months, name_of, provider=False)
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


def build_v2(run_id):
    """v1 원본을 재사용해 공급자 전년차 열을 추가한 v2 패널과 그림을 만든다. 재수집 없음."""
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    raw = ROOT / 'research/gathering/raw' / CID / run_id
    v1_csv = ROOT / 'research/data/processed' / CID / run_id / 'degree-days.csv'
    out = ROOT / 'research/data/processed' / CID / run_id / 'v2'
    receipt = ROOT / 'research/indexes' / CID / run_id / 'v2'
    manifest, series, months, name_of = read_panel(raw)
    previous = {r['month']: r for r in csv.DictReader(v1_csv.open())}
    assert len(previous) == len(months), 'v1 csv month coverage changed'
    rows = yoy_rows(series, months, name_of, provider=True)
    mismatches = []
    for i, row in enumerate(rows):
        old = previous[row['month']]
        assert str(row['hdd']) == old['hdd'] and str(row['cdd']) == old['cdd'], \
            f"v1 month total changed: {row['month']}"
        if i >= 12:
            assert str(row['hdd_yoy']) == old['hdd_yoy'] and str(row['cdd_yoy']) == old['cdd_yoy'], \
                f"v1 own yoy changed: {row['month']}"
            for kind, prefix in (('heating', 'hdd'), ('cooling', 'cdd')):
                own, provider = row[prefix + '_yoy'], row['provider_' + prefix + '_yoy']
                if own != '' and provider != '' and own != provider:
                    mismatches.append({'month': row['month'], 'kind': kind,
                                       'own_yoy': own, 'provider_yoy': provider})
    hdd_vals = [r['hdd'] for r in rows if r['hdd'] != '']
    cdd_vals = [r['cdd'] for r in rows if r['cdd'] != '']
    assert sum(hdd_vals) == HDD_SUM and sum(cdd_vals) == CDD_SUM, 'month total sums changed'
    assert len(mismatches) == MISMATCH_COUNT, \
        f'provider mismatch count changed ({len(mismatches)}); investigate, do not adjust the constant'
    stream = io.StringIO(newline='')
    fields = ['month', 'hdd', 'cdd', 'hdd_yoy', 'cdd_yoy', 'provider_hdd_yoy', 'provider_cdd_yoy']
    writer = csv.DictWriter(stream, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
    csv_bytes = stream.getvalue().encode()
    preserve(out / 'degree-days.csv', csv_bytes)
    svg_levels = render_levels_v2(months, [r['hdd'] if r['hdd'] != '' else None for r in rows],
                                  [r['cdd'] if r['cdd'] != '' else None for r in rows])
    preserve(receipt / 'degree-days-monthly-v2.svg', svg_levels.encode())
    svg_yoy = render_yoy_v2(months, rows)
    preserve(receipt / 'degree-days-yoy-v2.svg', svg_yoy.encode())
    code_hash = digest(Path(__file__).read_bytes())
    outputs = {}
    for path in (out / 'degree-days.csv', receipt / 'degree-days-monthly-v2.svg',
                 receipt / 'degree-days-yoy-v2.svg'):
        outputs[str(path.relative_to(ROOT))] = digest(path.read_bytes())
    summary = {
        'candidate': CID, 'version': 'v2', 'base_run': run_id,
        'source': 'NOAA CPC population-weighted monthly degree days, statesCONUS files (same raw as v1, no re-collection)',
        'unit': 'degree-days (°F·day), 65°F base, CONUS monthly total from UNITED STATES row of POPULATION WEIGHTED section',
        'unit_reference': 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/ddayexp.shtml (old explainer; do not project its population-weight base year onto 2015-2023)',
        'months': len(rows), 'first_month': months[0], 'last_month': months[-1],
        'raw_files': len(manifest),
        'hdd_sum': sum(hdd_vals), 'cdd_sum': sum(cdd_vals),
        'hdd_min': min(hdd_vals), 'hdd_max': max(hdd_vals),
        'cdd_min': min(cdd_vals), 'cdd_max': max(cdd_vals),
        'mismatch_count': len(mismatches),
        'mismatches': mismatches,
        'provider_note': 'provider MON DEV FROM L YR parsed as-is; cause of the 20 own-vs-provider differences is unconfirmed, no correction applied',
        'output_sha256': outputs,
        'code_sha256': code_hash,
        'available_at': 'per-file Last-Modified recorded in raw requests.json; monthly vintage not restored',
        'WTI_tests': 'NOT_RUN',
    }
    preserve(receipt / 'quality.json', (json.dumps(summary, indent=2) + '\n').encode())
    execution = {
        'command': f'collect.py --v2 --run {run_id}',
        'built_at': datetime.now(timezone.utc).isoformat(),
        'python': sys.version.split()[0],
        'code_sha256': code_hash,
        'base_run': run_id,
    }
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    (receipt / f'execution-{stamp}.json').write_text(json.dumps(execution, indent=2) + '\n')
    print(json.dumps(summary, indent=2))


def segments(months, values):
    """None에서 끊기는 연속 구간 리스트를 반환한다. None은 선으로 연결하지 않는다."""
    runs, current = [], []
    for i, value in enumerate(values):
        if value is None:
            if current:
                runs.append(current)
                current = []
        else:
            current.append((i, value))
    if current:
        runs.append(current)
    return runs


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


def render_levels_v2(months, hdd, cdd):
    W, H, L, B = 880, 340, 58, 52
    vmax = max([v for v in hdd + cdd if v is not None] + [1]) * 1.08
    def x(i):
        return L + i * (W - L - 16) / (len(months) - 1)
    def y(v):
        return (H - B) - v / vmax * (H - B - 34)
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="880" height="340" viewBox="0 0 880 340" role="img" aria-labelledby="t3 d3">',
             '<title id="t3">US population-weighted heating and cooling degree days, monthly (°F·day, 65°F base)</title>',
             '<desc id="d3">CONUS national monthly totals 2015-2023 from NOAA CPC statesCONUS files. Gaps are missing months, never interpolated. Monthly vintage not restored; no WTI test.</desc>',
             '<rect width="880" height="340" fill="white"/>',
             '<text x="58" y="24">US population-weighted degree days, monthly total (°F·day; 65°F base, CONUS)</text>']
    for tick in range(6):
        v = vmax * tick / 5
        width = '2' if tick == 0 else '1'
        color = '#666' if tick == 0 else '#ddd'
        parts.append(f'<text x="8" y="{y(v):.1f}" font-size="11">{v:.0f}</text><path d="M58 {y(v):.1f} H864" stroke="{color}" stroke-width="{width}"/>')
    for i in range(0, len(months), 12):
        parts.append(f'<text x="{x(i):.1f}" y="304" font-size="11">{months[i][:4]}</text><path d="M{x(i):.1f} 288 V296" stroke="#333"/>')
    for label, vals, color in (('HDD heating', hdd, '#b3541e'), ('CDD cooling', cdd, '#1e6fb3')):
        for run in segments(months, vals):
            pts = ' '.join(f'{x(i):.1f},{y(v):.1f}' for i, v in run)
            parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.6"/>')
    parts.append('<rect x="648" y="38" width="12" height="12" fill="#b3541e"/><text x="664" y="48" font-size="12">HDD heating</text>')
    parts.append('<rect x="648" y="56" width="12" height="12" fill="#1e6fb3"/><text x="664" y="66" font-size="12">CDD cooling</text>')
    parts.append('<text x="58" y="322" font-size="11">Source: NOAA CPC statesCONUS. Current vintage; monthly first-release dates not restored. Degree days are not fuel use.</text></svg>')
    return '\n'.join(parts)


def render_yoy_v2(months, rows):
    W, H, L, B = 880, 350, 62, 82
    own_hdd = [r['hdd_yoy'] if r['hdd_yoy'] != '' else None for r in rows]
    own_cdd = [r['cdd_yoy'] if r['cdd_yoy'] != '' else None for r in rows]
    vals = [v for v in own_hdd + own_cdd if v is not None]
    span = max([abs(v) for v in vals] + [1]) * 1.1
    def x(i):
        return L + i * (W - L - 16) / (len(months) - 1)
    def y(v):
        return 34 + (1 - (v + span) / (2 * span)) * (H - B - 34)
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="880" height="350" viewBox="0 0 880 350" role="img" aria-labelledby="t4 d4">',
             '<title id="t4">Year-over-year change of monthly degree days (°F·day)</title>',
             '<desc id="d4">Own year-over-year difference from raw monthly totals, 2015-2023 (first 12 months blank). Observation construction only; no WTI test.</desc>',
             '<rect width="880" height="350" fill="white"/>',
             '<text x="62" y="24">Degree-day YoY change, monthly (°F·day; own difference of raw totals)</text>',
             f'<path d="M62 {y(0):.1f} H864" stroke="#333" stroke-width="2"/>']
    for tick in (-1, 1):
        v = span * tick
        parts.append(f'<text x="8" y="{y(v):.1f}" font-size="11">{v:+.0f}</text><path d="M62 {y(v):.1f} H864" stroke="#ddd"/>')
    parts.append(f'<text x="8" y="{y(0) + 4:.1f}" font-size="11">0</text>')
    for i in range(0, len(months), 12):
        parts.append(f'<text x="{x(i):.1f}" y="292" font-size="11">{months[i][:4]}</text>')
    for label, vals, color in (('HDD YoY', own_hdd, '#b3541e'), ('CDD YoY', own_cdd, '#1e6fb3')):
        for run in segments(months, vals):
            pts = ' '.join(f'{x(i):.1f},{y(v):.1f}' for i, v in run)
            parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.4"/>')
    parts.append('<rect x="648" y="38" width="12" height="12" fill="#b3541e"/><text x="664" y="48" font-size="12">HDD YoY</text>')
    parts.append('<rect x="648" y="56" width="12" height="12" fill="#1e6fb3"/><text x="664" y="66" font-size="12">CDD YoY</text>')
    parts.append('<text x="62" y="310" font-size="11">Source: NOAA CPC, own YoY from monthly totals. Provider MON DEV FROM L YR differs.</text><text x="62" y="330" font-size="11">20 comparison values across 14 months differ (see quality.json); cause unconfirmed. No WTI test.</text></svg>')
    return '\n'.join(parts)


def self_test():
    def fixture(month_total, dev_lyr='-8', title='HEATING DEGREE DAY DATA MONTHLY SUMMARY',
                label='MONTHLY DATA FOR JANUARY 2023', decoy_total='777', extra_us=None):
        rows = [
            '',
            f'              {title}',
            label,
            '   STATE         MONTH MON  MON',
            '                 TOTAL DEV  DEV',
            ' ALABAMA             5    1    2',
            '',
            '        POPULATION WEIGHTED',
            '   REGION',
            ' NEW ENGLAND         9   -1   -2',
            f' UNITED STATES      {month_total}   -2   {dev_lyr}  -100  -100',
        ]
        if extra_us is not None:
            rows.append(f' UNITED STATES      {extra_us}   -2   -8  -100  -100')
        rows += [
            '',
            '        BOTTLED TANK LP GAS HEATING WEIGHTED',
            '   REGION',
            f' UNITED STATES      {decoy_total}   -4  -12  -100  -100',
            '',
        ]
        return '\n'.join(rows).encode()

    def rejects(data, kind, year, month, reason):
        try:
            parse_month_file(data, kind, year, month)
        except AssertionError:
            return
        raise AssertionError('accepted ' + reason)

    got = parse_month_file(fixture('41'), 'heating', 2023, 'January')
    assert got == {'missing': False, 'total': 41, 'provider_yoy': -8}, got
    got = parse_month_file(fixture('0', dev_lyr='-2', title='COOLING DEGREE DAY DATA MONTHLY SUMMARY',
                                   label='MONTHLY DATA FOR JAN 2023'), 'cooling', 2023, 'January')
    assert got == {'missing': False, 'total': 0, 'provider_yoy': -2}, got
    got = parse_month_file(fixture('-999'), 'heating', 2023, 'January')
    assert got == {'missing': True, 'total': None, 'provider_yoy': -8}, got
    got = parse_month_file(fixture('41', label='MONTHLY DATA FOR SEP 2023'), 'heating', 2023, 'September')
    assert got['total'] == 41, got
    for bad_total in ('4.5', 'NA'):
        rejects(fixture(bad_total), 'heating', 2023, 'January', 'bad total: ' + bad_total)
    rejects(fixture('41', label='MONTHLY DATA FOR FEBRUARY 2023'), 'heating', 2023, 'January', 'path/label mismatch')
    rejects(fixture('41'), 'cooling', 2023, 'January', 'wrong kind heating-as-cooling')
    rejects(fixture('41', title='COOLING DEGREE DAY DATA MONTHLY SUMMARY'), 'heating', 2023, 'January', 'wrong kind cooling-as-heating')
    rejects(fixture('41'), 'antarctic', 2023, 'January', 'kind outside KINDS')
    contaminated = fixture('41').decode().replace('UNITED STATES      41', 'UNITED STATESX     41', 1)
    rejects(contaminated.encode(), 'heating', 2023, 'January', 'UNITED STATESX accepted as US row')
    pop_us_gone = '\n'.join(ln for ln in fixture('41').decode().splitlines() if ' 41 ' not in ln)
    rejects(pop_us_gone.encode(), 'heating', 2023, 'January', 'missing US row in POPULATION section')
    rejects(fixture('41', extra_us='42'), 'heating', 2023, 'January', 'duplicate US rows in POPULATION section')
    for bad_token in ('J', 'Januar', 'Foo', 'Sept', 'JANU'):
        rejects(fixture('41', label=f'MONTHLY DATA FOR {bad_token} 2023'), 'heating', 2023, 'January', 'month token: ' + bad_token)
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
    print('PASS: kind/title check, section-bounded US row, strict month tokens, -999/decimal guards, immutable output')


def http_error(url, code):
    return urllib.error.HTTPError(url, code, f'Mock HTTP {code}', {}, None)


def self_test_collect():
    """mock fetch와 temp dir로 수집 실패 경로를 검사한다. 네트워크 없음."""
    plan_ok = {}
    for kind in KINDS:
        for year in YEARS:
            for month in MONTHS:
                plan_ok[f'{kind}/{year}/{month}.txt'] = f'{kind} {year} {month}'.encode()

    def mock_fetch(url):
        name = url.split('legacy_files/')[1].replace('statesCONUS/', '')
        kind, year, month_file = name.split('/')
        key = f'{kind}/{year}/{month_file}'
        if key == 'heating/2015/March.txt':
            raise TimeoutError('simulated timeout')
        return plan_ok[key], 200, 'Mock, 01 Jan 2020 00:00:00 GMT'

    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        try:
            collect('20200101T000000Z', _fetch=mock_fetch, _root=root, _sleep=lambda seconds: None)
        except AssertionError as exc:
            assert 'partial collection' in str(exc), exc
        else:
            raise AssertionError('collect accepted a partial panel')
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200101T000000Z' / 'requests.json').read_text())
        assert len(receipt) == len(KINDS) * len(YEARS) * 12, len(receipt)
        failed = [e for e in receipt if 'failed_at' in e]
        assert len(failed) == 1 and failed[0]['name'] == 'heating/2015/March.txt', failed
        assert failed[0]['error_type'] == 'TimeoutError', failed[0]
        assert (root / 'research/gathering/raw' / CID / '20200101T000000Z' / 'files' / 'heating/2015/January.txt').read_bytes() == plan_ok['heating/2015/January.txt']
        ok = [e for e in receipt if e.get('http_status') == 200]
        assert len(ok) == len(receipt) - 1, (len(ok), len(receipt))

        def mock_ok(url):
            return b'data', 200, None

        collect('20200102T000000Z', _fetch=mock_ok, _root=root, _sleep=lambda seconds: None)
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200102T000000Z' / 'requests.json').read_text())
        assert len(receipt) == len(KINDS) * len(YEARS) * 12 and all(e.get('http_status') == 200 for e in receipt), len(receipt)

    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)

        def mock_always_fail(url):
            raise ConnectionError('simulated first-request failure')

        try:
            collect('20200103T000000Z', _fetch=mock_always_fail, _root=root, _sleep=lambda seconds: None)
        except AssertionError as exc:
            assert 'partial collection' in str(exc), exc
        else:
            raise AssertionError('collect accepted an all-failed panel')
        receipt_path = root / 'research/gathering/raw' / CID / '20200103T000000Z' / 'requests.json'
        receipt = json.loads(receipt_path.read_text())
        assert len(receipt) == len(KINDS) * len(YEARS) * 12 and 'failed_at' in receipt[0], len(receipt)

    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        calls = []

        def mock_two_then_429(url):
            calls.append(url)
            if len(calls) <= 2:
                return b'data', 200, None
            raise http_error(url, 429)

        try:
            collect('20200104T000000Z', _fetch=mock_two_then_429, _root=root, _sleep=lambda seconds: None)
        except AssertionError as exc:
            assert 'stopped' in str(exc) and 'no retry' in str(exc), exc
        else:
            raise AssertionError('collect continued after HTTP 429')
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200104T000000Z' / 'requests.json').read_text())
        assert len(receipt) == 3 and len(calls) == 3, (len(receipt), len(calls))
        assert receipt[2].get('aborted') is True and receipt[2]['error_type'] == 'HTTPError', receipt[2]

        def mock_403_first(url):
            raise http_error(url, 403)

        try:
            collect('20200105T000000Z', _fetch=mock_403_first, _root=root, _sleep=lambda seconds: None)
        except AssertionError as exc:
            assert 'stopped' in str(exc), exc
        else:
            raise AssertionError('collect continued after HTTP 403')
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200105T000000Z' / 'requests.json').read_text())
        assert len(receipt) == 1 and receipt[0].get('aborted') is True, len(receipt)

        def mock_keyboard_interrupt(url):
            raise KeyboardInterrupt('simulated interrupt')

        try:
            collect('20200106T000000Z', _fetch=mock_keyboard_interrupt, _root=root, _sleep=lambda seconds: None)
        except KeyboardInterrupt:
            pass
        else:
            raise AssertionError('collect swallowed KeyboardInterrupt')
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200106T000000Z' / 'requests.json').read_text())
        assert len(receipt) == 1 and receipt[0]['error_type'] == 'KeyboardInterrupt' and receipt[0]['aborted'], receipt
        calls = []
        def two_then_interrupt(url):
            calls.append(url)
            if len(calls) == 3:
                raise KeyboardInterrupt('third request interrupted')
            return b'data', 200, None
        try:
            collect('20200107T000000Z', _fetch=two_then_interrupt, _root=root, _sleep=lambda seconds: None)
        except KeyboardInterrupt:
            pass
        else:
            raise AssertionError('collect swallowed middle interruption')
        receipt = json.loads((root / 'research/gathering/raw' / CID / '20200107T000000Z' / 'requests.json').read_text())
        assert len(calls) == len(receipt) == 3
        assert receipt[2]['aborted'] and receipt[2]['url'] == calls[2] and receipt[2]['failed_at']
        assert all(r['http_status'] == 200 for r in receipt[:2])
    print('PASS: per-attempt receipts on failure path, no unlimited retry, mid-run log preserved')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--collect', action='store_true')
    parser.add_argument('--run')
    parser.add_argument('--v2', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        self_test_collect()
    elif args.collect:
        run_id = args.run or datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        collect(run_id)
    elif args.v2:
        assert args.run, '--run required for v2 build'
        build_v2(args.run)
    else:
        assert args.run, '--run required for build'
        build(args.run)
