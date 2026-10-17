"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { chatApi, type ChatUser } from "@/lib/chat/api";
import { useChatAuth } from "@/lib/chat/auth";
import { AuthModal } from "./AuthModal";
import { BubbleAvatar } from "./BubbleAvatar";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { useChatRoom, type Connection } from "./useChatRoom";

const RULES = [
  "友善交流，尊重每一位泡友的喜好",
  "不发广告、引流、二手交易与违法信息",
  "单条消息不超过 500 字，请勿刷屏",
  "发言过快会被暂时限制，稍等片刻即可",
  "违规内容会被管理员删除，严重者禁言",
];

export function ChatRoom() {
  const status = useChatAuth((s) => s.status);
  const user = useChatAuth((s) => s.user);
  const refresh = useChatAuth((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      {status === "authed" && user ? (
        <ChatLayout key={user.id} user={user} />
      ) : (
        <Shell aside={<Aside online={<GuestOnline />} />}>
          {status === "loading" ? <LoadingState /> : status === "error" ? <ErrorState onRetry={refresh} /> : <GuestState />}
        </Shell>
      )}
      <AuthModal />
    </>
  );
}

/** 聊天卡片 + 侧栏的整体布局 */
function Shell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
      <section
        className="relative flex h-[calc(100svh-var(--nav-h)-7rem)] max-h-[860px] min-h-[460px] flex-col sm:h-[calc(100svh-var(--nav-h)-11rem)] overflow-hidden rounded-[1.75rem] bg-card shadow-[0_30px_80px_-40px_rgba(20,20,22,0.35)] ring-1 ring-black/[0.05] sm:rounded-[2rem]"
        aria-label="公共聊天大厅"
      >
        {children}
      </section>
      <aside className="space-y-5">{aside}</aside>
    </div>
  );
}

function ChatLayout({ user }: { user: ChatUser }) {
  const room = useChatRoom(user);
  const logout = useChatAuth((s) => s.logout);
  const greeting = useChatAuth((s) => s.greeting);
  const clearGreeting = useChatAuth((s) => s.clearGreeting);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const shown = notice ?? (greeting ? { id: 0, text: greeting } : null);

  const flash = useCallback((text: string) => setNotice({ id: Date.now(), text }), []);

  // 提示条 2.8 秒后自动消失
  useEffect(() => {
    if (!notice && !greeting) return;
    const t = setTimeout(() => (notice ? setNotice(null) : clearGreeting()), 2800);
    return () => clearTimeout(t);
  }, [notice, greeting, clearGreeting]);

  const sendMessage = room.send;
  const send = useCallback(
    async (text: string) => {
      const res = await sendMessage(text);
      if (!res.ok) flash(res.error ?? "发送失败");
      return res;
    },
    [sendMessage, flash],
  );

  const disabledReason = user.muted ? "你已被禁言，暂时无法发言" : room.connection !== "online" ? "正在连接…" : null;

  return (
    <Shell aside={<Aside user={user} onLogout={logout} online={<OnlineCount n={room.online} />} />}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ffd9c7,#d9d3ff)] text-lg" aria-hidden>
            🫧
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[15.5px] font-bold leading-tight">泡泡广场</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-mute">
              <ConnectionDot state={room.connection} />
              {room.connection === "online" ? (room.online !== null ? `${room.online} 位泡友在线` : "已连接") : room.connection === "connecting" ? "正在连接…" : "已断开"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <BubbleAvatar seed={user.avatar} size={32} label={user.name} />
          <button type="button" onClick={() => void logout()} className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-ink-soft ring-1 ring-line transition hover:text-ink">
            退出
          </button>
        </div>
      </header>

      <MessageList
        messages={room.messages}
        me={user}
        loaded={room.loaded}
        hasMore={room.hasMore}
        loadingMore={room.loadingMore}
        onLoadMore={room.loadMore}
        onDelete={room.remove}
        onMute={room.mute}
        onSuggest={setDraft}
        onNotice={flash}
      />

      <div className="relative">
        <AnimatePresence>
          {shown && (
            <motion.div
              key={shown.id}
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 6, x: "-50%" }}
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 max-w-[90%] rounded-full bg-ink px-4 py-2 text-center text-[12.5px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(20,20,22,0.5)]"
              role="status"
            >
              {shown.text}
            </motion.div>
          )}
        </AnimatePresence>
        <Composer value={draft} onChange={setDraft} onSend={send} disabledReason={disabledReason} />
      </div>
    </Shell>
  );
}

function ConnectionDot({ state }: { state: Connection }) {
  return (
    <span className="relative flex h-2 w-2">
      {state === "online" && <span className="absolute inset-0 animate-ping rounded-full bg-[#2ecc71] opacity-60" />}
      <span className={clsx("relative h-2 w-2 rounded-full", state === "online" ? "bg-[#2ecc71]" : state === "connecting" ? "bg-[#f5a623]" : "bg-ink-mute")} />
    </span>
  );
}

