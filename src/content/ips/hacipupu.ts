import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const hacipupu: IPContent = {
  slug: "hacipupu",
  officialSlug: "hacipupu",
  name: "HACIPUPU",
  epithet: "怕生的小男孩",
  aliases: ["hacipupu", "你的小男孩"],
  tagline: "一个怯生生的小男孩，替长大的我们保留着那份贪玩的天真。",
  intro: "带着天真梦幻气质的小男孩形象。设计理念是一个始终保有童心的孩子，也被视作社恐大人的化身。",
  tier: "featured",
  moods: ["萌趣治愈", "情绪共鸣"],
  keywords: ["天真", "害羞", "童心", "梦幻", "社恐"],
  artist: {
    name: "Agee & Yep",
    region: "中国",
    bio: "多数报道将 HACIPUPU 的创作者记为中国插画师 Agee 与 Yep；也有台湾媒体将其归于 PINKBOOMSTUDIO 工作室。创作者信息尚待官方资料核实。",
  },
  theme: { bg: "#FCEEE4", surface: "#FFF8F3", accent: "#DF7A3F", ink: "#2B1A10", glow: ["#FFD0B0", "#D8E6FF"] },
  story: {
    origin: [
      "据台湾媒体整理，HACIPUPU 又被称作「你的小男孩」。它的设计理念，是一个始终保有贪玩天性的孩子。",
      "关于创作者，多数报道记为插画师 Agee 与 Yep，也有资料指向 PINKBOOMSTUDIO 工作室，本站暂以「待核实」处理。",
    ],
    world: ["2025 年，EXO 成员灿烈在社交平台晒出自己抽到的 HACIPUPU 小熊软糖系列，相关盲盒在泡泡玛特官网迅速售罄，HACIPUPU 也因此被更多人认识。"],
    personality: ["那个害羞、有点退缩的小男孩，常被解读为社交焦虑的大人内心的投影：怕生，却依然天真。"],
  },
  milestones: [{ date: "2025", title: "因小熊软糖系列走红", desc: "EXO 灿烈晒出抽盒结果后，系列迅速售罄。", source: SRC.kcomicsHacipupu }],
  sources: [SRC.stockfeelHacipupu, SRC.kcomicsHacipupu, SRC.brightsideHacipupu, SRC.popmartUs("hacipupu", "HACIPUPU")],
  verification: "partial",
};
