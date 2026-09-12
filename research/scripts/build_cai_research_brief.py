"""공개 요약과 고정 설정만으로 연구 브리프·오프라인 HTML을 생성한다. 학습·수집 없음."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUMMARY = ROOT / "app/app/data/cai-experiment-summary.json"
CONFIG = ROOT / "research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json"
OUTPUTS = (ROOT / "docs/cai/RESEARCH_BRIEF.md", ROOT / "app/public/cai-research-brief.html")
REPO = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/"


def render(summary: dict, config: dict, source_sha: str) -> tuple[str, str]:
    """저장된 대표 실험 수치로 두 문서를 만든다. 필수 결과가 없으면 실패한다."""
    block = summary["sample_expansion"]
    rows = block["models"]
    by_id = {row["id"]: row for row in rows}
    expected = {item["id"] for item in config["configs"]}
    if len(by_id) != len(rows) or set(by_id) != expected or config["mode"] != "RETROSPECTIVE_RESEARCH":
        raise ValueError("대표 실험의 모델 집합 또는 회고 모드가 다릅니다")
    for row in rows:
        for metric in ("log_loss", "accuracy", "brier"):
            value = row["after"][metric]
            if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value):
                raise ValueError("완료된 유한 지표가 필요합니다")
    market_loss = by_id["market"]["after"]["log_loss"]
    deltas = {key: by_id[key]["after"]["log_loss"] - market_loss for key in ("market_cai_equal", "market_cai_learned")}
    conclusion = "시장정보에 CAI를 추가한 두 비교 모두 확률오차가 줄지 않았습니다." if all(v >= 0 for v in deltas.values()) else "시장정보에 CAI를 추가했을 때 확률오차가 줄어든 비교가 있습니다."
    baseline = "시장정보만 쓴 모델도 단순 상승률 기준선보다 확률오차가 큽니다." if market_loss > by_id["baseline"]["after"]["log_loss"] else "시장정보와 단순 상승률 기준선의 차이는 아래 표에서 확인합니다."
    ev = block["eval"]
    table = []
    for row in rows:
        m = row["after"]
        weights = "—" if m["weights"] is None else " / ".join(f"{w:.4f}" for w in m["weights"])
        delta = f"{deltas[row['id']]:+.6f}" if row["id"] in deltas else "—"
        table.append([row["label"], f"{m['log_loss']:.6f}", f"{100*m['accuracy']:.2f}%", f"{m['brier']:.6f}", delta, weights])
    headings = ["모델", "log loss ↓", "정확도 ↑", "Brier ↓", "시장정보에 추가한 Δll", "교통 / 유량 가중치"]
    sections = [
        ("질문과 현재 답", [
            "쿠싱 인근의 실제 활동 흔적을 결합하면 다음 5거래일 WTI 상승 여부에 정보를 더할 수 있을까요?",
            conclusion + " " + baseline,
            "대표 사례는 가장 최근 완료된 입력 보강인 2019년 교통 보강 실험입니다. 성능이 좋은 결과를 골라 대표로 삼은 것이 아닙니다. 이 결과를 모든 대안 데이터에 대한 결론으로 확대하지 않습니다.",
        ]),
        ("무엇을 측정했나", [
            "TMAS AVC040: 쿠싱 인근 도로의 일별 전체 차량 수입니다. 원유 운송 트럭만 센 값이 아닙니다.",
            "DMR: South STP(OK0026701 / 001)의 월별 신고 유량, MGD·DAILY MX 계열입니다. 원유 시설의 펌핑량이나 도시 전체 용수 사용량이 아닙니다. 강수·생활 유입·신고 관행의 영향을 구분하지 못했습니다.",
            "교통은 관측일에 정렬하고 DMR은 규제기관 접수일 이후 최대 62일 재사용합니다. 월별 값을 여러 거래일에 썼다고 독립 관측이 늘어나는 것은 아닙니다. 과거 최초 공개일·수정 전 값은 미확인이라 회고 전용입니다.",
        ]),
        ("지수와 모델을 어떻게 나눴나", [
            "학습 구간의 성분별 평균·표준편차(ddof=0)로 z를 구하고 ±3으로 제한한 뒤 score=(clip(z,−3,3)+3)/6×100으로 바꿉니다. 0–100은 이 변환의 상대 점수이며 시설 가동률·유가 상승 확률이 아닙니다.",
            "동일가중 CAI는 교통·유량 점수의 평균입니다. 학습가중 CAI는 학습 구간의 WTI 정답으로 CAI 단독 로지스틱 모델의 log loss를 최소화합니다(w≥0, 합=1). 활동 측정의 타당성을 학습으로 입증한 것이 아닙니다.",
            "시장정보 모델은 RSI14와 5일 수익률을 사용합니다. 시장정보+학습가중 CAI도 CAI 단독 목적함수로 구한 가중치를 사용하며, 시장정보와 공동으로 최적화한 가중치는 아닙니다.",
        ]),
        ("실제로 비교한 범위", [
            f"정답: 다음 {config['target']['horizon_days']}거래일 종가가 현재보다 높으면 상승, 보합은 하락과 함께 분류합니다. Yahoo CL=F 거래일 배열 기준입니다.",
            f"고정 설정: {config['is']['start']}부터 {config['split']['train_end']}까지 학습, {config['split']['val_start']}–{config['split']['val_end']} 평가 후보. 실제 공통 평가 표본은 {ev['start']}–{ev['end']}, {ev['n']}행입니다. 대표 실험의 모델 학습 표본은 {block['after_train_rows']}행입니다.",
            f"초기 교통+DMR 학습 {block['before_train_rows']}행에서 {block['after_train_rows']}행으로 보강했습니다. 평가 표본은 {'동일합니다' if block['eval_identical'] else '동일하지 않습니다'}. 학습 표본이 바뀌므로 전후 차이를 2019년 추가의 인과 효과로 단정하지 않습니다.",
            "성분 표준화는 학습 구간에서만, 모델 전처리는 해당 모델의 유효 학습 행에서만 적합합니다. 결측을 0으로 채우지 않으며, 학습/평가 경계를 넘는 정답 창과 0 이하 종가를 포함한 정답 창은 제외합니다.",
            "이미 본 결과에 이은 회고 탐색입니다. 독립 사전등록·미래 검증이 아닙니다. 5거래일 정답 창이 겹치므로 평가 행 수를 독립 시행 수로 해석하지 않습니다. 최종 OOS는 잠금 유지입니다.",
        ]),
        ("결과표 읽는 법", [
            "log loss·Brier는 낮을수록, 정확도는 높을수록 좋습니다. Δll은 시장정보+CAI에서 시장정보만의 log loss를 뺀 값이며 양수는 악화입니다. 다른 표본의 실험끼리 순위를 합치지 않습니다.",
            "학습가중치가 유량에 거의 전부 몰린 현상은 기록된 최적화 결과입니다. 실제 원유 활동을 더 잘 측정했다는 증거가 아닙니다. 원 가중치는 요약 JSON에 보존하고 이 표만 소수 4자리로 표시합니다.",
        ]),
        ("재현과 다음 판단", [
            "재현 안내: research/experiments/cai/REPRODUCE_2019.md. 기존 로컬 원본에서 별도 폴더로 재생성해 입력 해시·고정 설정·모델 지표/가중치/계수·내부 예측을 확인합니다. 같은 환경 재현과 성찬님의 독립 재현은 구분합니다.",
            "원자료·입력 CSV는 재배포 조건 미확인으로 공개 묶음에 넣지 않습니다. 원출처가 개정돼 해시가 달라지면 기존 숫자에 억지로 맞추지 말고 빈티지 차이로 중단·보고합니다.",
            "독립 재현·실제 활동 대표성·공개시점·공식 현재 지수·미래 확률은 아직 완료되지 않았습니다. 다음 연구는 대표성 검토와 당시 공개시점 확보부터 진행하고, 새 성분·새 모델 탐색은 그 부족분에 맞춰 별도로 정합니다.",
        ]),
        ("5분 설명 순서", [
            "0:00–0:40 질문: 현장 활동에서 유가의 단서를 찾을 수 있을까?",
            "0:40–1:30 자료: 전체 차량과 신고 유량을 실제로 얻었고, 무엇을 대신 재는지 설명한다.",
            "1:30–2:30 방법: 상대 점수→동일/학습가중 조합→시장정보 기준선과 같은 표본 비교.",
            "2:30–4:00 결과: 대표 표의 시장정보+CAI 두 행과 단순 기준선을 짚고, 개선 미확인의 범위를 설명한다.",
            "4:00–5:00 한계와 다음 판단: 회고/공개시점/독립 재현 경계를 밝히고, 실제 활동 대표성을 먼저 검토한다.",
        ]),
    ]
    title = "쿠싱 활동과 유가 — 실측으로 확인한 첫 비교"
    provenance = f"회고 연구 · 대표 run {block['after_run']} · 공개 요약 생성시각 {summary['generated_at_utc']} · 원문 SHA-256 {source_sha}"
    md = f"# {title}\n\n<!-- 생성: python3 research/scripts/build_cai_research_brief.py ; 직접 편집하지 않음 -->\n\n{provenance}\n"
    bodies = []
    for heading, paragraphs in sections:
        md += f"\n## {heading}\n\n" + "\n\n".join(paragraphs) + "\n"
        body = f"<section><h2>{escape(heading)}</h2>" + "".join(f"<p>{escape(p)}</p>" for p in paragraphs)
        if heading == "결과표 읽는 법":
            md += "\n| " + " | ".join(headings) + " |\n| " + " | ".join(["---"]*len(headings)) + " |\n"
            md += "".join("| " + " | ".join(row) + " |\n" for row in table)
            body += '<div class="table-wrap"><table><caption>2019 보강 · 동일 평가 표본의 모델 비교</caption><thead><tr>' + "".join(f'<th scope="col">{escape(h)}</th>' for h in headings) + "</tr></thead><tbody>"
            body += "".join("<tr>" + "".join(f"<td>{escape(c)}</td>" for c in row) + "</tr>" for row in table) + "</tbody></table></div>"
        bodies.append(body + "</section>")
    paths = ["research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json", "research/experiments/cai/reference/2019plus_20260912T013423Z/export/summary.json", "research/experiments/cai/REPRODUCE_2019.md", "app/app/data/cai-experiment-summary.json"]
    md += "\n## 근거\n\n" + "\n".join(f"- [{p}]({REPO+p})" for p in paths) + "\n"
    css = "body{margin:0;background:#faf8f2;color:#182c27;font:16px/1.75 system-ui,sans-serif}main{max-width:980px;margin:auto;padding:48px 24px}h1{font-size:30px;line-height:1.4}h2{font-size:20px;border-top:1px solid #ccd1ca;padding-top:22px}p{margin:12px 0}.meta{font-size:12px;overflow-wrap:anywhere;color:#52615a}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:10px;border-bottom:1px solid #ccd1ca;text-align:left}caption{text-align:left;font-weight:600}a{color:#215f45;overflow-wrap:anywhere}@media print{body{background:white}main{padding:0}h2{break-after:avoid}tr{break-inside:avoid}.table-wrap{overflow:visible}table{font-size:10px}}"
    page = '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    page += f"<title>{title}</title><style>{css}</style><main><h1>{title}</h1><p class=meta>{escape(provenance)}</p>"
    page += "".join(bodies) + '<section><h2>근거</h2><p>본문·표는 인터넷 없이 읽을 수 있습니다. 아래 원문 링크만 네트워크가 필요합니다.</p><ul>'
    page += "".join(f'<li><a href="{REPO+p}">{p}</a></li>' for p in paths) + "</ul></section></main></html>\n"
    return md, page


def main() -> int:
    """정본 두 파일을 생성하거나 --check로 최신 생성물과 같은지 검사한다."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    raw = SUMMARY.read_bytes()
    summary = json.loads(raw)
    # 설명에 새 설정이나 다른 run의 지표를 조용히 섞지 않는다.
    pins = json.loads((ROOT / "research/indexes/091-cai-reproduction-20260913/manifest.json").read_text())
    config_sha = next(item["sha256"] for item in pins if item["path"] == str(CONFIG.relative_to(ROOT)))
    if hashlib.sha256(CONFIG.read_bytes()).hexdigest() != config_sha:
        raise SystemExit("고정 설정이 재현 영수증과 다릅니다")
    reference = json.loads((ROOT / "research/experiments/cai/reference/2019plus_20260912T013423Z/export/summary.json").read_text())
    block = summary["sample_expansion"]
    by_id = {row["id"]: row["after"] for row in block["models"]}
    if block["after_run"] != reference["run_id"] or block["eval"] != reference["eval"]["common_eval"]:
        raise SystemExit("대표 run·평가 구간이 참조와 다릅니다")
    for model in reference["models"]:
        expected = {key: model["metrics"][key] for key in ("accuracy", "log_loss", "brier")}
        expected.update(train_rows=model["train_rows"], weights=model["weights"])
        if by_id.get(model["id"]) != expected:
            raise SystemExit(f"공개 요약과 참조 모델이 다릅니다: {model['id']}")
    rendered = render(summary, json.loads(CONFIG.read_text()), hashlib.sha256(raw).hexdigest())
    for path, content in zip(OUTPUTS, rendered):
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f"STALE: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        print(f"{'PASS' if args.check else 'WROTE'}: {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
