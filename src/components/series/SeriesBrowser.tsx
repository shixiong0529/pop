"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { LiteSeriesCard } from "@/components/cards/LiteCards";
import { Segmented } from "@/components/ui/Segmented";
import { LoadMore } from "@/components/ui/LoadMore";
import type { SeriesLite } from "@/lib/compact";
import type { SeriesCategory } from "@/lib/types";

type Cat = "all" | SeriesCategory;
type Sort = "new" | "old" | "count";
const CAT_OPTIONS: { value: Cat; label: string }[] = [
  { value: "all", label: "全部品类" },
  { value: "figure", label: "盲盒手办" },
  { value: "plush", label: "搪胶毛绒" },
  { value: "mega", label: "MEGA 珍藏" },
  { value: "figurine", label: "手办摆件" },
];

/** 全站系列图鉴：按 IP / 品类筛选与排序 */
export function SeriesBrowser({ series, ips }: { series: SeriesLite[]; ips: { slug: string; name: string; color: string }[] }) {
  const [ip, setIp] = useState("all");
  const [cat, setCat] = useState<Cat>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [limit, setLimit] = useState(36);

  const list = useMemo(() => {
    const l = series.filter((s) => (ip === "all" || s.ip === ip) && (cat === "all" || s.category === cat));
    if (sort === "new") l.sort((a, b) => b.time - a.time);
    if (sort === "old") l.sort((a, b) => a.time - b.time);
    if (sort === "count") l.sort((a, b) => b.count - a.count);
    return l;
  }, [series, ip, cat, sort]);

  const more = useCallback(() => setLimit((n) => n + 36), []);
  const reset = () => setLimit(36);

  return (
    <section className="pb-24">
      <div className="sticky top-[var(--nav-h)] z-30 border-y border-line bg-paper/85 py-3 backdrop-blur-xl">
        <div className="container-page space-y-3">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="radiogroup" aria-label="按 IP 筛选">
            {[{ slug: "all", name: "全部 IP", color: "#141416" }, ...ips].map((x) => (
              <button
                key={x.slug}
                role="radio"
                aria-checked={ip === x.slug}
                onClick={() => (setIp(x.slug), reset())}
                className={clsx(
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition",
                  ip === x.slug ? "bg-ink text-white" : "bg-paper-2 text-ink-soft hover:text-ink",
                )}
              >
                {x.slug !== "all" && <span className="h-2 w-2 rounded-full" style={{ background: x.color }} />}
                {x.name}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Segmented label="品类" value={cat} onChange={(v) => (setCat(v), reset())} options={CAT_OPTIONS} size="sm" />
            <label className="relative shrink-0">
              <span className="sr-only">排序</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 appearance-none rounded-full bg-paper-2 pl-4 pr-8 text-[12.5px] font-medium outline-none"
              >
                <option value="new">最新优先</option>
                <option value="old">最早优先</option>
                <option value="count">款式最多</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] opacity-70">▼</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container-page pt-10">
        <p className="mb-6 text-sm text-ink-mute" aria-live="polite">
          共 {list.length} 个系列
        </p>
        <AnimatePresence mode="wait">
          <motion.ul
            key={`${ip}-${cat}-${sort}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
          >
            {list.slice(0, limit).map((s) => (
              <li key={s.id}>
                <LiteSeriesCard s={s} />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <LoadMore onMore={more} remaining={list.length - limit} />
      </div>
    </section>
  );
}
