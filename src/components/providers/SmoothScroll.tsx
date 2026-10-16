"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Lenis 惯性平滑滚动；尊重“减少动态效果”与触屏原生滚动 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.95 });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 需要把实例暴露给子组件
    setLenis(instance);
    const loop = (t: number) => {
      instance.raf(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <Suspense fallback={null}>
        <ScrollReset lenis={lenis} />
      </Suspense>
      {children}
    </LenisContext.Provider>
  );
}

/** 路由切换后回到顶部（读取 pathname，需包在 Suspense 中） */
function ScrollReset({ lenis }: { lenis: Lenis | null }) {
  const pathname = usePathname();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);
  return null;
}
