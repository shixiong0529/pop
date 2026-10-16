import Link from "next/link";
import { HeroShowcase, type HeroSlide } from "@/components/home/HeroShowcase";
import { FeaturedRing } from "@/components/home/FeaturedRing";
import { IPCard } from "@/components/cards/IPCard";
import { SeriesCard } from "@/components/cards/SeriesCard";
import { Marquee } from "@/components/motion/Marquee";
import { CountUp } from "@/components/motion/CountUp";
import { HorizontalScroll } from "@/components/motion/HorizontalScroll";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Timeline } from "@/components/ui/Timeline";
import { Img } from "@/components/ui/Img";
import { BRAND_TIMELINE } from "@/content/brand";
import {
  getCatalogStats,
  getFeaturedProducts,
  getIP,
  getIPCover,
  getIPShowcase,
  getIPStats,
  getIPs,
  getLatestSeries,
  getSeriesById,
} from "@/lib/data";
import { seriesName } from "@/lib/naming";

const HERO_IPS = ["labubu", "molly", "dimoo", "hirono", "crybaby", "twinkle-twinkle"];

export default function Home() {
  const ips = getIPs();
  const stats = getCatalogStats();
  const ipName = new Map(ips.map((ip) => [ip.slug, ip.name]));

  const slides: HeroSlide[] = HERO_IPS.map((slug) => getIP(slug)!)
    .filter(Boolean)
    .map((ip) => {
      const st = getIPStats(ip.slug);
      const showcase = getIPShowcase(ip.slug, 4);
      return {
        slug: ip.slug,
        name: ip.name,
        epithet: ip.epithet,
        tagline: ip.tagline,
        artist: ip.artist.name,
        theme: ip.theme,
        cover: getIPCover(ip)!,
        side: showcase.slice(1, 3).map((p) => p.image),
        stats: { series: st.series, products: st.products },
      };
    })
    .filter((s) => s.cover);

  const core = ips.filter((ip) => ip.tier === "core");
  const others = ips.filter((ip) => ip.tier !== "core");
  const latest = getLatestSeries(9);
  const featured = getFeaturedProducts(14).map((p) => {
    const s = getSeriesById(p.seriesId)!;
    return { slug: p.slug, name: p.name, caption: `${ipName.get(p.ip)} · ${seriesName(s).name}`, image: p.image };
  });

  return (
    <>
      <HeroShowcase slides={slides} total={stats} />

      {/* IP 跑马灯 */}
      <section aria-label="IP 一览" className="border-y border-line bg-paper py-7">
        <Marquee speed={55} pauseOnHover>
          {ips.map((ip) => (
            <Link
              key={ip.slug}
              href={`/ips/${ip.slug}`}
              className="group flex items-center gap-6 px-6 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-black tracking-[-0.04em]"
            >
              <span className="text-outline text-ink/60 transition-colors duration-500 group-hover:text-ink group-hover:[-webkit-text-fill-color:currentColor]">
                {ip.name}
              </span>
              <span className="h-3 w-3 rounded-full" style={{ background: ip.theme.accent }} />
            </Link>
          ))}
        </Marquee>
      </section>

      {/* 开篇 */}
      <section className="bg-paper py-[clamp(6rem,14vw,12rem)]">
        <div className="container-page grid grid-cols-1 gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-ink-mute">
              <span className="inline-block h-px w-6 bg-current" />
              A Gallery of Art Toys
            </p>
            <h2 className="mt-6 font-zh-serif text-[clamp(2rem,4.4vw,4.2rem)] font-bold leading-[1.18] tracking-[-0.02em]">
              每一只潮玩背后，
              <br />
              都有一个被认真讲述的
              <span className="whitespace-nowrap font-serif italic text-pop">角色</span>。
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="self-end lg:col-span-5">
            <p className="text-[16px] leading-8 text-ink-soft">
              POP ATLAS 以展览馆的方式，整理泡泡玛特旗下 IP 的诞生、世界观与性格，再把每一个系列、每一款潮玩收进可检索的图鉴。故事均注明出处，产品资料来自泡泡玛特国际站公开页面。
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { v: stats.ips, l: "个 IP" },
                { v: stats.series, l: "个系列" },
                { v: stats.products, l: "款潮玩" },
                { v: stats.secrets, l: "款隐藏款" },
              ].map((s) => (
                <div key={s.l} className="border-t border-line pt-4">
                  <CountUp value={s.v} className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-black tabular-nums tracking-[-0.04em]" />
                  <p className="mt-1 text-sm text-ink-mute">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 热门 IP */}
      <section className="bg-paper pb-[clamp(5rem,10vw,9rem)]">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured IP"
            title="热门 IP 展厅"
            desc="六位最具代表性的角色，各自拥有一座专属展厅。点击卡片，走进他们的故事世界。"
            action={<ArrowLink href="/ips">进入 IP 系列馆</ArrowLink>}
          />
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {core.map((ip, i) => {
              const wide = i === 0 || i === core.length - 1;
              return (
                <StaggerItem key={ip.slug} className={wide ? "md:col-span-2" : ""}>
                  <IPCard ip={ip} cover={getIPCover(ip)} stats={getIPStats(ip.slug)} size={wide ? "lg" : "md"} priority={i === 0} />
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 最新系列 */}
      <section className="bg-ink text-white">
        <HorizontalScroll
          header={
            <div className="flex flex-col gap-6 pt-20 md:flex-row md:items-end md:justify-between lg:pt-0">
              <div>
                <p className="eyebrow flex items-center gap-3 opacity-70">
                  <span className="inline-block h-px w-6 bg-current" />
                  New Releases
                </p>
                <h2 className="mt-4 font-display text-title font-bold">最新系列</h2>
                <p className="mt-4 max-w-lg text-[15px] leading-7 opacity-70">按发售时间排列，每个 IP 选取最新的一个系列。</p>
              </div>
              <ArrowLink href="/series" className="self-start text-white [--t-bg:#141416] [--t-ink:#fff] md:self-auto">
                查看全部系列
              </ArrowLink>
            </div>
          }
        >
          {latest.map((s, i) => (
            <div key={s.id} className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[min(30vw,420px)]">
              <div className="[--t-ink:#ffffff]">
                <SeriesCard series={s} ipName={ipName.get(s.ip) ?? ""} layout="portrait" sizes="(min-width:1024px) 30vw, 78vw" priority={i < 2} />
              </div>
            </div>
          ))}
        </HorizontalScroll>
        <div className="h-16 lg:h-24" />
      </section>

      {/* 3D 精选展台 */}
      <section className="relative overflow-hidden bg-paper-2 py-[clamp(5rem,10vw,9rem)]">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Curated Picks"
            title={
              <>
                精选潮玩 <span className="font-serif font-normal italic">· 旋转展台</span>
              </>
            }
            desc="拖动或滑动展台浏览，点击任意展品查看详情。"
          />
        </div>
        <div className="mt-6">
          <FeaturedRing items={featured} />
        </div>
      </section>

      {/* 更多 IP */}
      <section className="bg-paper py-[clamp(5rem,10vw,9rem)]">
        <div className="container-page">
          <SectionHeading
            eyebrow="More to Discover"
            title="更多角色，等你认识"
            desc="从送梦的星星人到朋克少女乐队，泡泡玛特的角色宇宙远比你想象的辽阔。"
            action={<ArrowLink href="/ips">全部 {ips.length} 个 IP</ArrowLink>}
          />
          <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" stagger={0.04}>
            {others.map((ip) => {
              const cover = getIPCover(ip);
              const st = getIPStats(ip.slug);
              return (
                <StaggerItem key={ip.slug}>
                  <Link
                    href={`/ips/${ip.slug}`}
                    transitionTypes={["nav-forward"]}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-[1.4rem]"
                    style={{ background: ip.theme.bg, color: ip.theme.ink }}
                  >
                    {cover && (
                      <Img
                        asset={cover}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 16vw, (min-width:640px) 30vw, 48vw"
                        className="opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(180deg, ${ip.theme.bg}00 35%, ${ip.theme.bg}f2 82%)` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-lg font-black leading-none tracking-[-0.03em]">{ip.name}</p>
                      <p className="mt-1.5 text-[12px] font-medium opacity-70">
                        {ip.nameZh ?? ip.epithet} · {st.series} 个系列
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 品牌编年史 */}
      <section className="relative overflow-hidden bg-paper py-[clamp(5rem,10vw,9rem)]">
        <div className="container-page grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Chronicle"
                title="潮玩编年史"
                desc="从北京的一家小店，到把盲盒带向世界。以下节点整理自泡泡玛特官网「品牌发展」与公开资料。"
              />
              <Parallax offset={40} className="mt-10 hidden lg:block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                  {slides[1] && <Img asset={slides[1].cover} alt="MOLLY 系列" fill sizes="30vw" />}
                </div>
              </Parallax>
            </div>
          </div>
          <div className="lg:col-span-8 lg:pt-6">
            <Timeline
              entries={BRAND_TIMELINE.map((m) => ({
                date: m.date,
                title: m.title,
                desc: m.desc,
                sourceTitle: m.source?.title,
                sourceUrl: m.source?.url,
                kind: "story",
              }))}
            />
          </div>
        </div>
      </section>

      {/* 收尾 */}
      <section className="bg-paper pb-10">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-20 text-center text-white sm:px-12 md:py-28">
              <div aria-hidden className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-pop/40 blur-[100px]" />
              <div aria-hidden className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-[#7c6cff]/40 blur-[100px]" />
              <p className="eyebrow relative opacity-70">Your Collection</p>
              <h2 className="relative mx-auto mt-5 max-w-3xl font-display text-display font-black">把喜欢的，都收进口袋</h2>
              <p className="relative mx-auto mt-6 max-w-lg text-[15px] leading-7 text-white/60">
                在任意 IP、系列或单品上点亮 ♥，收藏会保存在你的浏览器里，无需注册。
              </p>
              <div className="relative mt-10 flex flex-wrap justify-center gap-3">
                <ArrowLink href="/series" tone="solid" className="[--t-bg:#141416] [--t-ink:#fff]">
                  开始浏览图鉴
                </ArrowLink>
                <ArrowLink href="/favorites" className="text-white [--t-bg:#141416] [--t-ink:#fff]">
                  我的收藏
                </ArrowLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
