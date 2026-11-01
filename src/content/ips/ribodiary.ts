import type { IPContent } from "@/lib/types";
import { SRC } from "../sources";

/**
 * RiboDiary：泡泡玛特 2026 年 10 月推出的原创 IP。
 * 世界观与角色设定来自泡泡玛特国际站合集简介与韩国媒体 Single List 的报道；官方渠道未公开具体创作者。
 * 角色暂无官方中文名，保留英文原名。
 */
export const ribodiary: IPContent = {
  slug: "ribodiary",
  officialSlug: "ribodiary",
  name: "RiboDiary",
  epithet: "旧日记里的森林伙伴",
  aliases: ["ribodiary", "ribo diary", "Bearibo", "森林欢聚日", "Forest Gathering Day"],
  tagline: "翻开一本被遗忘的日记，森林里的小伙伴正等你集合。",
  intro: "泡泡玛特 2026 年推出的原创 IP。故事发生在一本早已被遗忘、还没写完的日记里的森林，六位个性各异的动物朋友在这里寻找勇气、梦想和友情的甜。",
  tier: "rising",
  moods: ["萌趣治愈", "梦幻童话"],
  keywords: ["森林", "日记", "友情", "勇气", "绘本"],
  artist: {
    name: "泡泡玛特原创",
    nameEn: "POP MART",
    bio: "泡泡玛特国际站商品页的品牌一栏为 POP MART，官方渠道和媒体报道均未公开具体创作者。",
  },
  debutYear: 2026,
  theme: { bg: "#F2EEE4", surface: "#FBF9F3", accent: "#A0703A", ink: "#2E2418", glow: ["#F4D9B0", "#D4E6C3"] },
  quote: { text: "一片温馨的林地，小伙伴们在这里发现勇气、梦想，还有友情的甜。", by: "转述自泡泡玛特国际站 RiboDiary 合集介绍" },
  story: {
    origin: [
      "RiboDiary 是泡泡玛特于 2026 年 10 月推出的原创 IP，商品页的品牌一栏为 POP MART，暂未公开具体创作者。",
      "首个系列「森林欢聚日」（Forest Gathering Day）于 2026 年 10 月 29 日起在国内和海外陆续发售，包括盲盒手办、毛绒挂件，以及迷你包、手巾、背包等周边。",
    ],
    world: [
      "泡泡玛特国际站这样介绍 RiboDiary：一片温馨的林地，小伙伴们在这里发现勇气、梦想，还有友情的甜。",
      "据韩国媒体 Single List 报道，RiboDiary 的舞台是一本早已被遗忘、还没写完的日记里的森林。作品用柔和的粉彩色调，整体风格让人联想到复古绘本。",
      "「森林欢聚日」系列的手办附带一条小被子：角色可以裹在被子里，也可以单独站着，在书桌或书架上拼出一片小小的森林。",
    ],
    personality: [
      "森林里住着六位个性和梦想各不相同的动物朋友：害羞的小熊 Bearibo、为朋友做玩偶的企鹅 Iceymel、把特别时刻写成故事的兔子 Peippi、热爱时尚的城市鸭子 Memicchi、慢热却温柔的绵羊 Furrychiii，以及爱拆装旧物件的发明家松鼠 Joeius。",
      "首个系列的隐藏款是 Candy Bearibo，也就是那只要靠糖果鼓起勇气的小熊。",
    ],
  },
  characters: [
    { name: "Bearibo", desc: "害羞的小熊宝宝，吃到甜甜的糖果就会鼓起勇气。", productSlug: "9420-bearibo" },
    { name: "Iceymel", desc: "企鹅，喜欢亲手为朋友们做玩偶。", productSlug: "9420-iceymel" },
    { name: "Peippi", desc: "兔子，满脑子闪闪发光的点子，把和朋友们的特别时刻写成故事。", productSlug: "9420-peippi" },
    { name: "Memicchi", desc: "从城市来的鸭子，对时尚充满热情，也满满自信。", productSlug: "9420-memicchi" },
    { name: "Furrychiii", desc: "绵羊，很害羞，熟起来以后会露出温柔体贴的一面。", productSlug: "9420-furrychiii" },
    { name: "Joeius", desc: "发明家松鼠，爱把旧物件拆开再装回去，享受每一个新发现。", productSlug: "9420-joeius" },
  ],
  milestones: [
    {
      date: "2026.10",
      title: "首个系列「森林欢聚日」发售",
      desc: "10 月 29 日起在国内和海外陆续发售。据虎嗅转载的剁椒Spicy 报道，国内 10 月 29 日晚开售后很快显示售罄。",
      source: SRC.huxiuRibo,
    },
    {
      date: "2026.11",
      title: "门店「森林欢聚日」活动",
      desc: "11 月 1 日起，在活动门店找到 NPC、猜出来参加派对的角色，就能获得一张 RiboDiary 森林欢聚日贺卡（数量有限）。",
      source: SRC.weiboRibo,
    },
  ],
  sources: [SRC.popmartUs("ribodiary", "RiboDiary"), SRC.slistRibo, SRC.weiboRibo, SRC.huxiuRibo],
  verification: "partial",
  coverSeries: 9420,
};
