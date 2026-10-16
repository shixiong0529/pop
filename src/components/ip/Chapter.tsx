import clsx from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

/** IP 展厅中的一个章节：左侧固定的章节号与标题，右侧内容 */
export function Chapter({
  id,
  no,
  title,
  en,
  children,
  className,
  wide,
}: {
  id: string;
  no: string;
  title: string;
  en: string;
  children: ReactNode;
  className?: string;
  /** 内容占满整行（标题在上） */
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={clsx("scroll-mt-24 py-[clamp(4.5rem,9vw,8rem)]", className)}>
      <div className={clsx("container-page", !wide && "grid grid-cols-1 gap-10 lg:grid-cols-12")}>
        <div className={clsx(!wide && "lg:col-span-4")}>
          <Reveal className={clsx(!wide && "lg:sticky lg:top-32")}>
            <span className="text-outline block font-display text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.06em] opacity-40">
              {no}
            </span>
            <p className="eyebrow mt-4 opacity-70">{en}</p>
            <h2 id={`${id}-title`} className="mt-2 font-zh-serif text-[clamp(2rem,3.4vw,3rem)] font-bold tracking-[-0.01em]">
              {title}
            </h2>
          </Reveal>
        </div>
        <div className={clsx(wide ? "mt-12" : "lg:col-span-8 lg:pt-4")}>{children}</div>
      </div>
    </section>
  );
}

/** 章节正文段落 */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-6">
      {paragraphs.map((p, i) => (
        <Reveal key={i} delay={i * 0.06}>
          <p className={clsx("leading-[2] opacity-80", i === 0 ? "text-[clamp(1.1rem,1.6vw,1.3rem)] opacity-95" : "text-[16px]")}>{p}</p>
        </Reveal>
      ))}
    </div>
  );
}
