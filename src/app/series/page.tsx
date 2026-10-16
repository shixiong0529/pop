import type { Metadata } from "next";
import { SeriesBrowser } from "@/components/series/SeriesBrowser";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { Img } from "@/components/ui/Img";
import { getAllSeries, getCatalogStats, getIPs } from "@/lib/data";
import { toSeriesLite } from "@/lib/compact";

export const metadata: Metadata = {
  title: "系列图鉴",
  description: "泡泡玛特旗下全部 IP 的盲盒手办、搪胶毛绒、MEGA 珍藏与手办摆件系列图鉴，可按 IP、品类筛选，按时间与款式数排序。",
  alternates: { canonical: "/series" },
};

export default function SeriesIndexPage() {
  const ips = getIPs();
  const name = new Map(ips.map((ip) => [ip.slug, ip.name]));
  const all = getAllSeries();
  const stats = getCatalogStats();
  const series = all.map((s) => toSeriesLite(s, name.get(s.ip) ?? ""));
  const strip = all.filter((s) => s.products.length > 3).slice(0, 14);

  return (
    <div className="bg-paper">
      <header className="pt-[calc(var(--nav-h)+4rem)] md:pt-[calc(var(--nav-h)+6rem)]">
        <div className="container-page">
          <p className="eyebrow flex items-center gap-3 text-ink-mute">
            <span className="inline-block h-px w-6 bg-current" />
            The Collection
          </p>
          <h1 className="mt-6 font-display text-mega font-black">
            <SplitText text="系列图鉴" immediate stagger={0.06} />
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-2xl text-[16px] leading-8 text-ink-soft">
              {stats.series} 个系列、{stats.products} 款潮玩，按盲盒手办、搪胶毛绒、MEGA 珍藏与手办摆件归档。数据整理自泡泡玛特国际站公开商品页，日期优先采用官方发售日，缺失时标注为美国站上架时间。
            </p>
          </Reveal>
        </div>
        <div className="mt-14">
          <Marquee speed={70}>
            {strip.map((s) => (
              <div key={s.id} className="relative mx-2 h-40 w-40 shrink-0 overflow-hidden rounded-[1.4rem] sm:h-52 sm:w-52">
                <Img asset={s.cover} alt="" fill sizes="210px" />
              </div>
            ))}
          </Marquee>
        </div>
      </header>
      <div className="mt-14">
        <SeriesBrowser series={series} ips={ips.map((ip) => ({ slug: ip.slug, name: ip.name, color: ip.theme.accent }))} />
      </div>
    </div>
  );
}
