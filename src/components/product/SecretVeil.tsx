"use client";

import { useState, type ReactNode } from "react";

/** 隐藏款剪影：悬停或点击（触屏）后揭晓 */
export function SecretVeil({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      className="absolute inset-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setRevealed(true)}
      onClick={(e) => {
        if (!revealed) {
          e.preventDefault();
          setRevealed(true);
        }
      }}
    >
      <div className="secret-veil absolute inset-0" data-revealed={revealed}>
        {children}
      </div>
      <span
        className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold tracking-[0.2em] text-white/85 transition-opacity duration-500"
        style={{ opacity: revealed ? 0 : 1 }}
      >
        ？ 隐藏款 · 点击揭晓
      </span>
    </div>
  );
}
