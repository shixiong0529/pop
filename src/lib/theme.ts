import type { CSSProperties } from "react";
import type { IPTheme } from "./types";

/** 把 IP 主题转换为 CSS 变量（服务端 / 客户端通用） */
export function themeVars(t: IPTheme): CSSProperties {
  return {
    "--t-bg": t.bg,
    "--t-surface": t.surface,
    "--t-accent": t.accent,
    "--t-ink": t.ink,
    "--t-glow-1": t.glow[0],
    "--t-glow-2": t.glow[1],
  } as CSSProperties;
}
