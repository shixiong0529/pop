"use client";

import { useEffect, useRef } from "react";

/** 滚动到底部自动加载更多（同时提供按钮兜底） */
export function LoadMore({ onMore, remaining }: { onMore: () => void; remaining: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || remaining <= 0) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && onMore(), { rootMargin: "600px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onMore, remaining]);
  if (remaining <= 0) return null;
  return (
    <div ref={ref} className="mt-14 flex justify-center">
      <button onClick={onMore} className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-current/20 hover:ring-current/50">
        加载更多（剩余 {remaining}）
      </button>
    </div>
  );
}
