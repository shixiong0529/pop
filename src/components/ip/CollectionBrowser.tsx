"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { LiteProductCard, LiteSeriesCard } from "@/components/cards/LiteCards";
import { Segmented } from "@/components/ui/Segmented";
import { LoadMore } from "@/components/ui/LoadMore";
import type { ProductLite, SeriesLite } from "@/lib/compact";
import type { SeriesCategory } from "@/lib/types";

const CAT_LABEL: Record<SeriesCategory, string> = { figure: "盲盒手办", plush: "搪胶毛绒", mega: "MEGA 珍藏", figurine: "手办摆件" };
type Cat = "all" | SeriesCategory;
type View = "series" | "products";

/** IP 产品展示页：系列视图 / 单品视图，按品类与年份筛选 */
export function CollectionBrowser({ series, products }: { series: SeriesLite[]; products: ProductLite[] }) {
  const [view, setView] = useState<View>("series");
  const [cat, setCat] = useState<Cat>("all");
  const [year, setYear] = useState<string>("all");
  const [secretOnly, setSecretOnly] = useState(false);
  const [limit, setLimit] = useState(40);

  const cats = useMemo(() => {
    const counts = new Map<SeriesCategory, number>();
    for (const s of series) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return [
      { value: "all" as Cat, label: "全部", count: series.length },
      ...(Object.keys(CAT_LABEL) as SeriesCategory[])
        .filter((c) => counts.has(c))
        .map((c) => ({ value: c as Cat, label: CAT_LABEL[c], count: counts.get(c) })),
    ];
  }, [series]);

  const years = useMemo(() => [...new Set(series.map((s) => s.year).filter(Boolean))].sort((a, b) => b! - a!) as number[], [series]);

  const filteredSeries = useMemo(
    () => series.filter((s) => (cat === "all" || s.category === cat) && (year === "all" || String(s.year) === year)),
    [series, cat, year],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (year === "all" || String(p.year) === year) &&
          (!secretOnly || p.isSecret),
      ),
    [products, cat, year, secretOnly],
  );

  const more = useCallback(() => setLimit((l) => l + 40), []);

  return (
    <section className="pb-24">
      <div className="sticky top-[var(--nav-h)] z-30 border-y border-current/10 bg-[color-mix(in_oklab,var(--t-bg)_85%,transparent)] py-3 backdrop-blur-xl">
        <div className="container-page flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Segmented
              label="视图"
              value={view}
              onChange={(v) => (setView(v), setLimit(40))}
              options={[
                { value: "series", label: "系列视图" },
                { value: "products", label: "单品视图" },
              ]}
              className="rounded-full bg-current/[0.06] p-1"
              size="sm"
            />
            <span className="hidden h-5 w-px bg-current/15 sm:block" />
            <Segmented label="品类" value={cat} onChange={(v) => (setCat(v), setLimit(40))} options={cats} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            {view === "products" && (
              <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-current/15">
                <input type="checkbox" checked={secretOnly} onChange={(e) => setSecretOnly(e.target.checked)} className="accent-[var(--t-accent)]" />
                只看隐藏款
              </label>
            )}
            <label className="relative">
              <span className="sr-only">年份</span>
              <select
                value={year}
                onChange={(e) => (setYear(e.target.value), setLimit(40))}
                className="h-9 appearance-none rounded-full bg-current/[0.06] pl-4 pr-8 text-[12.5px] font-medium text-[var(--t-ink)] outline-none"
              >
                <option value="all">全部年份</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y} 年
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] opacity-70">▼</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container-page pt-10">
        <p className="mb-6 text-sm opacity-70" aria-live="polite">
          {view === "series" ? `${filteredSeries.length} 个系列` : `${filteredProducts.length} 款单品`}
          {year !== "all" && ` · ${year} 年发售 / 上架`}
        </p>

        <AnimatePresence mode="wait">
          {view === "series" ? (
            <motion.ul
              key={`s-${cat}-${year}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
            >
              {filteredSeries.slice(0, limit).map((s) => (
                <li key={s.id}>
                  <LiteSeriesCard s={s} showIP={false} />
                </li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key={`p-${cat}-${year}-${secretOnly}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-6 [&>*]:break-inside-avoid"
            >
              {filteredProducts.slice(0, limit).map((p) => (
                <LiteProductCard key={p.slug} p={p} ratio="natural" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <LoadMore onMore={more} remaining={(view === "series" ? filteredSeries.length : filteredProducts.length) - limit} />
        {(view === "series" ? filteredSeries.length : filteredProducts.length) === 0 && (
          <p className="py-24 text-center opacity-70">没有符合条件的结果</p>
        )}
      </div>
    </section>
  );
}
