import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { PageTheme } from "@/components/providers/PageTheme";
import { Img } from "@/components/ui/Img";
import { MediaViewer } from "@/components/product/MediaViewer";
import { SpecList } from "@/components/product/SpecList";
import { StoryNote } from "@/components/product/StoryNote";
import { ProductCard } from "@/components/cards/ProductCard";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { UpcomingBadge } from "@/components/ui/UpcomingBadge";
import { getFeaturedProducts, getIP, getProduct, getProductsOfSeries, getRelatedProducts, getSeriesById } from "@/lib/data";
import { CATEGORY_LABEL, seriesDate, seriesName } from "@/lib/naming";
import { themeVars } from "@/lib/theme";
import { SITE } from "@/lib/site";

// 只预生成首页精选展台里的产品；其余 2000+ 个产品页在第一次被访问时生成并缓存，
// 这样构建时间不会随产品数量增长（站点地图仍然列出全部产品）。
export function generateStaticParams() {
  return [...new Set(getFeaturedProducts(14).map((p) => p.slug))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const s = getSeriesById(p.seriesId)!;
  const ip = getIP(p.ip);
  const n = seriesName(s);
  const title = `${p.name}${p.isSecret ? "（隐藏款）" : ""} · ${ip?.name} ${n.nameZh ?? n.name}`;
  return {
    title,
    description: `${ip?.name} ${n.nameZh ?? n.name} ${n.kind}中的${p.isSecret ? "隐藏款" : "一款"}「${p.name}」。${s.size ? `尺寸：${s.size}。` : ""}`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title, images: [{ url: p.image.src, width: p.image.w, height: p.image.h }] },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ProductView params={params} />
    </Suspense>
  );
}

