"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";

/**
 * 沉浸式主图 + 缩略图切换 + 全屏灯箱。
 * `hero` 为服务端渲染的首图（用于共享元素过渡），切换到其他图片时在其上叠加显示。
 */
export function MediaViewer({
  images,
  hero,
  className,
  aspect = "aspect-square",
}: {
  images: LightboxImage[];
  hero: ReactNode;
  className?: string;
  aspect?: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const current = images[active];

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(active)}
        className={clsx("group relative block w-full cursor-zoom-in overflow-hidden rounded-[2.2rem]", aspect)}
        style={{ backgroundColor: images[0]?.color }}
        aria-label="查看大图"
      >
        {hero}
        <AnimatePresence>
          {active > 0 && (
            <motion.div
              key={current.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ backgroundColor: current.color }}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="(min-width:1024px) 55vw, 100vw"
                placeholder="blur"
                blurDataURL={current.blur}
                quality={90}
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[11.5px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          放大查看
        </span>
      </button>

      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              onClick={() => setActive(i)}
              className={clsx(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl transition sm:h-20 sm:w-20",
                i === active ? "ring-2 ring-[var(--t-ink)] ring-offset-2 ring-offset-[var(--t-bg)]" : "opacity-70 hover:opacity-100",
              )}
              style={{ backgroundColor: im.color }}
              aria-label={`查看第 ${i + 1} 张图`}
              aria-pressed={i === active}
            >
              <Image src={im.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={(i) => (setOpen(i), setActive(i))} />
    </div>
  );
}
