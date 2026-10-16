"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { IPCard } from "@/components/cards/IPCard";
import type { ImageAsset, IPContent, Mood } from "@/lib/types";
import type { IPStats } from "@/lib/data";

type Item = { ip: IPContent; cover?: ImageAsset; stats: IPStats };

const MOODS: ("全部" | Mood)[] = ["全部", "萌趣治愈", "梦幻童话", "情绪共鸣", "暗黑酷感", "潮流个性"];
const TIERS = [
  { key: "all", label: "全部" },
  { key: "core", label: "经典核心" },
  { key: "featured", label: "人气精选" },
  { key: "rising", label: "新锐登场" },
] as const;
const SORTS = [
  { key: "default", label: "推荐" },
  { key: "series", label: "系列最多" },
  { key: "year", label: "诞生年份" },
  { key: "name", label: "名称 A–Z" },
] as const;

export function IPGallery({ items }: { items: Item[] }) {
  const [mood, setMood] = useState<(typeof MOODS)[number]>("全部");
  const [tier, setTier] = useState<(typeof TIERS)[number]["key"]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("default");

  const list = useMemo(() => {
    const filtered = items.filter(
      ({ ip }) => (mood === "全部" || ip.moods.includes(mood)) && (tier === "all" || ip.tier === tier),
    );
    const sorted = [...filtered];
    if (sort === "series") sorted.sort((a, b) => b.stats.series - a.stats.series);
    if (sort === "year") sorted.sort((a, b) => (a.ip.debutYear ?? 9999) - (b.ip.debutYear ?? 9999));
    if (sort === "name") sorted.sort((a, b) => a.ip.name.localeCompare(b.ip.name));
    return sorted;
  }, [items, mood, tier, sort]);

  return (
    <section className="pb-24">
      <div className="sticky top-0 z-30 -mt-2 border-b border-line bg-paper/80 py-3 backdrop-blur-xl [top:var(--nav-h)]">
        <div className="container-page flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="mood">
            <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="radiogroup" aria-label="按风格筛选">
              {MOODS.map((m) => (
                <Chip key={m} active={mood === m} onClick={() => setMood(m)} layoutId="mood-pill">
                  {m}
                </Chip>
              ))}
            </div>
          </LayoutGroup>
          <div className="flex items-center gap-2">
            <LayoutGroup id="tier">
              <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-paper-2 p-1" role="radiogroup" aria-label="按类别筛选">
                {TIERS.map((t) => (
                  <Chip key={t.key} small active={tier === t.key} onClick={() => setTier(t.key)} layoutId="tier-pill">
                    {t.label}
                  </Chip>
                ))}
              </div>
            </LayoutGroup>
            <label className="relative shrink-0">
              <span className="sr-only">排序</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-9 appearance-none rounded-full bg-paper-2 pl-4 pr-8 text-[13px] font-medium outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] opacity-70">▼</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container-page pt-10">
        <p className="mb-6 text-sm text-ink-mute" aria-live="polite">
          共 {list.length} 个 IP
        </p>
        <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map(({ ip, cover, stats }, i) => (
              <motion.li
                key={ip.slug}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.03 }}
              >
                <IPCard ip={ip} cover={cover} stats={stats} priority={i < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {list.length === 0 && (
          <div className="py-24 text-center text-ink-mute">
            <p className="text-lg">这个组合下暂时没有 IP</p>
            <button className="mt-4 text-sm font-semibold text-ink underline underline-offset-4" onClick={() => (setMood("全部"), setTier("all"))}>
              重置筛选
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
  layoutId,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutId: string;
  small?: boolean;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={clsx(
        "relative shrink-0 rounded-full font-medium transition-colors duration-300",
        small ? "px-3.5 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]",
        active ? "text-white" : "text-ink-soft hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 -z-0 rounded-full bg-ink"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
