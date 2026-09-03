import { Link, NavLink } from "react-router";

import { cn } from "~/lib/cn";

/** 공개 화면 머리글 속성. */
interface DeskHeaderProps {
  source: string;
  ticker: string;
  freshness?: "fresh" | "stale" | "unavailable";
}

/**
 * 모든 공개 화면에서 쓰는 상단 내비게이션.
 * @param props 데이터 출처와 종목, 신선도.
 * @returns 제품 머리글.
 */
export function DeskHeader({ source, ticker, freshness }: DeskHeaderProps) {
  const freshnessLabel = freshness
    ? freshness === "fresh"
      ? "정상"
      : freshness === "stale"
        ? "업데이트 지연"
        : "데이터 없음"
    : null;

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 건너뛰기
      </a>
      <header
        data-source={source}
        className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="text-xl font-semibold tracking-[0.08em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-2xl"
          >
            LS CRUDE
          </Link>
          <nav aria-label="주요 화면" className="order-3 flex w-full gap-6 sm:order-none sm:w-auto">
            <DeskNavLink to="/" end>
              WTI 관측
            </DeskNavLink>
            <DeskNavLink to="/research">연구 장부</DeskNavLink>
            <a className="desk-nav-link" href="/research#method">
              방법
            </a>
            <a className="desk-nav-link" href="/research#team">
              팀
            </a>
          </nav>
          <p className="ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground">
            {source} · {ticker} · 일봉
            {freshness ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{freshnessLabel}</span>
                <span
                  className={cn(
                    "inline-block size-2 rounded-full",
                    freshness === "fresh" ? "bg-watching" : freshness === "stale" ? "bg-primary" : "bg-muted-foreground",
                  )}
                  aria-hidden="true"
                />
              </>
            ) : null}
          </p>
        </div>
      </header>
    </>
  );
}

/** 빌드 정보와 투자 비권유 문구를 보여주는 하단 영역. */
export function DeskFooter() {
  return (
    <footer className="border-t border-border px-5 py-5 sm:px-8">
      <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-2 font-mono text-[11px] text-muted-foreground sm:flex-row">
        <p>상관은 인과가 아니며 투자 권유가 아닙니다.</p>
        <p>
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
