"""보존한 USCG 문서에서 게시 상태표와 계획 공지1건을 구분해 추출한다."""
import argparse
import hashlib
import json
import re
import subprocess
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PORTS = {'FREEPORT', 'GALVESTON', 'HOUSTON', 'TEXAS CITY'}


class Rows(HTMLParser):
    """HTML 표의 원 셀을 보존한다. @param 없음. @returns 파서 객체."""
    def __init__(self):
        super().__init__(); self.rows = []; self.row = []; self.cell = None
    def handle_starttag(self, tag, attrs):
        """@param tag/attrs HTML 태그. @returns None."""
        if tag == 'tr': self.row = []
        if tag in ('td', 'th'): self.cell = ''
    def handle_data(self, value):
        """@param value 셀 문자열. @returns None."""
        if self.cell is not None: self.cell += value
    def handle_endtag(self, tag):
        """@param tag HTML 닫는 태그. @returns None."""
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(' '.join(self.cell.split())); self.cell = None
        if tag == 'tr' and self.row: self.rows.append(self.row)


def extract(folder):
    """원본 SHA를 확인하고 구조가 확인된 기록만 추출한다.
    @param folder 원본과 manifest가 있는 불변 빈티지 폴더.
    @returns 원천별 의미·시각·한계를 분리한 JSON 객체.
    """
    manifest = json.loads((folder / 'manifest.json').read_text())
    for item in manifest['attempts']:
        assert item['status'] == 'COLLECTED', 'source collection incomplete'
        assert hashlib.sha256((folder / item['file']).read_bytes()).hexdigest() == item['sha256']
    parser = Rows(); parser.feed((folder / 'port-status.html').read_text())
    assert ['Port', 'Status', 'Comments', 'Last Changed'] in parser.rows
    selected = [r for r in parser.rows if len(r) == 4 and r[0] in PORTS]
    assert len(selected) == 4 and {r[0] for r in selected} == PORTS
    statuses = []
    for port, status, comments, changed in selected:
        date.fromisoformat(changed)
        statuses.append({'port': port, 'published_status': status, 'comments': comments, 'last_changed_date': changed,
                         'status_asof_time': None, 'meaning': 'published table snapshot, not real-time fog closure status'})
    text = subprocess.run(['pdftotext', '-layout', str(folder / 'lnm0811g2026.pdf'), '-'], check=True, capture_output=True, text=True, timeout=20).stdout
    marker = 'Houston Ship Channel - Temporary VTS Measure --- On:'
    start = text.index(marker)
    end = text.index('Houston Ship Channel - Dredge Operation', start)
    notice = ' '.join(text[start:end].split())
    assert 'pipeline and dive operations' in notice and '9:00 a.m. to 3:00 p.m.' in notice
    assert "between the Sam Houston Bridge and Green's Bayou" in notice, 'scope wording changed'
    assert 'In the event of a natural disruption to vessel traffic (i.e. fog)' in notice and 'adjust the start time for daybreak' in notice, 'fog clause changed'
    # notice_date는 공지의 계획 시행일이며 최초 공표일이 아니다.
    event_date = re.search(r'On: (\d{4}-\d{2}-\d{2})', notice)[1]
    date.fromisoformat(event_date)
    event = {'source_pdf_page': text[:start].count('\f')+1, 'notice_date': event_date, 'start_text': '9:00 a.m.', 'end_text': '3:00 p.m.',
             'timezone': None, 'actual_start': None, 'actual_end': None, 'first_published_at': None,
             'scope': "Upper Houston Ship Channel between Sam Houston Bridge and Green's Bayou",
             'cause': 'pipeline and dive operations', 'state': 'DIRECTED_WINDOW_NOT_VERIFIED_AS_REALIZED',
             'fog_clause': 'possible start adjustment; not a record that fog caused this closure'}
    return {'source_manifest': str((folder / 'manifest.json').relative_to(ROOT)), 'source_sha256': {i['file']: i['sha256'] for i in manifest['attempts']},
            'retrievals': {i['file']: i['retrieved_at'] for i in manifest['attempts']}, 'port_status_rows': statuses, 'notice': event,
            'WTI_tests': 'NOT_RUN', 'KGLS_alignment': 'NOT_RUN; actual closure timing, timezone and spatial representativeness unresolved'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--raw', type=Path, required=True)
    args = parser.parse_args()
    result = extract(args.raw.resolve())
    output = ROOT / 'research/indexes/ALT-20260908-16' / args.raw.name
    output.mkdir(exist_ok=True)
    data = (json.dumps(result, indent=2)+'\n').encode()
    target = output / 'operational-sample.json'
    assert not target.exists() or target.read_bytes() == data, 'existing output differs; preserve and version the extraction'
    if not target.exists(): target.write_bytes(data)
    print(json.dumps(result, indent=2))
