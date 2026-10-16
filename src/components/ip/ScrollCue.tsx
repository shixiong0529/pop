"use client";

import { motion, useScroll, useTransform } from "motion/react";

export function ScrollCue({ label = "向下滚动，开始参观" }: { label?: string }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[11px] font-semibold tracking-[0.3em] opacity-70 md:flex"
    >
      <span>{label}</span>
      <span className="relative block h-10 w-px overflow-hidden bg-current/20">
        <motion.span
          className="absolute inset-x-0 top-0 h-1/2 bg-current"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}
