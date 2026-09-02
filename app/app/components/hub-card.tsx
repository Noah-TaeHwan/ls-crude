import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "~/lib/cn";

export function HubCard({
  kicker,
  title,
  badge,
  dashed,
  interactive = false,
  disabled = false,
  className,
  children,
  ...props
}: {
  kicker: string;
  title: string;
  badge?: string;
  dashed?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "children" | "title">) {
  return (
    <section
      data-slot="hub-card"
      className={cn(
        "border bg-card/30 px-4 py-3",
        dashed ? "border-dashed border-heading/40" : "border-border",
        interactive &&
          "transition-[border-color,background-color,box-shadow] hover:border-heading/70 hover:bg-card/55 focus-within:border-heading focus-within:ring-[3px] focus-within:ring-ring/40",
        disabled && "cursor-not-allowed opacity-70",
        className,
      )}
      aria-disabled={disabled || undefined}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
          {kicker}
        </p>
        {badge ? (
          <span className="font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-3xl leading-none tabular-nums">{title}</p>
      <div className="mt-3 space-y-1.5">{children}</div>
    </section>
  );
}
