import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const pucky: IPContent = {
  slug: "pucky",
  officialSlug: "pucky",
  name: "PUCKY",
  nameZh: "毕奇",
  epithet: "仲夏夜的小精灵",
  aliases: ["pucky", "毕奇", "Pucky Pool Babies"],
  tagline: "以莎士比亚笔下的精灵为名，在幻想与现实的交界处做一场彩色的梦。",
  intro: "香港插画师毕奇（Pucky）的同名品牌。作品探索自然与精神世界，像一场带着敏感与暗面的彩色梦境。",
  tier: "featured",
  moods: ["梦幻童话", "情绪共鸣"],
  keywords: ["精灵", "自然", "梦境", "敏感", "温暖"],
  artist: {
    name: "毕奇",
    nameEn: "Pucky",
    region: "中国香港",
    bio: "香港插画师、80 后潮玩设计师。毕业于加拿大艾米丽·卡尔艺术与设计大学，回港后创立个人工作室 Pookie。2017 年与泡泡玛特签订独家授权协议，2018 年推出首个盲盒系列「Pucky Pool Babies」。",
  },
  joinPopMartYear: 2017,
  theme: { bg: "#EDF1E8", surface: "#F8FAF5", accent: "#557F61", ink: "#1C2A20", glow: ["#F7D3E5", "#D2EDD9"] },
  quote: { text: "透过艺术创作，Pucky 希望更多地发现这个孤独却温暖的世界。", by: "转述自泡泡玛特官方设计师介绍" },
  story: {
    origin: [
      "PUCKY 是艺术家毕奇的同名潮玩品牌，名字来自莎士比亚《仲夏夜之梦》中的精灵 Puck，而 Puck 本身又源自英国神话中的古老精灵形象。",
      "它象征着幻想与现实世界的交汇。",
    ],
    world: ["PUCKY 的创作大多围绕自然与精神世界展开，像一场色彩缤纷的梦：既有敏感细腻的一面，也藏着幽暗的角落。"],
    personality: ["透过艺术创作，毕奇希望更多地发现这个孤独却温暖的世界。"],
  },
  milestones: [
    { date: "2017", title: "签约泡泡玛特", desc: "泡泡玛特与毕奇签订独家授权协议。", source: SRC.popmartDesigners },
    { date: "2018", title: "首个盲盒系列", desc: "推出首个盲盒系列「Pucky Pool Babies」。", source: SRC.popmartDesigners },
    { date: "2020.11", title: "天猫双十一", desc: "PUCKY 产品成为 2020 年天猫双十一最受欢迎的潮玩之一。", source: SRC.popmartDesigners },
  ],
  sources: [SRC.popmartDesigners, SRC.popmartCnHome, SRC.popmartUs("pucky", "PUCKY")],
  verification: "verified",
};
