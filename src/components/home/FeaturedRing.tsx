"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type RingItem = {
  slug: string;
  name: string;
  caption: string;
  image: { src: string; blur: string; color: string };
};

/**
 * 3D 环形展台：可拖拽旋转，空闲时缓慢自转；正对观众的展品高亮。
 */
export function FeaturedRing({ items }: { items: RingItem[] }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const step = 360 / n;
  const rotation = useMotionValue(0);
  const smooth = useSpring(rotation, { stiffness: 70, damping: 20, mass: 0.8 });
  const [radius, setRadius] = useState(560);
  const [card, setCard] = useState(240);
  const [front, setFront] = useState(0);
  const drag = useRef<{ x: number; r: number; moved: boolean } | null>(null);
  const idle = useRef(true);

  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth;
      const c = w < 640 ? 170 : w < 1024 ? 210 : 250;
      setCard(c);
      setRadius(Math.round((c * 1.18 * n) / (2 * Math.PI)));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [n]);

  useAnimationFrame((_, delta) => {
    if (!reduce && idle.current && !drag.current) rotation.set(rotation.get() - delta * 0.006);
  });

  useEffect(
    () =>
      smooth.on("change", (v) => {
        const i = ((Math.round(-v / step) % n) + n) % n;
        setFront(i);
      }),
    [smooth, step, n],
  );

  const ringRotate = useTransform(smooth, (v) => `translateZ(${-radius}px) rotateY(${v}deg)`);

  function onDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, r: rotation.get(), moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    rotation.set(drag.current.r + dx * 0.25);
  }
  function onUp() {
    if (!drag.current) return;
    // 吸附到最近的一格
    rotation.set(Math.round(rotation.get() / step) * step);
    setTimeout(() => (drag.current = null), 0);
  }

  const current = items[front];

  return (
    <div className="relative">
      <div
        className="relative mx-auto h-[min(68vh,560px)] cursor-grab touch-pan-y select-none active:cursor-grabbing [perspective:1600px]"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => (idle.current = false)}
        onPointerLeave={() => {
          idle.current = true;
          onUp();
        }}
        aria-roledescription="3D 展台"
      >
        <motion.div
          className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
          style={{ transform: ringRotate, width: 0, height: 0 }}
        >
          {items.map((it, i) => (
            <div
              key={it.slug}
              className="absolute [backface-visibility:hidden]"
              style={{
                width: card,
                height: card * 1.3,
                left: -card / 2,
                top: -(card * 1.3) / 2,
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              }}
            >
              <Link
                href={`/products/${it.slug}`}
                draggable={false}
                onClick={(e) => drag.current?.moved && e.preventDefault()}
                className="group block h-full w-full overflow-hidden rounded-[1.6rem] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] ring-1 ring-black/5 transition-[filter,opacity] duration-700"
                style={{
                  background: it.image.color,
                  opacity: i === front ? 1 : 0.82,
                  filter: i === front ? "none" : "saturate(0.85)",
                }}
                tabIndex={i === front ? 0 : -1}
              >
                <div className="relative h-[78%] w-full overflow-hidden">
                  <Image
                    src={it.image.src}
                    alt=""
                    fill
                    sizes="260px"
                    placeholder="blur"
                    blurDataURL={it.image.blur}
                    draggable={false}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex h-[22%] flex-col justify-center bg-white/90 px-4 text-ink backdrop-blur">
                  <p className="truncate text-[14px] font-semibold">{it.name}</p>
                  <p className="truncate text-[11.5px] text-ink-mute">{it.caption}</p>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
        {/* 地面反光 */}
        <div className="pointer-events-none absolute inset-x-[15%] bottom-2 h-16 rounded-[50%] bg-black/15 blur-2xl" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 text-center" aria-live="polite">
        <p className="text-sm text-current/60">
          <span className="font-semibold text-current">{current?.name}</span> · {current?.caption}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => rotation.set(Math.round(rotation.get() / step) * step + step)}
            className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-current/20 transition hover:bg-current/5"
            aria-label="上一个"
          >
            ←
          </button>
          <span className="w-20 text-center text-xs tabular-nums opacity-70">
            {String(front + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button
            onClick={() => rotation.set(Math.round(rotation.get() / step) * step - step)}
            className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-current/20 transition hover:bg-current/5"
            aria-label="下一个"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
