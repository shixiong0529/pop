import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { PageTheme } from "@/components/providers/PageTheme";
import { Img } from "@/components/ui/Img";
import { MediaViewer } from "@/components/product/MediaViewer";
import { GalleryGrid } from "@/components/product/GalleryGrid";
import { SpecList } from "@/components/product/SpecList";
import { StoryNote } from "@/components/product/StoryNote";
import { ProductCard } from "@/components/cards/ProductCard";
import { SeriesCard } from "@/components/cards/SeriesCard";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllSeries, getIP, getProductsOfSeries, getRelatedSeries, getSeries } from "@/lib/data";
import { CATEGORY_LABEL, seriesDate, seriesFullName, seriesName } from "@/lib/naming";
import { themeVars } from "@/lib/theme";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/series/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getSeries(slug);
  if (!s) return {};
  const ip = getIP(s.ip);
  const title = `${seriesFullName(s)} · ${ip?.name ?? ""}`;
  return {
    title,
    description: `${ip?.name} ${seriesName(s).name} ${seriesName(s).kind}，共 ${s.products.length} 款${s.secretCount ? `（含 ${s.secretCount} 款隐藏款）` : ""}。${seriesDate(s).label} ${seriesDate(s).value}。`,
    alternates: { canonical: `/series/${s.slug}` },
    openGraph: { title, images: [{ url: s.cover.src, width: s.cover.w, height: s.cover.h }] },
  };
}

export default function SeriesPage({ params }: PageProps<"/series/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <SeriesView params={params} />
    </Suspense>
  );
}

