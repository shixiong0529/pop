import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const nyota: IPContent = {
  slug: "nyota",
  officialSlug: "nyota",
  name: "NYOTA",
  epithet: "珍惜小确幸的女孩",
  aliases: ["nyota", "KaKa"],
  tagline: "一杯热饮、一张软沙发，就足以让她心满意足。",
  intro: "艺术家 KaKa 创作的温柔女孩，总被生活里的小事打动，喜欢窝在自己舒适的小世界里放松。",
  tier: "featured",
  moods: ["情绪共鸣", "萌趣治愈"],
  keywords: ["温柔", "松弛", "小确幸", "居家", "治愈"],
  artist: {
    name: "KaKa",
    bio: "NYOTA 的创作者。泡泡玛特曾邀请 KaKa 参加圣迭戈动漫展（SDCC）签售。",
  },
  debutYear: 2024,
  theme: { bg: "#F4EEE5", surface: "#FBF8F3", accent: "#C47852", ink: "#2A1D14", glow: ["#F6D2BC", "#D9E3F5"] },
  quote: { text: "她总会被生活中简单的快乐打动，喜欢在自己温暖的小世界里放松。", by: "转述自泡泡玛特国际站 NYOTA 合集介绍" },
  story: {
    origin: ["NYOTA 于 2024 年推出，是泡泡玛特的原创角色，创作者为艺术家 KaKa。"],
    world: ["泡泡玛特国际站介绍：NYOTA 是一个温柔的女孩，总会被生活中简单的快乐打动，喜欢在自己温暖的小世界里放松。泡泡玛特还为她推出了系列动画短片。"],
    personality: ["慢一点、软一点，是 NYOTA 的生活方式。"],
  },
  milestones: [{ date: "2024", title: "NYOTA 推出", desc: "泡泡玛特原创角色 NYOTA 首次亮相，随后推出系列动画短片。", source: SRC.daoNyota }],
  sources: [SRC.popmartUs("nyota", "NYOTA"), SRC.daoNyota, SRC.nerdistPopMart],
  verification: "partial",
};