function Aside({ user, onLogout, online }: { user?: ChatUser; onLogout?: () => void; online: ReactNode }) {
  return (
    <>
      {user && (
        <div className="hidden rounded-[1.75rem] bg-card p-6 ring-1 ring-black/[0.05] lg:block">
          <p className="eyebrow text-ink-mute">我的泡泡</p>
          <div className="mt-4 flex items-center gap-4">
            <BubbleAvatar seed={user.avatar} size={60} label={user.name} className="ring-2 ring-white shadow-[0_10px_24px_-12px_rgba(20,20,22,0.4)]" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold">{user.name}</p>
              <p className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                {user.role === "admin" ? (
                  <span className="rounded-full bg-pop/12 px-2 py-0.5 text-pop">管理员</span>
                ) : (
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-ink-soft">泡友</span>
                )}
                {user.muted && <span className="rounded-full bg-ink/8 px-2 py-0.5 text-ink-mute">已被禁言</span>}
              </p>
            </div>
          </div>
          {user.role === "admin" && (
            <p className="mt-4 rounded-2xl bg-paper px-3.5 py-3 text-[12px] leading-5 text-ink-soft">
              管理员模式：将鼠标移到任意消息上即可删除消息或禁言用户。
            </p>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="mt-5 w-full rounded-full py-2.5 text-[13px] font-medium text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-ink/25"
          >
            退出登录
          </button>
        </div>
      )}

      <div className="rounded-[1.75rem] bg-ink p-6 text-white">
        <p className="eyebrow text-white/45">Live</p>
        {online}
      </div>

      <div className="rounded-[1.75rem] bg-card p-6 ring-1 ring-black/[0.05]">
        <p className="eyebrow text-ink-mute">聊天公约</p>
        <ol className="mt-4 space-y-3 text-[13px] leading-6 text-ink-soft">
          {RULES.map((r, i) => (
            <li key={r} className="flex gap-3">
              <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper-2 text-[10.5px] font-bold text-ink">{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-[11.5px] leading-5 text-ink-mute">
          泡泡互动是本站的粉丝交流空间，与泡泡玛特官方无关。聊天记录保存在本站服务器上。
        </p>
      </div>
    </>
  );
}

function OnlineCount({ n }: { n: number | null }) {
  return (
    <p className="mt-3 flex items-baseline gap-2">
      <span className="font-display text-5xl font-black tabular-nums tracking-tight">{n ?? "–"}</span>
      <span className="text-sm text-white/60">位泡友在线</span>
    </p>
  );
}

/** 未登录时每 30 秒刷新一次在线人数 */
function GuestOnline() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      chatApi
        .stats()
        .then((s) => alive && setN(s.online))
        .catch(() => {});
    void load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return <OnlineCount n={n} />;
}

const FLOATERS = [
  { s: "c14e8a3b9f20", x: "8%", y: "14%", size: 64, d: 0, say: "👋" },
  { s: "07b3e5d2a1c8", x: "80%", y: "10%", size: 54, d: 0.8, say: "✨" },
  { s: "9e2f41c7b6a3", x: "14%", y: "70%", size: 50, d: 1.4, say: "" },
  { s: "4d6a0f2e8b91", x: "78%", y: "66%", size: 68, d: 0.4, say: "🧸" },
  { s: "b2e9c4f81a07", x: "46%", y: "84%", size: 40, d: 1.1, say: "" },
];

function GuestState() {
  const openModal = useChatAuth((s) => s.openModal);
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(80%_60%_at_15%_10%,#ffe3d6_0%,transparent_60%),radial-gradient(70%_60%_at_90%_95%,#e3deff_0%,transparent_60%)] px-6 text-center">
      {FLOATERS.map((f) => (
        <motion.div
          key={f.s}
          className="absolute hidden sm:block"
          style={{ left: f.x, top: f.y }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: f.d }}
          aria-hidden
        >
          <BubbleAvatar seed={f.s} size={f.size} className="shadow-[0_14px_30px_-14px_rgba(20,20,22,0.4)] ring-2 ring-white" />
          {f.say && <span className="absolute -right-4 -top-3 rounded-full rounded-bl-sm bg-white px-2 py-1 text-sm shadow-sm ring-1 ring-black/5">{f.say}</span>}
        </motion.div>
      ))}

      <div className="relative max-w-md">
        <div className="mx-auto flex w-fit -space-x-3 sm:hidden">
          {FLOATERS.slice(0, 3).map((f) => (
            <BubbleAvatar key={f.s} seed={f.s} size={48} className="ring-2 ring-white" />
          ))}
        </div>
        <p className="eyebrow mt-6 text-ink-mute sm:mt-0">Bubble Lounge</p>
        <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-black leading-[1.05] tracking-tight">和泡友们聊聊天</h2>
        <p className="mt-4 text-[14px] leading-7 text-ink-soft">
          抽到了什么？最想要哪个隐藏款？登录后即可进入公共聊天大厅，消息实时送达，聊天记录随时回看。
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => openModal("register")}
            className="rounded-full bg-ink px-7 py-3 text-[14px] font-semibold text-white transition hover:bg-black"
          >
            注册新账号
          </button>
          <button
            type="button"
            onClick={() => openModal("login")}
            className="rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-ink ring-1 ring-line transition hover:ring-ink/25"
          >
            我有账号，登录
          </button>
        </div>
        <p className="mt-5 text-[12px] text-ink-mute">注册只需用户名和密码 · 自动获得随机泡泡头像</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center" aria-busy="true" aria-label="加载中">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-3xl">🫧</p>
      <p className="mt-4 font-display text-xl font-bold">聊天服务暂时连接不上</p>
      <p className="mt-2 text-[13px] text-ink-mute">可能是网络波动或服务器正在更新，请稍后再试。</p>
      <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-ink px-6 py-2.5 text-[13.5px] font-semibold text-white">
        重新连接
      </button>
    </div>
  );
}
