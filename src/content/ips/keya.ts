import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

/**
 * KeyA：艺术家陈嫣冉与泡泡玛特合作推出的 IP。
 * 官方定义来自澎湃号转载的报道与泡泡玛特国际站合集简介；系列故事来自 The Toy Chronicle 刊载的系列介绍；
 * 艺术家生平综合澎湃号、界面新闻报道与 PTS 新加坡新闻稿。KeyA 暂无官方中文名。
 */
export const keya: IPContent = {
  slug: "keya",
  officialSlug: "keya",
  name: "KeyA",
  epithet: "永远在生成自我的女孩",
  aliases: ["keya", "key a", "陈嫣冉", "Yanran Chen", "未境之梦", "A Lucid Dream"],
  tagline: "她拒绝抵达；这一路本身，就是答案。",
  intro: "艺术家陈嫣冉创作的「机械少女」。泡泡玛特官方称她为“一个永远在生成自我的女孩”，在梦境与现实交错的时空里寻找真正的自己。",
  tier: "rising",
  moods: ["潮流个性", "暗黑酷感"],
  keywords: ["机械少女", "赛博", "梦境", "自我", "钥匙"],
  artist: {
    name: "陈嫣冉",
    nameEn: "Yanran Chen",
    region: "中国",
    bio: "2005 年出生于北京的艺术家，创作横跨绘画、雕塑、影像与角色设计，以「女孩」形象为核心，风格融合机械的冷感与有机的质感，曾与 Gucci 等品牌合作。KeyA 是她与泡泡玛特合作推出的潮玩形象。",
  },
  debutYear: 2025,
  theme: { bg: "#111218", surface: "#1B1D26", accent: "#A9BEFF", ink: "#ECEEF5", glow: ["#5B4B9A", "#2C6F86"], dark: true },
  quote: { text: "如果世界是一场盛大的梦，你愿意和 KeyA 一起醒来吗？", by: "转述自 KeyA「未境之梦」系列介绍（The Toy Chronicle 刊载）" },
  story: {
    origin: [
      "KeyA 由 2005 年出生的北京艺术家陈嫣冉创作。她的作品以「女孩」形象为核心，标志性的「机械少女」风格把修长优雅的身形与精密的生物机械结构结合在一起，让角色游走在机器与有机生命之间。",
      "2025 年，KeyA 在北京 PTS 潮玩展上首次亮相。陈嫣冉曾在采访中把自己的设计形容为“自我意识的延伸”。",
      "2026 年 3 月，泡泡玛特在新 IP Merodi 发售当天预告了 KeyA；首个盲盒系列「未境之梦」（A Lucid Dream）于 3 月 19 日起在国内和海外陆续开售。",
    ],
    world: [
      "泡泡玛特国际站这样介绍她：她就是 KeyA，她的存在本身就是对固定框架的反叛，是一个永远的例外，在无尽的循环里盘旋；一个拒绝抵达的女孩，旅程本身就是答案。",
      "「未境之梦」的故事从混沌中开始：KeyA 睁开眼睛，走出为她铺好的道路，握住一把只属于她自己的钥匙，踏上寻找真我的旅程。她穿行在时空的裂隙之间，破碎的光影在身边流转，梦境与现实无尽交织。",
      "据潮玩博客 SpankyStokes 介绍，这个系列把赛博朋克的想象延伸到深空：在由机械生命、外星生态与星际探索构成的宇宙里，角色在生物与机械的形态之间自由切换。机械部件不只是功能或装饰，也象征着转变、自由与重新定义自我。",
    ],
    personality: [
      "泡泡玛特官方把 KeyA 定义为“一个永远在生成自我的女孩”，定位是“不断变化的女孩”。",
      "「未境之梦」系列共有十款手办，包括 Daybreak、Tides、The Wayfinder、The Gardener 等，隐藏款为 First Light。",
    ],
  },
  milestones: [
    {
      date: "2025",
      title: "北京 PTS 潮玩展首次亮相",
      desc: "KeyA 在泡泡玛特北京 PTS 潮玩展上首次与观众见面。",
      source: SRC.toyChronicleKeyA,
    },
    {
      date: "2026.03",
      title: "首个盲盒系列「未境之梦」发售",
      desc: "3 月 19 日起陆续开售，3 月 20 日举办「未境之梦」线下特别企划。新 IP 预告后，角色形象在社交平台上引发了不少讨论。",
      source: SRC.jiemianKeyA,
    },
    {
      date: "2026.08",
      title: "PTS 新加坡全球首发新品",
      desc: "8 月 21–23 日的新加坡 PTS 潮玩展上，陈嫣冉带来 KeyA《Voyage Log》手办与 Q 版《Daydream Buddy》手办，并与粉丝见面。",
      source: SRC.ptsSgKeyA,
    },
  ],
  sources: [
    SRC.popmartUs("keya", "KeyA"),
    SRC.toyChronicleKeyA,
    SRC.spankyKeyA,
    SRC.thepaperKeyA,
    SRC.jiemianKeyA,
    SRC.ptsSgKeyA,
  ],
  verification: "partial",
  coverSeries: 5960,
};
