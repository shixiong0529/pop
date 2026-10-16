import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const hirono: IPContent = {
  slug: "hirono",
  officialSlug: "hirono",
  name: "HIRONO",
  nameZh: "小野",
  epithet: "内省少年",
  aliases: ["hirono", "小野", "HIRONO 小野"],
  tagline: "一个安静的男孩，替我们收好那些说不出口的情绪。",
  intro: "艺术家 Lang 创作的内省少年。每个系列都在探索一种情绪或一段人生体验，带着淡淡的孤独与温柔。",
  tier: "core",
  moods: ["情绪共鸣", "潮流个性"],
  keywords: ["内省", "孤独", "温柔", "伪装", "成长"],
  artist: {
    name: "Lang",
    region: "中国",
    bio: "中国艺术家，HIRONO 的创作者。据多篇报道，HIRONO 于 2021 年在泡泡玛特推出；有文章提到，Lang 最早的画稿可追溯到 2020 年，当时他的孩子即将出生，童年记忆与孩子都是重要的灵感来源。",
  },
  debutYear: 2021,
  theme: {
    bg: "#E9E6DF",
    surface: "#F5F3EF",
    accent: "#8B5E43",
    ink: "#23211D",
    glow: ["#DCCFBD", "#C6D2CB"],
  },
  quote: { text: "有的戴着面具藏起真实的自己，有的困在原地，等待被拯救。", by: "转述自媒体对 Little Mischief 系列的介绍" },
  story: {
    origin: [
      "HIRONO 由中国艺术家 Lang 创作，多篇报道将其在泡泡玛特的首次亮相时间记为 2021 年。",
      "有文章提到，Lang 最早的画稿可以追溯到 2020 年，当时他的孩子即将出生；也有资料称，他的灵感来自自己的童年记忆，以及他的儿子。（该部分资料来自媒体报道，尚未找到官方原文。）",
    ],
    world: [
      "HIRONO 以一个个系列串联起不同的情绪与人生体验，例如 The Other One、Little Mischief、City of Mercy、Mime、Reshape 等。",
      "以 Little Mischief 系列为例：有的角色戴着面具，把真实的自己藏起来；有的角色困在艰难的处境里，静静等待着被拯救。",
    ],
    personality: [
      "相比单纯的可爱，HIRONO 更像一面镜子：孤独、迷茫、伪装、渴望被理解，这些细腻的情绪被安静地凝固在一个小男孩身上。（本段为本站解读。）",
    ],
  },
  milestones: [{ date: "2021", title: "HIRONO 推出", desc: "Lang 创作的 HIRONO 在泡泡玛特推出。", source: SRC.risonHirono }],
  sources: [SRC.risonHirono, SRC.artoyzHirono, SRC.pepHirono, SRC.popmartUs("hirono", "HIRONO")],
  verification: "partial",
};
