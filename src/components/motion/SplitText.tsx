"use client";

import { motion, useReducedMotion } from "motion/react";
import clsx from "clsx";

type Props = {
  text: string;
  className?: string;
  /** 逐字（中文）或逐词（英文） */
  by?: "char" | "word";
  delay?: number;
  stagger?: number;
  /** 首次渲染即播放（首屏标题），否则进入视口时播放 */
  immediate?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/** 标题逐字遮罩上升动画 */
export function SplitText({ text, className, by = "char", delay = 0, stagger = 0.035, immediate, as = "span" }: Props) {
  const reduce = useReducedMotion();
  const Tag = as;
  const parts = by === "word" ? text.split(/(\s+)/) : Array.from(text);
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.6 } };

  return (
    <Tag className={clsx("inline", className)}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial={reduce ? "show" : "hidden"}
        {...trigger}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {parts.map((p, i) =>
          /^\s+$/.test(p) ? (
            <span key={i}>{p}</span>
          ) : (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block will-change-transform"
                variants={{
                  hidden: { y: "105%", rotate: 4 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                {p}
              </motion.span>
            </span>
          ),
        )}
      </motion.span>
    </Tag>
  );
}
