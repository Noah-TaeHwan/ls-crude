import { Link, NavLink, useNavigation } from "react-router";

import { cn } from "~/lib/cn";

/** 공개 화면 머리글 속성. */
interface DeskHeaderProps {
  source: string;
  ticker: string;
  contextLabel?: string;
  freshness?: "fresh" | "stale" | "unavailable";
}

/**
 * 모든 공개 화면에서 쓰는 상단 내비게이션.
 * @param props 데이터 출처와 종목, 신선도.
 * @returns 제품 머리글.
 */
export function DeskHeader({ source, ticker, freshness, contextLabel }: DeskHeaderProps) {
  const navigation = useNavigation();
  const pending = navigation.state !== "idle";
  const freshnessLabel = freshness
    ? freshness === "fresh"
      ? "정상"
      : freshness === "stale"
        ? "최신성 확인"
        : "데이터 없음"
    : null;

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 건너뛰기
      </a>
      <header
        data-source={source}
        className="desk-header"
      >
        <div className="desk-shell desk-header-inner">
          <Link to="/" className="desk-brand" aria-label="LS CRUDE 연구 데스크">
            <span className="desk-brand-mark" aria-hidden="true">LS</span>
            <span>LS CRUDE<span className="desk-brand-caption">ALTERNATIVE DATA RESEARCH</span></span>
          </Link>
          <nav aria-label="주요 화면" className="desk-nav">
            <DeskNavLink to="/" end>
              연구 데스크
            </DeskNavLink>
            <Link className="desk-nav-link" to="/#observations">관측</Link>
            <DeskNavLink to="/research">후보 장부</DeskNavLink>
            <a className="desk-nav-link" href="/research#method">
              검증 방법
            </a>
            <a className="desk-nav-link" href="/research#team">
              팀
            </a>
          </nav>
          <p className="desk-source" title={`${source} · ${contextLabel ?? `${ticker} · 일봉`}`}>
            <span>{contextLabel ?? `${ticker} · 일봉 관측`}</span>
            {freshness ? (
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span aria-hidden="true">·</span>
                <span>{freshnessLabel}</span>
                <span
                  className={cn(
                    "inline-block size-2 rounded-full",
                    freshness === "fresh" ? "bg-watching" : freshness === "stale" ? "bg-primary" : "bg-muted-foreground",
                  )}
                  aria-hidden="true"
                />
              </span>
            ) : null}
          </p>
        </div>
        <p role="status" aria-live="polite" className={pending ? "desk-loading" : "sr-only"}>
          {pending ? "연구 화면을 불러오는 중입니다." : ""}
        </p>
      </header>
    </>
  );
}

/**
 * 공동 연구자와 관측의 한계, 빌드 정보를 표시한다.
 * @returns 모든 공개 화면의 하단 영역.
 */
export function DeskFooter() {
  return (
    <footer className="desk-footer">
      <div className="desk-shell desk-footer-inner">
        <div>
          <p className="desk-footer-credit">오태환 · 손성찬 <span>East Camp AI Quant 4기</span></p>
          <p>관측과 가설을 기록합니다. 상관은 인과가 아니며 투자 권유가 아닙니다.</p>
        </div>
        <p className="desk-build">
          build {__LS_BUILD_SHA__} · {__LS_BUILD_BRANCH__}
          {__LS_BUILD_DIRTY__ ? " · dirty" : ""}
        </p>
      </div>
    </footer>
  );
}

/**
 * 현재 경로를 구분하는 상단 링크.
 * @param props 링크 목적지, 정확한 경로 비교 여부와 문구.
 * @returns React Router 내비게이션 링크.
 */
function DeskNavLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: string;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn("desk-nav-link", isActive && "text-primary")}
    >
      {children}
    </NavLink>
  );
}
