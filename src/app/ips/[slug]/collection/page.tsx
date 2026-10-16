import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTheme } from "@/components/providers/PageTheme";
import { CollectionBrowser } from "@/components/ip/CollectionBrowser";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Img } from "@/components/ui/Img";
import { getCollection, getIP, getIPStats, getIPs, getProductsOfSeries, getSeriesOfIP } from "@/lib/data";
import { toProductLite, toSeriesLite } from "@/lib/compact";
import { themeVars } from "@/lib/theme";

export function generateStaticParams() {
  return getIPs().map((ip) => ({ slug: ip.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ips/[slug]/collection">): Promise<Metadata> {
  const { slug } = await params;
  const ip = getIP(slug);
  if (!ip) return {};
  const st = getIPStats(slug);
  return {
    title: `${ip.name} 系列图鉴`,
    description: `${ip.name} 全部 ${st.series} 个系列、${st.products} 款潮玩图鉴，可按品类、年份浏览，支持隐藏款筛选。`,
    alternates: { canonical: `/ips/${slug}/collection` },
  };
}

export default function CollectionPage({ params }: PageProps<"/ips/[slug]/collection">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <CollectionView params={params} />
    </Suspense>
  );
}

async function CollectionView({ params }: { params: PageProps<"/ips/[slug]/collection">["params"] }) {
  const { slug } = await params;
  const ip = getIP(slug);
  if (!ip) notFound();
  const st = getIPStats(ip.slug);
  const list = getSeriesOfIP(ip.slug);
  const banner = getCollection(ip.slug)?.banner;
  const series = list.map((s) => toSeriesLite(s, ip.name));
  const products = list.flatMap((s) => getProductsOfSeries(s).map((p) => toProductLite(p, s)));

  return (
    <div style={themeVars(ip.theme)} className="min-h-svh bg-[var(--t-bg)] text-[var(--t-ink)]">
      <PageTheme theme={ip.theme} />
      <header className="relative overflow-hidden pt-[var(--nav-h)]">
        {banner && (
          <div className="absolute inset-x-0 top-0 -z-0 h-[340px] opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]">
            <Img asset={banner} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        )}
        <div className="container-page relative pb-12 pt-14">
          <nav aria-label="面包屑" className="flex items-center gap-2 text-[12px] font-medium opacity-70">
            <Link href="/ips" className="hover:underline">
              IP 系列馆
            </Link>
            <span>/</span>
            <Link href={`/ips/${ip.slug}`} className="hover:underline" transitionTypes={["nav-back"]}>
              {ip.name}
            </Link>
            <span>/</span>
            <span>系列图鉴</span>
          </nav>
          <p className="eyebrow mt-8 opacity-70">Collection · {ip.epithet}</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] font-black leading-[0.88] tracking-[-0.05em]">
            <SplitText text={`${ip.name} 图鉴`} by="word" immediate />
          </h1>
          <Reveal delay={0.25} className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            {[
              [st.series, "个系列"],
              [st.products, "款潮玩"],
              [st.secrets, "款隐藏款"],
              [st.firstYear && st.latestYear ? `${st.firstYear}–${st.latestYear}` : "—", "发售年份（有明确日期的系列）"],
            ].map(([v, l]) => (
              <div key={String(l)}>
                <span className="font-display text-3xl font-black tabular-nums tracking-tight">{v}</span>
                <span className="ml-2 opacity-70">{l}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </header>
      <CollectionBrowser series={series} products={products} />
    </div>
  );
}
