import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const skullpanda: IPContent = {
  slug: "skullpanda",
  officialSlug: "skullpanda",
  name: "SKULLPANDA",
  epithet: "宇宙共生体",
  aliases: ["skullpanda", "SP", "熊喵"],
  tagline: "穿梭星球之间的宇宙共生体，每一次登场，都是一段新的人生。",
  intro: "艺术家熊喵于 2018 年创作。它没有固定的身份，在裂变中寻找自我，以暗黑而华丽的美学著称。",
  tier: "core",
  moods: ["暗黑酷感", "潮流个性"],
  keywords: ["神秘", "多面", "宇宙共生体", "角色扮演", "暗黑美学"],
  artist: {
    name: "熊喵",
    nameEn: "SKULLPANDA（Xiong Miao）",
    region: "中国",
    bio: "CG 概念设计师、潮玩设计师，NORTH STUDIO 主理人。2018 年创作艺术玩具角色 SKULLPANDA，2020 年与泡泡玛特合作。她作品中鲜明的个性与独特的妆容，甚至成为粉丝 cosplay 的潮流。",
  },
  debutYear: 2018,
  joinPopMartYear: 2020,
  theme: {
    bg: "#121118",
    surface: "#1D1B26",
    accent: "#B8A6FF",
    ink: "#EEEBF6",
    glow: ["#4E3F8F", "#24365F"],
    dark: true,
  },
  quote: { text: "它栖居于黑暗、空旷而无垠的太空，仿佛永远不会着陆。", by: "转述自泡泡玛特官方设计师介绍" },
  story: {
    origin: [
      "SKULLPANDA 诞生于 2018 年，是熊喵的个人艺术创作。",
      "2020 年，SKULLPANDA 加入泡泡玛特。据官方介绍，首个盲盒系列「密林古堡」（Ancient Castle）发售时，一秒钟售出了 6 万只。",
    ],
    world: [
      "官方这样描述它：SKULLPANDA 是一种独特的存在。作为宇宙的共生体，它在星球之间自由穿梭，在裂变中寻找自我，扮演不同的角色，体验不同的人生。",
      "它栖居于黑暗、空旷、无边无际的太空。所以第一次见到 SKULLPANDA 时，最先击中你的往往是一种说不清的力量，一种辽阔感，仿佛它永远不会着陆。",
    ],
    personality: [
      "SKULLPANDA 没有被固定的性格。每一个系列都是一次新的扮演：古堡中的贵族、温度里的情绪、日常里的奇遇。",
      "强烈的个性与极具辨识度的造型让它在潮玩圈中深受喜爱，冷艳的妆容与细节也成为它最鲜明的签名。",
    ],
  },
  milestones: [
    { date: "2018", title: "SKULLPANDA 诞生", desc: "熊喵创作出这个穿梭宇宙的神秘角色。", source: SRC.popmartDesigners },
    { date: "2020", title: "加入泡泡玛特", desc: "首个系列「密林古堡」发售时一秒售出 6 万只。", source: SRC.popmartDesigners },
  ],
  sources: [SRC.popmartDesigners, SRC.thebeatSkullpanda, SRC.popmartUs("skullpanda", "SKULLPANDA")],
  verification: "verified",
};
