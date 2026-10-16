import clsx from "clsx";

/** 本站文字标识（非官方，不使用泡泡玛特商标） */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="currentColor" />
        <circle cx="12.5" cy="12.5" r="5.2" fill="var(--t-bg, #f6f4f0)" />
        <circle cx="21.5" cy="20.5" r="2.6" fill="var(--t-accent, #ff5b3a)" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-extrabold tracking-[-0.02em]">POP ATLAS</span>
          <span className="mt-1 text-[10px] font-medium tracking-[0.32em] opacity-70">潮玩图鉴</span>
        </span>
      )}
    </span>
  );
}
