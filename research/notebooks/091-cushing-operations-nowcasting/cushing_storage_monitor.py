"""
Cushing Storage & Stress Monitor (CSSM)
=========================================

이 스크립트는 원안(Pipeline Flow 기반 CBI)의 수정판이다. 원안은 다음을 전제했으나
실제로 존재하지 않거나 검증 불가능했다:

  1. EIA가 명명된 파이프라인별(Keystone inflow, Seaway outflow 등) 무료 유량 시리즈를
     제공한다는 전제 — 사실이 아니다. EIA는 PADD-to-PADD 집계 이동량만 공개하며,
     파이프라인 단위 유량은 Genscape/Kpler/Platts 등 유료 상품의 영역이다.
  2. Cushing(내륙, 걸프코스트에서 약 800km) 반경 50km 내 탱커 추적 — 지리적으로
     성립하지 않는다. Cushing에는 원양 탱커가 접근하지 않는다.

이 스크립트는 대신 **실제로 존재하고 검증된 단일 소스**만 사용한다:

  - EIA 주간 Cushing, OK crude oil ending stocks (SPR 제외), series id
    `PET.W_EPC0_SAX_YCUOK_MBBL.W` — 무료, 매주 수요일 10:30 AM ET 발표.

이것은 '유량(flow)'이 아니라 '재고 수준(stock level)'이다. 즉 이 지표는
'지금 얼마나 바쁜가'가 아니라 '지금 탱크가 얼마나 찼는가/얼마나 빈가'를 측정한다.
바쁨(활동량)의 대체 지표가 아니라는 점을 코드 전체에서 명시적으로 유지한다.

Genscape/Kpler 연동부는 실제 엔드포인트 스펙을 확인할 수 없어 스텁으로만 남긴다 —
사용하려면 각 벤더의 실제 계약된 API 문서로 교체해야 한다.

📌 사용법:
1. https://www.eia.gov/opendata/register.php 에서 무료 API 키 발급 (즉시 이메일로 발급)
2. 아래 EIA_API_KEY에 입력하거나 환경변수 EIA_API_KEY로 설정
3. 실행: python cushing_storage_monitor.py --once        (1회 조회)
        python cushing_storage_monitor.py --watch       (신규 발표 감시)
        python cushing_storage_monitor.py --plot out.png (히스토리 차트 저장)

📦 의존성:
pip install requests pandas numpy matplotlib
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timezone
from typing import Dict, Optional

import numpy as np
import pandas as pd
import requests

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    HAVE_MPL = True
except ImportError:
    HAVE_MPL = False

# ===== 설정 =====
EIA_API_KEY = os.environ.get("EIA_API_KEY", None)  # 무료지만 등록 필요 (v1과 달리 v2는 키 필수)
EIA_SERIES_ID = "PET.W_EPC0_SAX_YCUOK_MBBL.W"  # 검증됨: Weekly Cushing, OK Ending Stocks excl. SPR
EIA_BASE_URL = "https://api.eia.gov/v2/seriesid"

# Cushing 저장 용량 참고치 (working/shell capacity, 대략치 — EIA는 3/9월 반기 공식 발표를 사용 권장)
CUSHING_WORKING_CAPACITY_MBBL = 76_000  # thousand barrels, 대략 76M bbl. 정확한 최신치는
                                          # EIA Petroleum Supply Monthly 반기 발표로 갱신할 것.
CUSHING_MIN_OPERATIONAL_MBBL = 20_000    # 대략적인 하한 참고치(운영상 완전히 비울 수 없음)

# Genscape/Kpler: 실제 엔드포인트 스펙 미검증. 벤더 계약 시 실제 문서로 교체 필요.
GENSCAPE_API_KEY = os.environ.get("GENSCAPE_API_KEY")  # 유료
KPLER_API_KEY = os.environ.get("KPLER_API_KEY")  # 유료


class EIAFetchError(RuntimeError):
    pass


def fetch_cushing_stocks(api_key: Optional[str] = None, weeks: int = 260) -> pd.DataFrame:
    """
    실제 EIA 주간 Cushing 원유 재고(SPR 제외)를 가져온다.
    weeks: 최근 몇 주치를 가져올지 (기본 260주 ≈ 5년)

    반환: date, stock_mbbl 컬럼을 가진 DataFrame (최신순이 아니라 날짜 오름차순).
    """
    key = api_key or EIA_API_KEY
    if not key:
        raise EIAFetchError(
            "EIA API 키가 없습니다. https://www.eia.gov/opendata/register.php 에서 "
            "무료로 발급받아 EIA_API_KEY 환경변수로 설정하세요. "
            "(v1과 달리 v2 API는 무료 티어도 키가 필요합니다.)"
        )

    url = f"{EIA_BASE_URL}/{EIA_SERIES_ID}"
    # length를 명시적으로 지정 — v2 API의 기본 페이지 크기에 암묵적으로 의존하지 않는다.
    # weeks가 큰 값이어도 대응하도록 여유를 둔다(최대 5000, EIA API 상한).
    params = {"api_key": key, "length": min(max(weeks * 2, 100), 5000), "sort[0][column]": "period",
              "sort[0][direction]": "desc"}

    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise EIAFetchError(f"EIA API 요청 실패: {e}") from e

    payload = resp.json()
    rows = payload.get("response", {}).get("data", [])
    if not rows:
        raise EIAFetchError(
            f"EIA 응답에 데이터가 없습니다. series id({EIA_SERIES_ID})가 "
            f"변경되었을 수 있습니다. 원문 응답: {payload}"
        )

    df = pd.DataFrame(rows)
    # v2 응답 필드명은 시리즈마다 다를 수 있어 방어적으로 처리
    date_col = "period" if "period" in df.columns else df.columns[0]
    value_col = "value" if "value" in df.columns else df.columns[-1]

    df = df[[date_col, value_col]].rename(columns={date_col: "date", value_col: "stock_mbbl"})
    df["date"] = pd.to_datetime(df["date"])
    df["stock_mbbl"] = pd.to_numeric(df["stock_mbbl"], errors="coerce")
    df = df.dropna(subset=["stock_mbbl"]).sort_values("date").reset_index(drop=True)

    if weeks:
        df = df.tail(weeks).reset_index(drop=True)

    return df


def fetch_genscape_pipeline_flow(api_key: Optional[str]) -> pd.DataFrame:
    """
    스텁. Genscape(Wood Mackenzie)는 파이프라인별 유량을 실제로 판매하지만,
    엔드포인트/인증 방식은 계약 고객에게만 공개된다. 여기서는 실행하지 않고
    명시적으로 미구현 상태를 반환한다 — 추측한 엔드포인트로 호출을 시도해
    거짓 성공/실패를 만들지 않기 위함이다.
    """
    if not api_key:
        return pd.DataFrame()
    raise NotImplementedError(
        "Genscape 실제 API 스펙이 이 코드베이스에 검증되어 있지 않습니다. "
        "벤더 제공 문서의 정확한 엔드포인트/인증/필드명으로 이 함수를 채워야 합니다."
    )


def fetch_kpler_pipeline_flow(api_key: Optional[str]) -> pd.DataFrame:
    """스텁. Genscape와 동일한 이유로 미구현."""
    if not api_key:
        return pd.DataFrame()
    raise NotImplementedError(
        "Kpler 실제 API 스펙이 이 코드베이스에 검증되어 있지 않습니다. "
        "벤더 제공 문서의 정확한 엔드포인트/인증/필드명으로 이 함수를 채워야 합니다."
    )


class CushingStressAnalyzer:
    """
    재고 수준으로부터 '타이트함(tightness)' 지표를 계산한다.
    카드 010/Cushing 논의에서 정립한 대로, 이건 방향성(가격이 오른다/내린다)이
    아니라 양방향 꼬리위험(tank-tops 근접 OR tank-bottoms 근접) 프레임을 따른다.
    """

    @staticmethod
    def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["wow_change_mbbl"] = df["stock_mbbl"].diff()
        df["wow_change_pct"] = df["stock_mbbl"].pct_change() * 100
        df["pct_of_working_capacity"] = (
            df["stock_mbbl"] / CUSHING_WORKING_CAPACITY_MBBL * 100
        )
        # 4주 변동성(표준편차) — 급변 여부를 보는 보조 지표
        df["stock_4w_volatility"] = df["wow_change_mbbl"].rolling(4).std()

        # 양방향 타이트함: 0(중립, 예: 50% 충전)에서 멀어질수록 tail risk 상승.
        # 이건 검증된 가격 예측 모델이 아니라 카드 010에서 정립한 프레임을
        # 그대로 재고 데이터에 적용한 것 — 방향성 알파로 쓰지 않는다.
        midpoint = 50.0
        df["distance_from_midpoint"] = (df["pct_of_working_capacity"] - midpoint).abs()

        return df

    @staticmethod
    def summarize_latest(df: pd.DataFrame) -> Dict:
        if df.empty:
            return {"error": "no data"}
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else None

        near_bottom = latest["stock_mbbl"] <= CUSHING_MIN_OPERATIONAL_MBBL * 1.15
        near_top = latest["pct_of_working_capacity"] >= 90

        if near_bottom:
            regime = "⚠️ tank-bottom 근접 — 물리적 인도 제약 리스크 구간"
        elif near_top:
            regime = "⚠️ tank-top 근접 — 저장 공간 부족 리스크 구간"
        else:
            regime = "중립 구간"

        return {
            "date": latest["date"].strftime("%Y-%m-%d"),
            "stock_mbbl": float(latest["stock_mbbl"]),
            "wow_change_mbbl": float(latest["wow_change_mbbl"]) if prev is not None else None,
            "wow_change_pct": float(latest["wow_change_pct"]) if prev is not None else None,
            "pct_of_working_capacity": float(latest["pct_of_working_capacity"]),
            "stock_4w_volatility": float(latest["stock_4w_volatility"]) if not pd.isna(latest["stock_4w_volatility"]) else None,
            "regime": regime,
        }


def print_status(summary: Dict) -> None:
    print("\n" + "=" * 72)
    print(f"🛢️  CUSHING STORAGE MONITOR — as of {summary.get('date', 'N/A')}")
    print("=" * 72)
    print(f"재고 (Cushing, SPR 제외): {summary.get('stock_mbbl', 0):,.0f} 천 배럴")
    wow = summary.get("wow_change_mbbl")
    wow_pct = summary.get("wow_change_pct")
    if wow is not None:
        arrow = "▲" if wow > 0 else ("▼" if wow < 0 else "→")
        print(f"전주 대비: {arrow} {wow:+,.0f} 천 배럴 ({wow_pct:+.2f}%)")
    print(f"참고 작업저장용량 대비: {summary.get('pct_of_working_capacity', 0):.1f}% "
          f"(참고치 {CUSHING_WORKING_CAPACITY_MBBL:,} 천 배럴 기준 — EIA 반기 공식치로 갱신 필요)")
    vol = summary.get("stock_4w_volatility")
    if vol is not None:
        print(f"최근 4주 주간변동 표준편차: {vol:,.0f} 천 배럴")
    print(f"구간 판정: {summary.get('regime', 'N/A')}")
    print("=" * 72)
    print("주의: 이 수치는 재고 '수준'이지 파이프라인 '활동량'이 아닙니다.")
    print("      방향성 가격 신호로 검증되지 않았습니다 (091/010 문서의 검증 규율 참고).")


def plot_history(df: pd.DataFrame, out_path: str) -> None:
    if not HAVE_MPL:
        print("matplotlib이 설치되어 있지 않아 차트를 생성할 수 없습니다.")
        return

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 7), sharex=True)

    # matplotlib 기본 폰트(DejaVu Sans)는 한글 글리프가 없어 라벨은 영문으로 표기
    ax1.plot(df["date"], df["stock_mbbl"], color="#1f6feb", linewidth=1.5)
    ax1.axhline(CUSHING_WORKING_CAPACITY_MBBL, color="red", linestyle="--", linewidth=0.8,
                label="Reference working capacity")
    ax1.axhline(CUSHING_MIN_OPERATIONAL_MBBL, color="orange", linestyle="--", linewidth=0.8,
                label="Reference operational floor")
    ax1.set_ylabel("Thousand barrels")
    ax1.set_title("Cushing, OK Weekly Crude Stocks (excl. SPR)")
    ax1.legend(loc="upper right", fontsize=8)
    ax1.grid(alpha=0.3)

    ax2.bar(df["date"], df["wow_change_mbbl"], color="#57606a", width=5)
    ax2.axhline(0, color="black", linewidth=0.8)
    ax2.set_ylabel("Week-over-week change (kbbl)")
    ax2.grid(alpha=0.3)

    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    print(f"차트 저장됨: {out_path}")


def run_once(weeks: int) -> Optional[pd.DataFrame]:
    try:
        df = fetch_cushing_stocks(weeks=weeks)
    except EIAFetchError as e:
        print(f"⚠️  오류: {e}", file=sys.stderr)
        return None
    except Exception as e:  # noqa: BLE001 — 예상 못한 오류도 크래시 대신 안전하게 보고
        print(f"⚠️  예상치 못한 오류: {e}", file=sys.stderr)
        return None

    df = CushingStressAnalyzer.add_derived_columns(df)
    summary = CushingStressAnalyzer.summarize_latest(df)
    print_status(summary)
    return df


def watch(poll_seconds: int, weeks: int) -> None:
    """
    이 데이터는 주간 발표(수요일 10:30 AM ET)이므로 5분 단위로 폴링해도
    대부분의 호출은 '변화 없음'입니다. 그럼에도 폴링한다면 최소한 마지막으로
    확인한 날짜와 다를 때만 알림을 출력합니다 — 원안처럼 매 5분마다
    동일한 값을 새 정보인 것처럼 반복 출력하지 않습니다.
    """
    print("🚀 Cushing Storage Monitor 감시를 시작합니다 (신규 EIA 발표 시에만 알림).")
    print(f"🔄 확인 간격: {poll_seconds // 60}분 (실제 데이터는 주 1회만 갱신됩니다)")
    print("Ctrl+C로 중지하세요.\n")

    last_seen_date = None
    try:
        while True:
            df = run_once(weeks=weeks)
            if df is not None and not df.empty:
                latest_date = df.iloc[-1]["date"]
                if last_seen_date is not None and latest_date == last_seen_date:
                    print(f"[{datetime.now(timezone.utc).isoformat(timespec='seconds')}] "
                          f"신규 발표 없음 (최신: {latest_date.date()})")
                last_seen_date = latest_date
            time.sleep(poll_seconds)
    except KeyboardInterrupt:
        print("\n🛑 감시를 종료합니다.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Cushing Storage & Stress Monitor (실제 EIA 데이터 기반)")
    parser.add_argument("--once", action="store_true", help="1회 조회 후 종료")
    parser.add_argument("--watch", action="store_true", help="신규 EIA 발표 감시 (기본 폴링 간격 1시간)")
    parser.add_argument("--interval", type=int, default=3600, help="watch 모드 폴링 간격(초), 기본 3600")
    parser.add_argument("--weeks", type=int, default=260, help="가져올 주 수, 기본 260주(약 5년)")
    parser.add_argument("--plot", type=str, default=None, help="히스토리 차트를 저장할 파일 경로 (예: out.png)")
    args = parser.parse_args()

    if not (args.once or args.watch or args.plot):
        args.once = True  # 아무 옵션도 없으면 기본 1회 조회

    if args.watch:
        watch(poll_seconds=args.interval, weeks=args.weeks)
        return

    df = run_once(weeks=args.weeks)
    if df is None:
        sys.exit(1)  # cron/스케줄러가 실패를 감지할 수 있도록 nonzero exit

    if args.plot:
        plot_history(df, args.plot)


if __name__ == "__main__":
    main()
