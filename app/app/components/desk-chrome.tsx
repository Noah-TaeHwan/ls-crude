import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cn } from "~/lib/cn";

export function DeskHeader({
  source,
  ticker,
  samplePreview = false,
}: {
  source: string;
  ticker: string;
  samplePreview?: boolean;
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
      {samplePreview ? (
        <>
          <span aria-hidden>·</span>
          <span className="text-heading">샘플</span>
        </>
      ) : null}
      <nav
        className="ml-auto flex items-center gap-2"
        aria-label="화면"
      >
        <DeskNavLink to="/" end>
          관측 데스크
        </DeskNavLink>
        <span aria-hidden className="text-muted-foreground/60">
          |
        </span>
        <DeskNavLink to={samplePreview ? "/backtest?sample=1" : "/backtest"}>
          백테스트
        </DeskNavLink>
      </nav>
    </header>
  );
}

function DeskNavLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: ReactNode;
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

export function DeskFooter() {
  return (
    <footer className="border-t border-border px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
      build {__LS_BUILD_SHA__}
      {" · "}
      {__LS_BUILD_BRANCH__}
      {__LS_BUILD_DIRTY__ ? " · dirty" : ""}
    </footer>
  );
}
