"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage, ChatUser } from "@/lib/chat/api";
import { dayKey, dayLabel, fullTime, isBigEmoji, timeLabel } from "@/lib/chat/format";
import { BubbleAvatar } from "./BubbleAvatar";
import type { Ack } from "./useChatRoom";

const GROUP_GAP = 5 * 60 * 1000;
const NEAR_BOTTOM = 80;
const SUGGESTIONS = ["大家好呀 👋", "今天有人抽到隐藏款吗？", "你最喜欢哪个 IP？", "晒晒最近的新收藏 🧸"];

export function MessageList({
  messages,
  me,
  loaded,
  hasMore,
  loadingMore,
  onLoadMore,
  onDelete,
  onMute,
  onSuggest,
  onNotice,
}: {
  messages: ChatMessage[];
  me: ChatUser;
  loaded: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onDelete: (id: number) => Promise<Ack>;
  onMute: (userId: number, muted: boolean) => Promise<Ack>;
  onSuggest: (text: string) => void;
  onNotice: (text: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const prevRef = useRef<{ first?: number; last?: number; height: number }>({ height: 0 });
  const [pinned, setPinned] = useState(true);
  const [seenId, setSeenId] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const lastId = messages.at(-1)?.id ?? 0;
  const unread = pinned ? 0 : messages.filter((m) => m.id > seenId && m.user.id !== me.id).length;

  // 新消息自动滚到底部；加载更早的消息时保持当前阅读位置
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const prev = prevRef.current;
    const first = messages[0]?.id;
    const last = messages.at(-1)?.id;

    if (prev.first === undefined && first !== undefined) {
      el.scrollTop = el.scrollHeight;
    } else if (first !== undefined && prev.first !== undefined && first < prev.first) {
      el.scrollTop += el.scrollHeight - prev.height;
    }
    if (last !== undefined && prev.last !== undefined && last > prev.last) {
      const mine = messages.at(-1)?.user.id === me.id;
      if (atBottomRef.current || mine) el.scrollTop = el.scrollHeight;
    }
    prevRef.current = { first, last, height: el.scrollHeight };
  }, [messages, me.id]);

  // 元素高度变化（如字体加载、删除动画）后记录最新高度，供下一次计算
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (atBottomRef.current) el.scrollTop = el.scrollHeight;
      prevRef.current.height = el.scrollHeight;
    });
    ro.observe(el.firstElementChild as Element);
    return () => ro.disconnect();
  }, []);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    atBottomRef.current = atBottom;
    prevRef.current.height = el.scrollHeight;
    if (atBottom !== pinned) setPinned(atBottom);
    if (atBottom && seenId !== lastId) setSeenId(lastId);
    if (el.scrollTop < 160 && hasMore && !loadingMore) onLoadMore();
  }

  function scrollToBottom() {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto overscroll-contain [overflow-anchor:none]"
        data-lenis-prevent
        role="log"
        aria-live="polite"
        aria-label="聊天消息"
      >
        <div className="flex min-h-full flex-col px-3 pb-5 sm:px-6">
          <div className="flex-1" />
          <TopOfHistory loaded={loaded} hasMore={hasMore} loadingMore={loadingMore} empty={!messages.length} onLoadMore={onLoadMore} />

          {!loaded && <Skeleton />}

          {loaded && !messages.length && (
            <div className="flex flex-col items-center pb-6 text-center">
              <p className="text-sm text-ink-mute">还没有人说话，来打个招呼吧</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSuggest(s)}
                    className="rounded-full bg-paper px-3.5 py-2 text-[13px] text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-ink/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
              const first = newDay || prev.user.id !== m.user.id || m.createdAt - prev.createdAt > GROUP_GAP;
              return (
                <Fragment key={m.id}>
                  {newDay && <DaySeparator ts={m.createdAt} />}
                  <MessageRow
                    m={m}
                    me={me}
                    first={first}
                    active={active === m.id}
                    onToggle={() => setActive((a) => (a === m.id ? null : m.id))}
                    onDelete={onDelete}
                    onMute={onMute}
                    onNotice={onNotice}
                  />
                </Fragment>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {!pinned && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            onClick={scrollToBottom}
            className={clsx(
              "absolute bottom-4 left-1/2 flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold shadow-[0_12px_30px_-10px_rgba(20,20,22,0.45)] transition-colors",
              unread ? "bg-pop text-white" : "bg-ink text-white",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M12 5v14M5.5 12.5 12 19l6.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unread ? `${unread} 条新消息` : "回到最新"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopOfHistory({
  loaded,
  hasMore,
  loadingMore,
  empty,
  onLoadMore,
}: {
  loaded: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  empty: boolean;
  onLoadMore: () => void;
}) {
  if (!loaded) return null;
  if (loadingMore || hasMore)
    return (
      <div className="flex justify-center py-4">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] text-ink-mute ring-1 ring-line transition hover:text-ink"
        >
          {loadingMore && <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-ink-mute/40 border-t-ink-mute" />}
          {loadingMore ? "正在加载更早的消息…" : "查看更早的消息"}
        </button>
      </div>
    );
  return (
    <div className={clsx("flex flex-col items-center text-center", empty ? "pb-6 pt-10" : "pb-2 pt-8")}>
      <div className="flex -space-x-3">
        {["3fa2c1d47e09", "a81b52e6c3f4", "5c7d90ab12e8"].map((s, i) => (
          <BubbleAvatar key={s} seed={s} size={44} className={clsx("ring-2 ring-white", i === 1 && "-translate-y-1.5")} />
        ))}
      </div>
      <p className="mt-4 font-display text-lg font-bold">欢迎来到泡泡互动</p>
      <p className="mt-1 text-[12.5px] text-ink-mute">这里是聊天记录的起点 · 请友善交流</p>
    </div>
  );
}

function DaySeparator({ ts }: { ts: number }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] text-ink-mute" role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full bg-paper px-3 py-1 tracking-wide">{dayLabel(ts)}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function MessageRow({
  m,
  me,
  first,
  active,
  onToggle,
  onDelete,
  onMute,
  onNotice,
}: {
  m: ChatMessage;
  me: ChatUser;
  first: boolean;
  active: boolean;
  onToggle: () => void;
  onDelete: (id: number) => Promise<Ack>;
  onMute: (userId: number, muted: boolean) => Promise<Ack>;
  onNotice: (text: string) => void;
}) {
  const mine = m.user.id === me.id;
  const isAdmin = me.role === "admin";
  const canDelete = mine || isAdmin;
  const canMute = isAdmin && !mine && m.user.role !== "admin";
  const hasActions = canDelete || canMute;
  const big = isBigEmoji(m.text);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function del() {
    if (!confirming) return setConfirming(true);
    const res = await onDelete(m.id);
    if (!res.ok) onNotice(res.error ?? "删除失败");
  }

  async function toggleMute() {
    const res = await onMute(m.user.id, !m.user.muted);
    onNotice(res.ok ? (m.user.muted ? `已解除 ${m.user.name} 的禁言` : `已禁言 ${m.user.name}`) : (res.error ?? "操作失败"));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, height: 0, marginTop: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
      className={clsx("flex gap-2.5", mine && "flex-row-reverse", first ? "mt-4" : "mt-1")}
    >
      <div className="w-9 shrink-0 pt-0.5">{first && <BubbleAvatar seed={m.user.avatar} size={36} label={m.user.name} />}</div>

      <div className={clsx("flex min-w-0 max-w-[80%] flex-col sm:max-w-[68%]", mine ? "items-end" : "items-start")}>
        {first && (
          <div className={clsx("mb-1 flex items-center gap-1.5 px-1 text-[12px] leading-none", mine && "flex-row-reverse")}>
            <span className="font-semibold text-ink-soft">{mine ? `${m.user.name}（我）` : m.user.name}</span>
            {m.user.role === "admin" && <span className="rounded-full bg-pop/12 px-1.5 py-[3px] text-[10px] font-bold text-pop">管理员</span>}
            {isAdmin && m.user.muted && <span className="rounded-full bg-ink/8 px-1.5 py-[3px] text-[10px] font-semibold text-ink-mute">已禁言</span>}
          </div>
        )}

        <div className={clsx("group/msg relative flex max-w-full items-end gap-2", mine && "flex-row-reverse")}>
          <div
            onClick={hasActions ? onToggle : undefined}
            className={clsx(
              "min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
              hasActions && "cursor-pointer select-text",
              big
                ? "py-0.5 text-[40px] leading-[1.15]"
                : clsx(
                    "rounded-[1.25rem] px-3.5 py-2 text-[14.5px] leading-[1.6]",
                    mine
                      ? "bg-ink text-white"
                      : m.user.role === "admin"
                        ? "bg-[#fff0ea] text-ink ring-1 ring-pop/20"
                        : "bg-[#f2efe9] text-ink",
                    first && (mine ? "rounded-tr-md" : "rounded-tl-md"),
                  ),
            )}
          >
            {m.text}
          </div>
          <time dateTime={new Date(m.createdAt).toISOString()} title={fullTime(m.createdAt)} className="shrink-0 pb-0.5 text-[10.5px] tabular-nums text-ink-mute">
            {timeLabel(m.createdAt)}
          </time>

          {hasActions && (
            <div
              className={clsx(
                // 手机上浮在气泡上方，桌面端显示在气泡外侧（不遮挡昵称）
                "absolute -top-9 z-10 flex items-center gap-0.5 rounded-full bg-card p-1 text-[12px] font-medium shadow-[0_10px_30px_-10px_rgba(20,20,22,0.4)] ring-1 ring-black/[0.06] transition duration-200 sm:top-1/2 sm:-translate-y-1/2",
                mine ? "right-0 sm:right-full sm:mr-1.5" : "left-0 sm:left-full sm:ml-1.5",
                active
                  ? "visible scale-100 opacity-100"
                  : "invisible scale-95 opacity-0 group-hover/msg:visible group-hover/msg:scale-100 group-hover/msg:opacity-100 group-focus-within/msg:visible group-focus-within/msg:scale-100 group-focus-within/msg:opacity-100",
              )}
            >
              {canDelete && (
                <button
                  type="button"
                  onClick={del}
                  className={clsx(
                    "whitespace-nowrap rounded-full px-3 py-1 transition-colors",
                    confirming ? "bg-[#ff4d5e] text-white" : "text-ink-soft hover:bg-paper-2 hover:text-ink",
                  )}
                >
                  {confirming ? "确认删除？" : mine ? "撤回" : "删除"}
                </button>
              )}
              {canMute && (
                <button type="button" onClick={toggleMute} className="whitespace-nowrap rounded-full px-3 py-1 text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink">
                  {m.user.muted ? "解除禁言" : "禁言"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 pb-4 pt-6" aria-hidden>
      {[62, 40, 75, 48].map((w, i) => (
        <div key={i} className={clsx("flex items-end gap-2.5", i % 2 && "flex-row-reverse")}>
          <span className="h-9 w-9 animate-pulse rounded-full bg-paper-2" />
          <span className="h-10 animate-pulse rounded-[1.25rem] bg-paper-2" style={{ width: `${w}%`, maxWidth: 420 }} />
        </div>
      ))}
    </div>
  );
}
