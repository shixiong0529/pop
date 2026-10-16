"use client";

import { useEffect } from "react";
import type { IPTheme } from "@/lib/types";
import { themeVars } from "@/lib/theme";

/** 把 IP 主题色同步到 <html>，让导航、页面背景与滚动回弹区域跟随展厅配色 */
export function PageTheme({ theme }: { theme: IPTheme }) {
  useEffect(() => {
    const root = document.documentElement;
    const vars = themeVars(theme) as Record<string, string>;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    root.dataset.theme = theme.dark ? "dark" : "light";
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
      delete root.dataset.theme;
    };
  }, [theme]);
  return null;
}
