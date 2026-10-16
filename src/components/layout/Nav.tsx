"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import clsx from "clsx";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useUI } from "@/lib/ui-store";
import { useFavorites } from "@/lib/favorites";
import { useHydrated } from "@/lib/use-hydrated";

const LINKS = [
  { href: "/", label: "首页", en: "Home" },
  { href: "/ips", label: "IP 系列馆", en: "IP Gallery" },
  { href: "/series", label: "系列图鉴", en: "Collection" },
  { href: "/about", label: "关于本站", en: "About" },
];

export type NavIP = { slug: string; name: string; nameZh: string; color: string };

export function Nav({ ips }: { ips: NavIP[] }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const setSearch = useUI((s) => s.setSearch);
  const favCount = useFavorites((s) => s.items.length);
  const hydrated = useHydrated();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev + 2 && !menuOpen);
    if (y < prev - 2) setHidden(false);
  });

  // ⌘K / Ctrl+K 唤起搜索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(!useUI.getState().searchOpen);
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearch]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={clsx(
            "transition-[background-color,box-shadow,backdrop-filter] duration-500",
            scrolled || menuOpen
              ? "bg-[color-mix(in_oklab,var(--t-bg)_74%,transparent)] shadow-[0_1px_0_0_color-mix(in_oklab,var(--t-ink)_8%,transparent)] backdrop-blur-xl backdrop-saturate-150"
              : "bg-transparent",
          )}
        >
          <nav className="container-page flex h-[var(--nav-h)] items-center justify-between text-[var(--t-ink)]">
            <Link href="/" className="relative z-10" transitionTypes={["nav-back"]}>
              <Logo />
            </Link>

            <Suspense fallback={<DesktopLinks pathname="" />}>
              <ActiveDesktopLinks />
            </Suspense>

            <div className="relative z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearch(true)}
                className="group flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-medium ring-1 ring-[color-mix(in_oklab,var(--t-ink)_14%,transparent)] transition hover:ring-[color-mix(in_oklab,var(--t-ink)_35%,transparent)] sm:pr-2.5"
                aria-label="搜索（⌘K）"
              >
                <SearchIcon />
                <span className="hidden opacity-70 sm:inline">搜索 IP、系列、产品</span>
                <kbd className="hidden rounded-md bg-[color-mix(in_oklab,var(--t-ink)_8%,transparent)] px-1.5 py-0.5 font-sans text-[11px] opacity-70 md:inline">
                  ⌘K
                </kbd>
              </button>
              <Link
                href="/favorites"
                className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-[color-mix(in_oklab,var(--t-ink)_7%,transparent)]"
                aria-label={`我的收藏${hydrated && favCount ? `（${favCount}）` : ""}`}
              >
                <HeartIcon />
                <AnimatePresence>
                  {hydrated && favCount > 0 && (
                    <motion.span
                      key={favCount}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#ff4d5e] px-1 text-[10px] font-bold text-white"
                    >
                      {favCount > 99 ? "99+" : favCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full lg:hidden"
                aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
                aria-expanded={menuOpen}
                onClick={() => setMenu(!menuOpen)}
              >
                <span className="relative block h-3 w-5">
                  <motion.span
                    className="absolute left-0 top-0 h-[1.6px] w-5 rounded bg-current"
                    animate={menuOpen ? { y: 5.5, rotate: 45 } : { y: 0, rotate: 0 }}
                  />
                  <motion.span
                    className="absolute bottom-0 left-0 h-[1.6px] w-5 rounded bg-current"
                    animate={menuOpen ? { y: -5.5, rotate: -45 } : { y: 0, rotate: 0 }}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <Suspense fallback={null}>
        <CloseMenuOnRoute />
      </Suspense>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 overflow-y-auto bg-[var(--t-bg)] pt-[var(--nav-h)] text-[var(--t-ink)] lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 36px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="container-page flex min-h-full flex-col pb-10 pt-6">
              <ul className="space-y-1">
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={l.href} className="flex items-baseline justify-between border-b border-[color-mix(in_oklab,var(--t-ink)_10%,transparent)] py-4">
                      <span className="font-display text-4xl font-bold tracking-tight">{l.label}</span>
                      <span className="eyebrow opacity-65">{l.en}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-10"
              >
                <p className="eyebrow mb-4 opacity-65">热门 IP</p>
                <div className="flex flex-wrap gap-2">
                  {ips.map((ip) => (
                    <Link
                      key={ip.slug}
                      href={`/ips/${ip.slug}`}
                      className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ring-1 ring-[color-mix(in_oklab,var(--t-ink)_12%,transparent)]"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ip.color }} />
                      {ip.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActiveDesktopLinks() {
  return <DesktopLinks pathname={usePathname()} />;
}

function DesktopLinks({ pathname }: { pathname: string }) {
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1 lg:flex">
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className={clsx(
              "relative block rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-300",
              isActive(l.href) ? "text-[var(--t-bg)]" : "opacity-75 hover:opacity-100",
            )}
          >
            {isActive(l.href) && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[var(--t-ink)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 路由变化时关闭移动端菜单 */
function CloseMenuOnRoute() {
  const pathname = usePathname();
  const setMenu = useUI((s) => s.setMenu);
  useEffect(() => {
    setMenu(false);
  }, [pathname, setMenu]);
  return null;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.7 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4c3.6 0 5.9 3.6 4.6 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
