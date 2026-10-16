import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { fetchedAt, getCatalogStats, getIPs } from "@/lib/data";

export const metadata: Metadata = {
  title: "关于本站",
  description: "POP ATLAS 的定位、数据来源、内容核实方式与免责声明。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const stats = getCatalogStats();
  const ips = getIPs();
  const byStatus = {
    verified: ips.filter((i) => i.verification === "verified").map((i) => i.name),
    partial: ips.filter((i) => i.verification === "partial").map((i) => i.name),
    sample: ips.filter((i) => i.verification === "sample").map((i) => i.name),
  };
  const date = fetchedAt.slice(0, 10).replaceAll("-", ".");

  const blocks = [
    {
      no: "01",
      title: "这是什么",
      body: [
        "POP ATLAS（潮玩图鉴）是一个非官方的潮玩文化与收藏展示项目。它以展览馆的方式讲述泡泡玛特旗下 IP 的角色故事，并把每个系列、每一款潮玩整理成可检索、可收藏的图鉴。",
        "本站不提供购买、支付或会员服务，仅用于个人学习与交流。",
      ],
    },
    {
      no: "02",
      title: "数据从哪里来",
      body: [
        `产品名称、发售日期、尺寸、材质、款式与图片，整理自泡泡玛特国际站（美国区）的公开商品页（采集于 ${date}）。目前收录 ${stats.ips} 个 IP、${stats.series} 个系列、${stats.products} 款潮玩，其中隐藏款 ${stats.secrets} 款。`,
        "官网只保留了部分系列的发售日期；缺失时，本站显示的是商品在美国站的上架时间，并明确标注为「上架」。系列中文名仅在有把握是官方译名时才使用，其余保留官方英文名，品类名称为本站翻译。",
        "图鉴只收录潮玩本体（盲盒手办、搪胶毛绒、MEGA 珍藏、手办摆件），不包含杯子、手机壳、冰箱贴等周边。每个 IP 的收录数量有上限，优先收录多款式的盲盒系列。",
      ],
    },
    {
      no: "03",
      title: "故事如何核实",
      body: [
        "IP 故事优先采用泡泡玛特官方资料，包括官网「品牌发展」、官方设计师介绍和各 IP 合集页简介。官方资料缺失时，参考维基百科、创作者访谈与主流媒体报道，并在每个展厅底部列出全部出处。",
        "所有文字均由本站转述，不照搬原文。标注为「本站解读」的段落是编辑观点。每个 IP 都有核实状态标记：",
      ],
    },
  ];

  return (
    <div className="bg-paper pb-24">
      <header className="container-page pt-[calc(var(--nav-h)+4rem)] md:pt-[calc(var(--nav-h)+6rem)]">
        <p className="eyebrow flex items-center gap-3 text-ink-mute">
          <span className="inline-block h-px w-6 bg-current" />
          About
        </p>
        <h1 className="mt-6 font-display text-mega font-black">
          <SplitText text="关于本站" immediate stagger={0.06} />
        </h1>
      </header>

      <div className="container-page mt-20 space-y-20">
        {blocks.map((b) => (
          <Reveal key={b.no}>
            <section className="grid gap-6 border-t border-line pt-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <span className="font-display text-sm font-bold text-ink-mute">{b.no}</span>
                <h2 className="mt-2 font-zh-serif text-3xl font-bold">{b.title}</h2>
              </div>
              <div className="space-y-5 text-[16px] leading-8 text-ink-soft lg:col-span-7 lg:col-start-6">
                {b.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {b.no === "03" && (
                  <ul className="space-y-4 pt-2">
                    {(Object.keys(byStatus) as (keyof typeof byStatus)[]).map((k) =>
                      byStatus[k].length ? (
                        <li key={k} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                          <VerificationBadge status={k} className="shrink-0" />
                          <span className="text-[14px] leading-7">{byStatus[k].join("、")}</span>
                        </li>
                      ) : null,
                    )}
                  </ul>
                )}
              </div>
            </section>
          </Reveal>
        ))}

        <Reveal>
          <section className="rounded-[2rem] bg-ink p-8 text-white sm:p-12">
            <h2 className="font-zh-serif text-3xl font-bold">免责声明</h2>
            <p className="mt-5 max-w-3xl text-[15px] leading-8 text-white/70">
              本站与泡泡玛特（POP MART）及各 IP 创作者均无隶属、授权或合作关系。所有 IP 名称、角色形象、商标与产品图片的著作权和商标权归泡泡玛特及原作者所有，本站仅出于非商业的学习与交流目的进行整理展示。如权利人认为内容不妥，请联系删除。资料可能存在疏漏，请以泡泡玛特官方信息为准。
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a href="https://www.popmart.com.cn" target="_blank" rel="noreferrer" className="rounded-full px-5 py-2.5 ring-1 ring-white/25 hover:ring-white/60">
                泡泡玛特官网 ↗
              </a>
              <a href="https://www.popmart.com/us" target="_blank" rel="noreferrer" className="rounded-full px-5 py-2.5 ring-1 ring-white/25 hover:ring-white/60">
                泡泡玛特国际站 ↗
              </a>
              <Link href="/ips" className="rounded-full bg-white px-5 py-2.5 font-semibold text-ink">
                开始参观 →
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
