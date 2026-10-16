import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

/** 带箭头的胶囊链接 */
export function ArrowLink({
  href,
  children,
  className,
  tone = "outline",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "outline" | "solid";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-1.5 text-sm font-semibold transition-all duration-500",
        tone === "solid"
          ? "bg-[var(--t-ink)] text-[var(--t-bg)] hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]"
          : "ring-1 ring-current/20 hover:ring-current/60",
        className,
      )}
    >
      {children}
      <span
        className={clsx(
          "grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 group-hover:-rotate-45",
          tone === "solid" ? "bg-[var(--t-accent)] text-white" : "bg-[var(--t-ink)] text-[var(--t-bg)]",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