async function ProductView({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const s = getSeriesById(p.seriesId)!;
  const ip = getIP(p.ip)!;
  const n = seriesName(s);
  const d = seriesDate(s);
  const siblings = getProductsOfSeries(s);
  const pos = siblings.findIndex((x) => x.slug === p.slug);
  const prev = siblings[(pos - 1 + siblings.length) % siblings.length];
  const next = siblings[(pos + 1) % siblings.length];
  const related = getRelatedProducts(p, 10);
  const single = siblings.length === 1;

  const images = [
    { ...p.image, alt: p.name },
    ...s.gallery.filter((g) => g.src !== p.image.src).map((g, i) => ({ ...g, alt: `${n.name} 场景图 ${i + 1}` })),
  ];

  return (
    <div style={themeVars(ip.theme)} className="bg-[var(--t-bg)] text-[var(--t-ink)]">
      <PageTheme theme={ip.theme} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.name,
          image: `${SITE.url}${p.image.src}`,
          genre: CATEGORY_LABEL[s.category],
          datePublished: s.releaseDate,
          isPartOf: { "@type": "CreativeWork", name: s.title, url: `${SITE.url}/series/${s.slug}` },
          url: `${SITE.url}/products/${p.slug}`,
        }}
      />

      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute -right-[20%] -top-[30%] -z-10 h-[70vmax] w-[70vmax] rounded-full bg-[var(--t-glow-1)] opacity-65 blur-[120px]" />
        <div className="container-page grid grid-cols-1 gap-10 pb-16 pt-[calc(var(--nav-h)+2rem)] lg:grid-cols-12 lg:gap-14 lg:pt-[calc(var(--nav-h)+3rem)]">
          <div className="lg:col-span-7">
            <MediaViewer
              images={images}
              hero={
                <ViewTransition name={`product-${p.slug}`} share="morph" default="none">
                  <div className="absolute inset-0">
                    <Img asset={p.image} alt={p.name} fill sizes="(min-width:1024px) 55vw, 100vw" preload fetchPriority="high" quality={80} />
                  </div>
                </ViewTransition>
              }
            />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
              <nav aria-label="面包屑" className="flex flex-wrap items-center gap-2 text-[12px] font-medium opacity-70">
                <Link href={`/ips/${ip.slug}`} className="hover:underline" transitionTypes={["nav-back"]}>
                  {ip.name}
                </Link>
                <span>/</span>
                <Link href={`/series/${s.slug}`} className="hover:underline" transitionTypes={["nav-back"]}>
                  {n.nameZh ?? n.name}
                </Link>
              </nav>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {!single && (
                  <span className="rounded-full bg-current/[0.07] px-3 py-1 text-[12px] font-semibold tabular-nums">
                    No.{String(p.index).padStart(2, "0")} / {String(siblings.length).padStart(2, "0")}
                  </span>
                )}
                {p.isSecret && (
                  <span className="rounded-full bg-[var(--t-ink)] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[var(--t-bg)]">
                    SECRET 隐藏款
                  </span>
                )}
                <span className="rounded-full px-3 py-1 text-[12px] font-medium ring-1 ring-current/15">{n.kind}</span>
                <UpcomingBadge releaseAt={s.releaseAt} variant="detail" />
              </div>

              <h1 className="mt-5 font-display text-[clamp(2.6rem,5vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">
                <SplitText text={p.name} immediate by={/\s/.test(p.name) ? "word" : "char"} stagger={0.03} />
              </h1>
              <p className="mt-4 text-[15px] opacity-70">
                出自{" "}
                <Link href={`/series/${s.slug}`} className="font-semibold underline underline-offset-4">
                  {n.nameZh ? `${n.nameZh}（${n.name}）` : n.name}
                </Link>
              </p>

              <Reveal delay={0.2} className="mt-8">
                <SpecList
                  items={[
                    { k: "所属 IP", v: `${ip.name}${ip.nameZh ? ` · ${ip.nameZh}` : ""}` },
                    { k: d.label, v: d.label === "官网上架" ? `${d.value}（美国站上架时间）` : d.value },
                    { k: "系列款式", v: single ? "单品" : `${siblings.length} 款${s.secretCount ? `，含 ${s.secretCount} 款隐藏款` : ""}` },
                    { k: "尺寸", v: s.size },
                    { k: "材质", v: s.material },
                  ]}
                />
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <FavoriteButton
                    variant="pill"
                    tone={ip.theme.dark ? "dark" : "light"}
                    item={{
                      kind: "product",
                      key: p.slug,
                      title: p.name,
                      subtitle: `${ip.name} · ${n.nameZh ?? n.name}`,
                      href: `/products/${p.slug}`,
                      image: p.image.src,
                      color: p.image.color,
                    }}
                  />
                  <a
                    href={s.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold ring-1 ring-current/20 transition hover:ring-current/50"
                  >
                    官网原页 ↗
                  </a>
                </div>

                {!single && (
                  <div className="mt-10 flex items-center justify-between gap-4 border-t border-current/10 pt-6 text-sm">
                    <Link href={`/products/${prev.slug}`} transitionTypes={["nav-back"]} className="group flex items-center gap-3">
                      <span className="relative h-12 w-12 overflow-hidden rounded-xl" style={{ background: prev.image.color }}>
                        <Img asset={prev.image} alt="" fill sizes="48px" className={prev.isSecret ? "secret-veil" : ""} />
                      </span>
                      <span>
                        <span className="block text-[11px] opacity-65">← 上一款</span>
                        <span className="font-semibold group-hover:underline">{prev.isSecret ? "隐藏款" : prev.name}</span>
                      </span>
                    </Link>
                    <Link href={`/products/${next.slug}`} transitionTypes={["nav-forward"]} className="group flex items-center gap-3 text-right">
                      <span>
                        <span className="block text-[11px] opacity-65">下一款 →</span>
                        <span className="font-semibold group-hover:underline">{next.isSecret ? "隐藏款" : next.name}</span>
                      </span>
                      <span className="relative h-12 w-12 overflow-hidden rounded-xl" style={{ background: next.image.color }}>
                        <Img asset={next.image} alt="" fill sizes="48px" className={next.isSecret ? "secret-veil" : ""} />
                      </span>
                    </Link>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <StoryNote ip={ip} />

      {!single && (
        <section className="pb-[clamp(3rem,6vw,5rem)]">
          <div className="container-page">
            <SectionHeading eyebrow="Same Series" title="同系列其他款式" desc={`${n.nameZh ?? n.name} 共 ${siblings.length} 款，隐藏款以剪影呈现。`} />
            <Stagger className="mt-10 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6" stagger={0.03}>
              {siblings
                .filter((x) => x.slug !== p.slug)
                .map((x) => (
                  <StaggerItem key={x.slug}>
                    <ProductCard product={x} veil sizes="(min-width:1024px) 15vw, (min-width:640px) 24vw, 32vw" rounded="rounded-2xl" />
                  </StaggerItem>
                ))}
            </Stagger>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="pb-[clamp(4rem,8vw,7rem)]">
          <div className="container-page">
            <SectionHeading eyebrow="You May Also Like" title="你可能也喜欢" />
            <div className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] mt-10 flex snap-x gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-2">
              {related.map((r) => {
                const rs = getSeriesById(r.seriesId)!;
                return (
                  <div key={r.slug} className="w-[44vw] shrink-0 snap-start sm:w-[28vw] lg:w-[17vw]">
                    <ProductCard product={r} caption={`${getIP(r.ip)?.name} · ${seriesName(rs).name}`} sizes="(min-width:1024px) 17vw, 44vw" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
