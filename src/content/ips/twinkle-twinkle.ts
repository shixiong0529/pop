import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const twinkleTwinkle: IPContent = {
  slug: "twinkle-twinkle",
  officialSlug: "twinkle-twinkle",
  name: "TWINKLE TWINKLE",
  nameZh: "星星人",
  epithet: "送梦的小星星",
  aliases: ["twinkle", "星星人", "Twinkle Twinkle"],
  tagline: "从绘本角落里走出来的小星星，把梦写成信，寄给每一个人。",
  intro: "源自插画师 Da Xin 绘本《梦之岛》中的一个小配角，暖黄的身体与红红的脸颊，是勇气、希望与爱的化身。",
  tier: "featured",
  moods: ["萌趣治愈", "梦幻童话"],
  keywords: ["温暖", "希望", "勇气", "梦想", "爱"],
  artist: {
    name: "Da Xin",
    region: "中国",
    bio: "插画师、潮玩艺术家。据媒体报道，星星人最初是 Da Xin 绘本《梦之岛》里的配角；也有资料将插画师 A Li 列为共同创作者。",
  },
  debutYear: 2020,
  joinPopMartYear: 2024,
  theme: { bg: "#FFF3D6", surface: "#FFFAEC", accent: "#E99A12", ink: "#2B200C", glow: ["#FFD87A", "#FFC0B0"] },
  story: {
    origin: [
      "据媒体报道，星星人最初只是插画师 Da Xin 绘本《梦之岛》里的一个小配角，负责把梦写成信送出去。读者对它的喜爱远超预期，于是有了后来的「100 颗小星星」系列。",
      "2023 年，泡泡玛特在上海潮玩展上注意到了星星人，并于 2024 年正式签约。",
    ],
    world: ["星星人的宇宙里住着 100 颗小星星，每一颗都有自己的世界观。整个系列围绕勇气、希望、思念与爱展开。"],
    personality: ["暖黄色的身体与红扑扑的脸颊是星星人的标志，安静、温暖，像一盏随身携带的小夜灯。"],
  },
  milestones: [
    { date: "2020", title: "星星人诞生", desc: "以绘本《梦之岛》配角的身份首次登场。", source: SRC.marieclaireTwinkle },
    { date: "2024", title: "签约泡泡玛特", desc: "2023 年上海潮玩展后，星星人于次年与泡泡玛特签约。", source: SRC.travelofchinaTwinkle },
    { date: "2026.06", title: "英国国王生日派对", desc: "星星人作为特邀嘉宾亮相英国国王生日派对。", source: SRC.popmartCnHome },
  ],
  sources: [SRC.marieclaireTwinkle, SRC.travelofchinaTwinkle, SRC.popmartCnHome, SRC.wikiPopMart, SRC.popmartUs("twinkle-twinkle", "TWINKLE TWINKLE")],
  verification: "partial",
};
