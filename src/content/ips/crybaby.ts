import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const crybaby: IPContent = {
  slug: "crybaby",
  officialSlug: "crybaby",
  name: "CRYBABY",
  epithet: "爱哭的孩子",
  aliases: ["crybaby", "Molly Yllom"],
  tagline: "眼泪不是软弱。难过的时候，就痛快地哭一场吧。",
  intro: "泰国艺术家 Molly Yllom 的作品。挂着泪珠的大眼睛，把悲伤变成了一种可以被拥抱的情绪。",
  tier: "core",
  moods: ["情绪共鸣", "萌趣治愈"],
  keywords: ["眼泪", "治愈", "真诚", "怀念", "拥抱情绪"],
  artist: {
    name: "Molly Yllom",
    nameEn: "Nisa Srikamdee（Mod）",
    region: "泰国",
    bio: "泰国艺术家，本名 Nisa Srikamdee。据媒体报道，她在 2017 年前后创作了 CRYBABY，最初在社交媒体上分享作品；2021 年起与泡泡玛特合作，是首位与泡泡玛特合作的泰国艺术家。",
  },
  debutYear: 2017,
  joinPopMartYear: 2021,
  theme: {
    bg: "#FBE8EE",
    surface: "#FFF5F8",
    accent: "#DE4F78",
    ink: "#2A1620",
    glow: ["#FFC1D3", "#BFE2FF"],
  },
  story: {
    origin: [
      "据泰国媒体 Thairath 等报道，泰国艺术家 Molly Yllom（本名 Nisa Srikamdee）在 2017 年前后创作了 CRYBABY。她在接受访问时提到，创作这个角色的契机，是心爱的狗狗 Somchun 离世。",
      "另有报道称，她最早在 Instagram 上发布这一形象，随后吸引了大量关注。2021 年，她开始与泡泡玛特合作。",
    ],
    world: [
      "CRYBABY 的系列名字几乎都和眼泪有关，例如 Crying Again、Cry Me An Ocean。",
      "在这个世界里，哭泣并不需要被藏起来：难过、想念、委屈，都可以被看见、被拥抱。（本段为本站解读。）",
    ],
    personality: [
      "大大的眼睛、粉嫩的脸颊、永远挂在脸上的泪珠，是 CRYBABY 的标志。",
      "它并不只是悲伤，更像一种温柔的提醒：允许自己流泪，也是一种勇敢。（本段为本站解读。）",
    ],
  },
  milestones: [
    { date: "2017", title: "CRYBABY 诞生", desc: "Molly Yllom 在爱犬离世后创作了这个爱哭的角色。", source: SRC.thairathCrybaby },
    { date: "2021", title: "与泡泡玛特合作", desc: "成为首位与泡泡玛特合作的泰国艺术家。", source: SRC.thairathCrybaby },
  ],
  sources: [SRC.thairathCrybaby, SRC.marieclaireCrybaby, SRC.fzineCrybaby, SRC.popmartUs("crybaby", "CRYBABY")],
  verification: "partial",
};
