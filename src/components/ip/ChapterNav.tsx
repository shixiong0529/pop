"use client";

import { motion, useScroll, useSpring } from "motion/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

export type Chapter = { id: string; no: string; title: string };

/** 展厅章节导航：桌面端固定在左侧，移动端为顶部阅读进度条 */
export function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[var(--t-accent)] 2xl:hidden"
        style={{ scaleX: progress }}
      />
      <nav
        aria-label="展厅章节"
        className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block"
      >
        <ol className="space-y-1">
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => jump(c.id)}
                className={clsx(
                  "group flex items-center gap-3 py-1.5 text-left text-[12px] font-semibold transition-opacity",
                  active === c.id ? "opacity-100" : "opacity-40 hover:opacity-80",
                )}
                aria-current={active === c.id ? "true" : undefined}
              >
                <span
                  className={clsx(
                    "h-px bg-current transition-all duration-500",
                    active === c.id ? "w-8" : "w-4 group-hover:w-6",
                  )}
                />
                <span className="tabular-nums">{c.no}</span>
                <span>{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
