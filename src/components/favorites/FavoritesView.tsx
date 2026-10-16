"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useState } from "react";
import { useFavorites, type FavoriteKind } from "@/lib/favorites";
import { useHydrated } from "@/lib/use-hydrated";

const TABS: { key: "all" | FavoriteKind; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "ip", label: "IP" },
  { key: "series", label: "系列" },
  { key: "product", label: "产品" },
];
const KIND: Record<FavoriteKind, string> = { ip: "IP", series: "系列", product: "产品" };

export function FavoritesView() {
  const hydrated = useHydrated();
  const items = useFavorites((s) => s.items);
  const remove = useFavorites((s) => s.remove);
  const clear = useFavorites((s) => s.clear);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [confirming, setConfirming] = useState(false);

  const list = hydrated ? (tab === "all" ? items : items.filter((i) => i.kind === tab)) : [];
  const count = (k: (typeof TABS)[number]["key"]) => (k === "all" ? items.length : items.filter((i) => i.kind === k).length);

  return (
    <div className="container-page">
      <p className="eyebrow flex items-center gap-3 text-ink-mute">
        <span className="inline-block h-px w-6 bg-current" />
        My Collection
      </p>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="font-display text-display font-black">我的收藏</h1>
        <p className="max-w-sm text-sm leading-6 text-ink-mute">收藏保存在当前浏览器的本地存储中，无需登录；清除浏览器数据后会一并清空。</p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="收藏分类">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "rounded-full px-4 py-2 text-[13.5px] font-medium transition",
                tab === t.key ? "bg-ink text-white" : "bg-paper-2 text-ink-soft hover:text-ink",
              )}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums opacity-70">{hydrated ? count(t.key) : 0}</span>
            </button>
          ))}
        </div>
        {hydrated && list.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            {confirming ? (
              <>
                <span className="text-ink-mute">确定清空{tab === "all" ? "全部" : KIND[tab]}收藏？</span>
                <button
                  onClick={() => (clear(tab === "all" ? undefined : tab), setConfirming(false))}
                  className="rounded-full bg-[#ff4d5e] px-4 py-1.5 font-semibold text-white"
                >
                  清空
                </button>
                <button onClick={() => setConfirming(false)} className="rounded-full px-4 py-1.5 ring-1 ring-line">
                  取消
                </button>
              </>
            ) : (
              <button onClick={() => setConfirming(true)} className="rounded-full px-4 py-1.5 text-ink-mute ring-1 ring-line hover:text-ink">
                清空
              </button>
            )}
          </div>
        )}
      </div>

      {hydrated && list.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-24 w-24 place-items-center rounded-full bg-paper-2 text-4xl"
            aria-hidden
          >
            ♡
          </motion.div>
          <p className="mt-6 text-lg font-semibold">还没有收藏</p>
          <p className="mt-2 text-sm text-ink-mute">在任意 IP、系列或单品上点亮 ♥，它就会出现在这里。</p>
          <div className="mt-8 flex gap-3">
            <Link href="/ips" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              逛逛 IP 系列馆
            </Link>
            <Link href="/series" className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-line">
              浏览系列图鉴
            </Link>
          </div>
        </div>
      )}

      <motion.ul layout className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {list.map((i) => (
            <motion.li
              key={`${i.kind}:${i.key}`}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <Link href={i.href} className="block">
                <div
                  className={clsx("relative aspect-square overflow-hidden", i.kind === "ip" ? "rounded-[2rem]" : "rounded-[1.3rem]")}
                  style={{ background: i.color }}
                >
                  {i.image && (
                    <Image src={i.image} alt={i.title} fill sizes="(min-width:1024px) 18vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10.5px] font-semibold text-ink backdrop-blur">
                    {KIND[i.kind]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-1 text-[15px] font-semibold">{i.title}</p>
                {i.subtitle && <p className="line-clamp-1 text-[12.5px] text-ink-mute">{i.subtitle}</p>}
              </Link>
              <button
                onClick={() => remove(i.kind, i.key)}
                className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-sm text-ink opacity-0 shadow transition group-hover:opacity-100 max-md:opacity-100"
                aria-label={`移除 ${i.title}`}
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
