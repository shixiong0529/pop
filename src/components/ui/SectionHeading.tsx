import clsx from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

/** 区块标题：英文眉题 + 中文大标题 + 说明 + 右侧操作 */
export function SectionHeading({
  eyebrow,
  title,
  desc,
  action,
  className,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <Reveal className={clsx(align === "center" && "flex flex-col items-center")}>
        <p className="eyebrow flex items-center gap-3 opacity-70">
          <span className="inline-block h-px w-6 bg-current" />
          {eyebrow}
        </p>
        <h2 className="mt-4 font-display text-title font-bold">{title}</h2>
        {desc && <p className="mt-4 max-w-xl text-[15px] leading-7 opacity-65">{desc}</p>}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}
