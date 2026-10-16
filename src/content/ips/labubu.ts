import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

export const labubu: IPContent = {
  slug: "labubu",
  officialSlug: "the-monsters",
  name: "LABUBU",
  nameZh: "拉布布",
  epithet: "森林小怪物",
  aliases: ["THE MONSTERS", "精灵天团", "labubu", "拉布布"],
  family: "THE MONSTERS",
  tagline: "咧嘴一笑的森林小怪物，好心办坏事，却总能让人开心。",
  intro: "龙家升笔下北欧童话世界 THE MONSTERS 的一员。尖耳朵、锯齿牙，看起来淘气，内心却格外善良。",
  tier: "core",
  moods: ["萌趣治愈", "梦幻童话"],
  keywords: ["调皮", "善良", "好心办坏事", "咧嘴笑", "森林精灵"],
  artist: {
    name: "龙家升",
    nameEn: "Kasing Lung",
    region: "中国香港 · 成长于荷兰",
    bio: "生于香港，幼年随家人移居荷兰，后定居比利时。据泡泡玛特官方介绍，他是首位获得比利时插画奖的华人，拥有十余年插画经验，作品带有鲜明的北欧童话气质。2010 年起由职业插画师转型为玩具设计师，曾与香港潮玩品牌 How2work 合作推出艺术玩具；2019 年与泡泡玛特签订独家授权协议。",
  },
  debutYear: 2015,
  joinPopMartYear: 2019,
  theme: {
    bg: "#F2EADF",
    surface: "#FBF7F1",
    accent: "#2F6B4F",
    ink: "#1C2620",
    glow: ["#F6C9A8", "#BFE2C8"],
  },
  quote: { text: "无论遇到什么困难，像 LABUBU 一样咧嘴一笑，快乐自然就会到来。", by: "转述自泡泡玛特官方设计师介绍" },
  story: {
    origin: [
      "2015 年，龙家升在三本以北欧童话为灵感的绘本里，搭建出一个精灵世界，THE MONSTERS 就生活在那里。童年时期对北欧民间传说与神话的喜爱，构成了这个世界的底色。",
      "同年，THE MONSTERS 以艺术玩具的形式与 How2work 合作面世。2019 年，龙家升与泡泡玛特签订独家授权协议，据官方介绍，首个系列的销售额打破了当时潮玩品类的纪录。",
    ],
    world: [
      "THE MONSTERS 是一群亦正亦邪的精灵，成员包括首领 ZIMOMO、TYCOCO、SPOOKY、PATO 等，其中最广为人知的就是 LABUBU。",
      "泡泡玛特国际站这样描述它们：LABUBU 和精灵伙伴们生活在广袤的北欧森林里，尽情享受生活的每一天。",
    ],
    personality: [
      "官方形容 LABUBU 是一只竖着高高尖耳朵、长着锯齿牙的小怪物。毛茸茸的身体、圆圆的大眼睛，加上一排尖牙咧出的坏笑，构成了它最有辨识度的模样。",
      "第一眼看上去有点淘气，其实它心地善良，总想帮助别人，却常常一不小心把事情搞砸。正是这种反差，让 LABUBU 成为无数人心里的开心果。",
    ],
  },
  characters: [
    { name: "LABUBU", desc: "高耳尖牙、调皮又善良的小怪物，THE MONSTERS 中最出名的成员。", seriesId: 8990 },
    { name: "ZIMOMO", desc: "精灵部落的首领，拥有一条带尖刺的尾巴。", seriesId: 9174 },
    { name: "TYCOCO", desc: "骷髅模样的精灵，被视作 LABUBU 的男朋友。", seriesId: 9175 },
    { name: "SPOOKY", desc: "THE MONSTERS 的成员之一，泡泡玛特为其推出过原版手办。", seriesId: 8991 },
    { name: "YAYA", desc: "THE MONSTERS 的成员之一，泡泡玛特为其推出过原版手办。", seriesId: 8992 },
  ],
  milestones: [
    { date: "2015", title: "THE MONSTERS 诞生", desc: "龙家升在北欧童话绘本中创造精灵世界，并与 How2work 推出首批艺术玩具。", source: SRC.popmartDesigners },
    { date: "2019", title: "与泡泡玛特签约", desc: "签订独家授权协议，首个系列销售额刷新潮玩品类纪录。", source: SRC.popmartDesigners },
    { date: "2024.04", title: "风靡东南亚", desc: "BLACKPINK 成员 Lisa 被拍到挂着 LABUBU 挂件，带动了全球范围的收藏热潮。", source: SRC.wikiLabubu },
    { date: "2025.06", title: "首场官方拍卖", desc: "一只 1.2 米高的薄荷色 LABUBU 在北京以约 17 万美元成交。", source: SRC.wikiLabubu },
    { date: "2025", title: "THE MONSTERS 十周年", desc: "泡泡玛特推出十周年系列手办、MEGA 等纪念产品。", source: SRC.popmartUs("the-monsters", "THE MONSTERS") },
    { date: "2025.11", title: "大银幕计划", desc: "索尼影业获得 LABUBU 电影改编权。", source: SRC.wikiLabubu },
    { date: "2026.06", title: "亮相世界杯开幕式", desc: "身着世界杯主题服饰，亮相 2026 美加墨世界杯开幕式表演。", source: SRC.popmartCnHome },
  ],
  sources: [SRC.popmartDesigners, SRC.popmartUs("the-monsters", "THE MONSTERS"), SRC.wikiLabubu, SRC.popmartCnHome],
  verification: "verified",
  coverSeries: 1372,
};
