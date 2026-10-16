import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const molly: IPContent = {
  slug: "molly",
  officialSlug: "molly",
  name: "MOLLY",
  epithet: "噘嘴的小画家",
  aliases: ["molly", "MEGA MOLLY", "BABY MOLLY"],
  tagline: "噘着嘴的小画家，二十年来换过无数身份，始终是她自己。",
  intro: "王信明 2006 年创作的经典形象，也是泡泡玛特第一款潮流玩具盲盒的主角。湖绿色的眼睛、噘起的小嘴，倔强又可爱。",
  tier: "core",
  moods: ["潮流个性", "萌趣治愈"],
  keywords: ["倔强", "可爱", "聪明", "骄傲", "有趣"],
  artist: {
    name: "王信明",
    nameEn: "Kenny Wong",
    region: "中国香港",
    bio: "香港艺术家、玩具设计师，MOLLY 的创作者。2016 年 4 月与泡泡玛特签约，此后 MOLLY 受到年轻一代的广泛关注，他本人也成为潮玩领域最受欢迎的艺术家之一。",
  },
  debutYear: 2006,
  joinPopMartYear: 2016,
  theme: {
    bg: "#E6EFF1",
    surface: "#F6FAFB",
    accent: "#23838F",
    ink: "#13252A",
    glow: ["#FFD1DC", "#BDE5EA"],
  },
  quote: { text: "她戴着贝雷帽，系着画家围裙，手里拿着调色盘和画笔。", by: "转述自泡泡玛特官方设计师介绍" },
  story: {
    origin: [
      "MOLLY 诞生于 2006 年，最初的灵感来自一个小女孩。据 Vogue Hong Kong 的专访，王信明当时在太平山顶的一场慈善活动上为孩子们画肖像，在一张张噘着嘴的天真脸庞中，一个专心涂鸦、留着金色短卷发、有一双湖绿色眼睛的女孩格外打动他。他问她叫什么，她说：Molly。",
      "官方介绍里，王信明初见 MOLLY 时，她戴着贝雷帽、系着画家围裙，手握调色盘与画笔。小小艺术家 MOLLY 就这样诞生了。",
    ],
    world: [
      "2016 年 7 月，泡泡玛特推出首款潮流玩具产品 MOLLY 星座系列盲盒，此后以盲盒形式持续推出 MOLLY 的各种系列。",
      "从星座、职业到太空、童话，MOLLY 在一个又一个系列里换上不同造型与身份，也陆续出现了 BABY MOLLY、MEGA 珍藏系列等形态。2026 年是 MOLLY 诞生二十周年，泡泡玛特与王信明在多地举办了周年展览。",
    ],
    personality: [
      "湖绿色的眼睛、噘起的嘴唇，是 MOLLY 最鲜明的标志。",
      "官方用倔强、可爱、聪明、骄傲又有趣来形容她。正是这份带点小脾气的可爱，让 MOLLY 成为最知名的潮流文化形象之一。",
    ],
  },
  milestones: [
    { date: "2006", title: "MOLLY 诞生", desc: "王信明以一位小女孩为灵感，创作出小画家 MOLLY。", source: SRC.popmartDesigners },
    { date: "2016.04", title: "签约泡泡玛特", desc: "泡泡玛特签约设计师 Kenny Wong（王信明）。", source: SRC.popmartCnAbout },
    { date: "2016.07", title: "首个盲盒系列", desc: "泡泡玛特首款潮流玩具产品 MOLLY 星座系列盲盒上市。", source: SRC.popmartCnAbout },
    { date: "2026", title: "二十周年", desc: "MOLLY 诞生二十周年，周年展览在多座城市巡展。", source: SRC.tatlerMolly20 },
  ],
  sources: [SRC.popmartDesigners, SRC.popmartCnAbout, SRC.vogueKenny, SRC.tatlerMolly20, SRC.popmartUs("molly", "MOLLY")],
  verification: "verified",
};
