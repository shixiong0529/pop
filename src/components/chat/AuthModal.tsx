"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { chatApi, checkPassword, checkUsername, ChatApiError } from "@/lib/chat/api";
import { useChatAuth, type AuthModal as Mode } from "@/lib/chat/auth";
import { useLenis } from "@/components/providers/SmoothScroll";
import { BubbleAvatar } from "./BubbleAvatar";

const COPY = {
  login: { title: "欢迎回来", desc: "登录后继续和泡友们聊天", submit: "登录" },
  register: { title: "加入泡泡互动", desc: "只需一个用户名和密码，注册后自动获得一个随机泡泡头像", submit: "注册并进入聊天" },
} as const;

export function AuthModal() {
  const modal = useChatAuth((s) => s.modal);
  return <AnimatePresence>{modal && <Dialog key="auth" initialMode={modal} />}</AnimatePresence>;
}

function Dialog({ initialMode }: { initialMode: Exclude<Mode, null> }) {
  const close = useChatAuth((s) => s.closeModal);
  const signedIn = useChatAuth((s) => s.signedIn);
  const lenis = useLenis();
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const copy = COPY[mode];

  useEffect(() => {
    lenis?.stop();
    const t = setTimeout(() => nameRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, close]);

  function switchMode(next: typeof mode) {
    setMode(next);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const name = username.normalize("NFKC").trim();
    const problem = mode === "register" ? (checkUsername(name) ?? checkPassword(password)) : !name || !password ? "请输入用户名和密码" : null;
    if (problem) return setError(problem);
    setPending(true);
    setError(null);
    try {
      const { user } = mode === "register" ? await chatApi.register(name, password) : await chatApi.login(name, password);
      signedIn(user, mode === "register" ? `注册成功，欢迎你，${user.name}！` : `欢迎回来，${user.name}`);
    } catch (err) {
      setError(err instanceof ChatApiError ? err.message : "出了点问题，请稍后再试");
      setPending(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <button type="button" aria-label="关闭" className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-md" onClick={close} />

      <motion.div
        className="relative max-h-full w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-[1.75rem] bg-card text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
        data-lenis-prevent
        initial={{ y: 40, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 顶部插画：几只漂浮的泡泡头像 */}
        <div className="relative h-32 shrink-0 overflow-hidden sm:h-36 bg-[radial-gradient(120%_120%_at_0%_0%,#ffd9c7_0%,transparent_55%),radial-gradient(120%_120%_at_100%_100%,#d9d3ff_0%,transparent_55%)] bg-paper">
          {[
            { s: "c14e8a3b9f20", x: "12%", y: 34, size: 54, d: 0 },
            { s: "07b3e5d2a1c8", x: "40%", y: 18, size: 72, d: 0.6 },
            { s: "9e2f41c7b6a3", x: "70%", y: 40, size: 50, d: 1.2 },
          ].map((a) => (
            <motion.div
              key={a.s}
              className="absolute"
              style={{ left: a.x, top: a.y }}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: a.d }}
            >
              <BubbleAvatar seed={a.s} size={a.size} className="shadow-[0_10px_24px_-10px_rgba(20,20,22,0.35)] ring-2 ring-white" />
            </motion.div>
          ))}
          <span className="absolute right-[12%] top-6 text-xl text-pop">✦</span>
          <span className="absolute bottom-5 left-[30%] text-sm text-[#8b7cf6]">✦</span>
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/70 text-ink-soft backdrop-blur transition hover:bg-white hover:text-ink"
            aria-label="关闭"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-7 pt-6 sm:px-8">
          <div className="relative grid grid-cols-2 rounded-full bg-paper p-1 text-[13.5px] font-semibold" role="tablist" aria-label="登录或注册">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={clsx("relative rounded-full py-2 transition-colors", mode === m ? "text-white" : "text-ink-mute hover:text-ink")}
              >
                {mode === m && (
                  <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{m === "login" ? "登录" : "注册"}</span>
              </button>
            ))}
          </div>

          <h2 id="auth-title" className="mt-6 font-display text-2xl font-black tracking-tight">
            {copy.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-6 text-ink-mute">{copy.desc}</p>

          <form className="mt-5 space-y-3.5" onSubmit={submit} noValidate>
            <Field label="用户名" hint={mode === "register" ? "2–16 个字符，可用中文、字母、数字和下划线" : undefined}>
              <input
                ref={nameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={32}
                placeholder="例如：抽盒小能手"
                className="h-12 w-full rounded-2xl bg-paper px-4 text-[15px] outline-none ring-1 ring-line transition placeholder:text-ink-mute/70 focus:bg-white focus:ring-ink/30"
              />
            </Field>
            <Field label="密码" hint={mode === "register" ? "至少 6 位，密码经过加密保存" : undefined}>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  maxLength={72}
                  placeholder={mode === "register" ? "设置一个密码" : "输入密码"}
                  className="h-12 w-full rounded-2xl bg-paper pl-4 pr-12 text-[15px] outline-none ring-1 ring-line transition placeholder:text-ink-mute/70 focus:bg-white focus:ring-ink/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-mute transition hover:text-ink"
                  aria-label={showPw ? "隐藏密码" : "显示密码"}
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="2.8" />
                    {!showPw && <path d="M4 20 20 4" strokeLinecap="round" />}
                  </svg>
                </button>
              </div>
            </Field>

            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  key={error}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-[#ff4d5e]/10 px-3.5 py-2.5 text-[13px] font-medium text-[#d93448]"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-70"
            >
              {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {copy.submit}
            </button>
          </form>

          <p className="mt-5 text-center text-[12.5px] text-ink-mute">
            {mode === "login" ? "还没有账号？" : "已经有账号了？"}
            <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="ml-1 font-semibold text-ink underline-offset-4 hover:underline">
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-ink-mute">{hint}</span>}
    </label>
  );
}
