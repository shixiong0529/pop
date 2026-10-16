"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 纵向滚动驱动横向移动的画廊（桌面端），移动端退化为原生横向滑动。
 */
export function HorizontalScroll({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled || !track.current) return;
    const el = track.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!enabled) {
    return (
      <div ref={wrap} className="relative py-4">
        <div className="container-page">{header}</div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4 pt-10 [&>*]:snap-start">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrap} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="container-page">{header}</div>
        <motion.div
          ref={track}
          style={{ x }}
          className="mt-12 flex w-max gap-6 pl-[max(calc((100vw-1440px)/2+3.5rem),3.5rem)] pr-[10vw]"
        >
          {children}
        </motion.div>
        <div className="container-page mt-10">
          <div className="h-[2px] w-full overflow-hidden rounded bg-current/10">
            <motion.div className="h-full bg-current" style={{ width: progress }} />
          </div>
        </div>
      </div>
    </div>
  );
}
