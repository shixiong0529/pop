"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

const GROUPS = [
  {
    key: "face",
    label: "表情",
    icon: "😊",
    list: "😀 😄 😆 😂 🤣 😊 🥰 😍 😘 😋 😜 🤪 😎 🤩 🥳 😏 🥺 😢 😭 😤 😡 🤯 😱 🤔 🤗 🫣 🙈 😴 😇 🤤 😶‍🌫️ 🫠",
  },
  {
    key: "heart",
    label: "心意",
    icon: "💖",
    list: "👍 👏 🙌 🙏 💪 ✌️ 🤞 👌 👋 🫶 🤝 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💖 💕 ❤️‍🔥 ✨ ⭐ 🌟 🔥 🎉 🎊 💯 ✅ ❓ 💤",
  },
  {
    key: "toy",
    label: "潮玩",
    icon: "🧸",
    list: "🧸 🎁 🎀 🎈 🪅 🎨 🖼️ 🌈 🍭 🍬 🍰 🧁 🍓 🍑 🐰 🐻 🐱 🐶 🦊 🐼 🐨 🐸 🦄 🐣 👻 👽 🤖 🎃 🌙 ☁️ 🌸 🍀",
  },
].map((g) => ({ ...g, list: g.list.split(" ") }));

export function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const [group, setGroup] = useState(GROUPS[0].key);
  const ref = useRef<HTMLDivElement>(null);
  const current = GROUPS.find((g) => g.key === group) ?? GROUPS[0];

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!ref.current?.contains(target) && !target.closest("[data-emoji-toggle]")) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-full left-0 z-20 mb-3 w-[min(340px,calc(100vw-2.5rem))] origin-bottom-left overflow-hidden rounded-[1.4rem] bg-card shadow-[0_24px_60px_-18px_rgba(20,20,22,0.35)] ring-1 ring-black/[0.06]"
      role="dialog"
      aria-label="选择表情"
    >
      <div className="flex gap-1 border-b border-line px-2 pt-2" role="tablist">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={g.key === group}
            onClick={() => setGroup(g.key)}
            className={clsx(
              "relative flex items-center gap-1.5 rounded-t-xl px-3 pb-2 pt-1.5 text-[12.5px] font-medium transition-colors",
              g.key === group ? "text-ink" : "text-ink-mute hover:text-ink",
            )}
          >
            <span className="text-base leading-none">{g.icon}</span>
            {g.label}
            {g.key === group && <motion.span layoutId="emoji-tab" className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-ink" />}
          </button>
        ))}
      </div>
      <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
        {current.list.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            className="grid aspect-square place-items-center rounded-xl text-[22px] leading-none transition hover:scale-110 hover:bg-paper-2 active:scale-95"
            aria-label={`插入表情 ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
