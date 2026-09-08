"""USCG 공개 운영 문서 두 개만 새 빈티지에 보존한다. 폐쇄 실현 여부는 추정하지 않는다."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[3]
SOURCES = {
    'port-status.html': 'https://www.navcen.uscg.gov/port-status?zone=HOUSTON-GALVESTON',
    'lnm0811g2026.pdf': 'https://www.navcen.uscg.gov/sites/default/files/pdf/lnms/lnm0811g2026.pdf',
}


def main():
    """각 GET의 실제 HTTP·해시·수집시각을 기록하거나 기존 빈티지 해시를 검사한다.
    @param CLI --check PATH는 재요청 없이 기존 폴더를 검사한다.
    @returns None; 실패 영수증은 남기고 일부 실패 시 비정상 종료한다.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', type=Path)
    args = parser.parse_args()
    if args.check:
        manifest = json.loads((args.check / 'manifest.json').read_text())
        assert manifest['source_scope'] == SOURCES
        assert len(manifest['attempts']) == 2 and all(i['status'] == 'COLLECTED' for i in manifest['attempts']), 'collection incomplete'
        for item in manifest['attempts']:
            if item['status'] == 'COLLECTED':
                payload = (args.check / item['file']).read_bytes()
                assert len(payload) == item['bytes']
                assert hashlib.sha256(payload).hexdigest() == item['sha256']
        print('PASS: source scope, saved bytes and SHA256; event interpretation not tested')
        return
    folder = ROOT / 'research/gathering/raw/ALT-20260908-16' / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder.mkdir(parents=True, exist_ok=False)
    manifest = {'source_scope': SOURCES, 'terms': 'https://www.uscg.mil/disclaim/', 'attempts': []}
    for name, url in SOURCES.items():
        item = {'file': name, 'url': url, 'requested_at': datetime.now(timezone.utc).isoformat()}
        try:
            with urlopen(Request(url, headers={'User-Agent': 'ls-crude-research/1.0'}), timeout=20) as response:
                payload = response.read(8_000_001)
                assert response.status == 200 and 0 < len(payload) <= 8_000_000
                assert payload.startswith(b'%PDF') if name.endswith('.pdf') else b'<html' in payload.lower()
            (folder / name).write_bytes(payload)
            item.update(status='COLLECTED', http=200, bytes=len(payload), sha256=hashlib.sha256(payload).hexdigest())
        except Exception as error:
            item.update(status='FAILED', error=f'{type(error).__name__}: {error}')
        item['retrieved_at'] = datetime.now(timezone.utc).isoformat()
        manifest['attempts'].append(item)
    (folder / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    (folder / 'README.md').write_text('# USCG operational-source receipt\n\nPublic USCG source only; no logo/endorsement. Terms: https://www.uscg.mil/disclaim/\n\n```json\n'+json.dumps(manifest, indent=2)+'\n```\n\nOriginal files/manifest are gitignored. Re-fetch creates a new vintage. A notice is not proof of realised closure or historic first publication.\n')
    print(folder.relative_to(ROOT))
    print(json.dumps(manifest, indent=2))
    if any(x['status'] != 'COLLECTED' for x in manifest['attempts']):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
