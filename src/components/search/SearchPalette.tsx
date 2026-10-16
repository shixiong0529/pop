"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type Fuse from "fuse.js";
import { useUI } from "@/lib/ui-store";
import { groupResults, KIND_LABEL, loadSearch, type SearchEntry, type SearchKind } from "@/lib/search";
import { useLenis } from "@/components/providers/SmoothScroll";

const HOT = ["LABUBU", "MOLLY", "SKULLPANDA", "星星人", "小野", "隐藏款", "MEGA", "坐坐派对"];
const RECENT_KEY = "pop-atlas:recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function pushRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x !== q)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function SearchPalette() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearch);
  const router = useRouter();
  const lenis = useLenis();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  // 面板打开时读取最近搜索（仅在客户端打开后渲染，可直接读取 localStorage）
  const recent = useMemo(() => (open ? readRecent() : []), [open]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    loadSearch()
      .then(setFuse)
      .catch(() => setError(true));
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      clearTimeout(t);
      lenis?.start();
    };
  }, [open, lenis]);

  const groups = useMemo(() => {
    const q = deferred.trim();
    if (!fuse || !q) return null;
    return groupResults(fuse.search(q, { limit: 60 }), { ip: 4, series: 6, product: 8 });
  }, [fuse, deferred]);

  const flat = useMemo(() => (groups ? [...groups.ip, ...groups.series, ...groups.product] : []), [groups]);

  const search = (q: string) => {
    setQuery(q);
    setActive(0);
  };

  function close() {
    setOpen(false);
    setQuery("");
  }

  function go(href: string) {
    if (query.trim()) pushRecent(query.trim());
    close();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].h);
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let index = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[9vh] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="搜索"
          onKeyDown={onKeyDown}
        >
          <button aria-label="关闭搜索" className="absolute inset-0 bg-ink/35 backdrop-blur-md" onClick={close} />
          <motion.div
            className="relative flex max-h-[78vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[1.75rem] bg-card text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
            initial={{ y: -18, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -12, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-mute" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => search(e.target.value)}
                placeholder="搜索 IP、系列或产品名称，支持拼音"
                className="h-10 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-mute"
                aria-label="搜索关键词"
                aria-controls="search-results"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="rounded-md bg-paper-2 px-2 py-1 text-[11px] text-ink-mute">ESC</kbd>
            </div>

            <div ref={listRef} id="search-results" className="overflow-y-auto overscroll-contain px-2 py-2" data-lenis-prevent>
              {!query.trim() && (
                <div className="space-y-6 px-3 py-4">
                  {recent.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3 text-ink-mute">最近搜索</p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button key={r} onClick={() => search(r)} className="rounded-full bg-paper px-3.5 py-1.5 text-sm hover:bg-paper-2">
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-3 text-ink-mute">大家都在搜</p>
                    <div className="flex flex-wrap gap-2">
                      {HOT.map((h) => (
                        <button
                          key={h}
                          onClick={() => search(h)}
                          className="rounded-full px-3.5 py-1.5 text-sm ring-1 ring-line transition hover:bg-ink hover:text-white"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {query.trim() && !fuse && !error && <p className="px-4 py-10 text-center text-sm text-ink-mute">正在载入索引…</p>}
              {error && <p className="px-4 py-10 text-center text-sm text-ink-mute">搜索索引加载失败，请稍后重试。</p>}

              {groups && flat.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-[15px] font-medium">没有找到「{deferred}」</p>
                  <p className="mt-1 text-sm text-ink-mute">换个关键词试试，比如 IP 名、系列英文名或拼音首字母。</p>
                </div>
              )}

              {groups &&
                (Object.keys(groups) as SearchKind[]).map((kind) =>
                  groups[kind].length ? (
                    <div key={kind} className="py-1.5">
                      <p className="eyebrow px-3 pb-1.5 pt-2 text-ink-mute">{KIND_LABEL[kind]}</p>
                      {groups[kind].map((e) => {
                        index++;
                        const i = index;
                        return (
                          <button
                            key={e.h}
                            data-index={i}
                            onMouseMove={() => setActive(i)}
                            onClick={() => go(e.h)}
                            className={clsx(
                              "flex w-full items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left transition-colors",
                              active === i ? "bg-paper" : "hover:bg-paper/60",
                            )}
                          >
                            <span
                              className={clsx("relative h-12 w-12 shrink-0 overflow-hidden", kind === "ip" ? "rounded-full" : "rounded-xl")}
                              style={{ background: e.c }}
                            >
                              {e.i && <Image src={e.i} alt="" fill sizes="48px" className="object-cover" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-semibold">
                                {e.n}
                                {e.z && <span className="ml-2 text-[13px] font-normal text-ink-soft">{e.z}</span>}
                              </span>
                              <span className="block truncate text-[12.5px] text-ink-mute">{e.s}</span>
                            </span>
                            <span className={clsx("text-ink-mute transition", active === i ? "opacity-100" : "opacity-0")}>↵</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null,
                )}
            </div>

            {query.trim() && (
              <button
                onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm font-medium hover:bg-paper"
              >
                <span>查看「{query.trim()}」的全部结果</span>
                <span aria-hidden>→</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
