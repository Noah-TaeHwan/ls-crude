import { NavLink } from "react-router";

import { cn } from "~/lib/cn";

/** 관측 데스크 상단 줄. 백테스트 네비는 두지 않는다. */
export function DeskHeader({
  source,
  ticker,
}: {
  source: string;
  ticker: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-background/95 px-4 py-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
      <span className="text-heading">LS CRUDE</span>
      <span aria-hidden>·</span>
      <span>prototype</span>
      <span aria-hidden>·</span>
      <span>{source}</span>
      <span aria-hidden>·</span>
      <span>{ticker}</span>
      <span aria-hidden>·</span>
      <span>in 2015–2023 / out 2024~</span>
    </header>
  );
}

/** 빌드 표시와 로컬 안내 링크. */
export function DeskFooter() {
  return (
    <footer className="border-t border-border px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
      build {__LS_BUILD_SHA__}
      {" · "}
      {__LS_BUILD_BRANCH__}
      {__LS_BUILD_DIRTY__ ? " · dirty" : ""}
      {" · "}
      <nav aria-label="화면" className="inline">
        <DeskNavLink to="/" end>
          관측 데스크
        </DeskNavLink>
        {" · "}
        <DeskNavLink to="/backtest">분석 준비·백테스트 인계</DeskNavLink>
      </nav>
    </footer>
  );
}

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
      className={({ isActive }) =>
        cn(
          "uppercase tracking-[0.12em]",
          isActive ? "text-heading" : "hover:text-heading",
        )
      }
    >
      {children}
    </NavLink>
  );
}
