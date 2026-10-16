"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** 位移幅度（px），正值向下 */
  offset?: number;
  /** 同时轻微缩放 */
  scale?: [number, number];
};

/** 随滚动产生纵向位移的视差层 */
export function Parallax({ children, className, offset = 80, scale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-offset, offset]);
  const s = useTransform(scrollYProgress, [0, 1], reduce || !scale ? [1, 1] : scale);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, scale: s }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
