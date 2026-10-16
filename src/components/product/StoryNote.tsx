import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import type { IPContent } from "@/lib/types";

/**
 * “背后的故事”：官方未提供单品 / 系列设计说明时，展示所属 IP 的背景故事，并明确标注。
 */
export function StoryNote({ ip, title = "背后的故事" }: { ip: IPContent; title?: string }) {
  const paragraphs = [ip.story.world[0], ip.story.personality[0]].filter(Boolean);
  return (
    <section className="py-[clamp(4rem,8vw,7rem)]">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow opacity-70">Story · {ip.name}</p>
          <h2 className="mt-3 font-zh-serif text-[clamp(1.8rem,3vw,2.6rem)] font-bold">{title}</h2>
          <p className="mt-5 text-[13px] leading-6 opacity-70">
            泡泡玛特官网未公开该产品的单独设计说明。以下为所属 IP 的世界观与角色设定，整理自官方及公开资料。
          </p>
          <VerificationBadge status={ip.verification} className="mt-5" />
        </Reveal>
        <div className="space-y-6 lg:col-span-7 lg:col-start-6">
          {ip.quote && (
            <Reveal>
              <blockquote className="font-zh-serif text-[clamp(1.35rem,2.4vw,2rem)] font-bold leading-[1.55]">
                “{ip.quote.text}”
              </blockquote>
              <p className="mt-3 text-xs opacity-65">—— {ip.quote.by}</p>
            </Reveal>
          )}
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.05 * (i + 1)}>
              <p className="text-[16px] leading-[2] opacity-80">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.15}>
            <Link
              href={`/ips/${ip.slug}`}
              transitionTypes={["nav-back"]}
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              走进 {ip.name} 展厅，阅读完整故事 →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
