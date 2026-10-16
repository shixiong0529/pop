"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import clsx from "clsx";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type Fuse from "fuse.js";
import { KIND_LABEL, loadSearch, type SearchEntry, type SearchKind } from "@/lib/search";

const TABS: { key: "all" | SearchKind; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "ip", label: "IP" },
  { key: "series", label: "系列" },
  { key: "product", label: "产品" },
];

/** 搜索结果页：读取 ?q=，实时检索并分组展示 */
export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const deferred = useDeferredValue(q.trim());
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSearch().then(setFuse).catch(() => setError(true));
  }, []);

  // 同步地址栏
  useEffect(() => {
    const t = setTimeout(() => {
      const url = deferred ? `/search?q=${encodeURIComponent(deferred)}` : "/search";
      router.replace(url, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [deferred, router]);

  const results = useMemo(() => (fuse && deferred ? fuse.search(deferred, { limit: 300 }).map((r) => r.item) : []), [fuse, deferred]);
  const counts = useMemo(() => {
    const c = { all: results.length, ip: 0, series: 0, product: 0 };
    for (const r of results) c[r.t]++;
    return c;
  }, [results]);
  const shown = tab === "all" ? results : results.filter((r) => r.t === tab);

  return (
    <div className="container-page">
      <p className="eyebrow text-ink-mute">Search</p>
      <div className="mt-5 flex items-center gap-4 border-b-2 border-ink pb-4">
        <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索 IP、系列或产品"
          aria-label="搜索关键词"
          autoFocus
          className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.8rem,5vw,3.6rem)] font-bold tracking-tight outline-none placeholder:text-ink/25"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="结果分类">
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
            {deferred && <span className="ml-1.5 tabular-nums opacity-70">{counts[t.key]}</span>}
          </button>
        ))}
      </div>

      {error && <p className="py-20 text-center text-ink-mute">搜索索引加载失败，请刷新重试。</p>}
      {!deferred && <p className="py-20 text-center text-ink-mute">输入关键词开始搜索，例如「LABUBU」「坐坐派对」「xxr」（星星人拼音首字母）。</p>}
      {deferred && fuse && shown.length === 0 && (
        <p className="py-20 text-center text-ink-mute">没有找到与「{deferred}」相关的结果。</p>
      )}

      {shown.length > 0 && (
        <motion.ul
          key={`${deferred}-${tab}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5"
        >
          {shown.slice(0, 120).map((e) => (
            <li key={e.h}>
              <Link href={e.h} className="group block">
                <div
                  className={clsx("relative aspect-square overflow-hidden", e.t === "ip" ? "rounded-full" : "rounded-[1.3rem]")}
                  style={{ background: e.c }}
                >
                  {e.i && (
                    <Image src={e.i} alt="" fill sizes="(min-width:1024px) 18vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10.5px] font-semibold text-ink backdrop-blur">
                    {KIND_LABEL[e.t]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-1 text-[15px] font-semibold">{e.n}</p>
                <p className="line-clamp-1 text-[12.5px] text-ink-mute">{[e.z, e.s].filter(Boolean).join(" · ")}</p>
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
      {shown.length > 120 && <p className="mt-10 text-center text-sm text-ink-mute">仅显示前 120 条结果，请尝试更精确的关键词。</p>}
    </div>
  );
}
