import catalogJson from "@/content/generated/catalog.json";
import { IPS as MANUAL_IPS } from "@/content/ips";
import { autoIPContent } from "@/content/ips/auto";
import type { Catalog, ImageAsset, IPContent, Product, Series, SeriesCategory } from "./types";
import { seriesName, seriesTime } from "./naming";

/**
 * 图鉴数据访问层（仅在服务端组件中使用，避免把完整数据打进客户端包）。
 */
const catalog = catalogJson as unknown as Catalog;

// 手写的 IP 在前；自动收录的新 IP 排在最后，有了手写内容后自动让位
const manualSlugs = new Set(MANUAL_IPS.map((ip) => ip.slug));
const IPS: IPContent[] = [
  ...MANUAL_IPS,
  ...(catalog.autoIps ?? []).filter((a) => !manualSlugs.has(a.slug)).map(autoIPContent),
];

// 单品系列的产品名使用整理后的系列专名（官方完整标题保留在系列上）
{
  const byId = new Map(catalog.series.map((s) => [s.id, s]));
  for (const p of catalog.products) {
    const s = byId.get(p.seriesId);
    if (s && s.products.length === 1) p.name = seriesName(s).name;
  }
}

const ipOrder = new Map(IPS.map((ip, i) => [ip.slug, i]));
const seriesById = new Map(catalog.series.map((s) => [s.id, s]));
const seriesBySlug = new Map(catalog.series.map((s) => [s.slug, s]));
const productBySlug = new Map(catalog.products.map((p) => [p.slug, p]));
const ipBySlug = new Map(IPS.map((ip) => [ip.slug, ip]));

const byNewest = (a: Series, b: Series) => seriesTime(b) - seriesTime(a);

export const fetchedAt = catalog.generatedAt;

export function getIPs(): IPContent[] {
  return IPS;
}

export function getIP(slug: string): IPContent | undefined {
  return ipBySlug.get(slug);
}

export function getAllSeries(): Series[] {
  return [...catalog.series].sort(byNewest);
}

export function getSeries(slug: string): Series | undefined {
  return seriesBySlug.get(slug);
}

export function getSeriesById(id: number): Series | undefined {
  return seriesById.get(id);
}

export function getSeriesOfIP(ip: string): Series[] {
  return catalog.series.filter((s) => s.ip === ip).sort(byNewest);
}

export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProduct(slug: string): Product | undefined {
  return productBySlug.get(slug);
}

export function getProductsOfSeries(s: Series): Product[] {
  return s.products.map((slug) => productBySlug.get(slug)).filter((p): p is Product => !!p);
}

export function getCollection(ip: string) {
  return catalog.collections[ip];
}

export interface IPStats {
  series: number;
  products: number;
  secrets: number;
  categories: SeriesCategory[];
  firstYear?: number;
  latestYear?: number;
}

export function getIPStats(ip: string): IPStats {
  const list = getSeriesOfIP(ip);
  const years = list.map((s) => (s.releaseDate ? Number(s.releaseDate.slice(0, 4)) : undefined)).filter(Boolean) as number[];
  return {
    series: list.length,
    products: list.reduce((n, s) => n + s.products.length, 0),
    secrets: list.reduce((n, s) => n + s.secretCount, 0),
    categories: [...new Set(list.map((s) => s.category))],
    firstYear: years.length ? Math.min(...years) : undefined,
    latestYear: years.length ? Math.max(...years) : undefined,
  };
}

export function getCatalogStats() {
  return {
    ips: IPS.length,
    series: catalog.series.length,
    products: catalog.products.length,
    secrets: catalog.products.filter((p) => p.isSecret).length,
  };
}

/** IP 封面：优先使用指定系列，其次为最新的盲盒 / 毛绒系列 */
export function getIPCover(ip: IPContent): ImageAsset | undefined {
  const pinned = ip.coverSeries ? seriesById.get(ip.coverSeries) : undefined;
  if (pinned) return pinned.cover;
  const list = getSeriesOfIP(ip.slug);
  return (list.find((s) => s.category === "figure" || s.category === "plush") ?? list[0])?.cover;
}

/** IP 代表单品图（用于卡片上的小图 / 拼贴） */
export function getIPShowcase(ip: string, n = 6): Product[] {
  const out: Product[] = [];
  for (const s of getSeriesOfIP(ip)) {
    for (const p of getProductsOfSeries(s)) {
      if (!p.isSecret) {
        out.push(p);
        break;
      }
    }
    if (out.length >= n) break;
  }
  return out;
}

/** 首页“最新系列”：各 IP 轮流取最新，保证多样性 */
export function getLatestSeries(n = 8): Series[] {
  const all = getAllSeries();
  const out: Series[] = [];
  const seenIP = new Set<string>();
  for (const s of all) {
    if (out.length >= n) break;
    if (seenIP.has(s.ip) || s.products.length < 2) continue;
    seenIP.add(s.ip);
    out.push(s);
  }
  return out;
}

/** 精选潮玩：来自核心 / 精选 IP 的最新盲盒系列，每个系列挑一款 */
export function getFeaturedProducts(n = 14): Product[] {
  const out: Product[] = [];
  const ips = IPS.filter((ip) => ip.tier !== "rising");
  let round = 0;
  while (out.length < n && round < 6) {
    for (const ip of ips) {
      const s = getSeriesOfIP(ip.slug).filter((x) => x.products.length > 2)[round];
      if (!s) continue;
      const items = getProductsOfSeries(s).filter((p) => !p.isSecret);
      const pick = items[(round * 3 + ip.slug.length) % items.length];
      if (pick) out.push(pick);
      if (out.length >= n) break;
    }
    round++;
  }
  return out;
}

export function getRelatedSeries(s: Series, n = 6): Series[] {
  const same = getSeriesOfIP(s.ip).filter((x) => x.id !== s.id);
  const sameCat = same.filter((x) => x.category === s.category);
  const rest = same.filter((x) => x.category !== s.category);
  const fill = getAllSeries().filter((x) => x.ip !== s.ip && x.category === s.category);
  return [...sameCat, ...rest, ...fill].slice(0, n);
}

export function getRelatedProducts(p: Product, n = 8): Product[] {
  const s = seriesById.get(p.seriesId);
  const out: Product[] = [];
  if (s) {
    for (const r of getRelatedSeries(s, n)) {
      const items = getProductsOfSeries(r).filter((x) => !x.isSecret);
      if (items[0]) out.push(items[(p.index + r.id) % items.length]);
      if (out.length >= n) break;
    }
  }
  return out;
}

export function ipRank(slug: string) {
  return ipOrder.get(slug) ?? 999;
}
