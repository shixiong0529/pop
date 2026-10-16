import Link from "next/link";
import { Logo } from "./Logo";
import { Marquee } from "@/components/motion/Marquee";

type FooterIP = { slug: string; name: string };

export function Footer({ ips, fetchedAt }: { ips: FooterIP[]; fetchedAt: string }) {
  const date = fetchedAt ? fetchedAt.slice(0, 10).replaceAll("-", ".") : "";
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white">
      <div className="border-b border-white/10 py-10">
        <Marquee speed={60} className="text-[clamp(3rem,9vw,8rem)] font-display font-black tracking-[-0.04em]">
          {["POP ATLAS", "潮玩图鉴", "ART TOY ARCHIVE", "把艺术带回家"].map((t) => (
            <span key={t} className="flex items-center gap-[0.35em] pr-[0.35em]">
              <span className="text-outline opacity-70">{t}</span>
              <span className="text-[0.35em] text-pop">✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo className="text-white [--t-bg:#141416]" />
          <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
            POP ATLAS 是一个非官方的潮玩文化与收藏展示项目，以图鉴的方式整理泡泡玛特旗下 IP 的角色故事与系列产品，仅用于个人学习与交流。
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3" aria-label="页脚导航">
          <div>
            <p className="eyebrow mb-4 text-white/40">浏览</p>
            <ul className="space-y-3 text-white/75">
              <li><Link className="hover:text-white" href="/ips">IP 系列馆</Link></li>
              <li><Link className="hover:text-white" href="/series">系列图鉴</Link></li>
              <li><Link className="hover:text-white" href="/favorites">我的收藏</Link></li>
              <li><Link className="hover:text-white" href="/about">关于本站</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-white/40">IP 展厅</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-white/75 sm:grid-cols-3">
              {ips.map((ip) => (
                <li key={ip.slug}>
                  <Link className="hover:text-white" href={`/ips/${ip.slug}`}>
                    {ip.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="container-page flex flex-col gap-4 border-t border-white/10 py-8 text-xs leading-6 text-white/45 md:flex-row md:items-start md:justify-between">
        <p className="max-w-3xl">
          免责声明：本站与泡泡玛特（POP MART）无任何隶属或合作关系。所有 IP 名称、角色形象、商标及产品图片的版权归泡泡玛特及各原作者所有。产品与图片数据整理自泡泡玛特国际站公开页面
          {date && `（采集于 ${date}）`}，故事内容综合官方资料与公开报道，均标注出处；如有出入，请以官方信息为准。
        </p>
        <p className="shrink-0">© {fetchedAt.slice(0, 4) || "2026"} POP ATLAS · 非商业学习项目</p>
      </div>
    </footer>
  );
}
