"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageAsset, IPTheme } from "@/lib/types";
import { Magnetic } from "@/components/motion/Magnetic";

export type HeroSlide = {
  slug: string;
  name: string;
  epithet: string;
  tagline: string;
  artist: string;
  theme: IPTheme;
  cover: ImageAsset;
  side: ImageAsset[];
  stats: { series: number; products: number };
};

const DURATION = 7000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroShowcase({ slides, total }: { slides: HeroSlide[]; total: { ips: number; series: number; products: number } }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const slide = slides[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(next, DURATION);
    return () => clearTimeout(t);
  }, [index, paused, reduce, next]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // 指针视差
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  // 滚动离场
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const t = slide.theme;

  return (
    <motion.section
      ref={ref}
      aria-roledescription="carousel"
      aria-label="IP 主视觉"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[var(--nav-h)]"
      animate={{ backgroundColor: t.bg, color: t.ink }}
      transition={{ duration: 1.1, ease: EASE }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* 背景光晕 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-[15%] -top-[20%] -z-10 h-[70vmax] w-[70vmax] rounded-full blur-[110px] animate-drift"
        animate={{ backgroundColor: t.glow[0] }}
        transition={{ duration: 1.4 }}
        style={{ opacity: 0.75 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-[25%] -right-[10%] -z-10 h-[60vmax] w-[60vmax] rounded-full blur-[120px] animate-drift [animation-delay:-6s]"
        animate={{ backgroundColor: t.glow[1] }}
        transition={{ duration: 1.4 }}
        style={{ opacity: 0.7 }}
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 -z-10" />

      <div className="container-page grid flex-1 grid-cols-1 items-center gap-10 pb-28 pt-6 lg:grid-cols-12 lg:gap-6 lg:pb-32">
        {/* 文案 */}
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 lg:col-span-6">
          <div className="eyebrow flex items-center gap-3 opacity-70">
            <span className="inline-block h-px w-8 bg-current" />
            <span>
              Exhibition {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <h1 className="mt-6 font-display text-[clamp(3.6rem,11vw,10.5rem)] font-black leading-[0.82] tracking-[-0.055em]">
                <span className="sr-only">{slide.name}：</span>
                <span aria-hidden className="block overflow-hidden pb-[0.06em]">
                  {slide.name.split(" ").map((w, wi) => (
                    <span key={wi} className="inline-block overflow-hidden pr-[0.12em] align-bottom">
                      <motion.span
                        className="inline-block"
                        initial={{ y: "102%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 1, ease: EASE, delay: 0.05 + wi * 0.08 }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  ))}
                </span>
              </h1>
              <motion.p
                className="mt-6 font-zh-serif text-[clamp(1.25rem,2.1vw,1.75rem)] font-medium leading-snug"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
              >
                {slide.epithet}
              </motion.p>
              <motion.p
                className="mt-3 max-w-md text-[15px] leading-7 opacity-70"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
              >
                {slide.tagline}
              </motion.p>
              <motion.p
                className="mt-5 text-xs font-medium opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
              >
                {slide.artist} · {slide.stats.series} 个系列 · {slide.stats.products} 款潮玩
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href={`/ips/${slide.slug}`}
                transitionTypes={["nav-forward"]}
                className="group inline-flex h-14 items-center gap-3 rounded-full pl-7 pr-2 text-[15px] font-semibold shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] transition-colors duration-700"
                style={{ background: t.ink, color: t.bg }}
              >
                进入 {slide.name} 展厅
                <span
                  className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-[-45deg]"
                  style={{ background: t.accent, color: "#fff" }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Magnetic>
            <Link
              href="/ips"
              className="inline-flex h-14 items-center rounded-full px-6 text-[15px] font-semibold ring-1 ring-current/20 transition hover:ring-current/50"
            >
              浏览全部 {total.ips} 个 IP
            </Link>
          </div>
        </motion.div>

        {/* 展台 */}
        <motion.div style={{ y: stageY, scale: stageScale }} className="relative lg:col-span-6">
          <Stage slide={slide} sx={sx} sy={sy} first={index === 0} />
        </motion.div>
      </div>

      {/* 轮播指示 */}
      <div
        className="absolute inset-x-0 bottom-0 z-10"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className="container-page flex items-end justify-between gap-6 pb-7">
          <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="切换展厅">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={clsx(
                  "group relative min-w-[92px] shrink-0 px-1 pb-3 pt-2 text-left text-[12px] font-semibold tracking-wide transition-opacity sm:min-w-[120px]",
                  i === index ? "opacity-100" : "opacity-60 hover:opacity-80",
                )}
              >
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="ml-2">{s.name}</span>
                <span className="absolute inset-x-1 bottom-0 h-[2px] overflow-hidden rounded bg-current/15">
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="block h-full origin-left bg-current"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: paused || reduce ? 0.35 : 1 }}
                      transition={{ duration: paused || reduce ? 0.3 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-3 text-[11px] font-semibold tracking-[0.25em] opacity-70 md:flex">
            <span>SCROLL</span>
            <span className="relative block h-10 w-px overflow-hidden bg-current/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-current"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Stage({ slide, sx, sy, first }: { slide: HeroSlide; sx: MotionValue<number>; sy: MotionValue<number>; first: boolean }) {
  const mainX = useTransform(sx, (v) => v * -14);
  const mainY = useTransform(sy, (v) => v * -10);
  const rotY = useTransform(sx, (v) => v * 6);
  const rotX = useTransform(sy, (v) => v * -5);
  const s1x = useTransform(sx, (v) => v * 34);
  const s1y = useTransform(sy, (v) => v * 26);
  const s2x = useTransform(sx, (v) => v * -40);
  const s2y = useTransform(sy, (v) => v * -30);

  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[640px] [perspective:1400px] lg:aspect-[11/12]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={slide.slug} className="absolute inset-0">
          {/* 主图 */}
          <motion.div
            className="absolute left-[12%] top-[6%] h-[78%] w-[66%] overflow-hidden rounded-[2.4rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.55)]"
            style={{ x: mainX, y: mainY, rotateY: rotY, rotateX: rotX, backgroundColor: slide.cover.color }}
            initial={{ opacity: 0, scale: 1.08, rotateZ: 3, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, rotateZ: -2, filter: "blur(8px)", transition: { duration: 0.5 } }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <Image
              src={slide.cover.src}
              alt={`${slide.name} 代表作品`}
              fill
              sizes="(min-width:1024px) 34vw, 70vw"
              placeholder="blur"
              blurDataURL={slide.cover.blur}
              preload={first}
              fetchPriority={first ? "high" : undefined}
              className="object-cover"
              quality={80}
            />
          </motion.div>

          {/* 副图 1 */}
          {slide.side[0] && (
            <motion.div
              className="absolute right-[2%] top-[0%] h-[34%] w-[30%] overflow-hidden rounded-[1.6rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] ring-4 ring-white/70"
              style={{ x: s1x, y: s1y, backgroundColor: slide.side[0].color }}
              initial={{ opacity: 0, y: 60, rotate: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: 6, scale: 1 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.4 } }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.18 }}
            >
              <Image src={slide.side[0].src} alt="" fill sizes="220px" placeholder="blur" blurDataURL={slide.side[0].blur} className="object-cover" />
            </motion.div>
          )}

          {/* 副图 2 */}
          {slide.side[1] && (
            <motion.div
              className="absolute bottom-[2%] left-0 h-[30%] w-[27%] overflow-hidden rounded-[1.4rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] ring-4 ring-white/70"
              style={{ x: s2x, y: s2y, backgroundColor: slide.side[1].color }}
              initial={{ opacity: 0, y: 60, rotate: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: -7, scale: 1 }}
              exit={{ opacity: 0, y: 30, transition: { duration: 0.4 } }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.28 }}
            >
              <Image src={slide.side[1].src} alt="" fill sizes="200px" placeholder="blur" blurDataURL={slide.side[1].blur} className="object-cover" />
            </motion.div>
          )}

          {/* 标签 */}
          <motion.div
            className="absolute bottom-[9%] right-[6%] rounded-2xl px-4 py-3 text-[12px] font-semibold shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            style={{ background: `${slide.theme.surface}d9`, color: slide.theme.ink, x: s1x }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
          >
            <span className="block text-[10px] tracking-[0.22em] opacity-70">NOW SHOWING</span>
            <span className="mt-1 block text-[15px] tracking-tight">{slide.name}</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
