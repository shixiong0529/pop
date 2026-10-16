import type { Milestone } from "@/lib/types";
import { SRC } from "./sources";

/** 泡泡玛特品牌发展节点（来自官网“品牌发展”及公开资料） */
export const BRAND_TIMELINE: Milestone[] = [
  { date: "2010.11", title: "泡泡玛特成立", desc: "第一家门店在北京欧美汇购物中心开业。", source: SRC.popmartCnAbout },
  { date: "2015.01", title: "LIFESTYLE 概念旗舰店", desc: "在北京王府井 apm 购物中心推出全新概念旗舰店。", source: SRC.popmartCnAbout },
  { date: "2016.04", title: "签约 Kenny Wong", desc: "泡泡玛特签约 MOLLY 的创作者王信明。", source: SRC.popmartCnAbout },
  { date: "2016.07", title: "首款潮玩盲盒", desc: "MOLLY 星座系列盲盒上市，盲盒模式由此开启。", source: SRC.popmartCnAbout },
  { date: "2017.09", title: "北京国际潮流玩具展", desc: "中国大陆地区首届大型潮流玩具展会。", source: SRC.popmartCnAbout },
  { date: "2018.04", title: "上海国际潮流玩具展", desc: "当时亚洲地区规模最大的潮流玩具展会。", source: SRC.popmartCnAbout },
  { date: "2019.11", title: "双十一玩具类第一", desc: "天猫双十一当日销售额 8212 万元，斩获玩具大类第一。", source: SRC.popmartCnAbout },
  { date: "2020.12", title: "港交所上市", desc: "在香港联合交易所挂牌上市（股票代码 9992）。", source: SRC.wikiPopMart },
  { date: "2022.01", title: "走向欧洲", desc: "首家欧洲门店在伦敦开业。", source: SRC.wikiPopMart },
  { date: "2023.10", title: "泡泡玛特城市乐园", desc: "品牌乐园 POP LAND 在北京开园。", source: SRC.wikiPopMart },
  { date: "2026.06", title: "LABUBU 登上世界杯", desc: "LABUBU 亮相 2026 美加墨世界杯开幕式表演。", source: SRC.popmartCnHome },
];
