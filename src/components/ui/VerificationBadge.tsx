import clsx from "clsx";
import type { Verification } from "@/lib/types";

const MAP: Record<Verification, { label: string; desc: string; dot: string }> = {
  verified: { label: "资料已核实", desc: "主要内容来自官方资料或可靠来源", dot: "bg-emerald-500" },
  partial: { label: "部分待核实", desc: "部分内容来自媒体报道，尚未找到官方原文", dot: "bg-amber-500" },
  sample: { label: "示例数据", desc: "官方资料缺失，内容待补充", dot: "bg-rose-500" },
};

export function VerificationBadge({ status, className, withDesc }: { status: Verification; className?: string; withDesc?: boolean }) {
  const m = MAP[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full bg-current/[0.06] px-3 py-1 text-[11.5px] font-semibold ring-1 ring-current/10",
        className,
      )}
      title={m.desc}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
      {withDesc && <span className="font-normal opacity-70">· {m.desc}</span>}
    </span>
  );
}
