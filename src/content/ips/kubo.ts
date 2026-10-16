import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const kubo: IPContent = {
  slug: "kubo",
  officialSlug: "kubo",
  name: "KUBO",
  epithet: "心事很多的酷小孩",
  aliases: ["kubo", "BAO"],
  tagline: "爱是心底一场无声的混乱，起落之间，无人察觉。",
  intro: "插画师、潮玩设计师 BAO 笔下的酷小孩。表面冷静，心里却藏着温热的秘密。",
  tier: "featured",
  moods: ["情绪共鸣", "潮流个性"],
  keywords: ["酷", "沉默", "心事", "温热", "爱"],
  artist: {
    name: "BAO",
    region: "中国",
    bio: "插画师、潮玩设计师（亦作 Bao Bao）。据媒体报道，KUBO 于 2020 年诞生于 BAO 的想象。",
  },
  debutYear: 2020,
  theme: { bg: "#E6EBEF", surface: "#F5F7F9", accent: "#2F5F80", ink: "#132230", glow: ["#C8DAEA", "#F1D9D2"] },
  quote: { text: "爱是心底一场无声的混乱，在无人察觉的时刻涌起又落下。", by: "转述自泡泡玛特国际站 KUBO 合集介绍" },
  story: {
    origin: ["据媒体报道，KUBO 由插画师 BAO 于 2020 年创作，自 2023 年起陆续推出多个系列。"],
    world: ["泡泡玛特国际站用一句话描述 KUBO：爱是心底一场无声的混乱，在无人察觉的时刻涌起又落下。"],
    personality: ["有评论称它为「心里藏着温暖秘密的酷小孩」：外表淡定，内心却翻涌着细腻的情感。"],
  },
  milestones: [{ date: "2020", title: "KUBO 诞生", desc: "插画师 BAO 创作出 KUBO。", source: SRC.zaloraKubo }],
  sources: [SRC.popmartUs("kubo", "KUBO"), SRC.zaloraKubo],
  verification: "partial",
};
