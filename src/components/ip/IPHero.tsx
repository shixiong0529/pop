import Link from "next/link";
import { ViewTransition } from "react";
import { Img } from "@/components/ui/Img";
import { Parallax } from "@/components/motion/Parallax";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { ScrollCue } from "./ScrollCue";
import type { ImageAsset, IPContent, Product } from "@/lib/types";
import type { IPStats } from "@/lib/data";

export function IPHero({
  ip,
  cover,
  stats,
  floaters,
}: {
  ip: IPContent;
  cover?: ImageAsset;
  stats: IPStats;
  floaters: Product[];
}) {
  const meta = [
    { k: "创作者", v: ip.artist.name },
    ip.debutYear ? { k: "诞生", v: `${ip.debutYear} 年` } : null,
    ip.joinPopMartYear ? { k: "加入泡泡玛特", v: `${ip.joinPopMartYear} 年` } : null,
    { k: "收录", v: `${stats.series} 个系列 · ${stats.products} 款` },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <header className="relative isolate overflow-hidden pt-[var(--nav-h)]">
      {/* 背景大字 */}
      <Parallax offset={-120} className="pointer-events-none absolute inset-x-0 top-[12vh] -z-10 select-none">
        <p
          aria-hidden
          className="text-outline whitespace-nowrap text-center font-display text-[clamp(7rem,24vw,22rem)] font-black leading-none tracking-[-0.06em] opacity-[0.12]"
        >
          {ip.name}
        </p>
      </Parallax>
      <div aria-hidden className="absolute -right-[10%] top-[10%] -z-20 h-[60vmax] w-[60vmax] rounded-full bg-[var(--t-glow-1)] opacity-70 blur-[120px] animate-drift" />
      <div aria-hidden className="absolute -left-[15%] bottom-[-20%] -z-20 h-[50vmax] w-[50vmax] rounded-full bg-[var(--t-glow-2)] opacity-70 blur-[120px] animate-drift [animation-delay:-8s]" />

      <div className="container-page grid grid-cols-1 min-h-[calc(100svh-var(--nav-h))] items-center gap-12 pb-20 pt-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <nav aria-label="面包屑" className="flex items-center gap-2 text-[12px] font-medium opacity-70">
              <Link href="/ips" className="hover:underline" transitionTypes={["nav-back"]}>
                IP 系列馆
              </Link>
              <span>/</span>
              <span>{ip.name}</span>
            </nav>
          </Reveal>
          <p className="eyebrow mt-8 opacity-70">{ip.family ? `${ip.family} · ` : ""}Exhibition Hall</p>
          <h1 className="mt-4 font-display text-[clamp(3.6rem,10vw,9.5rem)] font-black leading-[0.84] tracking-[-0.055em]">
            <SplitText text={ip.name} immediate by={ip.name.includes(" ") ? "word" : "char"} stagger={0.04} />
          </h1>
          <Reveal delay={0.25}>
            <p className="mt-6 font-zh-serif text-[clamp(1.3rem,2.2vw,1.9rem)] font-bold">
              {ip.nameZh ? `${ip.nameZh} · ` : ""}
              {ip.epithet}
            </p>
            <p className="mt-4 max-w-lg text-[16px] leading-8 opacity-75">{ip.tagline}</p>
          </Reveal>
          <Reveal delay={0.35}>
            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-current/15 pt-6 sm:grid-cols-4">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="text-[11.5px] opacity-70">{m.k}</dt>
                  <dd className="mt-1 text-[14px] font-semibold">{m.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <FavoriteButton
                variant="pill"
                tone={ip.theme.dark ? "dark" : "light"}
                item={{
                  kind: "ip",
                  key: ip.slug,
                  title: ip.name,
                  subtitle: ip.epithet,
                  href: `/ips/${ip.slug}`,
                  image: cover?.src ?? "",
                  color: ip.theme.bg,
                }}
              />
              <Link
                href={`/ips/${ip.slug}/collection`}
                className="inline-flex h-12 items-center rounded-full bg-[var(--t-ink)] px-6 text-sm font-semibold text-[var(--t-bg)] transition hover:opacity-90"
              >
                浏览全部 {stats.series} 个系列
              </Link>
              <VerificationBadge status={ip.verification} />
            </div>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px]">
            {cover && (
              <ViewTransition name={`ip-cover-${ip.slug}`} share="morph" default="none">
                <div className="absolute inset-0 overflow-hidden rounded-[2.6rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.5)]">
                  <Img asset={cover} alt={`${ip.name} 代表作品`} fill sizes="(min-width:1024px) 40vw, 90vw" preload fetchPriority="high" quality={80} />
                </div>
              </ViewTransition>
            )}
            {floaters.slice(0, 3).map((p, i) => (
              <div
                key={p.slug}
                className={[
                  "absolute hidden overflow-hidden rounded-[1.3rem] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)] ring-4 ring-[var(--t-surface)] animate-float sm:block",
                  i === 0 && "-left-[14%] top-[12%] h-[24%] w-[30%] rotate-[-8deg]",
                  i === 1 && "-right-[10%] top-[40%] h-[22%] w-[28%] rotate-[7deg] [animation-delay:-2.5s]",
                  i === 2 && "-left-[6%] bottom-[-5%] h-[20%] w-[25%] rotate-[4deg] [animation-delay:-5s]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Img asset={p.image} alt="" fill sizes="180px" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ScrollCue />
    </header>
  );
}
