import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const peachRiot: IPContent = {
  slug: "peach-riot",
  officialSlug: "peach-riot",
  name: "PEACH RIOT",
  epithet: "少女朋克乐队",
  aliases: ["peach riot", "Gigi", "Frankie", "Poppy", "Libby Frame"],
  tagline: "三个高中好友组成的朋克乐队，音量开到最大，态度也是。",
  intro: "洛杉矶插画师、音乐人 Libby Frame 创作的虚构女子朋克乐队，也是泡泡玛特首个来自美国艺术家的原创 IP。",
  tier: "featured",
  moods: ["潮流个性"],
  keywords: ["朋克", "女孩力量", "友情", "热血", "舞台"],
  artist: {
    name: "Libby Frame",
    region: "美国 · 洛杉矶",
    bio: "洛杉矶插画师、音乐人。泡泡玛特将她介绍为旗下首位美国艺术家，PEACH RIOT 也因此成为泡泡玛特首个在美国诞生的原创 IP。",
  },
  theme: { bg: "#FFE6DB", surface: "#FFF5F0", accent: "#F24E2E", ink: "#2A110B", glow: ["#FFB394", "#FF9CC2"] },
  story: {
    origin: ["PEACH RIOT 由洛杉矶插画师兼音乐人 Libby Frame 创作，是泡泡玛特首个来自美国艺术家的原创 IP。"],
    world: [
      "泡泡玛特官方新闻这样介绍她们：一支以鲜明风格、充沛激情和强烈女孩力量著称的全女子朋克乐队。",
      "乐队由三个高中好友组成：主唱兼吉他手 Gigi、鼓手 Frankie，以及负责贝斯和键盘的 Poppy。",
    ],
    personality: [
      "泡泡玛特团队在采访中提到，自家 IP 通常只有一个角色，PEACH RIOT 却是一整支高中乐队，这让它格外特别。之后的系列也延伸到她们台下的生活，比如睡衣派对与课余打工。",
    ],
  },
  characters: [
    { name: "Gigi", desc: "主唱兼吉他手。" },
    { name: "Frankie", desc: "鼓手。" },
    { name: "Poppy", desc: "贝斯手，也负责键盘。" },
  ],
  milestones: [{ date: "2024.02", title: "官方介绍亮相", desc: "泡泡玛特在洛杉矶门店开业新闻中介绍 PEACH RIOT。", source: SRC.popmartUsNews9 }],
  sources: [SRC.popmartUsNews9, SRC.nerdistPopMart, SRC.wikiPopMart, SRC.popmartUs("peach-riot", "PEACH RIOT")],
  verification: "verified",
};
