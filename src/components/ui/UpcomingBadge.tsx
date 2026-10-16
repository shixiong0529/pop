"use client";

import clsx from "clsx";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
// 精确到分钟，保证同一分钟内快照稳定
const getNow = () => Math.floor(Date.now() / 60_000) * 60;
const getServerNow = () => null;

const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** 北京时间，固定格式“10月23日 08:00”（不依赖浏览器的本地化格式） */
function beijingTime(sec: number) {
  const p = Object.fromEntries(parts.formatToParts(new Date(sec * 1000)).map((x) => [x.type, x.value]));
  return `${p.month}月${p.day}日 ${p.hour}:${p.minute}`;
}

/**
 * “即将发售”标记：在浏览器端按当前时间判断，过了官网发售时刻自动消失，无需重新构建。
 * 服务端渲染时不输出，避免与静态页面的生成时间绑定。
 */
export function UpcomingBadge({
  releaseAt,
  variant = "chip",
  className,
}: {
  /** 官网发售时刻（Unix 秒） */
  releaseAt?: number;
  variant?: "chip" | "detail";
  className?: string;
}) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  if (!releaseAt || now === null || now >= releaseAt) return null;

  if (variant === "chip") {
    return (
      <span className={clsx("rounded-full bg-pop px-2.5 py-1 text-[11px] font-semibold text-white", className)}>即将发售</span>
    );
  }
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-pop px-3 py-1 text-[12px] font-semibold text-white",
        className,
      )}
    >
      即将发售 · 北京时间 {beijingTime(releaseAt)}
    </span>
  );
}
