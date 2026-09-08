"""공식 MPA 월간 입항 소표본을 수집하고 원단위로 대사한다. WTI 검정 없음."""
import argparse
import csv
import hashlib
import io
import json
import re
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CID = 'ALT-20260907-26'
IDS = {'breakdown': 'd_c9dcfd8b85990669d1e74dd7ad71eb8b', 'total': 'd_9adb5ace517591edd9a8c88291ac1f1c'}
CATEGORIES = {'Oil Tankers', 'Chemical Tankers', 'LNG & LPG Tankers'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """같은 출력은 유지하고 다른 결과의 기존 파일 덮어쓰기를 막는다."""
    if path.exists():
        assert path.read_bytes() == data, f'output differs; use new run/version: {path}'
    else:
        path.write_bytes(data)


def verify_inputs(manifest, inputs):
    """수집 영수증의 원본 해시를 기준으로 변조를 차단한다."""
    assert len(manifest) == len(IDS), 'incomplete request manifest'
    expected = {entry['name']: entry['sha256'] for entry in manifest}
    assert set(expected) == set(IDS), 'request manifest names mismatch'
    for name, data in inputs.items():
        assert digest(data) == expected[name], f'raw SHA-256 differs from acquisition manifest: {name}'


def parse(data, breakdown):
    """응답 계약·고유키·수치를 검사하고 월별 원단위 행을 반환한다."""
    doc = json.loads(data)
    assert doc.get('success') is True, 'API unsuccessful'
    result = doc['result']
    assert result['resource_id'] == IDS['breakdown' if breakdown else 'total'], 'wrong resource'
    rows = result['records']
    assert rows, 'empty sample'
    seen = set()
    out = []
    for row in rows:
        month = row['month']
        assert re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', month), 'invalid month'
        category = row['category'] if breakdown else 'Total'
        assert not breakdown or category in CATEGORIES, 'category drift'
        key = (month, category)
        assert key not in seen, 'duplicate month-category'
        seen.add(key)
        value = row['number_of_tankers']
        assert isinstance(value, str) and re.fullmatch(r'\d+', value), 'missing/invalid count'
        out.append({'month': month, 'category': category, 'arrivals': int(value)})
    return sorted(out, key=lambda r: (r['month'], r['category']))


def reconcile(breakdown, totals):
    """완전한 유형 바스켓을 공식 total과 월별 대사한다."""
    monthly = {}
    for row in breakdown:
        monthly.setdefault(row['month'], {})[row['category']] = row['arrivals']
    t = {r['month']: r['arrivals'] for r in totals}
    assert set(monthly) == set(t), 'sample month coverage mismatch'
    ordinals = sorted(int(m[:4]) * 12 + int(m[5:]) for m in monthly)
    assert all(b - a == 1 for a, b in zip(ordinals, ordinals[1:])), 'missing month'
    for month, categories in monthly.items():
        assert set(categories) == CATEGORIES, 'incomplete category basket'
        assert sum(categories.values()) == t[month], 'breakdown sum differs from total'
    return monthly


def self_test():
    base = {'success': True, 'result': {'resource_id': IDS['breakdown'], 'records': [{'month': '2020-01', 'category': c, 'number_of_tankers': str(i + 1)} for i, c in enumerate(sorted(CATEGORIES))]}}
    rows = parse(json.dumps(base), True)
    assert reconcile(rows, [{'month': '2020-01', 'category': 'Total', 'arrivals': 6}])
    for mutation in ('duplicate', 'missing', 'category'):
        altered = json.loads(json.dumps(base))
        if mutation == 'duplicate': altered['result']['records'].append(altered['result']['records'][0])
        if mutation == 'missing': altered['result']['records'][0]['number_of_tankers'] = None
        if mutation == 'category': altered['result']['records'][0]['category'] = 'All vessels'
        try: parse(json.dumps(altered), True)
        except AssertionError: pass
        else: raise AssertionError('accepted bad input: ' + mutation)
    try: reconcile(rows, [{'month': '2020-01', 'arrivals': 7}])
    except AssertionError: pass
    else: raise AssertionError('accepted wrong total')
    inputs = {name: b'original' for name in IDS}
    manifest = [{'name': name, 'sha256': digest(data)} for name, data in inputs.items()]
    verify_inputs(manifest, inputs)
    inputs['breakdown'] = b'changed'
    try: verify_inputs(manifest, inputs)
    except AssertionError: pass
    else: raise AssertionError('accepted changed raw input')
    with tempfile.TemporaryDirectory() as temp:
        path = Path(temp) / 'output'
        preserve(path, b'original')
        preserve(path, b'original')
        try: preserve(path, b'changed')
        except AssertionError: pass
        else: raise AssertionError('overwrote different output')
        assert path.read_bytes() == b'original'
    print('PASS: schema, reconciliation, raw tamper and immutable-output checks')


def run(run_id, collect):
    assert re.fullmatch(r'\d{8}T\d{6}Z', run_id), 'UTC run format required'
    raw = ROOT / 'research/gathering/raw' / CID / run_id
    out = ROOT / 'research/data/processed' / CID / run_id
    receipt = ROOT / 'research/indexes' / CID / run_id
    if collect:
        raw.mkdir(parents=True, exist_ok=False)
        requests = []
        for name, resource in IDS.items():
            params = urllib.parse.urlencode({'resource_id': resource, 'limit': 36 if name == 'breakdown' else 12, 'sort': 'month desc'})
            url = 'https://data.gov.sg/api/action/datastore_search?' + params
            at = datetime.now(timezone.utc).isoformat()
            try:
                with urllib.request.urlopen(url, timeout=25) as response:
                    data = response.read(1_000_001)
                    assert len(data) <= 1_000_000, 'unexpected response size'
                    status = response.status
                (raw / (name + '.json')).write_bytes(data)
                requests.append({'name': name, 'url': url, 'requested_at': at, 'retrieved_at': datetime.now(timezone.utc).isoformat(), 'http_status': status, 'sha256': digest(data)})
            except Exception as exc:
                requests.append({'name': name, 'url': url, 'requested_at': at, 'failed_at': datetime.now(timezone.utc).isoformat(), 'error_type': type(exc).__name__})
                (raw / 'requests.json').write_text(json.dumps(requests, indent=2))
                raise
        (raw / 'requests.json').write_text(json.dumps(requests, indent=2))
    inputs = {name: (raw / (name + '.json')).read_bytes() for name in IDS}
    manifest = json.loads((raw / 'requests.json').read_text())
    verify_inputs(manifest, inputs)
    b, t = parse(inputs['breakdown'], True), parse(inputs['total'], False)
    monthly = reconcile(b, t)
    out.mkdir(parents=True, exist_ok=True)
    receipt.mkdir(parents=True, exist_ok=True)
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=['month', 'category', 'arrivals'])
    writer.writeheader()
    writer.writerows(b + t)
    data = stream.getvalue().encode()
    preserve(out / 'arrivals.csv', data)
    summary = {'input_sha256': {k: digest(v) for k, v in inputs.items()}, 'output_sha256': digest(data), 'months': len(monthly), 'first_month': min(monthly), 'last_month': max(monthly), 'breakdown_rows': len(b), 'total_rows': len(t), 'duplicate_keys': 0, 'missing_counts': 0, 'sum_mismatches': 0, 'unit': 'tanker arrivals per month (>75 GT); not unique ships, cargo tonnes or bunker sales', 'available_at': None, 'WTI_tests': 'NOT_RUN', 'latest_month': monthly[max(monthly)], 'latest_total': t[-1]['arrivals']}
    preserve(receipt / 'quality.json', (json.dumps(summary, indent=2) + '\n').encode())
    months = sorted(monthly)
    values = [monthly[m]['Oil Tankers'] for m in months]
    ymax = max(1, max(values) * 1.1)
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="840" height="310" viewBox="0 0 840 310" role="img" aria-labelledby="title desc">', '<title id="title">Singapore oil tanker arrivals, monthly</title>', '<desc id="desc">Latest twelve sampled months. Counts above 75 GT, provisional latest month. Not cargo volume or WTI evidence.</desc>', '<rect width="840" height="310" fill="white"/>', '<text x="45" y="25">Oil tanker arrivals (>75 GT), monthly count</text>']
    for tick in range(5):
        value = ymax * tick / 4
        y = 240 - value / ymax * 180
        svg.append(f'<text x="5" y="{y:.1f}" font-size="11">{value:.0f}</text><path d="M45 {y:.1f} H825" stroke="#ddd"/>')
    for i, (month, value) in enumerate(zip(months, values)):
        x, height = 50 + i * 64, value / ymax * 180
        svg.append(f'<rect x="{x}" y="{240-height:.1f}" width="42" height="{height:.1f}" fill="#17675f"/><text x="{x}" y="{232-height:.1f}" font-size="11">{value}</text><text x="{x}" y="258" font-size="10">{month}</text>')
    svg.append('<text x="45" y="288" font-size="11">Source: MPA / data.gov.sg; Singapore Open Data Licence 1.0. Latest month preliminary.</text></svg>')
    preserve(receipt / 'oil-tanker-arrivals.svg', '\n'.join(svg).encode())
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--collect', action='store_true')
    parser.add_argument('--run')
    args = parser.parse_args()
    if args.self_test: self_test()
    else:
        run_id = args.run or (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') if args.collect else None)
        assert run_id, '--run required for replay'
        run(run_id, args.collect)
