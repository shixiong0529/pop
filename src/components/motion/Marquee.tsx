import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

/** 纯 CSS 无限滚动条（内容复制一份实现无缝衔接） */
export function Marquee({
  children,
  speed = 40,
  reverse,
  className,
  pauseOnHover,
}: {
  children: ReactNode;
  /** 一个周期的秒数 */
  speed?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={clsx("group/marquee flex overflow-hidden mask-fade-x", className)}>
      <div
        className={clsx(
          "flex w-max shrink-0 animate-marquee items-center whitespace-nowrap motion-reduce:animate-none",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${speed}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
