import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTheme } from "@/components/providers/PageTheme";
import { IPHero } from "@/components/ip/IPHero";
import { ChapterNav, type Chapter as ChapterInfo } from "@/components/ip/ChapterNav";
import { Chapter, Prose } from "@/components/ip/Chapter";
import { SeriesCard } from "@/components/cards/SeriesCard";
import { Img } from "@/components/ui/Img";
import { Timeline, type TimelineEntry } from "@/components/ui/Timeline";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCollection,
  getIP,
  getIPCover,
  getIPShowcase,
  getIPStats,
  getIPs,
  getSeriesById,
  getSeriesOfIP,
} from "@/lib/data";
import { seriesDate, seriesName } from "@/lib/naming";
import { themeVars } from "@/lib/theme";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return getIPs().map((ip) => ({ slug: ip.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ips/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ip = getIP(slug);
  if (!ip) return {};
  const cover = getIPCover(ip);
  const title = `${ip.name}${ip.nameZh ? `（${ip.nameZh}）` : ""} · 角色故事`;
  return {
    title,
    description: `${ip.intro} 创作者：${ip.artist.name}。`,
    alternates: { canonical: `/ips/${ip.slug}` },
    openGraph: { title, description: ip.tagline, images: cover ? [{ url: cover.src, width: cover.w, height: cover.h }] : undefined },
  };
}

const KIND_LABEL = { official: "官方", media: "媒体", wiki: "百科", interview: "访谈" } as const;

export default function IPPage({ params }: PageProps<"/ips/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <IPExhibition params={params} />
    </Suspense>
  );
}

async function IPExhibition({ params }: { params: PageProps<"/ips/[slug]">["params"] }) {
  const { slug } = await params;
  const ip = getIP(slug);
  if (!ip) notFound();

  const ips = getIPs();
  const idx = ips.findIndex((x) => x.slug === ip.slug);
  const nextIP = ips[(idx + 1) % ips.length];
  const stats = getIPStats(ip.slug);
  const cover = getIPCover(ip);
  const showcase = getIPShowcase(ip.slug, 8);
  const series = getSeriesOfIP(ip.slug);
  const collection = getCollection(ip.slug);
  const galleryShots = series.flatMap((s) => s.gallery.slice(1, 2)).slice(0, 3);

  // 时间轴：故事节点 + 有明确发售日期的系列
  const releases: (TimelineEntry & { sort: number })[] = series
    .filter((s) => s.releaseDate && s.products.length > 1)
    .slice(0, 10)
    .map((s) => {
      const n = seriesName(s);
      return {
        date: seriesDate(s).value.slice(0, 7),
        title: `${n.nameZh ?? n.name} ${n.kind}`,
        desc: `${s.products.length} 款${s.secretCount ? `，含 ${s.secretCount} 款隐藏款` : ""}`,
        href: `/series/${s.slug}`,
        kind: "release" as const,
        sort: Date.parse(s.releaseDate!),
      };
    });
  const story = ip.milestones.map((m) => ({
    date: m.date,
    title: m.title,
    desc: m.desc,
    sourceTitle: m.source?.title,
    sourceUrl: m.source?.url,
    kind: "story" as const,
    sort: /^\d{4}/.test(m.date) ? Date.parse(`${m.date.slice(0, 4)}-${m.date.slice(5, 7) || "01"}-01`) : -Infinity,
  }));
  const timeline = [...story, ...releases].sort((a, b) => a.sort - b.sort);

  const characters = (ip.characters ?? []).map((c) => ({ ...c, series: c.seriesId ? getSeriesById(c.seriesId) : undefined }));

  const chapters: ChapterInfo[] = [
    { id: "origin", no: "01", title: "起源" },
    { id: "world", no: "02", title: "世界观" },
    { id: "personality", no: "03", title: "性格" },
    ...(characters.length ? [{ id: "characters", no: "04", title: "角色" }] : []),
    { id: "timeline", no: characters.length ? "05" : "04", title: "发展历程" },
    { id: "collection", no: characters.length ? "06" : "05", title: "系列图鉴" },
  ];
  const no = Object.fromEntries(chapters.map((c) => [c.id, c.no]));

  return (
    <div style={themeVars(ip.theme)} className="bg-[var(--t-bg)] text-[var(--t-ink)]">
      <PageTheme theme={ip.theme} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: ip.name,
          alternateName: [ip.nameZh, ip.epithet].filter(Boolean),
          description: ip.intro,
          creator: { "@type": "Person", name: ip.artist.nameEn ?? ip.artist.name },
          dateCreated: ip.debutYear ? String(ip.debutYear) : undefined,
          image: cover ? `${SITE.url}${cover.src}` : undefined,
          url: `${SITE.url}/ips/${ip.slug}`,
        }}
      />
      <ChapterNav chapters={chapters} />
      <IPHero ip={ip} cover={cover} stats={stats} floaters={showcase.slice(1, 4)} />

      {/* 01 起源 */}
      <Chapter id="origin" no={no.origin} title="起源" en="Origin">
        <Prose paragraphs={ip.story.origin} />
        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-6 rounded-[2rem] bg-[var(--t-surface)] p-7 ring-1 ring-current/5 sm:grid-cols-[auto_1fr] sm:p-9">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--t-accent)] font-display text-3xl font-black text-white">
              {ip.artist.name.slice(0, 1)}
            </div>
            <div>
              <p className="eyebrow opacity-70">Artist · 创作者</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">
                {ip.artist.name}
                {ip.artist.nameEn && <span className="ml-3 text-base font-medium opacity-70">{ip.artist.nameEn}</span>}
              </p>
              {ip.artist.region && <p className="mt-1 text-sm opacity-70">{ip.artist.region}</p>}
              <p className="mt-4 text-[15px] leading-8 opacity-80">{ip.artist.bio}</p>
            </div>
          </div>
        </Reveal>
      </Chapter>

      {/* 引言 */}
      {ip.quote && (
        <section className="relative overflow-hidden py-[clamp(5rem,12vw,10rem)]">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[var(--t-surface)]" />
          <div className="container-page text-center">
            <Reveal>
              <span aria-hidden className="block font-serif text-[8rem] leading-[0.5] text-[var(--t-accent)]">“</span>
              <blockquote className="mx-auto mt-6 max-w-4xl font-zh-serif text-[clamp(1.6rem,3.6vw,3.2rem)] font-bold leading-[1.45] tracking-[-0.01em]">
                {ip.quote.text}
              </blockquote>
              <p className="mt-8 text-sm opacity-70">—— {ip.quote.by}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* 02 世界观 */}
      <Chapter id="world" no={no.world} title="世界观" en="The World">
        <Prose paragraphs={ip.story.world} />
        {collection?.desc && (
          <Reveal delay={0.1}>
            <figure className="mt-10 border-l-2 border-[var(--t-accent)] pl-6">
              <blockquote className="font-serif text-xl italic leading-relaxed opacity-85">“{collection.desc}”</blockquote>
              <figcaption className="mt-3 text-xs opacity-70">泡泡玛特国际站 {ip.name} 合集页官方简介（英文原文）</figcaption>
            </figure>
          </Reveal>
        )}
        {galleryShots.length >= 2 && (
          <div className="mt-14 grid grid-cols-6 gap-4">
            {galleryShots.map((g, i) => (
              <Parallax
                key={g.src}
                offset={[30, 70, 45][i]}
                className={["col-span-4 aspect-[4/5]", "col-span-2 mt-24 aspect-[3/4]", "col-span-3 col-start-2 -mt-10 aspect-square"][i]}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                  <Img asset={g} alt={`${ip.name} 系列场景图`} fill sizes="(min-width:1024px) 35vw, 60vw" />
                </div>
              </Parallax>
            ))}
          </div>
        )}
      </Chapter>

      {/* 03 性格 */}
      <Chapter id="personality" no={no.personality} title="性格" en="Personality">
        <Stagger className="mb-12 flex flex-wrap gap-3" stagger={0.08}>
          {ip.keywords.map((k, i) => (
            <StaggerItem key={k}>
              <span
                className="inline-block animate-float rounded-full px-6 py-3 font-zh-serif font-bold shadow-[0_14px_30px_-18px_rgba(0,0,0,0.4)]"
                style={{
                  fontSize: `${[1.6, 1.2, 1.4, 1.1, 1.3][i % 5]}rem`,
                  background: i % 2 ? "var(--t-surface)" : "var(--t-accent)",
                  color: i % 2 ? "var(--t-ink)" : "#fff",
                  animationDelay: `${-i * 1.3}s`,
                }}
              >
                {k}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
        <Prose paragraphs={ip.story.personality} />
      </Chapter>

      {/* 04 角色 */}
      {characters.length > 0 && (
        <Chapter id="characters" no={no.characters} title="角色" en="Characters" wide>
          <Stagger className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {characters.map((c) => (
              <StaggerItem key={c.name}>
                <TiltCard className="h-full" max={7}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-[var(--t-surface)] ring-1 ring-current/5">
                    <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--t-glow-1)" }}>
                      {c.series ? (
                        <Img asset={c.series.cover} alt={c.name} fill sizes="(min-width:1024px) 18vw, 45vw" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center font-display text-6xl font-black opacity-30">
                          {c.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <p className="font-display text-xl font-black tracking-tight">{c.name}</p>
                      <p className="mt-2 text-[13.5px] leading-6 opacity-70">{c.desc}</p>
                      {c.series && (
                        <Link href={`/series/${c.series.slug}`} className="mt-3 inline-block text-xs font-semibold underline underline-offset-4 opacity-70 hover:opacity-100">
                          查看手办
                        </Link>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </Chapter>
      )}

      {/* 发展历程 */}
      <Chapter id="timeline" no={no.timeline} title="发展历程" en="Timeline">
        <Reveal>
          <p className="mb-10 text-sm opacity-70">实心圆点为角色故事节点（附出处），空心圆点为图鉴中有明确发售日期的系列。</p>
        </Reveal>
        <Timeline entries={timeline} />
      </Chapter>

      {/* 系列图鉴 */}
      <Chapter id="collection" no={no.collection} title="系列图鉴" en="Collection" wide>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-[15px] leading-7 opacity-70">
            图鉴共收录 {ip.name} 的 {stats.series} 个系列、{stats.products} 款潮玩
            {stats.secrets ? `，其中隐藏款 ${stats.secrets} 款` : ""}。以下为最新的系列。
          </p>
          <ArrowLink href={`/ips/${ip.slug}/collection`} tone="solid">
            查看全部系列与单品
          </ArrowLink>
        </div>
        <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {series.slice(0, 8).map((s, i) => (
            <StaggerItem key={s.id}>
              <SeriesCard series={s} ipName={ip.name} morph priority={i < 2} />
            </StaggerItem>
          ))}
        </Stagger>
        {showcase.length > 4 && (
          <div className="mt-16 overflow-hidden rounded-[2rem] bg-[var(--t-surface)] p-6 sm:p-10">
            <p className="eyebrow opacity-70">Highlights · 单品速览</p>
            <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2">
              {showcase.map((p) => {
                const s = getSeriesById(p.seriesId)!;
                return (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="group w-40 shrink-0 sm:w-48">
                    <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: p.image.color }}>
                      <Img asset={p.image} alt={p.name} fill sizes="200px" className="transition duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs opacity-70">{seriesName(s).name}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Chapter>

      {/* 资料来源 */}
      <section className="pb-[clamp(4rem,8vw,7rem)]">
        <div className="container-page">
          <Reveal>
            <div className="rounded-[2rem] border border-current/10 p-7 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold">资料来源与核实状态</h2>
                <VerificationBadge status={ip.verification} withDesc />
              </div>
              <ol className="mt-6 grid gap-x-10 gap-y-3 text-[13.5px] md:grid-cols-2">
                {ip.sources.map((s, i) => (
                  <li key={s.url} className="flex gap-3">
                    <span className="tabular-nums opacity-40">{String(i + 1).padStart(2, "0")}</span>
                    <a href={s.url} target="_blank" rel="noreferrer" className="opacity-75 underline-offset-4 hover:underline hover:opacity-100">
                      {s.kind && <span className="mr-1.5 rounded bg-current/10 px-1.5 py-0.5 text-[10.5px] font-semibold">{KIND_LABEL[s.kind]}</span>}
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-xs leading-6 opacity-65">
                故事文字由本站根据上述资料整理、转述；标注为“本站解读”的段落为编辑观点。产品数据与图片来自泡泡玛特国际站公开页面。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 下一个展厅 */}
      <Link
        href={`/ips/${nextIP.slug}`}
        transitionTypes={["nav-forward"]}
        className="group relative block overflow-hidden"
        style={{ background: nextIP.theme.bg, color: nextIP.theme.ink }}
      >
        <div className="container-page flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-24">
          <div>
            <p className="eyebrow opacity-70">Next Exhibition · 下一个展厅</p>
            <p className="mt-4 font-display text-[clamp(3rem,9vw,8rem)] font-black leading-[0.85] tracking-[-0.05em] transition-transform duration-700 group-hover:translate-x-3">
              {nextIP.name}
            </p>
            <p className="mt-3 text-sm opacity-70">{nextIP.epithet}</p>
          </div>
          <span
            className="grid h-20 w-20 shrink-0 place-items-center rounded-full transition-transform duration-700 group-hover:-rotate-45 md:h-28 md:w-28"
            style={{ background: nextIP.theme.ink, color: nextIP.theme.bg }}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}
