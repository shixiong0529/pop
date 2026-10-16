"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { SecretVeil } from "@/components/product/SecretVeil";
import { UpcomingBadge } from "@/components/ui/UpcomingBadge";
import type { ProductLite, SeriesLite } from "@/lib/compact";

/** 客户端列表用的系列卡片（数据精简版） */
export function LiteSeriesCard({ s, showIP = true, sizes }: { s: SeriesLite; showIP?: boolean; sizes?: string }) {
  return (
    <Link href={`/series/${s.slug}`} transitionTypes={["nav-forward"]} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem]" style={{ backgroundColor: s.cover.color }}>
        <Image
          src={s.cover.src}
          alt={`${s.name} ${s.kind}`}
          fill
          sizes={sizes ?? "(min-width:1280px) 22vw, (min-width:768px) 30vw, 48vw"}
          className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-soft)] group-hover:scale-[1.05]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur-md">{s.kind}</span>
          {s.secrets > 0 && (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">含隐藏款</span>
          )}
          <UpcomingBadge releaseAt={s.releaseAt} />
        </div>
        <div className="absolute right-3 top-3 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <FavoriteButton
            item={{
              kind: "series",
              key: String(s.id),
              title: s.nameZh ?? s.name,
              subtitle: `${s.ipName} · ${s.kind}`,
              href: `/series/${s.slug}`,
              image: s.cover.src,
              color: s.cover.color,
            }}
          />
        </div>
      </div>
      <div className="mt-3 px-1 text-[var(--t-ink)]">
        <p className="flex items-center gap-2 text-[11.5px] font-medium opacity-70">
          {showIP && (
            <>
              <span className="uppercase tracking-[0.14em]">{s.ipName}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
            </>
          )}
          <span>{s.dateLabel === "官网上架" ? `上架 ${s.dateValue}` : s.dateValue}</span>
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[16.5px] font-semibold leading-snug tracking-[-0.01em]">
          {s.nameZh ? (
            <>
              {s.nameZh} <span className="font-normal opacity-70">{s.name}</span>
            </>
          ) : (
            s.name
          )}
        </h3>
        <p className="mt-1 text-[13px] opacity-70">
          {s.count > 1 ? `${s.count} 款` : "单品"}
          {s.secrets > 0 && ` · ${s.secrets} 款隐藏`}
        </p>
      </div>
    </Link>
  );
}

/** 客户端列表用的单品卡片 */
export function LiteProductCard({ p, sizes, ratio = "square" }: { p: ProductLite; sizes?: string; ratio?: "square" | "natural" }) {
  const img = (
    <Image
      src={p.image.src}
      alt=""
      fill
      sizes={sizes ?? "(min-width:1280px) 18vw, (min-width:768px) 25vw, 48vw"}
      className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-soft)] group-hover:scale-[1.06]"
    />
  );
  return (
    <Link href={`/products/${p.slug}`} transitionTypes={["nav-forward"]} className="group block">
      <div
        className={clsx("relative overflow-hidden rounded-[1.3rem]", ratio === "square" && "aspect-square")}
        style={{ backgroundColor: p.image.color, aspectRatio: ratio === "natural" ? `${p.image.w} / ${p.image.h}` : undefined }}
      >
        {p.isSecret ? <SecretVeil>{img}</SecretVeil> : img}
        {p.isSecret && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.12em] text-white">
            SECRET
          </span>
        )}
        <div className="absolute right-2.5 top-2.5 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <FavoriteButton
            item={{
              kind: "product",
              key: p.slug,
              title: p.name,
              subtitle: p.seriesName,
              href: `/products/${p.slug}`,
              image: p.image.src,
              color: p.image.color,
            }}
          />
        </div>
      </div>
      <div className="mt-2.5 px-0.5 text-[var(--t-ink)]">
        <h3 className="line-clamp-1 text-[14.5px] font-semibold">{p.isSecret ? "隐藏款" : p.name}</h3>
        <p className="line-clamp-1 text-[12px] opacity-70">{p.seriesName}</p>
      </div>
    </Link>
  );
}
