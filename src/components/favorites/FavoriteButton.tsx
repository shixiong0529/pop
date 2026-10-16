"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useFavorites, isFavorite, type FavoriteItem } from "@/lib/favorites";
import { useHydrated } from "@/lib/use-hydrated";

type Props = {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
  /** 圆形图标按钮 / 带文字的胶囊按钮 */
  variant?: "icon" | "pill";
  tone?: "light" | "dark";
};

const PARTICLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

export function FavoriteButton({ item, className, variant = "icon", tone = "light" }: Props) {
  const hydrated = useHydrated();
  const items = useFavorites((s) => s.items);
  const toggle = useFavorites((s) => s.toggle);
  const active = hydrated && isFavorite(items, item.kind, item.key);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `取消收藏 ${item.title}` : `收藏 ${item.title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={clsx(
        "group/fav relative inline-flex items-center justify-center gap-2 rounded-full transition-[background,color,transform] duration-300 active:scale-90",
        variant === "icon" ? "h-11 w-11" : "h-12 px-5 text-sm font-medium",
        tone === "light"
          ? "bg-white/80 text-ink shadow-[0_4px_18px_-6px_rgba(0,0,0,0.25)] backdrop-blur-md hover:bg-white"
          : "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/20",
        className,
      )}
    >
      <span className="relative grid place-items-center">
        <motion.svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <path
            d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.7 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4c3.6 0 5.9 3.6 4.6 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z"
            className={clsx(
              "transition-colors duration-300",
              active ? "fill-[#ff4d5e] stroke-[#ff4d5e]" : "fill-transparent stroke-current",
            )}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </motion.svg>
        <AnimatePresence>
          {active &&
            PARTICLES.map((a, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-[#ff4d5e]"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 16, y: Math.sin(a) * 16, opacity: 0, scale: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
      </span>
      {variant === "pill" && <span>{active ? "已收藏" : "收藏"}</span>}
    </button>
  );
}
