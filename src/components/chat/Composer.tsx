"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/api";
import { charCount } from "@/lib/chat/format";
import { EmojiPicker } from "./EmojiPicker";
import type { Ack } from "./useChatRoom";

const COARSE = "(pointer: coarse)";
const subscribeCoarse = (cb: () => void) => {
  const mq = window.matchMedia(COARSE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** 触屏设备上回车换行、点按钮发送；桌面端回车发送、Shift+回车换行 */
function useCoarsePointer() {
  return useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia(COARSE).matches,
    () => false,
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  disabledReason,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  onSend: (text: string) => Promise<Ack>;
  /** 有值时禁用输入框并显示原因（如被禁言、连接断开） */
  disabledReason?: string | null;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const coarse = useCoarsePointer();
  const count = charCount(value);
  const over = count > MAX_MESSAGE_LENGTH;
  const disabled = Boolean(disabledReason);
  const canSend = !disabled && !sending && !over && value.trim().length > 0;

  // 输入框随内容自动增高（最多约 5 行）
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [value]);

  async function submit() {
    if (!canSend) return;
    const text = value;
    onChange("");
    setSending(true);
    const res = await onSend(text);
    setSending(false);
    // 发送失败时把内容还给输入框（若用户已经输入了新内容则不覆盖）
    if (!res.ok) onChange((cur) => (cur ? cur : text));
    if (!coarse) ref.current?.focus();
  }

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = ref.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      onChange(value.slice(0, start) + emoji + value.slice(end));
      requestAnimationFrame(() => {
        if (!el) return;
        const pos = start + emoji.length;
        if (!coarse) el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [value, onChange, coarse],
  );

  const closeEmoji = useCallback(() => setEmojiOpen(false), []);

  return (
    <form
      className="relative border-t border-line bg-card/80 px-3 pb-3 pt-3 sm:px-5 sm:pb-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <AnimatePresence>{emojiOpen && !disabled && <EmojiPicker onPick={insertEmoji} onClose={closeEmoji} />}</AnimatePresence>

      <div
        className={clsx(
          "flex items-end gap-1.5 rounded-[1.4rem] bg-paper p-1.5 ring-1 transition-shadow",
          over ? "ring-[#ff4d5e]/60" : "ring-line focus-within:ring-ink/25 focus-within:shadow-[0_0_0_4px_rgba(20,20,22,0.04)]",
          disabled && "opacity-70",
        )}
      >
        <button
          type="button"
          data-emoji-toggle
          disabled={disabled}
          onClick={() => setEmojiOpen((o) => !o)}
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink disabled:pointer-events-none",
            emojiOpen && "bg-paper-2 text-ink",
          )}
          aria-label="表情"
          aria-expanded={emojiOpen}
        >
          <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
            <circle cx="12" cy="12" r="8.6" />
            <path d="M8.6 14.2c.8 1.3 2 2 3.4 2s2.6-.7 3.4-2" strokeLinecap="round" />
            <circle cx="9.2" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="14.8" cy="10" r="1" fill="currentColor" stroke="none" />
          </svg>
        </button>

        <label className="sr-only" htmlFor="chat-input">
          消息内容
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey || coarse) return;
            // 中文输入法选词时的回车不发送
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            e.preventDefault();
            void submit();
          }}
          placeholder={disabledReason ?? "说点什么吧…"}
          enterKeyHint={coarse ? "enter" : "send"}
          className="max-h-[132px] min-h-10 flex-1 resize-none bg-transparent px-1 py-[9px] text-[15px] leading-[22px] text-ink outline-none placeholder:text-ink-mute disabled:cursor-not-allowed"
          data-lenis-prevent
        />

        <motion.button
          type="submit"
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.9 } : undefined}
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-300",
            canSend ? "bg-pop text-white shadow-[0_8px_20px_-8px_rgba(255,91,58,0.9)]" : "bg-paper-2 text-ink-mute",
          )}
          aria-label="发送"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-3 text-[11px] text-ink-mute">
        <span className="hidden sm:inline">Enter 发送 · Shift + Enter 换行</span>
        <span className="sm:hidden">文明交流，友善发言</span>
        <span className={clsx("tabular-nums", over ? "font-semibold text-[#ff4d5e]" : count > MAX_MESSAGE_LENGTH * 0.8 ? "text-ink-soft" : "")}>
          {count}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
}
