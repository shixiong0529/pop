import type { AutoIP, IPContent } from "@/lib/types";

const PENDING = "官方资料暂缺，故事待补充。";

/**
 * 自动收录的新 IP：只使用官网公开数据，其余部分明确标注待补充（核实状态为“示例数据”）。
 * 官网合集简介会在展厅“世界观”章节以英文原文展示。
 * 写好正式故事后，在 scripts/ips.mjs 与 src/content/ips/ 中手动收录，手写内容会自动优先。
 */
export function autoIPContent(a: AutoIP): IPContent {
  return {
    slug: a.slug,
    officialSlug: a.officialSlug,
    name: a.name,
    epithet: "新登场的 IP",
    aliases: [a.name.toLowerCase(), a.officialSlug],
    tagline: "泡泡玛特国际站新上线的角色，故事正在整理中。",
    intro: "本站自动收录的新 IP。图鉴数据来自泡泡玛特国际站，角色故事与创作者信息尚待补充。",
    tier: "rising",
    moods: [],
    keywords: [],
    artist: {
      name: "待核实",
      bio: "暂未整理该 IP 的创作者资料。",
    },
    theme: a.theme,
    story: {
      origin: [PENDING],
      world: [PENDING],
      personality: [PENDING],
    },
    milestones: [],
    sources: [
      {
        title: `POP MART US · ${a.name} 合集页`,
        url: `https://www.popmart.com/us/collection/${a.officialSlug}`,
        kind: "official",
      },
    ],
    verification: "sample",
  };
}
