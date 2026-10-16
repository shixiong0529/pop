import type { Metadata } from "next";
import { IPGallery } from "@/components/ip/IPGallery";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { getCatalogStats, getIPCover, getIPStats, getIPs } from "@/lib/data";

export const metadata: Metadata = {
  title: "IP 系列馆",
  description: "浏览泡泡玛特旗下 23 个 IP：LABUBU、MOLLY、SKULLPANDA、DIMOO、HIRONO、CRYBABY、星星人等，按风格与类别筛选，走进每个角色的专属故事展厅。",
  alternates: { canonical: "/ips" },
};

export default function IPsPage() {
  const ips = getIPs();
  const stats = getCatalogStats();
  const items = ips.map((ip) => ({ ip, cover: getIPCover(ip), stats: getIPStats(ip.slug) }));

  return (
    <div className="bg-paper">
      <header className="container-page pb-12 pt-[calc(var(--nav-h)+4rem)] md:pt-[calc(var(--nav-h)+6rem)]">
        <p className="eyebrow flex items-center gap-3 text-ink-mute">
          <span className="inline-block h-px w-6 bg-current" />
          The IP Gallery
        </p>
        <h1 className="mt-6 font-display text-mega font-black">
          <SplitText text="IP 系列馆" immediate stagger={0.06} />
        </h1>
        <Reveal delay={0.3} className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="text-[16px] leading-8 text-ink-soft md:col-span-6">
            这里陈列着泡泡玛特旗下的 {stats.ips} 个 IP。有人以噘嘴的小画家出道，有人从北欧森林里咧嘴走来，有人穿梭于宇宙之间。按风格挑一位，推门进去，就是他们的世界。
          </p>
          <dl className="grid grid-cols-3 gap-6 md:col-span-5 md:col-start-8">
            {[
              [stats.ips, "IP"],
              [stats.series, "系列"],
              [stats.products, "款潮玩"],
            ].map(([v, l]) => (
              <div key={l} className="border-t border-line pt-3">
                <dt className="text-xs text-ink-mute">{l}</dt>
                <dd className="mt-1 font-display text-3xl font-black tabular-nums tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>
      <IPGallery items={items} />
    </div>
  );
}
