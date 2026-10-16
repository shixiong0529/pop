import type { Product, Series, SeriesCategory } from "./types";
import { seriesDate, seriesName } from "./naming";

/** 传给客户端列表组件的精简系列数据（去掉模糊占位等大字段） */
export interface SeriesLite {
  id: number;
  slug: string;
  ip: string;
  ipName: string;
  name: string;
  nameZh?: string;
  kind: string;
  category: SeriesCategory;
  dateLabel: string;
  dateValue: string;
  year?: number;
  time: number;
  releaseAt?: number;
  count: number;
  secrets: number;
  cover: { src: string; w: number; h: number; color: string };
}

export interface ProductLite {
  slug: string;
  name: string;
  isSecret: boolean;
  seriesId: number;
  seriesName: string;
  category: SeriesCategory;
  year?: number;
  image: { src: string; w: number; h: number; color: string };
}

export function toSeriesLite(s: Series, ipName: string): SeriesLite {
  const n = seriesName(s);
  const d = seriesDate(s);
  return {
    id: s.id,
    slug: s.slug,
    ip: s.ip,
    ipName,
    name: n.name,
    nameZh: n.nameZh,
    kind: n.kind,
    category: s.category,
    dateLabel: d.label,
    dateValue: d.value,
    year: d.year,
    time: s.releaseDate ? Date.parse(s.releaseDate.length === 7 ? `${s.releaseDate}-01` : s.releaseDate) / 1000 : s.listedAt,
    releaseAt: s.releaseAt,
    count: s.products.length,
    secrets: s.secretCount,
    cover: { src: s.cover.src, w: s.cover.w, h: s.cover.h, color: s.cover.color },
  };
}

export function toProductLite(p: Product, s: Series): ProductLite {
  const n = seriesName(s);
  return {
    slug: p.slug,
    name: p.name,
    isSecret: p.isSecret,
    seriesId: s.id,
    seriesName: n.nameZh ?? n.name,
    category: s.category,
    year: seriesDate(s).year,
    image: { src: p.image.src, w: p.image.w, h: p.image.h, color: p.image.color },
  };
}
