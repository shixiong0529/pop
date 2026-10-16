"use client";

import { LayoutGroup, motion } from "motion/react";
import clsx from "clsx";
import { useId } from "react";

export type SegOption<T extends string> = { value: T; label: string; count?: number };

/** 胶囊式单选组（带滑动高亮） */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div role="radiogroup" aria-label={label} className={clsx("no-scrollbar flex gap-1 overflow-x-auto", className)}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={clsx(
                "relative shrink-0 rounded-full font-medium transition-colors duration-300",
                size === "sm" ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]",
                active ? "text-[var(--t-bg)]" : "text-[var(--t-ink)] opacity-70 hover:opacity-100",
              )}
            >
              {active && (
                <motion.span
                  layoutId="seg-pill"
                  className="absolute inset-0 rounded-full bg-[var(--t-ink)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                {o.label}
                {o.count !== undefined && <span className="ml-1.5 tabular-nums opacity-70">{o.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
