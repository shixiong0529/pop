import Link from "next/link";
import { ViewTransition } from "react";
import clsx from "clsx";
import { Img } from "@/components/ui/Img";
import { TiltCard } from "@/components/motion/TiltCard";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { ImageAsset, IPContent } from "@/lib/types";
import type { IPStats } from "@/lib/data";

type Props = {
  ip: IPContent;
  cover?: ImageAsset;
  stats: IPStats;
  size?: "lg" | "md" | "sm";
  /** 为封面开启跨页面共享元素过渡（同一页面内名称需唯一） */
  morph?: boolean;
  priority?: boolean;
  className?: string;
};

export function IPCard({ ip, cover, stats, size = "md", morph = true, priority, className }: Props) {
  const t = ip.theme;
  const image = cover && (
    <Img
      asset={cover}
      alt={`${ip.name} 代表作品`}
      fill
      sizes={size === "lg" ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"}
      className="transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.06]"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
  return (
    <TiltCard className={clsx("group h-full", className)} max={size === "lg" ? 5 : 8}>
      <Link
        href={`/ips/${ip.slug}`}
        transitionTypes={["nav-forward"]}
        className="relative flex h-full flex-col overflow-hidden rounded-4xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        style={{ background: t.bg, color: t.ink }}
      >
        <div
          className={clsx(
            "relative overflow-hidden",
            size === "lg" ? "aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:flex-1" : "aspect-[4/5]",
          )}
        >
          {image &&
            (morph ? (
              <ViewTransition name={`ip-cover-${ip.slug}`} share="morph" default="none">
                <div className="absolute inset-0">{image}</div>
              </ViewTransition>
            ) : (
              image
            ))}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
            style={{ background: `linear-gradient(to top, ${t.bg}, ${t.bg}00)` }}
          />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md"
              style={{ background: `${t.surface}cc`, color: t.ink }}
            >
              {stats.series} 个系列 · {stats.products} 款
            </span>
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton
              item={{
                kind: "ip",
                key: ip.slug,
                title: ip.name,
                subtitle: ip.epithet,
                href: `/ips/${ip.slug}`,
                image: cover?.src ?? "",
                color: t.bg,
              }}
            />
          </div>
        </div>

        <div className={clsx("relative px-5 pb-5", size === "lg" ? "sm:px-8 sm:pb-8" : "")} style={{ transform: "translateZ(30px)" }}>
          <p className="eyebrow opacity-70">{ip.family ?? ip.artist.name}</p>
          <h3
            className={clsx(
              "mt-2 font-display font-black leading-[0.9] tracking-[-0.04em]",
              size === "lg" ? "text-[clamp(2.6rem,5vw,4.6rem)]" : "text-[clamp(1.8rem,2.6vw,2.4rem)]",
            )}
          >
            {ip.name}
          </h3>
          <p className="mt-2 text-sm font-medium opacity-75">
            {ip.nameZh ? `${ip.nameZh} · ` : ""}
            {ip.epithet}
          </p>
          {size === "lg" && <p className="mt-4 max-w-md text-[15px] leading-7 opacity-75">{ip.intro}</p>}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs font-medium opacity-70">
              {ip.debutYear ? `诞生于 ${ip.debutYear}` : ip.artist.name}
            </span>
            <span
              className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-45"
              style={{ background: t.ink, color: t.bg }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
