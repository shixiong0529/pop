import type { Source } from "@/lib/types";

/** 全站引用的资料来源 */
export const SRC = {
  popmartDesigners: {
    title: "POP MART Australia · Our Designers（官方设计师介绍，网页存档）",
    url: "https://web.archive.org/web/2024/https://au.popmart.com/pages/our-designers",
    kind: "official",
  },
  popmartCnAbout: {
    title: "泡泡玛特官网 · 关于我们 / 品牌发展",
    url: "https://www.popmart.com.cn/home/about",
    kind: "official",
  },
  popmartCnHome: {
    title: "泡泡玛特官网 · 媒体新闻",
    url: "https://www.popmart.com.cn/home",
    kind: "official",
  },
  popmartUs: (slug: string, name: string): Source => ({
    title: `POP MART US · ${name} 合集页`,
    url: `https://www.popmart.com/us/collection/${slug}`,
    kind: "official",
  }),
  popmartUsNews9: {
    title: "POP MART US 新闻 · 2024 年洛杉矶门店开业",
    url: "https://www.popmart.com/us/news/9",
    kind: "official",
  },
  wikiLabubu: { title: "Wikipedia · Labubu", url: "https://en.wikipedia.org/wiki/Labubu", kind: "wiki" },
  wikiPopMart: { title: "Wikipedia · Pop Mart", url: "https://en.wikipedia.org/wiki/Pop_Mart", kind: "wiki" },
  vogueKenny: {
    title: "Vogue Hong Kong · Kenny Wong 专访",
    url: "https://www.voguehk.com/en/article/art-lifestyle/kenny-wong-pop-mart-molly-interview/",
    kind: "interview",
  },
  tatlerMolly20: {
    title: "Tatler Asia · MOLLY 20 周年",
    url: "https://www.tatlerasia.com/lifestyle/arts/molly-20th-anniversary-kenny-wong-pop-mart-fr",
    kind: "media",
  },
  thebeatSkullpanda: {
    title: "The Beat Asia · SKULLPANDA 指南",
    url: "https://thebeat.asia/vibe/pop-culture/skull-panda-guide-pop-mart",
    kind: "media",
  },
  thairathCrybaby: {
    title: "Thairath · CRYBABY 与 Molly Yllom",
    url: "https://en.thairath.co.th/lifestyle/life/2928920",
    kind: "media",
  },
  marieclaireCrybaby: {
    title: "Marie Claire 台湾 · CRYBABY",
    url: "https://www.marieclaire.com.tw/lifestyle/news/83589/crybaby",
    kind: "media",
  },
  fzineCrybaby: {
    title: "F Zine · Crybaby",
    url: "https://www.fzine.com/culture/crybaby-popmart-bag-charms",
    kind: "media",
  },
  artoyzHirono: { title: "Artoyz · Hirono", url: "https://artoyz.com/en/collections/hirono", kind: "media" },
  risonHirono: {
    title: "Ri-son · What Is Hirono",
    url: "https://ri-son.com/blogs/information/what-is-hirono-pop-mart-s-emotional-icon",
    kind: "media",
  },
  pepHirono: {
    title: "PEP.ph · Lang 与 Hirono",
    url: "https://www.pep.ph/lifestyle/lifestyle/190217/marian-rivera-fangirls-hirono-artist-lang-a721-20251222",
    kind: "media",
  },
  marieclaireTwinkle: {
    title: "Marie Claire 台湾 · 星星人 Twinkle Twinkle",
    url: "https://www.marieclaire.com.tw/lifestyle/news/90853/twinkle-twinkle-popmart",
    kind: "media",
  },
  travelofchinaTwinkle: {
    title: "Travel of China · Twinkle Twinkle Guide",
    url: "https://www.travelofchina.com/pop-mart-twinkle-twinkle/",
    kind: "media",
  },
  stockfeelHacipupu: {
    title: "StockFeel 股感 · 泡泡玛特 IP 整理",
    url: "https://www.stockfeel.com.tw/%E6%B3%A1%E6%B3%A1%E7%91%AA%E7%89%B9-popmart-molly-labubu",
    kind: "media",
  },
  kcomicsHacipupu: {
    title: "K-Comics Beat · Hacipupu",
    url: "https://kcomicsbeat.com/2025/06/30/hacipupu-the-plushie-making-waves-after-chanyeols-post/",
    kind: "media",
  },
  brightsideHacipupu: {
    title: "Bright Side of News · Top Pop Mart Series 2025",
    url: "https://brightsideofnews.com/blog/whats-next-after-labubu-top-3-pop-mart-series-in-malaysia-2025/",
    kind: "media",
  },
  nerdistPopMart: {
    title: "Nerdist · POP MART 15 周年访谈",
    url: "https://nerdist.com/article/pop-mart-intervew-reflection-on-past-15-years-future-labubus-and-more/",
    kind: "interview",
  },
  zaloraKubo: {
    title: "ZALORA · Why KUBO is the Next Pop Mart Character to Watch",
    url: "https://zalora.com.ph/blog/lifestyle/forget-labubu-why-kubo-is-the-next-pop-mart-character-to-watch",
    kind: "media",
  },
  daoNyota: {
    title: "Dao Insights · POP MART releases animated shorts for Nyota",
    url: "https://daoinsights.com/news/pop-mart-releases-series-of-animated-shorts-for-nyota/",
    kind: "media",
  },
  tatlerPino: {
    title: "Tatler Asia · 泡泡玛特人气 IP 盘点",
    url: "https://www.tatlerasia.com/lifestyle/entertainment/pop-mart-popular-collectible-toys-zh-hant",
    kind: "media",
  },
} satisfies Record<string, Source | ((...args: string[]) => Source)>;
