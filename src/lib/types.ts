/** 内容核实状态：已核实 / 部分核实 / 示例数据 */
export type Verification = "verified" | "partial" | "sample";

export interface Source {
  title: string;
  url: string;
  /** 来源类型：官方 / 媒体 / 百科 / 访谈 */
  kind?: "official" | "media" | "wiki" | "interview";
}

/** 由 scripts/fetch-images.mjs 生成的本地图片资源 */
export interface ImageAsset {
  src: string;
  w: number;
  h: number;
  /** 10px 级别的模糊占位图 data URL */
  blur: string;
  /** 主色（十六进制） */
  color: string;
  /** 官网原图地址 */
  origin: string;
}

export interface IPTheme {
  /** 展厅主背景色 */
  bg: string;
  /** 卡片 / 次级背景 */
  surface: string;
  /** 强调色 */
  accent: string;
  /** 主体文字色 */
  ink: string;
  /** 两个用于光晕的辅助色 */
  glow: [string, string];
  /** 深色展厅 */
  dark?: boolean;
}

export type Mood = "萌趣治愈" | "暗黑酷感" | "梦幻童话" | "情绪共鸣" | "潮流个性";

export interface Character {
  name: string;
  nameZh?: string;
  desc: string;
  /** 官网商品 id（对应本站系列 id），用于取角色图 */
  seriesId?: number;
}

export interface Milestone {
  /** 形如 2016.07 / 2023 */
  date: string;
  title: string;
  desc?: string;
  source?: Source;
}

export interface IPContent {
  slug: string;
  /** 官网合集 slug */
  officialSlug: string;
  name: string;
  /** 官方或广泛使用的中文名（没有则留空，不自行翻译） */
  nameZh?: string;
  /** 本站撰写的中文称谓，如“云朵男孩” */
  epithet: string;
  /** 搜索用别名 */
  aliases?: string[];
  /** 所属家族 / 世界观名称 */
  family?: string;
  /** 一句话标语（本站撰写） */
  tagline: string;
  /** 卡片上的简介 */
  intro: string;
  tier: "core" | "featured" | "rising";
  moods: Mood[];
  keywords: string[];
  artist: {
    name: string;
    nameEn?: string;
    region?: string;
    bio: string;
  };
  debutYear?: number;
  joinPopMartYear?: number;
  theme: IPTheme;
  story: {
    origin: string[];
    world: string[];
    personality: string[];
  };
  /** 引言：只使用官方或可靠来源描述的转述 */
  quote?: { text: string; by: string };
  characters?: Character[];
  milestones: Milestone[];
  sources: Source[];
  verification: Verification;
  /** 手动指定封面所用的系列 id */
  coverSeries?: number;
}

export type SeriesCategory = "figure" | "plush" | "mega" | "figurine";

export interface Series {
  id: number;
  slug: string;
  ip: string;
  title: string;
  titleZh: string;
  category: SeriesCategory;
  /** ISO 日期（yyyy-mm-dd），或仅有年月 */
  releaseDate?: string;
  /** 官网原文中的发售日期 */
  releaseText?: string;
  /** 官网发售时刻（Unix 秒，由美国太平洋时间换算） */
  releaseAt?: number;
  /** 美国站上架时间（秒级时间戳），仅用于排序 */
  listedAt: number;
  designer?: string;
  size?: string;
  material?: string;
  cover: ImageAsset;
  gallery: ImageAsset[];
  products: string[];
  secretCount: number;
  /** 整盒（端盒）包含的盲盒数量 */
  boxesPerSet?: number;
  officialUrl: string;
}

export interface Product {
  slug: string;
  seriesId: number;
  ip: string;
  name: string;
  isSecret: boolean;
  /** 在系列中的序号（从 1 开始） */
  index: number;
  image: ImageAsset;
}

export interface Catalog {
  generatedAt: string;
  series: Series[];
  products: Product[];
  /** 各 IP 合集在官网上的简介与横幅 */
  collections: Record<string, { desc: string; banner?: ImageAsset; bannerMobile?: ImageAsset }>;
}
