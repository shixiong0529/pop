"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

export type LightboxImage = { src: string; w: number; h: number; blur: string; color: string; alt: string };

/** 全屏看图：点击放大 / 拖动查看细节、左右切换、ESC 关闭 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const lenis = useLenis();
  const open = index !== null;
  const img = open ? images[index] : null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setZoom(false);
      onIndex((index + d + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, go, onClose, lenis]);

  return (
    <AnimatePresence>
      {img && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-[#0d0d0f]/95 text-white backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="查看大图"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="tabular-nums opacity-70">
              {index! + 1} / {images.length}
            </span>
            <span className="hidden truncate px-6 opacity-70 sm:block">{img.alt}</span>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="关闭">
              ✕
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={img.src}
                className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                drag={zoom ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
              >
                <div
                  className="relative h-full max-h-full w-full cursor-zoom-in overflow-hidden"
                  style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
                    setZoom((z) => !z);
                  }}
                  onPointerMove={(e) => {
                    if (!zoom || e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="100vw"
                    quality={90}
                    placeholder="blur"
                    blurDataURL={img.blur}
                    className="object-contain transition-transform duration-500 ease-[var(--ease-soft)]"
                    style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
                    draggable={false}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-lg hover:bg-white/20 sm:left-6"
                  aria-label="上一张"
                >
                  ←
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-lg hover:bg-white/20 sm:right-6"
                  aria-label="下一张"
                >
                  →
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 py-4">
              {images.map((im, i) => (
                <button
                  key={im.src}
                  onClick={() => (setZoom(false), onIndex(i))}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl transition ${i === index ? "ring-2 ring-white" : "opacity-65 hover:opacity-90"}`}
                  aria-label={`第 ${i + 1} 张`}
                >
                  <Image src={im.src} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="pb-4 text-center text-[11px] opacity-40">点击图片放大 · 左右滑动或方向键切换 · ESC 关闭</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