async function SeriesView({ params }: { params: PageProps<"/series/[slug]">["params"] }) {
  const { slug } = await params;
  const s = getSeries(slug);
  if (!s) notFound();
  const ip = getIP(s.ip)!;
  const n = seriesName(s);
  const d = seriesDate(s);
  const products = getProductsOfSeries(s);
  const related = getRelatedSeries(s, 8);
  const single = products.length === 1;

  const images = s.gallery.map((g, i) => ({ ...g, alt: `${n.name} 图 ${i + 1}` }));

  return (
    <div style={themeVars(ip.theme)} className="bg-[var(--t-bg)] text-[var(--t-ink)]">
      <PageTheme theme={ip.theme} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: s.title,
          alternateName: n.nameZh,
          genre: CATEGORY_LABEL[s.category],
          image: `${SITE.url}${s.cover.src}`,
          datePublished: s.releaseDate,
          isPartOf: { "@type": "CreativeWork", name: ip.name, url: `${SITE.url}/ips/${ip.slug}` },
          url: `${SITE.url}/series/${s.slug}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "IP 系列馆", item: `${SITE.url}/ips` },
            { "@type": "ListItem", position: 2, name: ip.name, item: `${SITE.url}/ips/${ip.slug}` },
            { "@type": "ListItem", position: 3, name: n.name, item: `${SITE.url}/series/${s.slug}` },
          ],
        }}
      />

      <section className="container-page grid grid-cols-1 gap-10 pb-16 pt-[calc(var(--nav-h)+2rem)] lg:grid-cols-12 lg:gap-14 lg:pt-[calc(var(--nav-h)+3rem)]">
        <div className="lg:col-span-7">
          <MediaViewer
            images={images}
            hero={
              <ViewTransition name={`series-cover-${s.id}`} share="morph" default="none">
                <div className="absolute inset-0">
                  <Img asset={s.cover} alt={`${n.name} ${n.kind}`} fill sizes="(min-width:1024px) 55vw, 100vw" preload fetchPriority="high" quality={80} />
                </div>
              </ViewTransition>
            }
          />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <nav aria-label="面包屑" className="flex flex-wrap items-center gap-2 text-[12px] font-medium opacity-70">
              <Link href="/series" className="hover:underline">
                系列图鉴
              </Link>
              <span>/</span>
              <Link href={`/ips/${ip.slug}`} className="hover:underline" transitionTypes={["nav-back"]}>
                {ip.name}
              </Link>
            </nav>
            <p className="eyebrow mt-6 opacity-70">
              {ip.name} · {n.kind}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-black leading-[0.95] tracking-[-0.04em]">
              <SplitText text={n.nameZh ?? n.name} immediate by={/\s/.test(n.nameZh ?? n.name) ? "word" : "char"} stagger={0.03} />
            </h1>
            {n.nameZh && <p className="mt-2 text-xl font-semibold opacity-70">{n.name}</p>}
            <p className="mt-4 text-[13px] leading-6 opacity-70">官方名称：{s.title}</p>

            <Reveal delay={0.2} className="mt-8">
              <SpecList
                items={[
                  { k: d.label, v: d.label === "官网上架" ? `${d.value}（美国站上架时间）` : d.value },
                  { k: "品类", v: CATEGORY_LABEL[s.category] },
                  { k: "款式", v: single ? "单品" : `${products.length} 款${s.secretCount ? `（含 ${s.secretCount} 款隐藏款）` : ""}` },
                  { k: "整盒", v: s.boxesPerSet ? `${s.boxesPerSet} 个不重复盲盒` : undefined },
                  { k: "尺寸", v: s.size },
                  { k: "材质", v: s.material },
                  { k: "设计师", v: s.designer },
                ]}
              />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <FavoriteButton
                  variant="pill"
                  tone={ip.theme.dark ? "dark" : "light"}
                  item={{
                    kind: "series",
                    key: String(s.id),
                    title: n.nameZh ?? n.name,
                    subtitle: `${ip.name} · ${n.kind}`,
                    href: `/series/${s.slug}`,
                    image: s.cover.src,
                    color: s.cover.color,
                  }}
                />
                {single && (
                  <Link
                    href={`/products/${products[0].slug}`}
                    className="inline-flex h-12 items-center rounded-full bg-[var(--t-ink)] px-6 text-sm font-semibold text-[var(--t-bg)]"
                  >
                    查看单品详情
                  </Link>
                )}
                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold ring-1 ring-current/20 transition hover:ring-current/50"
                >
                  官网原页 ↗
                </a>
              </div>
              <p className="mt-6 text-[11.5px] leading-5 opacity-60">数据与图片来源：泡泡玛特国际站公开商品页，仅作学习展示。</p>
            </Reveal>
          </div>
        </div>
      </section>

      {!single && (
        <section className="py-[clamp(3rem,6vw,5rem)]">
          <div className="container-page">
            <SectionHeading
              eyebrow="Line-up"
              title={`全部款式 · ${products.length}`}
              desc={s.secretCount ? "隐藏款默认以剪影呈现，将鼠标移上或点击即可揭晓。" : undefined}
            />
            <Stagger className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" stagger={0.04}>
              {products.map((p) => (
                <StaggerItem key={p.slug}>
                  <ProductCard
                    product={p}
                    caption={`No.${String(p.index).padStart(2, "0")}${p.isSecret ? " · 隐藏款" : ""}`}
                    veil
                    morph
                    sizes="(min-width:1280px) 18vw, (min-width:640px) 30vw, 48vw"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {images.length > 1 && (
        <section className="py-[clamp(3rem,6vw,5rem)]">
          <div className="container-page">
            <SectionHeading eyebrow="Gallery" title="场景图集" desc="官方商品页中的场景与细节图，点击可全屏查看。" />
            <div className="mt-12">
              <GalleryGrid images={images} />
            </div>
          </div>
        </section>
      )}

      <StoryNote ip={ip} />

      {related.length > 0 && (
        <section className="pb-[clamp(4rem,8vw,7rem)]">
          <div className="container-page">
            <SectionHeading eyebrow="More Series" title="相关系列" />
            <div className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] mt-10 flex snap-x gap-5 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-2">
              {related.map((r) => (
                <div key={r.id} className="w-[64vw] shrink-0 snap-start sm:w-[34vw] lg:w-[22vw]">
                  <SeriesCard series={r} ipName={getIP(r.ip)?.name ?? ""} sizes="(min-width:1024px) 22vw, 64vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
