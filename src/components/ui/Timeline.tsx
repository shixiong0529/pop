"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import clsx from "clsx";
import { useRef } from "react";

export type TimelineEntry = {
  date: string;
  title: string;
  desc?: string;
  href?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  /** 来自图鉴数据（系列发售）还是故事节点 */
  kind?: "story" | "release";
};

/** 随滚动填充进度线的竖向时间轴 */
export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className={clsx("relative", className)}>
      <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-current/15 md:left-[calc(9rem+7px)]" />
      <motion.span
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-[var(--t-accent)] md:left-[calc(9rem+7px)]"
        style={{ scaleY }}
      />
      {entries.map((e, i) => (
        <motion.li
          key={`${e.date}-${i}`}
          className="relative grid gap-1 pb-10 pl-9 last:pb-0 md:grid-cols-[9rem_1fr] md:gap-0 md:pl-0"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-sm font-bold tabular-nums tracking-tight opacity-70 md:pr-8 md:pt-0.5 md:text-right md:text-base">
            {e.date}
          </span>
          <span
            aria-hidden
            className={clsx(
              "absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 md:left-[9rem]",
              e.kind === "release" ? "border-current/40 bg-[var(--t-bg)]" : "border-[var(--t-accent)] bg-[var(--t-accent)]",
            )}
          />
          <div className="md:pl-10">
            <h3 className="text-[17px] font-semibold tracking-tight">
              {e.href ? (
                <Link href={e.href} className="underline-offset-4 hover:underline">
                  {e.title}
                </Link>
              ) : (
                e.title
              )}
            </h3>
            {e.desc && <p className="mt-1.5 max-w-xl text-[14.5px] leading-7 opacity-65">{e.desc}</p>}
            {e.sourceUrl && (
              <a
                href={e.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block text-[11.5px] opacity-60 underline-offset-2 hover:underline hover:opacity-80"
              >
                来源：{e.sourceTitle}
              </a>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
