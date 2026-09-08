"""이미 고정한 IS 주검정 쌍을 분할별 산점도로 표시한다. 새 검정·튜닝은 없다."""
import hashlib
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd


def main():
    """기존 영수증의 입력 해시를 확인하고 주 타깃 산점도를 생성한다.
    @param 없음. 고정 실행의 pairs.csv만 읽는다.
    @returns None; 도표와 별도 해시 영수증을 저장한다.
    """
    root = Path(__file__).resolve().parents[3]
    source = root / 'research/data/processed/joint-hunt-20260908/20260908T044354588864Z/pairs.csv'
    original = root / 'research/indexes/joint-hunt-20260908/20260908T044354588864Z/receipt.json'
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    assert json.loads(original.read_text())['outputs'][str(source.relative_to(root))] == digest
    pairs = pd.read_csv(source)
    pairs = pairs[pairs['variant'].eq('primary')]
    assert pairs.groupby('split').size().to_dict() == {'internal': 155, 'train': 240}
    assert pd.to_datetime(pairs.target_end).max() < pd.Timestamp('2024-01-01')
    output = root / 'research/indexes/joint-hunt-20260908/review-20260908'
    output.mkdir(exist_ok=True)
    fig, axes = plt.subplots(1, 2, figsize=(10, 4), sharex=True, sharey=True)
    for axis, (split, label) in zip(axes, [('train', '2015-2020'), ('internal', '2021-2023')]):
        part = pairs[pairs['split'].eq(split)]
        axis.scatter(part.signal, 100 * part.target, s=15, alpha=.55)
        axis.axhline(0, color='grey', lw=.5)
        axis.set(title=f'{split}: {label}, n={len(part)}', xlabel='Activity: 100 log(A / A_52w_ago)')
    axes[0].set_ylabel('Next-week WTI simple return (%)')
    fig.suptitle('Locks27 fixed primary pairs; observed-date only, as-of safety unproven')
    fig.tight_layout()
    target = output / 'primary-scatter.png'
    fig.savefig(target, dpi=140)
    plt.close(fig)
    receipt = {'input': str(source.relative_to(root)), 'input_sha256': digest,
               'script_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
               'output_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
               'purpose': 'missing descriptive figure; no new statistics, no fitting, no OOS',
               'n': {'train': 240, 'internal': 155}}
    (output / 'scatter-receipt.json').write_text(json.dumps(receipt, indent=2)+'\n')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
