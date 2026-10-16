import Link from "next/link";
import { ViewTransition } from "react";
import clsx from "clsx";
import { Img } from "@/components/ui/Img";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { Series } from "@/lib/types";
import { seriesDate, seriesName } from "@/lib/naming";

type Props = {
  series: Series;
  ipName: string;
  /** 横向卡片 / 竖向卡片 */
  layout?: "portrait" | "square" | "wide";
  morph?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function SeriesCard({ series, ipName, layout = "square", morph = false, className, sizes, priority }: Props) {
  const n = seriesName(series);
  const d = seriesDate(series);
  const img = (
    <Img
      asset={series.cover}
      alt={`${n.name} ${n.kind}`}
      fill
      sizes={sizes ?? "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"}
      className="transition-transform duration-[1.1s] ease-[var(--ease-soft)] group-hover:scale-[1.05]"
      loading={priority ? "eager" : "lazy"}
    />
  );
  return (
    <Link
      href={`/series/${series.slug}`}
      transitionTypes={["nav-forward"]}
      className={clsx("group block", className)}
    >
      <div
        className={clsx(
          "relative overflow-hidden rounded-[1.6rem] bg-paper-2",
          layout === "portrait" ? "aspect-[4/5]" : layout === "wide" ? "aspect-[16/10]" : "aspect-square",
        )}
        style={{ backgroundColor: series.cover.color }}
      >
        {morph ? (
          <ViewTransition name={`series-cover-${series.id}`} share="morph" default="none">
            <div className="absolute inset-0">{img}</div>
          </ViewTransition>
        ) : (
          img
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur-md">
            {n.kind}
          </span>
          {series.secretCount > 0 && (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              含隐藏款
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <FavoriteButton
            item={{
              kind: "series",
              key: String(series.id),
              title: n.nameZh ?? n.name,
              subtitle: `${ipName} · ${n.kind}`,
              href: `/series/${series.slug}`,
              image: series.cover.src,
              color: series.cover.color,
            }}
          />
        </div>
      </div>
      <div className="mt-3.5 px-1">
        <div className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--t-ink)] opacity-70">
          <span className="uppercase tracking-[0.14em]">{ipName}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-current" />
          <span>{d.label === "官网上架" ? `上架 ${d.value}` : d.value}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[var(--t-ink)]">
          {n.nameZh ? (
            <>
              {n.nameZh} <span className="font-normal opacity-70">{n.name}</span>
            </>
          ) : (
            n.name
          )}
        </h3>
        <p className="mt-1 text-[13px] text-[var(--t-ink)] opacity-70">
          {series.products.length > 1 ? `${series.products.length} 款` : "单品"}
          {series.secretCount > 0 && ` · ${series.secretCount} 款隐藏`}
        </p>
      </div>
    </Link>
  );
}
