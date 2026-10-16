import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const dimoo: IPContent = {
  slug: "dimoo",
  officialSlug: "dimoo",
  name: "DIMOO",
  epithet: "云朵男孩",
  aliases: ["dimoo", "DIMOO WORLD"],
  family: "DIMOO WORLD",
  tagline: "白天胆小的男孩，在梦里勇敢；头顶那朵云，从不让他孤单。",
  intro: "Ayan 用两年时间构思的 DIMOO WORLD，讲述一个大眼睛小男孩在梦境中探索与成长的旅程。",
  tier: "core",
  moods: ["梦幻童话", "情绪共鸣"],
  keywords: ["害羞", "梦境", "勇敢", "陪伴", "云朵"],
  artist: {
    name: "Ayan",
    region: "中国",
    bio: "毕业于广州美术学院，知名设计工作室 MOUNTAIN STUDIO 的创始人之一，也是 YANSTUDIO 与 DIMOO WORLD 系列的主理人和主创。她花了两年时间打磨 DIMOO WORLD 的故事与角色，借由这些创作表达和传递自己的情感。",
  },
  theme: {
    bg: "#E8EFFB",
    surface: "#F7F9FE",
    accent: "#4672D6",
    ink: "#141F38",
    glow: ["#CFE0FF", "#FFE3F0"],
  },
  quote: { text: "小云会随着他的情绪变换形状，一直守护着他、陪伴着他。", by: "转述自泡泡玛特官方设计师介绍" },
  story: {
    origin: [
      "DIMOO WORLD 系列是 Ayan 花费两年时间构思的故事世界。整个系列充满幻想之美，讲述的是一个名叫 DIMOO 的小男孩的旅程。",
      "对 Ayan 来说，DIMOO 是她找到的一种方式：用自己的创作去表达、去传递情感。",
    ],
    world: [
      "在现实世界里，DIMOO 害羞、胆小，对未来充满恐惧；可是在梦里，他变得勇敢，尝试去探索新的世界、结交新的朋友。",
      "在梦中，他遇见了云妈妈（Mother Cloud）。云妈妈把一朵小云（Baby Cloud）放在他的头上陪伴他。小云是 DIMOO 的朋友，也渐渐成为他的一部分。",
    ],
    personality: [
      "官方形容 DIMOO 是一个有着大眼睛、带着恐惧与迷茫的小男孩。",
      "头顶的小云会随着他的情绪不断变换形状，始终守护在他身边。这份敏感与陪伴，正是 DIMOO 最动人的地方。",
    ],
  },
  milestones: [
    { date: "—", title: "DIMOO WORLD 成形", desc: "Ayan 用两年时间完成 DIMOO WORLD 的故事与角色设定。", source: SRC.popmartDesigners },
  ],
  sources: [SRC.popmartDesigners, SRC.popmartUs("dimoo", "DIMOO")],
  verification: "verified",
};
